"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

interface TerminalProps { onSuccess?: () => void; }

export default function TerminalWindow({ onSuccess }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>(["TINY BUNNY OS v1.0.1", "READY TO HOP. TYPE 'MINT' TO START."]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [userWallet, setUserWallet] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typeSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    typeSound.current = new Audio('/type.mp3');
    if (typeSound.current) typeSound.current.volume = 0.2;
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
  const playTypeSound = () => { if (typeSound.current) { typeSound.current.currentTime = 0; typeSound.current.play().catch(() => {}); } };

  const playSuccessBeep = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    const g = context.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    osc.connect(g); g.connect(context.destination);
    osc.start(); osc.stop(context.currentTime + 0.3);
  };

  const startPolling = async (paymentAddr: string, relayerKey: string, dest: string, qty: number) => {
    const provider = new ethers.JsonRpcProvider("https://rpc.megaeth.com");
    const relayer = new ethers.Wallet(relayerKey, provider);
    
    const PRICE_PER_NFT = "0.0002";
    const GAS_BUFFER = "0.0002"; 
    const totalRequired = (parseFloat(PRICE_PER_NFT) * qty + parseFloat(GAS_BUFFER)).toFixed(4);
    const targetWei = ethers.parseUnits(totalRequired, "ether");

    const checkInterval = setInterval(async () => {
      try {
        const balance = await provider.getBalance(paymentAddr);
        if (balance >= targetWei) {
          clearInterval(checkInterval);
          setStatus("processing");
          addLog(`>>> DEPOSIT CONFIRMED. PROCESSING BATCH...`);

          const contract = new ethers.Contract(
            "0xc2A17C61E6eC87d633055ffFD1978DfDc743963d",
            ["function mint(uint256 quantity) external payable"],
            relayer
          );

          try {
            addLog(`>>> MINTING ${qty} BUNNY...`);
            const tx = await contract.mint(qty, { 
              value: ethers.parseUnits((parseFloat(PRICE_PER_NFT) * qty).toFixed(18), "ether"),
              gasLimit: 300000 
            });
            await tx.wait();
            
            playSuccessBeep();
            if (onSuccess) onSuccess();
            addLog("=============================================");
            addLog("✅ ACCESS GRANTED. BUNNIES SECURED.");
            addLog("=============================================");
            setStatus("idle");
          } catch (err) {
            addLog(`>>> [!] ERROR: CONTRACT REJECTED.`);
            setStatus("idle");
          }
        }
      } catch (e) { clearInterval(checkInterval); setStatus("idle"); }
    }, 4000);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput("");
    if (!cmd || status === "processing" || status === "waiting_pay") return;
    addLog(`$ ${cmd}`);

    if (status === "idle") {
      if (cmd === 'mint') { addLog("[INPUT] Enter Destination Wallet:"); setStatus("input_addr"); }
      else if (cmd === 'clear') { setLogs(["READY."]); }
      else { addLog(`UNKNOWN COMMAND: ${cmd}`); }
    } else if (status === "input_addr") {
      if (!cmd.startsWith("0x") || cmd.length !== 42) { addLog("[ERROR] INVALID ADDR."); }
      else { setUserWallet(cmd); addLog("[INPUT] Quantity (1-5):"); setStatus("input_qty"); }
    } else if (status === "input_qty") {
      const qty = parseInt(cmd);
      if (isNaN(qty) || qty < 1 || qty > 5) { addLog("[ERROR] MAX MINT IS 5."); }
      else {
        setStatus("waiting_pay");
        const totalPay = (0.0002 * qty + 0.0002).toFixed(4);
        try {
          const res = await fetch('/api/mint-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destinationAddress: userWallet, qty: qty })
          });
          const data = await res.json();
          addLog("---------------------------------------------");
          addLog(`💳 DEPOSIT : ${totalPay} ETH`);
          addLog(`TO      : ${data.paymentAddress}`);
          addLog("---------------------------------------------");
          startPolling(data.paymentAddress, data.relayerKey, userWallet, qty);
        } catch (err) { addLog("[ERROR] RELAYER OFFLINE."); setStatus("idle"); }
      }
    }
  };

  return (
    <div className="bg-black p-4 font-mono text-[10px] md:text-xs text-green-500 h-72 md:h-80 flex flex-col">
      <div ref={scrollRef} className="overflow-y-auto pr-2 scrollbar-hide flex-1">
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 break-all ${log.includes('[ERROR]') ? 'text-red-400' : 'text-green-400'} opacity-90`}>
            {log}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="flex mt-2 border-t border-green-900/30 pt-2 shrink-0">
        <span className="mr-2 text-green-900 animate-pulse font-bold">{">"}</span>
        <input 
          type="text" value={input} onChange={(e) => { setInput(e.target.value); playTypeSound(); }}
          disabled={status === "waiting_pay" || status === "processing"}
          className="bg-transparent border-none outline-none flex-1 text-green-400 focus:ring-0 p-0"
          autoFocus
        />
      </form>
    </div>
  );
}
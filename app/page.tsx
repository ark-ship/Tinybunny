"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

// KONFIGURASI SMART CONTRACT
const CONTRACT_ADDRESS = "0xc2A17C61E6eC87d633055ffFD1978DfDc743963d"; 
const RPC_URL = "https://rpc.megaeth.com"; 
const ABI = [
  "function totalSupply() view returns (uint256)",
  "function mint(uint256 quantity) external payable"
];
const MAX_SUPPLY = 2222;

export default function TinyBunnyFullMint() {
  const [supply, setSupply] = useState<number>(0);
  const [account, setAccount] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintQty, setMintQty] = useState(1);

  // Fungsi ambil data supply dari blockchain
  const fetchSupply = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const count = await contract.totalSupply();
      setSupply(Number(count));
    } catch (e) { 
      console.log("Syncing supply..."); 
    }
  }, []);

  // Fungsi koneksi wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Auto-switch ke MegaETH Chain ID 1338
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x53a' }], 
          });
        } catch (err) {
          console.log("Please add MegaETH network to Metamask.");
        }
      } catch (err) {
        console.log("Connect failed.");
      }
    } else {
      alert("Please install Metamask!");
    }
  };

  // FUNGSI MINT (DIUPDATE DENGAN GAS LIMIT)
  const handleMint = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    
    try {
      setIsMinting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      const pricePerBunny = ethers.parseUnits("0.0002", "ether");
      const totalValue = pricePerBunny * BigInt(mintQty);

      // Kita tambahin gasLimit manual biar gak Reverted di MegaETH
      const tx = await contract.mint(mintQty, { 
        value: totalValue,
        gasLimit: 250000 
      });

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      
      fetchSupply();
      alert("MINT SUCCESS! Bunny secured.");
    } catch (err: any) {
      console.error("Mint Error Details:", err);
      // Cek apakah error karena saldo atau hal lain
      if (err.code === "INSUFFICIENT_FUNDS") {
        alert("Error: Saldo ETH lo di MegaETH gak cukup!");
      } else {
        alert(err.reason || "Mint failed. Coba cek saldo/network lo lagi Bro.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    fetchSupply();
    const interval = setInterval(fetchSupply, 15000);
    return () => clearInterval(interval);
  }, [fetchSupply]);

  const row1 = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen text-black overflow-x-hidden relative" 
          style={{ 
            background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e1f5fe 50%, #e8f5e9 75%, #fffde7 100%)',
            fontFamily: '"Press Start 2P", cursive' 
          }}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* NAVBAR */}
      <nav className="fixed w-full top-0 bg-white/40 backdrop-blur-md border-b-4 border-black z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 font-black text-sm md:text-lg">
                <div className="bg-pink-500 border-2 border-black p-1">
                    <img src="/bunny.png" alt="logo" className="w-5 h-5 object-contain" />
                </div>
                TINY BUNNY
            </div>
            <button 
              onClick={connectWallet}
              className="text-[8px] font-bold bg-white border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px]"
            >
              {account ? `${account.substring(0,6)}...${account.substring(38)}` : "CONNECT WALLET"}
            </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-12 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
            <div className="inline-block border-2 border-black px-3 py-1 text-[8px] font-bold uppercase bg-yellow-300">MegaETH Live</div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-tight uppercase">
                FAST HOP.<br/> <span className="text-pink-600">NO STOP.</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-700 bg-white border-2 border-black p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                Tiny Bunny is minting now. Fast, clean, and strictly limited.
            </p>
            
            {/* STATS */}
            <div className="flex gap-8 border-t-2 border-black pt-6">
                 <div>
                    <p className="text-2xl font-black">{supply || "???"} / {MAX_SUPPLY}</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">MINTED</p>
                </div>
                <div>
                    <p className="text-2xl font-black">0.0002</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">PRICE (ETH)</p>
                </div>
            </div>
        </div>

        {/* IMAGE PREVIEW (ANTENG GAK LONCAT) */}
        <div className="relative w-full max-w-sm mx-auto aspect-square">
            <div className="absolute top-4 left-4 w-full h-full bg-pink-400 border-2 border-black -z-10"></div>
            <div className="w-full h-full border-4 border-black bg-white flex items-center justify-center p-8 shadow-2xl overflow-hidden">
                <img src="/bunny.png" alt="Bunny Preview" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
        </div>
      </div>

      {/* GALLERY SEAMLESS */}
      <div className="relative z-10 py-10 border-y-4 border-black bg-white/30 overflow-hidden">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...row1, ...row1, ...row1].map((n, i) => (
            <div key={i} className="flex-shrink-0 mx-4 w-28 h-28 md:w-36 md:h-36 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <img src={`/gallery/${n}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
            </div>
          ))}
        </div>
      </div>

      {/* INFO & MINT CONTROL (ISI AREA KOSONG) */}
      <div className="relative z-10 py-20 flex flex-col items-center px-6">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full text-center">
              <h2 className="text-sm font-black mb-8 uppercase italic">MINT CONTROL PANEL</h2>
              
              {/* QUANTITY SELECTOR */}
              <div className="flex items-center justify-between border-4 border-black p-4 mb-6 bg-zinc-50">
                  <button onClick={() => setMintQty(Math.max(1, mintQty - 1))} className="text-xl font-black w-10 h-10 border-2 border-black bg-white active:bg-zinc-200">-</button>
                  <div className="text-xl font-black">{mintQty}</div>
                  <button onClick={() => setMintQty(Math.min(5, mintQty + 1))} className="text-xl font-black w-10 h-10 border-2 border-black bg-white active:bg-zinc-200">+</button>
              </div>

              {/* MINT BUTTON */}
              <button 
                onClick={handleMint}
                disabled={isMinting}
                className="w-full py-4 bg-pink-500 text-white border-4 border-black text-[10px] font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase mb-6"
              >
                {isMinting ? "PROCESSING..." : `MINT ${mintQty} BUNNY (${(0.0002 * mintQty).toFixed(4)} ETH)`}
              </button>

              <div className="text-[8px] font-bold text-zinc-400 tracking-widest uppercase italic">
                  © 2026 TINY BUNNY /// ALL RIGHTS RESERVED
              </div>
          </div>
      </div>

      <div className="pb-24"></div>

      {/* SEAMLESS FOOTER */}
      <footer className="fixed bottom-0 w-full bg-black border-t-4 border-black z-50 h-12 flex items-center overflow-hidden">
          <div className="text-pink-500 text-[8px] font-bold tracking-[0.3em] whitespace-nowrap animate-marquee">
            CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// MEGAETH SPEED /// CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// 
          </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100% / 3)); } }
        @keyframes marquee-f { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-marquee { display: inline-block; animation: marquee-f 20s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
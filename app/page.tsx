"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0xc2A17C61E6eC87d633055ffFD1978DfDc743963d"; 
const RPC_URL = "https://rpc.megaeth.com"; 
const MEGAETH_CHAIN_ID = "0x53a"; // 1338 in Hex

const ABI = [
  "function totalSupply() view returns (uint256)",
  "function mint(uint256 quantity) external payable"
];

const MAX_SUPPLY = 2222;

export default function TinyBunnyFinal() {
  const [supply, setSupply] = useState<number>(0);
  const [account, setAccount] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintQty, setMintQty] = useState(1);

  const fetchSupply = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const count = await contract.totalSupply();
      setSupply(Number(count));
    } catch (e) { 
      console.log("RPC Syncing..."); 
    }
  }, []);

  // Fungsi khusus buat maksa pindah network
  const switchToMegaETH = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MEGAETH_CHAIN_ID }],
        });
        return true;
      } catch (switchError: any) {
        // Jika network belum ada di Metamask, minta user tambah manual
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: MEGAETH_CHAIN_ID,
                chainName: 'MegaETH',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ['https://explorer.megaeth.com/']
              }],
            });
            return true;
          } catch (addError) {
            return false;
          }
        }
        return false;
      }
    }
    return false;
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await switchToMegaETH(); // Coba pindah pas konek
      } catch (err) { console.log("Rejected"); }
    } else { alert("Install Metamask!"); }
  };

  const handleMint = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    
    // CEK ULANG: Apakah user di network yang benar?
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== MEGAETH_CHAIN_ID) {
      const success = await switchToMegaETH();
      if (!success) return; // Berhenti kalau user nolak pindah network
    }

    try {
      setIsMinting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      const price = ethers.parseUnits("0.0002", "ether");
      const totalValue = price * BigInt(mintQty);

      const tx = await contract.mint(mintQty, { 
        value: totalValue,
        gasLimit: 300000 
      });

      await tx.wait();
      fetchSupply();
      alert("MINT SUCCESS!");
    } catch (err: any) {
      console.error(err);
      alert(err.reason || "Mint failed. Cek saldo!");
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    fetchSupply();
    const interval = setInterval(fetchSupply, 10000);
    return () => clearInterval(interval);
  }, [fetchSupply]);

  const row1 = Array.from({ length: 10 }, (_, i) => i + 1);
  const row2 = Array.from({ length: 10 }, (_, i) => i + 11);

  return (
    <main className="min-h-screen text-black overflow-x-hidden relative" 
          style={{ 
            background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e1f5fe 50%, #e8f5e9 75%, #fffde7 100%)',
            fontFamily: '"Press Start 2P", cursive' 
          }}>
      
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* NAVBAR */}
      <nav className="fixed w-full top-0 bg-white/40 backdrop-blur-md border-b-4 border-black z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 font-black text-sm">
                <div className="bg-pink-500 border-2 border-black p-1">
                    <img src="/bunny.png" alt="logo" className="w-5 h-5 object-contain" />
                </div>
                TINY BUNNY
            </div>
            <button 
              onClick={connectWallet}
              className="text-[8px] font-bold bg-white border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              {account ? `${account.substring(0,6)}...` : "CONNECT"}
            </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-12 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
            <div className="inline-block border-2 border-black px-3 py-1 text-[8px] font-bold bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">MegaETH Live</div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">
                FAST HOP.<br/> <span className="text-pink-600">NO STOP.</span>
            </h1>
            
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                    <div className="flex border-2 border-black">
                        <button onClick={() => setMintQty(Math.max(1, mintQty - 1))} className="px-3 py-1 bg-zinc-100 border-r-2 border-black font-black">-</button>
                        <div className="px-4 py-1 font-black bg-white">{mintQty}</div>
                        <button onClick={() => setMintQty(Math.min(5, mintQty + 1))} className="px-3 py-1 bg-zinc-100 border-l-2 border-black font-black">+</button>
                    </div>
                    <div className="text-[10px] font-black italic text-pink-600">0.0002 ETH</div>
                </div>
                
                <button 
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full py-4 bg-pink-500 text-white border-4 border-black text-[10px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  {isMinting ? "HOPPING..." : `MINT ${mintQty} BUNNY`}
                </button>

                <div className="flex justify-between text-[8px] font-bold">
                    <span>MINTED: {supply} / {MAX_SUPPLY}</span>
                </div>
            </div>
        </div>

        <div className="relative w-full max-w-sm mx-auto aspect-square border-4 border-black bg-white p-8 shadow-2xl">
            <img src="/bunny.png" alt="Preview" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* 2 BARIS GALLERY */}
      <div className="relative z-10 py-10 border-y-4 border-black bg-white/30 overflow-hidden flex flex-col gap-8">
        <div className="flex whitespace-nowrap">
          <div className="flex animate-scroll-left">
            {[...row1, ...row1, ...row1].map((n, i) => (
              <div key={i} className="flex-shrink-0 mx-4 w-28 h-28 md:w-32 md:h-32 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img src={`/gallery/${n}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex whitespace-nowrap">
          <div className="flex animate-scroll-right">
            {[...row2, ...row2, ...row2].map((n, i) => (
              <div key={i} className="flex-shrink-0 mx-4 w-28 h-28 md:w-32 md:h-32 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img src={`/gallery/${n}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="relative z-10 py-20 flex flex-col items-center text-center px-6">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-loose">
                  © 2026 TINY BUNNY /// ALL RIGHTS RESERVED
              </p>
          </div>
      </div>

      <footer className="fixed bottom-0 w-full bg-black border-t-4 border-black z-50 h-12 flex items-center overflow-hidden">
          <div className="text-pink-500 text-[8px] font-bold tracking-[0.3em] whitespace-nowrap animate-marquee">
            CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// MEGAETH SPEED /// 
          </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100% / 3)); } }
        @keyframes scroll-right { 0% { transform: translateX(calc(-100% / 3)); } 100% { transform: translateX(0); } }
        @keyframes marquee-f { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-scroll-right { animation: scroll-right 30s linear infinite; }
        .animate-marquee { display: inline-block; animation: marquee-f 20s linear infinite; }
      `}</style>
    </main>
  );
}
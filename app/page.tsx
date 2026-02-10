"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import TerminalWindow from '../components/TerminalWindow'; 

const CONTRACT_ADDRESS = "0xc2A17C61E6eC87d633055ffFD1978DfDc743963d"; 
const RPC_URL = "https://rpc.megaeth.com"; 
const ABI = ["function totalSupply() view returns (uint256)"];
const MAX_SUPPLY = 2222;

export default function TinyBunnyCLI() {
  const [supply, setSupply] = useState<number>(0);
  const [latency, setLatency] = useState(2);

  const fetchSupply = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const count = await contract.totalSupply();
      setSupply(Number(count));
    } catch (e) { console.error("Supply error"); }
  }, []);

  useEffect(() => {
    fetchSupply();
    const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * 3) + 1);
        fetchSupply();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchSupply]);

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
            <div className="flex items-center gap-3 font-black text-sm md:text-lg tracking-tighter">
                <div className="bg-pink-500 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                    {/* GANTI ICON DI SINI */}
                    <img src="/bunny.png" alt="logo" className="w-5 h-5 object-contain" />
                </div>
                TINY <span className="text-pink-600">BUNNY</span>
            </div>
            <div className="text-[8px] font-bold bg-white border-2 border-black px-2 py-1">MEGAETH MAINNET</div>
        </div>
      </nav>

      <div className="pt-32 pb-32 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LEFT SIDE */}
        <div className="space-y-6 md:space-y-8">
            <div className="inline-block border-2 border-black px-3 py-1 text-[8px] font-bold uppercase bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Bunny Terminal
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[1.2] uppercase">
                FAST HOP.<br/> <span className="text-pink-600">NO STOP.</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-bold text-zinc-700 max-w-sm leading-relaxed bg-white border-2 border-black p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                Talk to the terminal, get your Bunny, and keep hopping.
            </p>
            <div className="flex gap-8 border-t-2 border-black pt-8">
                 <div>
                    <p className="text-2xl font-black">{supply} / {MAX_SUPPLY}</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">MINTED Bunnies</p>
                </div>
                <div>
                    <p className="text-2xl font-black">{latency}ms</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">Hop Latency</p>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute top-4 left-4 w-full h-full bg-pink-400 border-2 border-black -z-10"></div>
            <div className="border-4 border-black bg-black shadow-2xl overflow-hidden min-h-[300px]">
                <TerminalWindow onSuccess={fetchSupply} />
            </div>
            <div className="flex justify-between items-center mt-6 px-2">
            </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full bg-black border-t-4 border-black z-50">
        <div className="flex items-center h-12">
          <div className="flex-1 text-pink-500 text-[8px] py-3 overflow-hidden whitespace-nowrap font-bold tracking-[0.3em]">
            <div className="inline-block animate-marquee px-4">
                CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// MEGAETH SPEED /// 
                CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// MEGAETH SPEED /// 
            </div>
          </div>
          
          <div className="flex bg-zinc-900 border-l-4 border-black h-full px-6 gap-6 items-center shrink-0">
             <a href="https://x.com/tinybunnyNFT" target="_blank" rel="noreferrer">
                <img src="/x.png" alt="X" className="h-4 w-4 invert" />
             </a>
             <a href="https://opensea.io" target="_blank" rel="noreferrer">
                <img src="/opensea.png" alt="OS" className="h-4 w-4 invert" />
             </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 20s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
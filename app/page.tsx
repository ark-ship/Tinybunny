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
      // Pake staticNetwork biar loading lebih stabil dan cepet
      const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const count = await contract.totalSupply();
      setSupply(Number(count));
    } catch (e) { 
      // Console log aja biar gak muncul error overlay merah di layar
      console.log("Syncing supply from MegaETH..."); 
    }
  }, []);

  useEffect(() => {
    fetchSupply();
    const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * 3) + 1);
        fetchSupply();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchSupply]);

  const row1 = Array.from({ length: 10 }, (_, i) => i + 1);
  const row2 = Array.from({ length: 10 }, (_, i) => i + 11);
  const footerText = "CATCH THE BUNNY /// 2222 TOTAL SUPPLY /// NO GAS DELAY /// MEGAETH SPEED /// ";

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
                    <img src="/bunny.png" alt="logo" className="w-5 h-5 object-contain" />
                </div>
                TINY <span className="text-pink-600">BUNNY</span>
            </div>
            <div className="text-[8px] font-bold bg-white border-2 border-black px-2 py-1 uppercase">MEGAETH MAINNET</div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-12 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
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
                    <p className="text-2xl font-black">{supply || "???"} / {MAX_SUPPLY}</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">MINTED Bunnies</p>
                </div>
                <div>
                    <p className="text-2xl font-black">{latency}ms</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-2">Hop Latency</p>
                </div>
            </div>
        </div>

        <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute top-4 left-4 w-full h-full bg-pink-400 border-2 border-black -z-10"></div>
            <div className="border-4 border-black bg-black shadow-2xl overflow-hidden min-h-[300px]">
                <TerminalWindow onSuccess={fetchSupply} />
            </div>
        </div>
      </div>

      {/* SEAMLESS DOUBLE GALLERY */}
      <div className="relative z-10 py-10 border-y-4 border-black bg-white/30 overflow-hidden flex flex-col gap-8">
        <div className="flex whitespace-nowrap">
          <div className="flex animate-scroll-left">
            {[...row1, ...row1, ...row1].map((num, idx) => (
              <div key={`l-${idx}`} className="flex-shrink-0 mx-4">
                <div className="w-28 h-28 md:w-36 md:h-36 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <img src={`/gallery/${num}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex whitespace-nowrap">
          <div className="flex animate-scroll-right">
            {[...row2, ...row2, ...row2].map((num, idx) => (
              <div key={`r-${idx}`} className="flex-shrink-0 mx-4">
                <div className="w-28 h-28 md:w-36 md:h-36 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <img src={`/gallery/${num}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFO SECTION (ISI TEMPAT KOSONG) */}
      <div className="relative z-10 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
              <h2 className="text-lg md:text-xl font-black mb-4 uppercase italic">TINY BUNNY</h2>
              <p className="text-[10px] leading-relaxed text-zinc-600 mb-6">
                  Tiny Bunny is a collection of 2,222 unique pixel bunnies hopping through the MegaETH.
              </p>
              <div className="text-[8px] font-bold text-pink-600 tracking-widest uppercase">
                  © 2026 TINY BUNNY /// ALL RIGHTS RESERVED
              </div>
          </div>
      </div>

      <div className="pb-24"></div>

      {/* SEAMLESS FOOTER */}
      <footer className="fixed bottom-0 w-full bg-black border-t-4 border-black z-50">
        <div className="flex items-center h-12">
          <div className="flex-1 text-pink-500 text-[8px] overflow-hidden font-bold tracking-[0.3em] whitespace-nowrap">
            <div className="inline-block animate-marquee px-4">
               {footerText} {footerText} {footerText} {footerText}
            </div>
          </div>
          <div className="flex bg-zinc-900 border-l-4 border-black h-full items-center shrink-0">
             <div className="flex px-6 gap-6 items-center">
                <a href="https://x.com/tinybunnyNFT" target="_blank" rel="noreferrer"><img src="/x.png" className="h-4 w-4 invert opacity-80" /></a>
                <a href="https://opensea.io" target="_blank" rel="noreferrer"><img src="/opensea.png" className="h-4 w-4 invert opacity-80" /></a>
             </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100% / 3)); } }
        @keyframes scroll-right { 0% { transform: translateX(calc(-100% / 3)); } 100% { transform: translateX(0); } }
        @keyframes marquee-footer { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-scroll-right { animation: scroll-right 30s linear infinite; }
        .animate-marquee { display: inline-block; animation: marquee-footer 25s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
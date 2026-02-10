"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0xc2A17C61E6eC87d633055ffFD1978DfDc743963d"; 
const RPC_URL = "https://mainnet.megaeth.com/rpc"; 
const MEGAETH_CHAIN_ID = "0x10e6"; // 4326 in Hex

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
      console.log("Syncing chain data..."); 
    }
  }, []);

  const switchToMegaETH = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MEGAETH_CHAIN_ID }],
        });
        return true;
      } catch (err: any) {
        if (err.code === 4902) {
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
          } catch (addError) { return false; }
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
        await switchToMegaETH();
      } catch (err) { console.log("Rejected"); }
    } else { alert("Please install Metamask!"); }
  };

  const handleMint = async () => {
    if (!account) return connectWallet();
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== MEGAETH_CHAIN_ID) {
      const success = await switchToMegaETH();
      if (!success) return;
    }
    try {
      setIsMinting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const pricePerNft = ethers.parseUnits("0.0002", "ether");
      const totalValue = pricePerNft * BigInt(mintQty);
      const tx = await contract.mint(mintQty, { value: totalValue, gasLimit: 300000 });
      await tx.wait();
      fetchSupply();
      alert("MINT SUCCESSFUL!");
    } catch (err: any) {
      alert(err.reason || "Mint failed. Check balance!");
    } finally { setIsMinting(false); }
  };

  useEffect(() => {
    fetchSupply();
    const interval = setInterval(fetchSupply, 10000);
    return () => clearInterval(interval);
  }, [fetchSupply]);

  const row1 = Array.from({ length: 10 }, (_, i) => i + 1);
  const row2 = Array.from({ length: 10 }, (_, i) => i + 11);
  const marqueeText = "Catch the Bunny /// 2222 Total Supply /// MegaETH Speed /// Catch the Bunny /// 2222 Total Supply /// MegaETH Speed /// ";

  return (
    <main className="min-h-screen text-black overflow-x-hidden relative" 
          style={{ 
            background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e1f5fe 50%, #e8f5e9 75%, #fffde7 100%)',
            fontFamily: '"Press Start 2P", cursive' 
          }}>
      
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* NAVBAR */}
      <nav className="fixed w-full top-0 bg-white/40 backdrop-blur-md border-b-4 border-black z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-pink-500 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">🐰</div>
                <span className="hidden lg:block text-[10px] font-black uppercase italic">Tiny Bunny</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
                <div className="relative flex items-center">
                    <span className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase">Agent</span>
                    <span className="absolute -top-3 -right-4 bg-pink-500 text-white text-[5px] px-1 border border-black shadow-[1px_1px_0px_0px_#000]">SOON</span>
                </div>
                <div className="relative flex items-center">
                    <span className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase">Raffle</span>
                    <span className="absolute -top-3 -right-4 bg-yellow-400 text-black text-[5px] px-1 border border-black shadow-[1px_1px_0px_0px_#000]">SOON</span>
                </div>
                <div className="relative flex items-center">
                    <span className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase">Stake</span>
                    <span className="absolute -top-3 -right-4 bg-green-500 text-white text-[5px] px-1 border border-black shadow-[1px_1px_0px_0px_#000]">SOON</span>
                </div>
                <button onClick={connectWallet} className="text-[7px] md:text-[8px] bg-white border-2 border-black px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase">
                  {account ? `${account.substring(0,6)}...` : "Connect"}
                </button>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="pt-32 pb-12 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
            <div className="inline-block border-2 border-black px-3 py-1 text-[8px] font-bold bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">tiny bunny</div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">FAST HOP.<br/> <span className="text-pink-600">NO STOP.</span></h1>
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                    <div className="flex border-2 border-black bg-white">
                        <button onClick={() => setMintQty(Math.max(1, mintQty - 1))} className="px-3 py-1 border-r-2 border-black font-black">-</button>
                        <div className="px-4 py-1 font-black">{mintQty}</div>
                        <button onClick={() => setMintQty(Math.min(5, mintQty + 1))} className="px-3 py-1 border-l-2 border-black font-black">+</button>
                    </div>
                    <div className="text-[10px] font-black text-pink-600">0.0002 ETH</div>
                </div>
                <button onClick={handleMint} disabled={isMinting} className="w-full py-4 bg-pink-500 text-white border-4 border-black text-[10px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase">
                  {isMinting ? "Minting..." : `Mint ${mintQty} Bunny`}
                </button>
                <div className="flex justify-between text-[8px] font-bold"><span>Supply: {supply} / {MAX_SUPPLY}</span> <span className="text-green-600 animate-pulse">● Live</span></div>
            </div>
        </div>
        <div className="relative w-full max-w-sm mx-auto aspect-square border-4 border-black bg-white p-8 shadow-2xl overflow-hidden"><img src="/bunny.png" alt="Preview" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} /></div>
      </div>

      {/* GALLERY ROWS */}
      <div className="relative z-10 py-10 border-y-4 border-black bg-white/30 overflow-hidden flex flex-col gap-8">
        {[row1, row2].map((row, idx) => (
          <div key={idx} className="flex whitespace-nowrap overflow-hidden">
            <div className={`flex ${idx === 0 ? 'animate-scroll-left' : 'animate-scroll-right'}`}>
              {[...row, ...row, ...row].map((n, i) => (
                <div key={i} className="flex-shrink-0 mx-4 w-24 h-24 md:w-32 md:h-32 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <img src={`/gallery/${n}.png`} alt="B" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="/bunny.png"} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ SECTION */}
      <div className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-black text-center mb-12 uppercase italic tracking-tighter">Frequently Asked Questions</h2>
          <div className="space-y-6">
              {[
                { q: "What is Tiny Bunny?", a: "Tiny Bunny is a collection of 2,222 unique pixel art NFTs hopping on the MegaETH network." },
                { q: "How much is the mint price?", a: "Each Tiny Bunny costs 0.0002 ETH per mint." },
                { q: "Which network do I use?", a: "We are live on MegaETH (Chain ID: 4326). Make sure to bridge your ETH before minting." },
                { q: "What's the utility?", a: "Holding a Tiny Bunny gives you access to the upcoming Bunny Agent, Raffles, and Staking features." }
              ].map((faq, i) => (
                <div key={i} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] md:text-[12px] font-black mb-3 uppercase text-pink-600 tracking-tighter">Q: {faq.q}</p>
                    <p className="text-[8px] md:text-[10px] font-bold leading-relaxed text-zinc-600">A: {faq.a}</p>
                </div>
              ))}
          </div>

          {/* SOCIAL LINKS - ADDED HERE */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">
              <a href="https://x.com/tinybunnyNFT" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-3 bg-white border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all">
                  <img src="/x.png" alt="Twitter/X" className="w-6 h-6 object-contain pixelated" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase">X</span>
              </a>
              <a href="https://opensea.io/collection/tiny-bunny-mega" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 bg-white border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all">
                  <img src="/opensea.png" alt="OpenSea" className="w-6 h-6 object-contain pixelated" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase">OpenSea</span>
              </a>
          </div>
      </div>

      {/* FOOTER AREA */}
      <div className="relative z-10 py-10 flex flex-col items-center text-center">
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest italic">© 2026 Tiny Bunny /// All Rights Reserved</p>
          </div>
      </div>
      <div className="pb-24"></div>

      {/* INFINITE MARQUEE FOOTER */}
      <footer className="fixed bottom-0 w-full bg-black border-t-4 border-black z-50 h-12 flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex">
            <span className="text-pink-500 text-[8px] font-bold tracking-[0.3em] uppercase py-2">
              {marqueeText}
            </span>
            <span className="text-pink-500 text-[8px] font-bold tracking-[0.3em] uppercase py-2">
              {marqueeText}
            </span>
            <span className="text-pink-500 text-[8px] font-bold tracking-[0.3em] uppercase py-2">
              {marqueeText}
            </span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100% / 3)); } }
        @keyframes scroll-right { 0% { transform: translateX(calc(-100% / 3)); } 100% { transform: translateX(0); } }
        @keyframes marquee-infinite { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-scroll-right { animation: scroll-right 30s linear infinite; }
        .animate-marquee { animation: marquee-infinite 20s linear infinite; display: flex; width: fit-content; }
        .pixelated { image-rendering: pixelated; }
        img { image-rendering: pixelated; }
      `}</style>
    </main>
  );
}
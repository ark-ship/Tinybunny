import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    // Ambil data dari body request
    const body = await request.json();
    const { destinationAddress, qty } = body;

    // Setup Provider MegaETH
    const provider = new ethers.JsonRpcProvider("https://carrot.megaeth.com/rpc");
    
    // Generate Burner Wallet (Relayer)
    const burner = ethers.Wallet.createRandom().connect(provider);

    // Kirim data balik ke terminal (Frontend)
    return NextResponse.json({ 
      paymentAddress: burner.address,
      relayerKey: burner.privateKey 
    });

  } catch (error) {
    console.error("Error in API Route:", error);
    return NextResponse.json({ error: "Failed to create relayer" }, { status: 500 });
  }
}
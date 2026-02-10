#!/bin/bash

# --- CONFIG (ADJUST HERE) ---
MINT_PRICE="0.0002"  # NFT Price in Contract
GAS_BUFFER="0.0001"  # Buffer for MegaETH gas fees
TOTAL_ASK="0.0003"   # Total amount user needs to send
CONTRACT_ADDR="0xd64a8cB9D0658597859369d1768bDcDA63a5BaaD"

# --- UI VIBES ---
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
clear
echo -e "${CYAN}"
echo "  _   _  _   _  ____   _____  ____  "
echo " | | | || | | ||  _ \ | ____||  _ \ "
echo " | |_| || |_| || |_) ||  _|  | |_) |"
echo " |  _  | \__  ||  __/ | |___ |  _ < "
echo " |_| |_|    |_||_|    |_____||_| \_\\"
echo -e "${NC}"
echo -e "${CYAN}/// HYPER PROTOCOL: VENDING MACHINE V2.1${NC}"
echo -e "${GREEN}/// STATUS: SECURE RELAYER ACTIVE${NC}"

# --- INPUT ---
echo -e "\n${YELLOW}[INPUT] Enter your Destination Wallet Address (NFT Receiver):${NC}"
read -p "> " DEST_WALLET < /dev/tty

# Validate Address format
if [[ ! "$DEST_WALLET" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo -e "${RED}[ERROR] Invalid Ethereum address format!${NC}"
    exit 1
fi

# --- JS RELAYER ENGINE ---
cat <<EOF > _relay.js
const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://carrot.megaeth.com/rpc");
    
    // Generate an ephemeral burner wallet for this session
    const burner = ethers.Wallet.createRandom().connect(provider);
    
    console.log("\n=============================================");
    console.log("   💳 PAYMENT REQUIRED (MEGAETH NETWORK)");
    console.log("=============================================");
    console.log("SEND EXACTLY : $TOTAL_ASK ETH");
    console.log("TO ADDRESS   : " + burner.address);
    console.log("=============================================");
    console.log("/// Monitoring incoming funds...");

    while (true) {
        try {
            const balance = await provider.getBalance(burner.address);
            const targetWei = ethers.parseEther("$TOTAL_ASK");

            if (balance >= targetWei) {
                console.log("\n\n\x1b[32m/// FUNDS RECEIVED! INITIATING MINT...\x1b[0m");
                
                const contract = new ethers.Contract("$CONTRACT_ADDR", [
                    "function mint() external payable", 
                    "function transferFrom(address from, address to, uint256 id) external", 
                    "event Transfer(address indexed from, address indexed to, uint256 indexed id)"
                ], burner);

                // Step 1: Mint NFT to Burner
                console.log("/// Step 1: Minting NFT (Price: $MINT_PRICE ETH)...");
                const txMint = await contract.mint({ value: ethers.parseEther("$MINT_PRICE") });
                const receipt = await txMint.wait();
                
                // Parse Token ID from Transfer event
                const log = receipt.logs.find(l => l.topics[0] === ethers.id("Transfer(address,address,uint256)"));
                const tokenID = parseInt(log.topics[3], 16);

                // Step 2: Transfer NFT to User
                console.log("/// Step 2: Delivering NFT #" + tokenID + " to receiver...");
                const txTransfer = await contract.transferFrom(burner.address, "$DEST_WALLET", tokenID);
                await txTransfer.wait();
                
                console.log("\n\x1b[32m=============================================");
                console.log("   ✅ SUCCESS! NFT DELIVERED SUCCESSFULLY");
                console.log("=============================================");
                console.log("Receiver: $DEST_WALLET");
                console.log("Token ID: #" + tokenID);
                console.log("=============================================\x1b[0m");
                process.exit(0);
            }
        } catch (error) {
            // Silence polling errors
        }
        process.stdout.write(".");
        await new Promise(r => setTimeout(r, 3000));
    }
}
main();
EOF

# Execute
node _relay.js

# Cleanup
rm _relay.js
require('dotenv').config();
const { ethers } = require('ethers');
const CONTRACT_ABI = require("./abi");

// Function to initialize provider and contract
async function initializeEthereum() {
    try {
        // Configure provider with network settings
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_URL || "http://127.0.0.1:8545/",
            {
                chainId: 31337,
                name: 'localhost',
                ensAddress: null
            }
        );

        // Test provider connection
        const network = await provider.getNetwork();
        console.log("Successfully connected to network:", {
            chainId: network.chainId,
            name: network.name
        });

        // Initialize wallet with private key from env or default Hardhat account
        const privateKey = process.env.PRIVATE_KEY || 
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const wallet = new ethers.Wallet(privateKey, provider);

        // Get wallet address and balance
        const address = await wallet.getAddress();
        const balance = await provider.getBalance(address);
        console.log("Wallet Address:", address);
        console.log("Balance:", ethers.utils.formatEther(balance), "ETH");

        // Initialize contract with address from env or deployed contract
        const contractAddress = process.env.CONTRACT_ADDRESS || 
            "0xa196769ca67f4903eca574f5e76e003071a4d84a";
        
        if (!contractAddress) {
            throw new Error("Contract address not provided");
        }

        // Initialize contract
        const votingContract = new ethers.Contract(
            contractAddress,
            CONTRACT_ABI,
            wallet
        );

        // Verify contract connection
        try {
            await votingContract.deployed();
            console.log("Contract connected successfully at:", contractAddress);
        } catch (error) {
            console.error("Failed to connect to contract. Please check:");
            console.error("1. Contract address is correct");
            console.error("2. Contract is deployed");
            console.error("3. ABI matches the deployed contract");
            throw error;
        }

        return { provider, wallet, votingContract };
    } catch (error) {
        console.error("Initialization error:", error.message);
        if (error.code === 'NETWORK_ERROR') {
            console.error("Network connection failed. Please check:");
            console.error("1. Hardhat node is running");
            console.error("2. The network endpoint is accessible");
            console.error("3. Your firewall/network settings allow the connection");
        }
        throw error;
    }
}

// Test function with additional contract verification
async function test() {
    try {
        const { provider, wallet, votingContract } = await initializeEthereum();
        
        // Test contract interaction
        console.log("\nTesting contract interaction...");
        
        // Create test election
        const electionId = 1;
        const now = Math.floor(Date.now() / 1000);
        const startTime = now + 3600; // Start in 1 hour
        const endTime = startTime + (7 * 24 * 60 * 60); // 7 days duration

        console.log("Creating test election:", {
            electionId,
            startTime: new Date(startTime * 1000).toISOString(),
            endTime: new Date(endTime * 1000).toISOString()
        });

        const tx = await votingContract.createElection(electionId, startTime, endTime);
        await tx.wait();
        // const tx = await votingContract.elections();
        console.log("Test election created successfully",tx);

    } catch (error) {
        console.error("Test failed:", error);
        
        if (error.code === 'CALL_EXCEPTION') {
            console.error("Contract call failed. Details:", {
                address: error.address,
                method: error.method,
                args: error.args
            });
        }
    }
}

module.exports = {
    initializeEthereum,
    test
};
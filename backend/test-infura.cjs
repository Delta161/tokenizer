require('dotenv').config();
const { ethers } = require('ethers');

async function testConnection() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Connected to Ethereum! Current block:", blockNumber);
  } catch (err) {
    console.error("❌ Error connecting to Ethereum:", err.message);
  }
}

testConnection();

const { ethers } = require('ethers');
require('dotenv').config();

const tokenAddress = '0x21c3320b0b7555f3e63f5c72d123fabb23ae906a'; // Working ERC-20 on Sepolia
const walletAddress = '0x000000000000000000000000000000000000dead';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

const contract = new ethers.Contract(tokenAddress, abi, provider);

(async () => {
  try {
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.name, `(chainId: ${network.chainId})`);

    console.log('🔎 Fetching name...');
    const name = await contract.name();
    console.log('✅ Name:', name);

    console.log('🔎 Fetching symbol...');
    const symbol = await contract.symbol();
    console.log('✅ Symbol:', symbol);

    console.log('🔎 Fetching decimals...');
    const decimals = await contract.decimals();
    console.log('✅ Decimals:', decimals);

    console.log('🔎 Fetching total supply...');
    const totalSupply = await contract.totalSupply();
    console.log('✅ Total Supply:', totalSupply.toString());

    console.log(`🔎 Fetching balance of ${walletAddress}...`);
    const balance = await contract.balanceOf(walletAddress);
    console.log(`✅ Balance: ${balance.toString()}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();

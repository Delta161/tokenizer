const { ethers } = require("ethers");
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Example ERC-20 ABI (symbol, totalSupply, balanceOf)
const erc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

// Initialize contract instance
function getERC20Contract(tokenAddress) {
  return new ethers.Contract(tokenAddress, erc20Abi, provider);
}

// Fetch token metadata
async function getTokenMetadata(tokenAddress) {
  const contract = getERC20Contract(tokenAddress);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply()
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString()
  };
}

// Get token balance of a wallet
async function getTokenBalance(tokenAddress, walletAddress) {
  const contract = getERC20Contract(tokenAddress);
  const balance = await contract.balanceOf(walletAddress);
  return balance.toString();
}

module.exports = {
  getTokenMetadata,
  getTokenBalance
};


// 1️⃣ Load a contract
function getERC20Contract(tokenAddress) {
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
  ];
  return new ethers.Contract(tokenAddress, abi, provider);
}

// 2️⃣ Get token metadata
async function getTokenMetadata(tokenAddress) {
  const contract = getERC20Contract(tokenAddress);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString(),
  };
}

// 3️⃣ Get wallet balance
async function getTokenBalance(tokenAddress, walletAddress) {
  const contract = getERC20Contract(tokenAddress);
  const balance = await contract.balanceOf(walletAddress);
  return balance.toString();
}

module.exports = {
  getERC20Contract,
  getTokenMetadata,
  getTokenBalance,
};

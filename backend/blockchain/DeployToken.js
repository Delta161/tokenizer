require("dotenv").config();
const hre = require("hardhat");

async function deployToken() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("📤 Deploying ERC-20 contract with wallet:", deployer.address);

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = await Token.deploy(1_000_000); // Just await here
  await token.waitForDeployment(); // ✅ Required in Ethers v6

  const deployedAddress = await token.getAddress(); // ✅ Ethers v6 method
  console.log("✅ ERC-20 Token deployed at:", deployedAddress);

  return deployedAddress;
}

if (require.main === module) {
  deployToken().catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
}

module.exports = deployToken;

import { network } from "hardhat";

async function main() {
  console.log("Deploying LoyaltyToken...");

  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const token = await LoyaltyToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("✅ LoyaltyToken deployed to:", address);
  console.log("Deployer is the owner and initial minter.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
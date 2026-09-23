const { ethers } = require("ethers");
const abi = require("./abi");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

async function awardPoints(userAddress, amount) {
  const tx = await contract.awardPoints(userAddress, amount);
  const receipt = await tx.wait();
  return receipt;
}

async function getPoints(userAddress) {
  const balance = await contract.balanceOf(userAddress);
  return balance.toString();
}

async function redeemPointsForUser(userAddress, amount) {
  const balance = await contract.balanceOf(userAddress);
  if (BigInt(balance) < BigInt(amount)) {
    throw new Error(`Insufficient points. You have ${balance}, need ${amount}.`);
  }

  const tx = await contract.adminRedeem(userAddress, amount);
  const receipt = await tx.wait();
  return receipt;
}

module.exports = { awardPoints, getPoints, redeemPointsForUser, contract };
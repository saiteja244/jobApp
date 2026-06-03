const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying JobPortal contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const JobPortal = await ethers.getContractFactory("JobPortal");
  const jobPortal = await JobPortal.deploy();

  await jobPortal.waitForDeployment();

  const address = await jobPortal.getAddress();
  console.log("JobPortal deployed to:", address);
  console.log("Copy this address into Web3Context.jsx!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
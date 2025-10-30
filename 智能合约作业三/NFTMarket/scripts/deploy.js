import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy Mock Price Oracle
  console.log("Deploying MockPriceOracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const priceOracle = await MockPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("MockPriceOracle deployed to:", priceOracleAddress);

  // Set initial prices
  console.log("Setting initial prices...");
  await priceOracle.setPrice(ethers.ZeroAddress, 2000 * 1e8, 8);
  console.log("Set ETH price: $2000");

  // 2. Deploy NFT
  console.log("Deploying AuctionNFT...");
  const AuctionNFT = await ethers.getContractFactory("AuctionNFT");
  const nft = await AuctionNFT.deploy(
    "Auction NFT",
    "ANFT",
    "https://api.example.com/tokens/"
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("AuctionNFT deployed to:", nftAddress);

  // 3. Deploy Auction
  console.log("Deploying Auction...");
  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(priceOracleAddress);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("Auction deployed to:", auctionAddress);

  // 4. Deploy Factory
  console.log("Deploying AuctionFactory...");
  const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
  const factory = await AuctionFactory.deploy(priceOracleAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("AuctionFactory deployed to:", factoryAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("MockPriceOracle:", priceOracleAddress);
  console.log("AuctionNFT:", nftAddress);
  console.log("Auction:", auctionAddress);
  console.log("AuctionFactory:", factoryAddress);
  console.log("Deployer:", deployer.address);

  // Verify functionality
  console.log("\n=== Verification ===");
  const ethPrice = await priceOracle.getETHPrice();
  console.log("ETH Price from oracle:", ethPrice.toString());
  
  const oneEthInUSD = await priceOracle.convertToUSD(ethers.parseEther("1"), true, ethers.ZeroAddress);
  console.log("1 ETH in USD:", oneEthInUSD.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
import { expect } from "chai";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("NFT Auction Market", function () {
  async function deployContractsFixture() {
    const { ethers } = hre;
    const [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy Mock Price Oracle
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Set prices
    await priceOracle.setPrice(ethers.ZeroAddress, 2000 * 1e8, 8);

    // Deploy NFT
    const NFT = await ethers.getContractFactory("AuctionNFT");
    const nft = await NFT.deploy("Test NFT", "TNFT", "https://test.com/");
    await nft.waitForDeployment();

    // Deploy Auction
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(await priceOracle.getAddress());
    await auction.waitForDeployment();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("AuctionFactory");
    const factory = await Factory.deploy(await priceOracle.getAddress());
    await factory.waitForDeployment();

    return {
      owner,
      seller,
      bidder1,
      bidder2,
      priceOracle,
      nft,
      auction,
      factory
    };
  }

  describe("NFT Contract", function () {
    it("Should mint NFT successfully", async function () {
      const { nft, seller } = await loadFixture(deployContractsFixture);
      
      await nft.connect(seller).mint(seller.address);
      expect(await nft.ownerOf(1)).to.equal(seller.address);
      expect(await nft.totalSupply()).to.equal(1);
    });
  });

  describe("Auction Contract", function () {
    it("Should create auction successfully", async function () {
      const { nft, auction, seller } = await loadFixture(deployContractsFixture);
      
      await nft.connect(seller).mint(seller.address);
      await nft.connect(seller).approve(await auction.getAddress(), 1);

      await expect(
        auction.connect(seller).createAuction(
          await nft.getAddress(),
          1,
          3600,
          ethers.parseEther("1.0"),
          0,
          ethers.ZeroAddress
        )
      ).to.emit(auction, "AuctionCreated");
    });
  });
});
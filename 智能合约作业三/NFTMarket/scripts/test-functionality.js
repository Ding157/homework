import hre from "hardhat";

async function main() {
  console.log("=== NFT Auction Market 功能测试 ===\n");

  const { ethers } = hre;
  const [deployer, seller, bidder1, bidder2] = await ethers.getSigners();
  
  console.log("部署者:", deployer.address);
  console.log("卖家:", seller.address);
  console.log("竞拍者1:", bidder1.address);
  console.log("竞拍者2:", bidder2.address);
  console.log("");

  // 部署和测试代码...
}

main().catch((error) => {
  console.error("测试失败:", error);
  process.exitCode = 1;
});
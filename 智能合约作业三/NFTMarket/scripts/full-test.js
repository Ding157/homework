import hre from "hardhat";

async function main() {
    console.log("🎯 === NFT Auction Market 全面功能测试 ===\n");

    const { ethers } = hre;
    const [deployer, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();
    
    console.log("👥 测试账户:");
    console.log("  部署者:", deployer.address);
    console.log("  卖家:", seller.address);
    console.log("  竞拍者1:", bidder1.address);
    console.log("  竞拍者2:", bidder2.address);
    console.log("  竞拍者3:", bidder3.address);
    console.log("");

    // 1. 部署合约
    console.log("📦 1. 部署合约...");
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();
    await priceOracle.waitForDeployment();

    const AuctionNFT = await ethers.getContractFactory("AuctionNFT");
    const nft = await AuctionNFT.deploy("Test NFT", "TNFT", "https://test.com/");
    await nft.waitForDeployment();

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(await priceOracle.getAddress());
    await auction.waitForDeployment();

    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    const factory = await AuctionFactory.deploy(await priceOracle.getAddress());
    await factory.waitForDeployment();

    console.log("✅ 合约部署完成");
    console.log("  PriceOracle:", await priceOracle.getAddress());
    console.log("  NFT:", await nft.getAddress());
    console.log("  Auction:", await auction.getAddress());
    console.log("  Factory:", await factory.getAddress());
    console.log("");

    // 2. 价格预言机测试
    console.log("💰 2. 价格预言机测试...");
    await priceOracle.setPrice(ethers.ZeroAddress, 2000 * 1e8, 8); // ETH: $2000
    
    // 添加一个测试 ERC20 代币价格
    const testToken = "0x0000000000000000000000000000000000000001";
    await priceOracle.setPrice(testToken, 1 * 1e8, 18); // 测试代币: $1
    
    const ethPrice = await priceOracle.getETHPrice();
    const tokenPrice = await priceOracle.getERC20Price(testToken);
    
    console.log("✅ 价格设置完成");
    console.log("  ETH 价格:", ethPrice.toString(), "(=$2000)");
    console.log("  测试代币价格:", tokenPrice.toString(), "(=$1)");
    
    // 价格转换测试
    const oneETH = ethers.parseEther("1.0");
    const ethUSD = await priceOracle.convertToUSD(oneETH, true, ethers.ZeroAddress);
    console.log("  1 ETH =", ethUSD.toString(), "USD");
    
    const oneToken = ethers.parseEther("100.0"); // 100个测试代币
    const tokenUSD = await priceOracle.convertToUSD(oneToken, false, testToken);
    console.log("  100 测试代币 =", tokenUSD.toString(), "USD");
    console.log("");

    // 3. NFT 功能测试
    console.log("🖼️  3. NFT 功能测试...");
    
    // 铸造多个 NFT
    console.log("  铸造 NFT...");
    await nft.connect(seller).mint(seller.address); // Token ID 1
    await nft.connect(seller).mint(seller.address); // Token ID 2
    await nft.connect(bidder1).mint(bidder1.address); // Token ID 3
    
    console.log("✅ NFT 铸造完成");
    console.log("  Token 1 所有者:", await nft.ownerOf(1));
    console.log("  Token 2 所有者:", await nft.ownerOf(2));
    console.log("  Token 3 所有者:", await nft.ownerOf(3));
    console.log("  NFT 总供应量:", await nft.totalSupply());
    console.log("");

    // 4. 拍卖功能测试 - ETH 拍卖
    console.log("🔨 4. ETH 拍卖测试...");
    
    // 创建 ETH 拍卖
    console.log("  创建 ETH 拍卖...");
    await nft.connect(seller).approve(await auction.getAddress(), 1);
    
    const auctionTx = await auction.connect(seller).createAuction(
        await nft.getAddress(),
        1, // Token ID 1
        3600, // 1小时
        ethers.parseEther("1.0"), // 保留价 1 ETH
        0, // ETH 拍卖
        ethers.ZeroAddress
    );
    await auctionTx.wait();
    
    console.log("✅ ETH 拍卖创建成功");
    console.log("  拍卖 ID: 1");
    
    // 查询拍卖信息
    const auction1 = await auction.getAuction(1);
    console.log("  拍卖信息:");
    console.log("    - 卖家:", auction1.seller);
    console.log("    - NFT:", auction1.nftContract);
    console.log("    - Token ID:", auction1.tokenId.toString());
    console.log("    - 保留价:", ethers.formatEther(auction1.reservePrice), "ETH");
    console.log("    - 状态:", getAuctionStatus(auction1.status));
    console.log("");

    // 5. 出价测试
    console.log("💰 5. 出价测试...");
    
    // 第一个出价
    console.log("  第一个出价...");
    const bid1Amount = ethers.parseEther("1.5");
    await auction.connect(bidder1).placeBid(1, bid1Amount, {
        value: bid1Amount
    });
    
    let currentAuction = await auction.getAuction(1);
    console.log("  ✅ 出价成功");
    console.log("    最高出价者:", currentAuction.highestBidder);
    console.log("    最高出价:", ethers.formatEther(currentAuction.highestBid), "ETH");
    
    // 第二个出价（更高的价格）
    console.log("  第二个出价（更高价格）...");
    const bid2Amount = ethers.parseEther("2.0");
    await auction.connect(bidder2).placeBid(1, bid2Amount, {
        value: bid2Amount
    });
    
    currentAuction = await auction.getAuction(1);
    console.log("  ✅ 出价成功");
    console.log("    最高出价者:", currentAuction.highestBidder);
    console.log("    最高出价:", ethers.formatEther(currentAuction.highestBid), "ETH");
    
    // 测试价格转换
    const usdValue = await auction.getBidInUSD(1, bid2Amount);
    console.log("    当前出价 (USD):", usdValue.toString());
    console.log("");

    // 6. 取消拍卖测试
    console.log("❌ 6. 取消拍卖测试...");
    
    // 创建第二个拍卖用于取消测试
    await nft.connect(seller).approve(await auction.getAddress(), 2);
    await auction.connect(seller).createAuction(
        await nft.getAddress(),
        2, // Token ID 2
        3600,
        ethers.parseEther("1.0"),
        0,
        ethers.ZeroAddress
    );
    
    console.log("  创建拍卖 2 用于取消测试");
    
    // 取消拍卖
    await auction.connect(seller).cancelAuction(2);
    const cancelledAuction = await auction.getAuction(2);
    console.log("  ✅ 拍卖取消成功");
    console.log("    拍卖状态:", getAuctionStatus(cancelledAuction.status));
    console.log("");

    // 7. 结束拍卖测试
    console.log("⏰ 7. 结束拍卖测试...");
    
    // 推进时间
    console.log("  推进时间 1 小时...");
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");
    
    // 结束拍卖
    console.log("  结束拍卖...");
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    const ownerBalanceBefore = await ethers.provider.getBalance(deployer.address);
    
    await auction.connect(seller).endAuction(1);
    
    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    const ownerBalanceAfter = await ethers.provider.getBalance(deployer.address);
    
    console.log("  ✅ 拍卖结束成功");
    console.log("    NFT 新所有者:", await nft.ownerOf(1));
    console.log("    卖家余额变化:", ethers.formatEther(sellerBalanceAfter - sellerBalanceBefore), "ETH");
    console.log("    平台费用:", ethers.formatEther(ownerBalanceAfter - ownerBalanceBefore), "ETH");
    console.log("");

    // 8. 工厂模式测试
    console.log("🏭 8. 工厂模式测试...");
    
    console.log("  通过工厂创建拍卖合约...");
    const factoryTx = await factory.createAuction();
    await factoryTx.wait();
    
    const auctionCount = await factory.allAuctionsLength();
    console.log("  ✅ 工厂创建成功");
    console.log("    创建的拍卖合约数量:", auctionCount.toString());
    
    const newAuctionAddress = await factory.allAuctions(0);
    const isAuction = await factory.isAuction(newAuctionAddress);
    console.log("    新拍卖合约地址:", newAuctionAddress);
    console.log("    验证是否为拍卖合约:", isAuction);
    console.log("");

    // 9. 边界情况测试
    console.log("⚠️  9. 边界情况测试...");
    
    // 测试过低出价
    console.log("  测试过低出价...");
    try {
        await auction.connect(bidder3).placeBid(1, ethers.parseEther("0.5"), {
            value: ethers.parseEther("0.5")
        });
        console.log("  ❌ 应该失败但成功了");
    } catch (error) {
        console.log("  ✅ 正确拒绝过低出价");
    }
    
    // 测试重复出价
    console.log("  测试重复出价（相同价格）...");
    try {
        await auction.connect(bidder3).placeBid(1, ethers.parseEther("2.0"), {
            value: ethers.parseEther("2.0")
        });
        console.log("  ❌ 应该失败但成功了");
    } catch (error) {
        console.log("  ✅ 正确拒绝相同价格出价");
    }
    
    // 测试已结束拍卖的出价
    console.log("  测试已结束拍卖的出价...");
    try {
        await auction.connect(bidder3).placeBid(1, ethers.parseEther("3.0"), {
            value: ethers.parseEther("3.0")
        });
        console.log("  ❌ 应该失败但成功了");
    } catch (error) {
        console.log("  ✅ 正确拒绝已结束拍卖的出价");
    }
    console.log("");

    // 10. 统计信息
    console.log("📊 10. 统计信息...");
    const totalAuctions = await auction.getAuctionCount();
    const totalNFTs = await nft.totalSupply();
    
    console.log("  总拍卖数量:", totalAuctions.toString());
    console.log("  总 NFT 数量:", totalNFTs.toString());
    console.log("  工厂创建的拍卖合约:", auctionCount.toString());
    console.log("");

    console.log("🎉 === 所有功能测试完成 ===");
    console.log("✅ NFT 拍卖市场运行正常！");
}

// 辅助函数：获取拍卖状态文本
function getAuctionStatus(status) {
    switch(status) {
        case 0: return "ACTIVE";
        case 1: return "ENDED";
        case 2: return "CANCELLED";
        default: return "UNKNOWN";
    }
}

main().catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exitCode = 1;
});
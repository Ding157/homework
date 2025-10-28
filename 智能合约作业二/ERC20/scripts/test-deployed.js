

async function main() {
  // 已部署的合约地址
  const CONTRACT_ADDRESS = "0x694A9B2D272831772b1707dc84C0b9aA4bF54111";
  
  // 获取合约实例
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const token = SimpleERC20.attach(CONTRACT_ADDRESS);
  
  console.log("🔗 连接到已部署的合约:", CONTRACT_ADDRESS);
  
  const [owner] = await ethers.getSigners();
  console.log("测试账户:", owner.address);
  
  // 测试只读函数
  console.log("代币名称:", await token.name());
  console.log("代币符号:", await token.symbol());
  console.log("总供应量:", ethers.utils.formatUnits(await token.totalSupply(), 18));
  console.log("账户余额:", ethers.utils.formatUnits(await token.balanceOf(owner.address), 18));
  
  // 测试转账（小金额避免浪费Gas）
  const testAmount = ethers.utils.parseUnits("1", 18);
  console.log("\n测试转账 1 TEST...");
  
  const tx = await token.transfer(owner.address, testAmount); // 转给自己测试
  await tx.wait();
  console.log("✅ 转账测试成功");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
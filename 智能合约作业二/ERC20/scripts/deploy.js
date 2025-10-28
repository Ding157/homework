async function main() {
  const [deployer] = await ethers.getSigners();

  // console.log("部署合约的账户:", deployer.address);
  // console.log("账户余额:", (await deployer.getBalance()).toString());

  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const token = await SimpleERC20.deploy(
    "My Test Token",     // 代币名称
    "MTT",               // 代币符号
    18,                  // 小数位数
    1000000              // 初始供应量 100万
  );

  await token.deployed();

  console.log("代币合约部署地址:", token.address);
  console.log("代币名称:", await token.name());
  console.log("代币符号:", await token.symbol());
  console.log("总供应量:", (await token.totalSupply()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
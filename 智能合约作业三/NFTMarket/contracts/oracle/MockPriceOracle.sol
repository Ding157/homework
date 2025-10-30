// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle, Ownable {
    struct TokenPrice {
        uint256 price;
        uint8 decimals;
    }
    
    mapping(address => TokenPrice) public prices;
    
    event PriceUpdated(address indexed token, uint256 price, uint8 decimals);

    constructor() Ownable(msg.sender) {
        prices[address(0)] = TokenPrice(2000 * 1e8, 8);
    }

    function setPrice(address token, uint256 price, uint8 decimals) external onlyOwner {
        prices[token] = TokenPrice(price, decimals);
        emit PriceUpdated(token, price, decimals);
    }

    function getETHPrice() external view returns (uint256) {
        return getERC20Price(address(0));
    }

    function getERC20Price(address token) public view returns (uint256) {
        TokenPrice memory tokenPrice = prices[token];
        require(tokenPrice.price > 0, "Price not set");
        return tokenPrice.price;
    }

    function convertToUSD(
        uint256 amount, 
        bool isETH, 
        address token
    ) external view returns (uint256) {
        address tokenAddress = isETH ? address(0) : token;
        TokenPrice memory tokenPrice = prices[tokenAddress];
        require(tokenPrice.price > 0, "Price not set");
        
        uint256 usdValue = (amount * tokenPrice.price) / (10 ** tokenPrice.decimals);
        return usdValue;
    }
}
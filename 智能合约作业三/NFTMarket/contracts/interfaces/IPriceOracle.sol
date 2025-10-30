// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceOracle {
    function getETHPrice() external view returns (uint256);
    
    function getERC20Price(address token) external view returns (uint256);
    
    function convertToUSD(
        uint256 amount, 
        bool isETH, 
        address token
    ) external view returns (uint256);
}
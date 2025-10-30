// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuctionFactory {
    event AuctionCreated(address indexed auction, address indexed creator);
    
    function createAuction() external returns (address auction);
    function allAuctionsLength() external view returns (uint256);
    function allAuctions(uint256 index) external view returns (address);
    function isAuction(address auction) external view returns (bool);
}
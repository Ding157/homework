// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAuctionFactory.sol";

contract AuctionFactory is IAuctionFactory, Ownable {
    address[] public allAuctionContracts;
    mapping(address => bool) public isAuctionContract;
    
    address public priceOracle;
    address public template;

    constructor(address _priceOracle) Ownable(msg.sender) {
        priceOracle = _priceOracle;
        template = address(new AuctionTemplate());
    }

    function createAuction() external override returns (address auction) {
        bytes20 targetBytes = bytes20(template);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            auction := create(0, clone, 0x37)
        }
        
        require(auction != address(0), "Auction creation failed");
        
        (bool success, ) = auction.call(abi.encodeWithSignature("initialize(address)", priceOracle));
        require(success, "Auction initialization failed");
        
        (success, ) = auction.call(abi.encodeWithSignature("transferOwnership(address)", msg.sender));
        require(success, "Ownership transfer failed");
        
        allAuctionContracts.push(auction);
        isAuctionContract[auction] = true;
        
        emit AuctionCreated(auction, msg.sender);
        return auction;
    }

    function allAuctionsLength() external view override returns (uint256) {
        return allAuctionContracts.length;
    }

    function allAuctions(uint256 index) external view override returns (address) {
        require(index < allAuctionContracts.length, "Index out of bounds");
        return allAuctionContracts[index];
    }

    function isAuction(address _auction) external view override returns (bool) {
        return isAuctionContract[_auction];
    }

    function setPriceOracle(address newOracle) external onlyOwner {
        priceOracle = newOracle;
    }
}

contract AuctionTemplate {
    constructor() {}
    
    function initialize(address priceOracle) external {}
}
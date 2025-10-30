// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAuction.sol";
import "../interfaces/IPriceOracle.sol";

contract Auction is IAuction, ReentrancyGuard, Ownable {
    uint256 private _auctionIdCounter;

    IPriceOracle public priceOracle;
    uint256 public platformFeeBPS;
    uint256 public minBidIncrementBPS;
    
    mapping(uint256 => AuctionInfo) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;

    constructor(address _priceOracle) Ownable(msg.sender) {
        priceOracle = IPriceOracle(_priceOracle);
        platformFeeBPS = 250;
        minBidIncrementBPS = 500;
        _auctionIdCounter = 0;
    }

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 duration,
        uint256 reservePrice,
        PaymentCurrency paymentCurrency,
        address erc20Token
    ) external override returns (uint256) {
        require(duration > 0, "Duration must be positive");
        require(reservePrice > 0, "Reserve price must be positive");
        
        if (paymentCurrency == PaymentCurrency.ERC20) {
            require(erc20Token != address(0), "ERC20 token address required");
        }

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        _auctionIdCounter++;
        uint256 auctionId = _auctionIdCounter;

        auctions[auctionId] = AuctionInfo({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            reservePrice: reservePrice,
            paymentCurrency: paymentCurrency,
            erc20Token: erc20Token,
            highestBidder: address(0),
            highestBid: 0,
            status: AuctionStatus.ACTIVE
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            nftContract,
            tokenId,
            block.timestamp,
            block.timestamp + duration,
            reservePrice,
            paymentCurrency,
            erc20Token
        );

        return auctionId;
    }

    function placeBid(uint256 auctionId, uint256 amount) external payable override nonReentrant {
        AuctionInfo storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        
        uint256 minBid = auction.highestBid == 0 ? 
            auction.reservePrice : 
            auction.highestBid + (auction.highestBid * minBidIncrementBPS) / 10000;
        
        require(amount >= minBid, "Bid too low");

        if (auction.paymentCurrency == PaymentCurrency.ETH) {
            require(msg.value == amount, "ETH amount mismatch");
            if (auction.highestBidder != address(0)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            }
        } else {
            require(msg.value == 0, "ETH not accepted for ERC20 auction");
            IERC20 token = IERC20(auction.erc20Token);
            require(token.transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
            
            if (auction.highestBidder != address(0)) {
                require(token.transfer(auction.highestBidder, auction.highestBid), "Refund failed");
            }
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = amount;

        emit BidPlaced(auctionId, msg.sender, amount, auction.paymentCurrency);
    }

    function endAuction(uint256 auctionId) external override nonReentrant {
        AuctionInfo storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(
            block.timestamp >= auction.endTime || msg.sender == auction.seller,
            "Auction not ended"
        );

        auction.status = AuctionStatus.ENDED;

        if (auction.highestBidder != address(0)) {
            uint256 platformFee = (auction.highestBid * platformFeeBPS) / 10000;
            uint256 sellerAmount = auction.highestBid - platformFee;

            IERC721(auction.nftContract).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );

            if (auction.paymentCurrency == PaymentCurrency.ETH) {
                payable(auction.seller).transfer(sellerAmount);
                payable(owner()).transfer(platformFee);
            } else {
                IERC20 token = IERC20(auction.erc20Token);
                require(token.transfer(auction.seller, sellerAmount), "Transfer to seller failed");
                require(token.transfer(owner(), platformFee), "Transfer fee failed");
            }
        } else {
            IERC721(auction.nftContract).transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    function cancelAuction(uint256 auctionId) external override {
        AuctionInfo storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(
            msg.sender == auction.seller || msg.sender == owner(),
            "Not authorized"
        );
        require(auction.highestBidder == address(0), "Bids already placed");

        auction.status = AuctionStatus.CANCELLED;

        IERC721(auction.nftContract).transferFrom(
            address(this),
            auction.seller,
            auction.tokenId
        );

        emit AuctionCancelled(auctionId);
    }

    function getAuction(uint256 auctionId) external view override returns (AuctionInfo memory) {
        return auctions[auctionId];
    }

    function getAuctionCount() external view override returns (uint256) {
        return _auctionIdCounter;
    }

    function getBidInUSD(
        uint256 auctionId,
        uint256 amount
    ) external view override returns (uint256) {
        AuctionInfo memory auction = auctions[auctionId];
        bool isETH = auction.paymentCurrency == PaymentCurrency.ETH;
        address token = isETH ? address(0) : auction.erc20Token;
        
        return priceOracle.convertToUSD(amount, isETH, token);
    }

    function setPlatformFee(uint256 newFeeBPS) external onlyOwner {
        require(newFeeBPS <= 1000, "Fee too high");
        platformFeeBPS = newFeeBPS;
    }

    function setMinBidIncrement(uint256 newIncrementBPS) external onlyOwner {
        require(newIncrementBPS <= 1000, "Increment too high");
        minBidIncrementBPS = newIncrementBPS;
    }
}
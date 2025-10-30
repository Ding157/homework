// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuction {
    enum AuctionStatus { ACTIVE, ENDED, CANCELLED }
    enum PaymentCurrency { ETH, ERC20 }

    struct AuctionInfo {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 reservePrice;
        PaymentCurrency paymentCurrency;
        address erc20Token;
        address highestBidder;
        uint256 highestBid;
        AuctionStatus status;
    }

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime,
        uint256 reservePrice,
        PaymentCurrency paymentCurrency,
        address erc20Token
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        PaymentCurrency paymentCurrency
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );

    event AuctionCancelled(uint256 indexed auctionId);

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 duration,
        uint256 reservePrice,
        PaymentCurrency paymentCurrency,
        address erc20Token
    ) external returns (uint256);

    function placeBid(uint256 auctionId, uint256 amount) external payable;

    function endAuction(uint256 auctionId) external;

    function cancelAuction(uint256 auctionId) external;

    function getAuction(uint256 auctionId) external view returns (AuctionInfo memory);

    function getAuctionCount() external view returns (uint256);
    
    function getBidInUSD(uint256 auctionId, uint256 amount) external view returns (uint256);
}
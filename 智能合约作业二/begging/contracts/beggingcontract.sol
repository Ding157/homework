// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdvancedBeggingContract{
    address public owner;
    mapping(address=>uint256) public donations;
    uint256 public totalDonations;

    // 捐赠时间限制
    uint256 public startTime;
    uint256 public endTime;
    bool public timeRestrictionEnabled;

    // 捐赠事件
    event Donation(address indexed donor, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp);

    // 捐赠者结构体，用于排行榜
    struct Donor{
        address donorAddress;
        uint256 amount;
    }

    Donor[] public topDonors;

    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier donationPeriod() {
        if (timeRestrictionEnabled) {
            require(block.timestamp >= startTime && block.timestamp <= endTime, "Donations are not allowed at this time");
        }
        _;
    }

    constructor(){
        owner = msg.sender;
        timeRestrictionEnabled = false;
        // 初始化排行榜
        for (uint i = 0; i < 3; i++) {
            topDonors.push(Donor(address(0), 0));
        }

    }
  function donate() external payable donationPeriod {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        
        // 更新排行榜
        _updateTopDonors(msg.sender, donations[msg.sender]);
        
        emit Donation(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner).transfer(balance);
        emit Withdrawal(owner, balance, block.timestamp);
    }

     function getDonation(address donor) external view returns (uint256) {
        return donations[donor];
    }

    // 设置捐赠时间段
    function setDonationPeriod(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime < _endTime, "Start time must be before end time");
        startTime = _startTime;
        endTime = _endTime;
        timeRestrictionEnabled = true;
    }
    
    // 禁用时间限制
    function disableTimeRestriction() external onlyOwner {
        timeRestrictionEnabled = false;
    }
    

    // 获取排行榜
    function getTopDonors() external view returns (Donor[3] memory) {
        Donor[3] memory result;
        for (uint i = 0; i < 3; i++) {
            result[i] = topDonors[i];
        }
        return result;
    }

    // 更新排行榜内部函数
    function _updateTopDonors(address donor, uint256 amount) private {
        // 检查是否已经在排行榜中
        int256 existingIndex = -1;
        for (uint i = 0; i < 3; i++) {
            if (topDonors[i].donorAddress == donor) {
                existingIndex = int256(i);
                break;
            }
        }
        
        if (existingIndex >= 0) {
            // 更新现有捐赠者金额
            topDonors[uint256(existingIndex)].amount = amount;
        } else {
            // 检查是否可以进入排行榜
            for (uint i = 0; i < 3; i++) {
                if (amount > topDonors[i].amount) {
                    // 插入到合适位置
                    for (uint j = 2; j > i; j--) {
                        topDonors[j] = topDonors[j - 1];
                    }
                    topDonors[i] = Donor(donor, amount);
                    break;
                }
            }
        }
        
        // 重新排序确保正确顺序
        _sortTopDonors();
    }
    

     // 排序排行榜
    function _sortTopDonors() private {
        for (uint i = 0; i < 2; i++) {
            for (uint j = 0; j < 2 - i; j++) {
                if (topDonors[j].amount < topDonors[j + 1].amount) {
                    Donor memory temp = topDonors[j];
                    topDonors[j] = topDonors[j + 1];
                    topDonors[j + 1] = temp;
                }
            }
        }
    }

     function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable donationPeriod {
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        _updateTopDonors(msg.sender, donations[msg.sender]);
        emit Donation(msg.sender, msg.value, block.timestamp);
    }

}
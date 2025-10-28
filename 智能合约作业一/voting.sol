// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // 存储候选人的得票数
    mapping(string => uint256) private votes;

    // 存储所有候选人的名字，用于重置功能
    string[] private candidateNames;

    // 事件：投票时触发
    event Voted(address indexed voter, string candidate, uint256 newVoteCount);

    // 事件：重置投票时触发
    event VotesReset(address indexed resetBy);

    function vote(string memory candidate) public {
        require(bytes(candidate).length > 0, "Candidate name cannot be empty");
        // 如果是第一次给这个候选人投票，将其添加到候选人列表中
        if (votes[candidate] == 0 && !isCandidateInList(candidate)) {
            candidateNames.push(candidate);
        }
        votes[candidate]++;
        emit Voted(msg.sender, candidate, votes[candidate]);
    }

    // 获取某个候选人的得票数
    function getVotes(string memory candidate) public view returns (uint256) {
        return votes[candidate];
    }

    // 重置所有候选人的得票数
    function resetVotes() public {
        for (uint256 i = 0; i < candidateNames.length; i++) {
            votes[candidateNames[i]] = 0;
        }
        emit VotesReset(msg.sender);
    }

    // 获取候选人总数
    function getCandidateCount() public view returns (uint256) {
        return candidateNames.length;
    }

    // 获取指定索引的候选人名字
    function getCandidateName(uint256 index) public view returns (string memory) {
        require(index < candidateNames.length, "Index out of bounds");
        return candidateNames[index];
    }

    // 内部函数：检查候选人是否已经在列表中
    function isCandidateInList(string memory candidate) private view returns (bool) {
        for (uint256 i = 0; i < candidateNames.length; i++) {
            if (keccak256(bytes(candidateNames[i])) == keccak256(bytes(candidate))) {
                return true;
            }
        }
        return false;
    }

    


}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BinarySearchOptimized {
    /**
     * @dev 优化的二分查找 - 使用uint256避免类型转换
     */
    function binarySearch(uint256[] memory nums, uint256 target) 
        public 
        pure 
        returns (int256) 
    {
        uint256 length = nums.length;
        if (length == 0) return -1;
        
        uint256 left = 0;
        uint256 right = length - 1;
        
        while (left <= right) {
            // 使用位运算计算中间值（更高效）
            uint256 mid = (left + right) >> 1; // 等同于 (left + right) / 2
            
            if (nums[mid] == target) {
                return int256(mid);
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                // 防止下溢
                if (mid == 0) break;
                right = mid - 1;
            }
        }
        
        return -1;
    }
    
    /**
     * @dev 递归版本的二分查找
     */
    function binarySearchRecursive(uint256[] memory nums, uint256 target) 
        public 
        pure 
        returns (int256) 
    {
        return _binarySearchRecursive(nums, target, 0, nums.length - 1);
    }
    
    function _binarySearchRecursive(
        uint256[] memory nums, 
        uint256 target, 
        uint256 left, 
        uint256 right
    ) private pure returns (int256) {
        if (left > right) return -1;
        
        uint256 mid = (left + right) >> 1;
        
        if (nums[mid] == target) {
            return int256(mid);
        } else if (nums[mid] < target) {
            return _binarySearchRecursive(nums, target, mid + 1, right);
        } else {
            if (mid == 0) return -1;
            return _binarySearchRecursive(nums, target, left, mid - 1);
        }
    }
}
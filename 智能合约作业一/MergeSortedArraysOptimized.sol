// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MergeSortedArraysOptimized {
    /**
     * @dev 优化的合并函数 - 使用固定大小数组避免动态数组操作
     */
    function merge(uint256[] memory nums1, uint256[] memory nums2) 
        public 
        pure 
        returns (uint256[] memory) 
    {
        uint256 m = nums1.length;
        uint256 n = nums2.length;
        
        if (m == 0) return nums2;
        if (n == 0) return nums1;
        
        uint256[] memory result = new uint256[](m + n);
        uint256 i = 0;
        uint256 j = 0;
        uint256 k = 0;
        
        // 主合并循环
        while (i < m && j < n) {
            // 使用三元运算符减少条件判断
            if (nums1[i] < nums2[j]) {
                result[k++] = nums1[i++];
            } else {
                result[k++] = nums2[j++];
            }
        }
        
        // 复制剩余元素
        while (i < m) {
            result[k++] = nums1[i++];
        }
        
        while (j < n) {
            result[k++] = nums2[j++];
        }
        
        return result;
    }
    
    /**
     * @dev 原地合并版本（修改第一个数组）
     * 注意：这个版本假设nums1有足够的空间容纳所有元素
     */
    function mergeInPlace(
        uint256[] memory nums1, 
        uint256 m, // nums1中的有效元素数量
        uint256[] memory nums2, 
        uint256 n  // nums2中的有效元素数量
    ) public pure {
        require(nums1.length >= m + n, "nums1 too small");
        
        uint256 i = m - 1;     // nums1有效元素末尾
        uint256 j = n - 1;     // nums2末尾
        uint256 k = m + n - 1; // 合并后数组末尾
        
        // 从后向前合并，避免元素覆盖
        while (i >= 0 && j >= 0) {
            if (nums1[i] > nums2[j]) {
                nums1[k] = nums1[i];
                i--;
            } else {
                nums1[k] = nums2[j];
                j--;
            }
            k--;
        }
        
        // 复制nums2剩余元素
        while (j >= 0) {
            nums1[k] = nums2[j];
            j--;
            k--;
        }
    }
}
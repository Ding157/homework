// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReverseString {
    /**
     * @dev 反转字符串
     * @param str 输入字符串
     * @return 反转后的字符串
     */
    function reverse(string memory str) public pure returns (string memory) {
        // 将字符串转换为bytes类型
        bytes memory strBytes = bytes(str);
        bytes memory reversed = new bytes(strBytes.length);
        
        // 反转操作
        for (uint i = 0; i < strBytes.length; i++) {
            reversed[i] = strBytes[strBytes.length - 1 - i];
        }
        
        return string(reversed);
    }
    
    /**
     * @dev 测试函数 - 反转 "abcde"
     */
    function testReverse() public pure returns (string memory) {
        return reverse("abcde");
    }
}
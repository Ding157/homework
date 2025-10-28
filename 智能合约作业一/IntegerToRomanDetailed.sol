// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IntegerToRomanDetailed {
    /**
     * @dev 按照详细规则实现的转换函数
     */
    function intToRoman(uint256 num) public pure returns (string memory) {
        require(num > 0 && num < 4000, "Number must be between 1 and 3999");
        
        bytes memory roman;
        
        // 处理千位
        uint256 thousands = num / 1000;
        for (uint256 i = 0; i < thousands; i++) {
            roman = abi.encodePacked(roman, "M");
        }
        num %= 1000;
        
        // 处理百位
        roman = abi.encodePacked(roman, _convertDigit(num / 100, "C", "D", "M"));
        num %= 100;
        
        // 处理十位
        roman = abi.encodePacked(roman, _convertDigit(num / 10, "X", "L", "C"));
        num %= 10;
        
        // 处理个位
        roman = abi.encodePacked(roman, _convertDigit(num, "I", "V", "X"));
        
        return string(roman);
    }
    
    /**
     * @dev 转换单个数字位 (0-9) 为罗马数字
     * @param digit 数字 (0-9)
     * @param one 单位符号 (I, X, C)
     * @param five 五单位符号 (V, L, D) 
     * @param ten 十单位符号 (X, C, M)
     */
    function _convertDigit(uint256 digit, string memory one, string memory five, string memory ten) 
        private 
        pure 
        returns (string memory) 
    {
        if (digit == 0) return "";
        if (digit <= 3) {
            bytes memory result;
            for (uint256 i = 0; i < digit; i++) {
                result = abi.encodePacked(result, one);
            }
            return string(result);
        } else if (digit == 4) {
            return string(abi.encodePacked(one, five));
        } else if (digit == 5) {
            return five;
        } else if (digit <= 8) {
            bytes memory result = bytes(five);
            for (uint256 i = 5; i < digit; i++) {
                result = abi.encodePacked(result, one);
            }
            return string(result);
        } else { // digit == 9
            return string(abi.encodePacked(one, ten));
        }
    }
}
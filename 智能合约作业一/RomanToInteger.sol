// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RomanToInteger {
    // 存储罗马字符到数值的映射
    mapping(bytes1 => uint256) private romanValues;
    
    // 事件：记录转换结果
    event RomanConverted(string roman, uint256 result);
    
    constructor() {
        // 初始化罗马数字映射
        romanValues['I'] = 1;
        romanValues['V'] = 5;
        romanValues['X'] = 10;
        romanValues['L'] = 50;
        romanValues['C'] = 100;
        romanValues['D'] = 500;
        romanValues['M'] = 1000;
    }
    
    /**
     * @dev 将罗马数字转换为整数
     * @param s 罗马数字字符串
     * @return 转换后的整数值
     */
    function romanToInt(string memory s) public returns (uint256) {
        bytes memory romanBytes = bytes(s);
        uint256 length = romanBytes.length;
        
        require(length > 0, "Empty string");
        
        uint256 total = 0;
        uint256 prevValue = 0;
        
        // 从右向左遍历，处理特殊情况
        for (uint256 i = length; i > 0; i--) {
            bytes1 currentChar = romanBytes[i - 1];
            uint256 currentValue = getRomanValue(currentChar);
            
            // 如果当前值小于前一个值，需要减去（如IV=4）
            if (currentValue < prevValue) {
                total -= currentValue;
            } else {
                total += currentValue;
            }
            
            prevValue = currentValue;
        }
        
        // 发射事件记录转换
        emit RomanConverted(s, total);
        
        return total;
    }
    
    /**
     * @dev 获取单个罗马字符的数值
     */
    function getRomanValue(bytes1 c) private view returns (uint256) {
        uint256 value = romanValues[c];
        require(value > 0, "Invalid Roman character");
        return value;
    }
    
    /**
     * @dev 批量测试函数
     */
    function testMultipleCases() public returns (uint256[10] memory results) {
        results[0] = romanToInt("III");        // 3
        results[1] = romanToInt("IV");         // 4
        results[2] = romanToInt("IX");         // 9
        results[3] = romanToInt("LVIII");      // 58
        results[4] = romanToInt("MCMXCIV");    // 1994
        results[5] = romanToInt("XII");        // 12
        results[6] = romanToInt("XXVII");      // 27
        results[7] = romanToInt("XL");         // 40
        results[8] = romanToInt("XC");         // 90
        results[9] = romanToInt("CD");         // 400
    }
    
    /**
     * @dev 验证特定测试用例
     */
    function testSpecificCase(string memory roman) public returns (uint256) {
        return romanToInt(roman);
    }
    
    /**
     * @dev 获取支持的罗马字符
     */
    function getSupportedCharacters() public pure returns (string memory) {
        return "IVXLCDM";
    }
}
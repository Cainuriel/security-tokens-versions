// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library LibSecurityToken {
    bytes32 constant SECURITY_TOKEN_STORAGE_POSITION = keccak256("security.token.storage");
    
    struct TransactionRecord {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }
    
    struct SecurityTokenStorage {
        // ERC20 Storage
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
        uint256 totalSupply;
        string name;
        string symbol;
        uint8 decimals;
        
        // ERC20Capped Storage
        uint256 cap;
        
        // Pausable Storage
        bool paused;
        
        // AccessControl Storage
        mapping(bytes32 => mapping(address => bool)) roles;
        mapping(bytes32 => bytes32) roleAdmins;
        
        // Security Token Specific Storage
        string isin;
        string instrumentType;
        string jurisdiction;
        
        // Whitelist/Blacklist Storage
        mapping(address => bool) whitelist;
        mapping(address => bool) blacklist;
        
        // Transaction Records Storage
        mapping(uint256 => TransactionRecord) transactionRecords;
        uint256 transactionCount;
        
        // Role Constants
        bytes32 adminRole;
        bytes32 minterRole;
        bytes32 pauserRole;
        bytes32 defaultAdminRole;
    }
    
    function securityTokenStorage() internal pure returns (SecurityTokenStorage storage sts) {
        bytes32 position = SECURITY_TOKEN_STORAGE_POSITION;
        assembly {
            sts.slot := position
        }
    }
}
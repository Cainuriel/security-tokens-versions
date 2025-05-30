
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

contract ComplianceFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    modifier onlyRole(bytes32 role) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        require(sts.roles[role][msg.sender], "AccessControl: account is missing role");
        _;
    }
    
    // Security token metadata
    function isin() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().isin;
    }
    
    function instrumentType() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().instrumentType;
    }
    
    function jurisdiction() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().jurisdiction;
    }
    
    function cap() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().cap;
    }
    
    // Transaction records
    function getTransactionRecord(uint256 id) external view returns (LibSecurityToken.TransactionRecord memory) {
        return LibSecurityToken.securityTokenStorage().transactionRecords[id];
    }
    
    function transactionCount() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().transactionCount;
    }
    
    // Transaction reversal (only for emergencies)
    function revertTransaction(uint256 transactionId) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        LibSecurityToken.TransactionRecord memory record = sts.transactionRecords[transactionId];
        
        require(record.from != address(0) && record.to != address(0), "Invalid transaction record");
        require(sts.balances[record.to] >= record.amount, "Insufficient balance for reversal");
        
        // Perform reverse transfer
        sts.balances[record.to] -= record.amount;
        sts.balances[record.from] += record.amount;
        
        // Record the reversal transaction
        sts.transactionCount += 1;
        sts.transactionRecords[sts.transactionCount] = LibSecurityToken.TransactionRecord({
            id: sts.transactionCount,
            from: record.to,
            to: record.from,
            amount: record.amount,
            timestamp: block.timestamp
        });
    }
    
    // Role constants getters
    function ADMIN_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().adminRole;
    }
    
    function MINTER_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().minterRole;
    }
    
    function PAUSER_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().pauserRole;
    }
    
    function DEFAULT_ADMIN_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().defaultAdminRole;
    }
}
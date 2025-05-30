// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

contract MintingFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    modifier onlyRole(bytes32 role) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        require(sts.roles[role][msg.sender], "AccessControl: account is missing role");
        _;
    }
    
    function mint(address to, uint256 amount) external onlyRole(LibSecurityToken.securityTokenStorage().minterRole) {
        require(to != address(0), "ERC20: mint to zero address");
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Check cap
        require(sts.totalSupply + amount <= sts.cap, "ERC20Capped: cap exceeded");
        
        sts.totalSupply += amount;
        sts.balances[to] += amount;
        
        // Record transaction
        sts.transactionCount += 1;
        sts.transactionRecords[sts.transactionCount] = LibSecurityToken.TransactionRecord({
            id: sts.transactionCount,
            from: address(0),
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });
        
        emit Transfer(address(0), to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) external {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 currentAllowance = sts.allowances[account][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        
        _burn(account, amount);
        sts.allowances[account][msg.sender] = currentAllowance - amount;
    }
    
    function _burn(address from, uint256 amount) internal {
        require(from != address(0), "ERC20: burn from zero address");
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 accountBalance = sts.balances[from];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        
        sts.balances[from] = accountBalance - amount;
        sts.totalSupply -= amount;
        
        // Record transaction
        sts.transactionCount += 1;
        sts.transactionRecords[sts.transactionCount] = LibSecurityToken.TransactionRecord({
            id: sts.transactionCount,
            from: from,
            to: address(0),
            amount: amount,
            timestamp: block.timestamp
        });
        
        emit Transfer(from, address(0), amount);
    }
}
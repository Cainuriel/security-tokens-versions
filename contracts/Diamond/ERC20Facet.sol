// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

contract ERC20Facet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    function name() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().name;
    }
    
    function symbol() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().symbol;
    }
    
    function decimals() external view returns (uint8) {
        return LibSecurityToken.securityTokenStorage().decimals;
    }
    
    function totalSupply() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().totalSupply;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().balances[account];
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 currentAllowance = sts.allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Security checks
        require(!sts.paused, "ERC20Pausable: token transfer while paused");
        require(sts.whitelist[from], "Sender is not whitelisted");
        require(!sts.blacklist[from], "Sender is blacklisted");
        require(sts.whitelist[to], "Recipient is not whitelisted");
        require(!sts.blacklist[to], "Recipient is blacklisted");
        
        uint256 fromBalance = sts.balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        sts.balances[from] = fromBalance - amount;
        sts.balances[to] += amount;
        
        // Record transaction
        sts.transactionCount += 1;
        sts.transactionRecords[sts.transactionCount] = LibSecurityToken.TransactionRecord({
            id: sts.transactionCount,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from zero address");
        require(spender != address(0), "ERC20: approve to zero address");
        
        LibSecurityToken.securityTokenStorage().allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
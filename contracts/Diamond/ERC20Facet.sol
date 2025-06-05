// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

/**
 * @title ERC20Facet
 * @dev Facet contract that implements ERC20 token functionality for the Diamond SecurityToken
 * @notice This facet provides:
 *         - Standard ERC20 token operations (transfer, approve, etc.)
 *         - Compliance checks during transfers
 *         - Transaction recording for regulatory purposes
 * @author ISBE Security Tokens Team
 */
contract ERC20Facet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    /// @notice Emitted when tokens are transferred from one account to another
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    /// @notice Emitted when the allowance of a spender for an owner is set
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // =============================================================
    //                           ERRORS
    // =============================================================
    
    /// @notice Thrown when transfer is attempted from zero address
    error ERC20InvalidSender(address sender);
    
    /// @notice Thrown when transfer is attempted to zero address
    error ERC20InvalidReceiver(address receiver);
    
    /// @notice Thrown when approve is attempted from zero address
    error ERC20InvalidApprover(address approver);
    
    /// @notice Thrown when approve is attempted to zero address
    error ERC20InvalidSpender(address spender);
    
    /// @notice Thrown when transfer amount exceeds balance
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    
    /// @notice Thrown when transfer amount exceeds allowance
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    
    /// @notice Thrown when token transfers are paused
    error ERC20TokenTransferPaused();
    
    /// @notice Thrown when sender is not whitelisted
    error SenderNotWhitelisted(address sender);
    
    /// @notice Thrown when recipient is not whitelisted
    error RecipientNotWhitelisted(address recipient);
    
    /// @notice Thrown when sender is blacklisted
    error SenderBlacklisted(address sender);
    
    /// @notice Thrown when recipient is blacklisted
    error RecipientBlacklisted(address recipient);

    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================    
    /**
     * @notice Returns the name of the token
     * @return The token name
     */
    function name() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().name;
    }
    
    /**
     * @notice Returns the symbol of the token
     * @return The token symbol
     */
    function symbol() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().symbol;
    }
    
    /**
     * @notice Returns the number of decimals used for token amounts
     * @return The number of decimals (typically 18)
     */
    function decimals() external view returns (uint8) {
        return LibSecurityToken.securityTokenStorage().decimals;
    }
    
    /**
     * @notice Returns the total token supply
     * @return The total supply of tokens
     */
    function totalSupply() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().totalSupply;
    }
    
    /**
     * @notice Returns the token balance of a specific account
     * @param account The address to query the balance of
     * @return The token balance of the account
     */
    function balanceOf(address account) external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().balances[account];
    }
    
    /**
     * @notice Returns the remaining number of tokens that spender is allowed to spend on behalf of owner
     * @param owner The address which owns the tokens
     * @param spender The address which will spend the tokens
     * @return The remaining allowance
     */
    function allowance(address owner, address spender) external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().allowances[owner][spender];
    }

    // =============================================================
    //                      TRANSFER FUNCTIONS
    // =============================================================
    
    /**
     * @notice Transfers tokens from the caller's account to another account
     * @param to The address to transfer tokens to
     * @param amount The amount of tokens to transfer
     * @return True if the transfer was successful
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @notice Transfers tokens from one account to another using an allowance
     * @param from The address to transfer tokens from
     * @param to The address to transfer tokens to
     * @param amount The amount of tokens to transfer
     * @return True if the transfer was successful
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 currentAllowance = sts.allowances[from][msg.sender];
        if (currentAllowance < amount) {
            revert ERC20InsufficientAllowance(msg.sender, currentAllowance, amount);
        }
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        
        return true;
    }

    // =============================================================
    //                      APPROVAL FUNCTIONS
    // =============================================================
      /**
     * @notice Sets the allowance amount for a spender
     * @param spender The address which will spend the tokens
     * @param amount The amount of tokens to allow
     * @return True if the approval was successful
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                              INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Internal function to transfer tokens between accounts with compliance checks
     * @param from The address to transfer tokens from
     * @param to The address to transfer tokens to
     * @param amount The amount of tokens to transfer
     */
    function _transfer(address from, address to, uint256 amount) internal {
        if (from == address(0)) revert ERC20InvalidSender(address(0));
        if (to == address(0)) revert ERC20InvalidReceiver(address(0));
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Compliance checks
        if (sts.paused) revert ERC20TokenTransferPaused();
        if (!sts.whitelist[from]) revert SenderNotWhitelisted(from);
        if (sts.blacklist[from]) revert SenderBlacklisted(from);
        if (!sts.whitelist[to]) revert RecipientNotWhitelisted(to);
        if (sts.blacklist[to]) revert RecipientBlacklisted(to);
        
        uint256 fromBalance = sts.balances[from];
        if (fromBalance < amount) revert ERC20InsufficientBalance(from, fromBalance, amount);
        
        // Perform transfer
        sts.balances[from] = fromBalance - amount;
        sts.balances[to] += amount;
        
        // Record transaction for compliance
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
    
    /**
     * @dev Internal function to set allowance amount for a spender
     * @param owner The address which owns the tokens
     * @param spender The address which will spend the tokens
     * @param amount The allowance amount to set
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        if (owner == address(0)) revert ERC20InvalidApprover(address(0));
        if (spender == address(0)) revert ERC20InvalidSpender(address(0));
        
        LibSecurityToken.securityTokenStorage().allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    // =============================================================
    //                      UTILITY FUNCTIONS
    // =============================================================
    
    /**
     * @notice Returns the version of the ERC20Facet
     * @return The version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
    
    /**
     * @notice Increases the allowance granted to spender by the caller
     * @param spender The address which will spend the tokens
     * @param addedValue The additional amount to increase the allowance by
     * @return True if the operation was successful
     */
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        uint256 currentAllowance = sts.allowances[msg.sender][spender];
        _approve(msg.sender, spender, currentAllowance + addedValue);
        return true;
    }
    
    /**
     * @notice Decreases the allowance granted to spender by the caller
     * @param spender The address which will spend the tokens
     * @param subtractedValue The amount to decrease the allowance by
     * @return True if the operation was successful
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        uint256 currentAllowance = sts.allowances[msg.sender][spender];
        
        if (currentAllowance < subtractedValue) {
            revert ERC20InsufficientAllowance(spender, currentAllowance, subtractedValue);
        }
        
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }
}
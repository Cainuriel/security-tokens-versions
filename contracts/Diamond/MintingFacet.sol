// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './Librarys/LibSecurityToken.sol';

/**
 * @title MintingFacet
 * @author ISBE Security Tokens Team
 * @notice Facet contract for minting and burning security tokens
 * @dev This facet handles token creation and destruction operations with proper
 *      compliance tracking and supply cap enforcement. Part of the Diamond pattern.
 */
contract MintingFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;

    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the MintingFacet contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when tokens are transferred, including minting and burning
     * @param from The address tokens are transferred from (address(0) for minting)
     * @param to The address tokens are transferred to (address(0) for burning)
     * @param value The amount of tokens transferred
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when caller doesn't have the required role
    error UnauthorizedRole(address caller, bytes32 requiredRole);
    
    /// @notice Thrown when attempting to mint to zero address
    error MintToZeroAddress();
    
    /// @notice Thrown when minting would exceed the token cap
    error CapExceeded(uint256 totalSupply, uint256 amount, uint256 cap);
    
    /// @notice Thrown when attempting to burn from zero address
    error BurnFromZeroAddress();
    
    /// @notice Thrown when burn amount exceeds account balance
    error BurnAmountExceedsBalance(address account, uint256 amount, uint256 balance);
    
    /// @notice Thrown when burn amount exceeds allowance
    error InsufficientAllowance(address owner, address spender, uint256 amount, uint256 allowance);

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Modifier to check if caller has the required role
     * @param role The role to check for
     */
    modifier onlyRole(bytes32 role) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        if (!sts.roles[role][msg.sender]) {
            revert UnauthorizedRole(msg.sender, role);
        }
        _;
    }
      /*//////////////////////////////////////////////////////////////
                              MINTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mints new tokens to a specified address
     * @dev Only callable by addresses with MINTER_ROLE. Enforces supply cap and records transaction.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(LibSecurityToken.securityTokenStorage().minterRole) {
        if (to == address(0)) {
            revert MintToZeroAddress();
        }
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Check cap
        if (sts.totalSupply + amount > sts.cap) {
            revert CapExceeded(sts.totalSupply, amount, sts.cap);
        }
        
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

    /**
     * @notice Batch mints tokens to multiple addresses
     * @dev Only callable by addresses with MINTER_ROLE. More gas efficient for multiple recipients.
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each recipient
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        onlyRole(LibSecurityToken.securityTokenStorage().minterRole) 
    {
        if (recipients.length != amounts.length) {
            revert("Arrays length mismatch");
        }
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Calculate total amount first to check cap
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        if (sts.totalSupply + totalAmount > sts.cap) {
            revert CapExceeded(sts.totalSupply, totalAmount, sts.cap);
        }
        
        // Execute mints
        for (uint256 i = 0; i < recipients.length; i++) {
            address to = recipients[i];
            uint256 amount = amounts[i];
            
            if (to == address(0)) {
                revert MintToZeroAddress();
            }
            
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
        
        sts.totalSupply += totalAmount;
    }
      /*//////////////////////////////////////////////////////////////
                              BURNING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Burns tokens from the caller's balance
     * @dev Destroys tokens and reduces total supply. Records transaction for compliance.
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @notice Burns tokens from another account using allowance
     * @dev Requires sufficient allowance from the token owner. Reduces allowance after burning.
     * @param account The account to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) external {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 currentAllowance = sts.allowances[account][msg.sender];
        if (currentAllowance < amount) {
            revert InsufficientAllowance(account, msg.sender, amount, currentAllowance);
        }
        
        _burn(account, amount);
        sts.allowances[account][msg.sender] = currentAllowance - amount;
    }

    /**
     * @notice Internal function to burn tokens from an account
     * @dev Handles the core burning logic with proper validation and transaction recording
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function _burn(address from, uint256 amount) internal {
        if (from == address(0)) {
            revert BurnFromZeroAddress();
        }
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        uint256 accountBalance = sts.balances[from];
        if (accountBalance < amount) {
            revert BurnAmountExceedsBalance(from, amount, accountBalance);
        }
        
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

    /*//////////////////////////////////////////////////////////////
                              VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the remaining tokens that can be minted
     * @return The difference between cap and current total supply
     */
    function mintableAmount() external view returns (uint256) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        return sts.cap - sts.totalSupply;
    }

    /**
     * @notice Checks if a specific amount can be minted
     * @param amount The amount to check
     * @return Whether the amount can be minted without exceeding cap
     */
    function canMint(uint256 amount) external view returns (bool) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        return sts.totalSupply + amount <= sts.cap;
    }

    /**
     * @notice Returns the maximum amount an account can burn
     * @param account The account to check
     * @return The account's token balance (maximum burnable amount)
     */
    function burnableAmount(address account) external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().balances[account];
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this facet contract
     * @return The version string
     */
    function mintingFacetVersion() external pure returns (string memory) {
        return VERSION;
    }

    /**
     * @notice Returns comprehensive minting information
     * @return totalSupply Current total supply
     * @return cap Maximum supply cap
     * @return mintable Remaining mintable amount
     */
    function getMintingInfo() 
        external 
        view 
        returns (
            uint256 totalSupply,
            uint256 cap,
            uint256 mintable
        ) 
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        totalSupply = sts.totalSupply;
        cap = sts.cap;
        mintable = cap - totalSupply;
    }
}
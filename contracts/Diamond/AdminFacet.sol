// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

/**
 * @title AdminFacet
 * @dev Facet contract that handles administrative functions for the Diamond SecurityToken
 * @notice This facet provides:
 *         - Pause/unpause functionality
 *         - Whitelist/blacklist management
 *         - Role-based access control
 * @author ISBE Security Tokens Team
 */
contract AdminFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    /// @notice Emitted when the contract is paused
    event Paused(address account);
    
    /// @notice Emitted when the contract is unpaused
    event Unpaused(address account);
    
    /// @notice Emitted when a role is granted to an account
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    
    /// @notice Emitted when a role is revoked from an account
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    
    /// @notice Emitted when an address is added to the whitelist
    event WhitelistAdded(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is removed from the whitelist
    event WhitelistRemoved(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is added to the blacklist
    event BlacklistAdded(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is removed from the blacklist
    event BlacklistRemoved(address indexed account, address indexed admin);

    // =============================================================
    //                           ERRORS
    // =============================================================
    
    /// @notice Thrown when account is missing required role
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    
    /// @notice Thrown when sender must be an admin to grant/revoke roles
    error AccessControlSenderMustBeAdmin(address sender, bytes32 role);
    
    /// @notice Thrown when account address is zero
    error InvalidAccountAddress();

    // =============================================================
    //                           MODIFIERS
    // =============================================================    
    /// @notice Ensures the caller has the required role
    /// @param role The role required to call the function
    modifier onlyRole(bytes32 role) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        if (!sts.roles[role][msg.sender]) {
            revert AccessControlUnauthorizedAccount(msg.sender, role);
        }
        _;
    }
    
    /// @notice Ensures the account address is not zero
    /// @param account The address to validate
    modifier validAccount(address account) {
        if (account == address(0)) revert InvalidAccountAddress();
        _;
    }

    // =============================================================
    //                         PAUSE FUNCTIONS
    // =============================================================
    
    /**
     * @notice Pauses all token transfers
     * @dev Only accounts with PAUSER_ROLE can call this function
     */
    function pause() external onlyRole(LibSecurityToken.securityTokenStorage().pauserRole) {
        LibSecurityToken.securityTokenStorage().paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @notice Unpauses all token transfers
     * @dev Only accounts with PAUSER_ROLE can call this function
     */
    function unpause() external onlyRole(LibSecurityToken.securityTokenStorage().pauserRole) {
        LibSecurityToken.securityTokenStorage().paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @notice Returns whether the contract is paused
     * @return True if the contract is paused, false otherwise
     */
    function paused() external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().paused;
    }

    // =============================================================
    //                       WHITELIST FUNCTIONS
    // =============================================================
    
    /**
     * @notice Adds an address to the whitelist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to add to the whitelist
     */
    function addToWhitelist(address account) 
        external 
        onlyRole(LibSecurityToken.securityTokenStorage().adminRole) 
        validAccount(account)
    {
        LibSecurityToken.securityTokenStorage().whitelist[account] = true;
        emit WhitelistAdded(account, msg.sender);
    }
    
    /**
     * @notice Removes an address from the whitelist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to remove from the whitelist
     */
    function removeFromWhitelist(address account) 
        external 
        onlyRole(LibSecurityToken.securityTokenStorage().adminRole) 
        validAccount(account)
    {
        LibSecurityToken.securityTokenStorage().whitelist[account] = false;
        emit WhitelistRemoved(account, msg.sender);
    }
    
    /**
     * @notice Checks if an address is whitelisted
     * @param account The address to check
     * @return True if the address is whitelisted, false otherwise
     */
    function isWhitelisted(address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().whitelist[account];
    }

    // =============================================================
    //                       BLACKLIST FUNCTIONS
    // =============================================================
    
    /**
     * @notice Adds an address to the blacklist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to add to the blacklist
     */
    function addToBlacklist(address account) 
        external 
        onlyRole(LibSecurityToken.securityTokenStorage().adminRole) 
        validAccount(account)
    {
        LibSecurityToken.securityTokenStorage().blacklist[account] = true;
        emit BlacklistAdded(account, msg.sender);
    }
    
    /**
     * @notice Removes an address from the blacklist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to remove from the blacklist
     */
    function removeFromBlacklist(address account) 
        external 
        onlyRole(LibSecurityToken.securityTokenStorage().adminRole) 
        validAccount(account)
    {
        LibSecurityToken.securityTokenStorage().blacklist[account] = false;
        emit BlacklistRemoved(account, msg.sender);
    }
    
    /**
     * @notice Checks if an address is blacklisted
     * @param account The address to check
     * @return True if the address is blacklisted, false otherwise
     */
    function isBlacklisted(address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().blacklist[account];
    }

    // =============================================================
    //                         ROLE FUNCTIONS
    // =============================================================    
    /**
     * @notice Grants a role to an account
     * @dev Only accounts with admin role for the specific role can call this function
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function grantRole(bytes32 role, address account) 
        external 
        validAccount(account)
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        if (!sts.roles[sts.roleAdmins[role]][msg.sender]) {
            revert AccessControlSenderMustBeAdmin(msg.sender, role);
        }
        
        sts.roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }
    
    /**
     * @notice Revokes a role from an account
     * @dev Only accounts with admin role for the specific role can call this function
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function revokeRole(bytes32 role, address account) 
        external 
        validAccount(account)
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        if (!sts.roles[sts.roleAdmins[role]][msg.sender]) {
            revert AccessControlSenderMustBeAdmin(msg.sender, role);
        }
        
        sts.roles[role][account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }
    
    /**
     * @notice Checks if an account has a specific role
     * @param role The role to check
     * @param account The account to check
     * @return True if the account has the role, false otherwise
     */
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().roles[role][account];
    }
    
    /**
     * @notice Gets the admin role for a specific role
     * @param role The role to get the admin for
     * @return The admin role for the specified role
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().roleAdmins[role];
    }    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Batch check whitelist status for multiple addresses
     * @param accounts Array of addresses to check
     * @return statuses Array of whitelist statuses
     */
    function batchIsWhitelisted(address[] calldata accounts) 
        external 
        view 
        returns (bool[] memory statuses) 
    {
        statuses = new bool[](accounts.length);
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        for (uint256 i = 0; i < accounts.length; i++) {
            statuses[i] = sts.whitelist[accounts[i]];
        }
        return statuses;
    }
    
    /**
     * @notice Batch check blacklist status for multiple addresses
     * @param accounts Array of addresses to check
     * @return statuses Array of blacklist statuses
     */
    function batchIsBlacklisted(address[] calldata accounts) 
        external 
        view 
        returns (bool[] memory statuses) 
    {
        statuses = new bool[](accounts.length);
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        for (uint256 i = 0; i < accounts.length; i++) {
            statuses[i] = sts.blacklist[accounts[i]];
        }
        return statuses;
    }
}
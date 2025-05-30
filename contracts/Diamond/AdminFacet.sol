// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

contract AdminFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    event Paused(address account);
    event Unpaused(address account);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    
    modifier onlyRole(bytes32 role) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        require(sts.roles[role][msg.sender], "AccessControl: account is missing role");
        _;
    }
    
    // Pausable functions
    function pause() external onlyRole(LibSecurityToken.securityTokenStorage().pauserRole) {
        LibSecurityToken.securityTokenStorage().paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyRole(LibSecurityToken.securityTokenStorage().pauserRole) {
        LibSecurityToken.securityTokenStorage().paused = false;
        emit Unpaused(msg.sender);
    }
    
    function paused() external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().paused;
    }
    
    // Whitelist/Blacklist functions
    function addToWhitelist(address account) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.securityTokenStorage().whitelist[account] = true;
    }
    
    function removeFromWhitelist(address account) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.securityTokenStorage().whitelist[account] = false;
    }
    
    function addToBlacklist(address account) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.securityTokenStorage().blacklist[account] = true;
    }
    
    function removeFromBlacklist(address account) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.securityTokenStorage().blacklist[account] = false;
    }
    
    function isWhitelisted(address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().whitelist[account];
    }
    
    function isBlacklisted(address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().blacklist[account];
    }
    
    // Role management
    function grantRole(bytes32 role, address account) external {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        require(sts.roles[sts.roleAdmins[role]][msg.sender], "AccessControl: sender must be an admin");
        
        sts.roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }
    
    function revokeRole(bytes32 role, address account) external {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        require(sts.roles[sts.roleAdmins[role]][msg.sender], "AccessControl: sender must be an admin");
        
        sts.roles[role][account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }
    
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return LibSecurityToken.securityTokenStorage().roles[role][account];
    }
    
    function getRoleAdmin(bytes32 role) external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().roleAdmins[role];
    }
}
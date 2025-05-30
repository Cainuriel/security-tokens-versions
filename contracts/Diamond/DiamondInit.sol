// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibSecurityToken.sol';

contract DiamondInit {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;
    
    function init(
        string memory name,
        string memory symbol,
        uint256 cap,
        string memory _isin,
        string memory _instrumentType,
        string memory _jurisdiction,
        address admin
    ) external {
        require(admin != address(0), "Admin address cannot be zero");
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Initialize ERC20 data
        sts.name = name;
        sts.symbol = symbol;
        sts.decimals = 18;
        sts.cap = cap;
        
        // Initialize security token specific data
        sts.isin = _isin;
        sts.instrumentType = _instrumentType;
        sts.jurisdiction = _jurisdiction;
        
        // Initialize role constants
        sts.defaultAdminRole = 0x00;
        sts.adminRole = keccak256("ADMIN_ROLE");
        sts.minterRole = keccak256("MINTER_ROLE");
        sts.pauserRole = keccak256("PAUSER_ROLE");
        
        // Grant roles to admin
        sts.roles[sts.defaultAdminRole][admin] = true;
        sts.roles[sts.adminRole][admin] = true;
        sts.roles[sts.minterRole][admin] = true;
        sts.roles[sts.pauserRole][admin] = true;
        
        // Set role admins
        sts.roleAdmins[sts.adminRole] = sts.defaultAdminRole;
        sts.roleAdmins[sts.minterRole] = sts.adminRole;
        sts.roleAdmins[sts.pauserRole] = sts.adminRole;
    }
}
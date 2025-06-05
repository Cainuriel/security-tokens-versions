// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './Librarys/LibSecurityToken.sol';

/**
 * @title DiamondInit
 * @author ISBE Security Tokens Team
 * @notice Initialization contract for the Security Token Diamond
 * @dev This contract is used during diamond deployment to initialize storage.
 *      It sets up the ERC20 metadata, security token specific data, and role system.
 *      This contract is typically called once during diamond cut initialization.
 */
contract DiamondInit {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;

    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the DiamondInit contract
    string private constant VERSION = "1.0.0";

    /// @dev Default decimals for the security token
    uint8 private constant DEFAULT_DECIMALS = 18;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when admin address is zero
    error ZeroAdminAddress();
    
    /// @notice Thrown when cap is zero
    error ZeroCap();
    
    /// @notice Thrown when required string parameter is empty
    error EmptyString(string paramName);

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when the diamond is initialized
     * @param name Token name
     * @param symbol Token symbol
     * @param cap Maximum supply cap
     * @param isin ISIN identifier
     * @param instrumentType Type of security instrument
     * @param jurisdiction Regulatory jurisdiction
     * @param admin Initial admin address
     */
    event DiamondInitialized(
        string name,
        string symbol,
        uint256 cap,
        string isin,
        string instrumentType,
        string jurisdiction,
        address indexed admin
    );

    /*//////////////////////////////////////////////////////////////
                           INITIALIZATION FUNCTION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initialize the security token diamond storage
     * @dev This function should only be called once during diamond deployment
     * @param name The name of the security token
     * @param symbol The symbol of the security token
     * @param cap The maximum supply cap for the token
     * @param _isin The ISIN (International Securities Identification Number)
     * @param _instrumentType The type of security instrument (e.g., "BOND", "EQUITY")
     * @param _jurisdiction The regulatory jurisdiction
     * @param admin The initial admin address who will receive all roles
     */
    function init(
        string memory name,
        string memory symbol,
        uint256 cap,
        string memory _isin,
        string memory _instrumentType,
        string memory _jurisdiction,
        address admin
    ) external {
        // Input validation
        if (admin == address(0)) {
            revert ZeroAdminAddress();
        }
        if (cap == 0) {
            revert ZeroCap();
        }
        if (bytes(name).length == 0) {
            revert EmptyString("name");
        }
        if (bytes(symbol).length == 0) {
            revert EmptyString("symbol");
        }
        if (bytes(_isin).length == 0) {
            revert EmptyString("isin");
        }
        if (bytes(_instrumentType).length == 0) {
            revert EmptyString("instrumentType");
        }
        if (bytes(_jurisdiction).length == 0) {
            revert EmptyString("jurisdiction");
        }
        
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // Initialize ERC20 data
        sts.name = name;
        sts.symbol = symbol;
        sts.decimals = DEFAULT_DECIMALS;
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
        
        // Grant all roles to admin
        sts.roles[sts.defaultAdminRole][admin] = true;
        sts.roles[sts.adminRole][admin] = true;
        sts.roles[sts.minterRole][admin] = true;
        sts.roles[sts.pauserRole][admin] = true;
        
        // Set role hierarchy (role admins)
        sts.roleAdmins[sts.adminRole] = sts.defaultAdminRole;
        sts.roleAdmins[sts.minterRole] = sts.adminRole;
        sts.roleAdmins[sts.pauserRole] = sts.adminRole;

        // Initialize transaction counter
        sts.transactionCount = 0;
        
        // Initialize total supply (starts at 0)
        sts.totalSupply = 0;

        emit DiamondInitialized(
            name,
            symbol,
            cap,
            _isin,
            _instrumentType,
            _jurisdiction,
            admin
        );
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this initialization contract
     * @return The version string
     */
    function diamondInitVersion() external pure returns (string memory) {
        return VERSION;
    }
}
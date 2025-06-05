// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title LibSecurityToken
 * @author ISBE Security Tokens Team
 * @notice Library for security token storage management in diamond pattern
 * @dev This library implements diamond storage for security tokens, providing
 *      a unified storage structure for ERC20 functionality, compliance features,
 *      access control, and security token specific metadata.
 */
library LibSecurityToken {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Storage position for security token data using diamond storage pattern
    bytes32 constant SECURITY_TOKEN_STORAGE_POSITION = keccak256("isbe.security.token.storage");
    
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Struct representing a transaction record for compliance tracking
     * @param id Unique identifier for the transaction
     * @param from Address that sent the tokens (address(0) for minting)
     * @param to Address that received the tokens (address(0) for burning)
     * @param amount Number of tokens transferred
     * @param timestamp Block timestamp when the transaction occurred
     */
    struct TransactionRecord {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }
    
    /**
     * @notice Main storage struct for security token data
     * @dev Uses diamond storage pattern to maintain state across facets
     */
    struct SecurityTokenStorage {
        // ERC20 Standard Storage
        /// @dev Mapping of account balances
        mapping(address => uint256) balances;
        /// @dev Mapping of allowances (owner => spender => amount)
        mapping(address => mapping(address => uint256)) allowances;
        /// @dev Total supply of tokens
        uint256 totalSupply;
        /// @dev Token name
        string name;
        /// @dev Token symbol
        string symbol;
        /// @dev Token decimals (typically 18)
        uint8 decimals;
        
        // ERC20Capped Extension Storage
        /// @dev Maximum supply cap for the token
        uint256 cap;
        
        // Pausable Functionality Storage
        /// @dev Whether token transfers are paused
        bool paused;
        
        // Access Control Storage
        /// @dev Mapping of roles to accounts (role => account => hasRole)
        mapping(bytes32 => mapping(address => bool)) roles;
        /// @dev Mapping of role admins (role => adminRole)
        mapping(bytes32 => bytes32) roleAdmins;
        
        // Security Token Specific Storage
        /// @dev ISIN (International Securities Identification Number)
        string isin;
        /// @dev Type of security instrument (e.g., "BOND", "EQUITY")
        string instrumentType;
        /// @dev Regulatory jurisdiction
        string jurisdiction;
        
        // Compliance Storage
        /// @dev Mapping of whitelisted addresses
        mapping(address => bool) whitelist;
        /// @dev Mapping of blacklisted addresses
        mapping(address => bool) blacklist;
        
        // Transaction Recording Storage
        /// @dev Mapping of transaction IDs to transaction records
        mapping(uint256 => TransactionRecord) transactionRecords;
        /// @dev Counter for transaction records
        uint256 transactionCount;
        
        // Role Constants Storage
        /// @dev Admin role identifier
        bytes32 adminRole;
        /// @dev Minter role identifier
        bytes32 minterRole;
        /// @dev Pauser role identifier
        bytes32 pauserRole;
        /// @dev Default admin role identifier (usually 0x00)
        bytes32 defaultAdminRole;    }
    
    /*//////////////////////////////////////////////////////////////
                              STORAGE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the security token storage struct
     * @dev Uses diamond storage pattern to access the storage slot
     * @return sts The SecurityTokenStorage struct containing all token data
     */
    function securityTokenStorage() internal pure returns (SecurityTokenStorage storage sts) {
        bytes32 position = SECURITY_TOKEN_STORAGE_POSITION;
        assembly {
            sts.slot := position
        }
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the storage position constant
     * @dev Useful for debugging and verification purposes
     * @return The storage position as bytes32
     */
    function getStoragePosition() internal pure returns (bytes32) {
        return SECURITY_TOKEN_STORAGE_POSITION;
    }

    /**
     * @notice Checks if storage has been initialized
     * @dev Checks if the name field has been set as an indicator of initialization
     * @return Whether the storage has been initialized
     */
    function isInitialized() internal view returns (bool) {
        SecurityTokenStorage storage sts = securityTokenStorage();
        return bytes(sts.name).length > 0;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './Librarys/LibSecurityToken.sol';

/**
 * @title ComplianceFacet
 * @author ISBE Security Tokens Team
 * @notice Facet contract for compliance and regulatory management of security tokens
 * @dev This facet handles compliance-related operations including transaction records,
 *      security token metadata, and emergency transaction reversals. Part of the Diamond pattern.
 */
contract ComplianceFacet {
    using LibSecurityToken for LibSecurityToken.SecurityTokenStorage;

    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the ComplianceFacet contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when caller doesn't have the required role
    error UnauthorizedRole(address caller, bytes32 requiredRole);
    
    /// @notice Thrown when transaction record is invalid
    error InvalidTransactionRecord(uint256 transactionId);
    
    /// @notice Thrown when insufficient balance for reversal
    error InsufficientBalanceForReversal(address account, uint256 required, uint256 available);

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
                         SECURITY TOKEN METADATA
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the ISIN (International Securities Identification Number) of the security token
     * @return The ISIN identifier as a string
     */
    function isin() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().isin;
    }
    
    /**
     * @notice Returns the instrument type of the security token
     * @return The instrument type as a string (e.g., "BOND", "EQUITY")
     */
    function instrumentType() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().instrumentType;
    }
    
    /**
     * @notice Returns the jurisdiction where the security token is issued
     * @return The jurisdiction as a string
     */
    function jurisdiction() external view returns (string memory) {
        return LibSecurityToken.securityTokenStorage().jurisdiction;
    }
    
    /**
     * @notice Returns the maximum supply cap of the security token
     * @return The cap as the maximum number of tokens that can be minted
     */
    function cap() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().cap;
    }

    /*//////////////////////////////////////////////////////////////
                          TRANSACTION RECORDS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Retrieves a specific transaction record by ID
     * @param id The unique identifier of the transaction record
     * @return The transaction record containing transfer details
     */
    function getTransactionRecord(uint256 id) external view returns (LibSecurityToken.TransactionRecord memory) {
        return LibSecurityToken.securityTokenStorage().transactionRecords[id];
    }
    
    /**
     * @notice Returns the total number of recorded transactions
     * @return The count of all transactions that have been recorded
     */
    function transactionCount() external view returns (uint256) {
        return LibSecurityToken.securityTokenStorage().transactionCount;
    }

    /**
     * @notice Retrieves multiple transaction records with pagination
     * @param offset The starting index for pagination
     * @param limit The maximum number of records to return
     * @return records Array of transaction records
     * @return total Total number of transaction records
     */
    function getTransactionRecords(uint256 offset, uint256 limit) 
        external 
        view 
        returns (LibSecurityToken.TransactionRecord[] memory records, uint256 total) 
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        total = sts.transactionCount;
        
        if (offset >= total) {
            return (new LibSecurityToken.TransactionRecord[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 length = end - offset;
        records = new LibSecurityToken.TransactionRecord[](length);
        
        for (uint256 i = 0; i < length; i++) {
            records[i] = sts.transactionRecords[offset + i + 1]; // Transaction IDs start from 1
        }
    }

    /**
     * @notice Retrieves transaction records for a specific address
     * @param account The address to get transaction records for
     * @param asFrom Whether to get transactions where account is the sender
     * @return records Array of relevant transaction records
     */
    function getTransactionRecordsForAccount(address account, bool asFrom) 
        external 
        view 
        returns (LibSecurityToken.TransactionRecord[] memory records) 
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        
        // First pass: count matching records
        uint256 count = 0;
        for (uint256 i = 1; i <= sts.transactionCount; i++) {
            LibSecurityToken.TransactionRecord storage record = sts.transactionRecords[i];
            if ((asFrom && record.from == account) || (!asFrom && record.to == account)) {
                count++;
            }
        }
        
        // Second pass: collect matching records
        records = new LibSecurityToken.TransactionRecord[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= sts.transactionCount; i++) {
            LibSecurityToken.TransactionRecord storage record = sts.transactionRecords[i];
            if ((asFrom && record.from == account) || (!asFrom && record.to == account)) {
                records[index] = record;
                index++;
            }
        }
    }
      /*//////////////////////////////////////////////////////////////
                         EMERGENCY OPERATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Reverts a transaction in case of emergency or regulatory compliance
     * @dev Only callable by admin role. Creates a reverse transaction record.
     * @param transactionId The ID of the transaction to revert
     */
    function revertTransaction(uint256 transactionId) external onlyRole(LibSecurityToken.securityTokenStorage().adminRole) {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        LibSecurityToken.TransactionRecord memory record = sts.transactionRecords[transactionId];
        
        if (record.from == address(0) || record.to == address(0)) {
            revert InvalidTransactionRecord(transactionId);
        }
        
        if (sts.balances[record.to] < record.amount) {
            revert InsufficientBalanceForReversal(record.to, record.amount, sts.balances[record.to]);
        }
        
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

    /*//////////////////////////////////////////////////////////////
                              ROLE GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the admin role identifier
     * @return The bytes32 identifier for the admin role
     */
    function ADMIN_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().adminRole;
    }
    
    /**
     * @notice Returns the minter role identifier
     * @return The bytes32 identifier for the minter role
     */
    function MINTER_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().minterRole;
    }
    
    /**
     * @notice Returns the pauser role identifier
     * @return The bytes32 identifier for the pauser role
     */
    function PAUSER_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().pauserRole;
    }
    
    /**
     * @notice Returns the default admin role identifier
     * @return The bytes32 identifier for the default admin role
     */
    function DEFAULT_ADMIN_ROLE() external view returns (bytes32) {
        return LibSecurityToken.securityTokenStorage().defaultAdminRole;
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this facet contract
     * @return The version string
     */
    function complianceFacetVersion() external pure returns (string memory) {
        return VERSION;    }

    /**
     * @notice Returns comprehensive compliance information for the security token
     * @return isinCode The ISIN identifier
     * @return tokenType The instrument type
     * @return tokenJurisdiction The jurisdiction
     * @return maxSupply The supply cap
     * @return totalTransactions The total number of transactions
     */
    function getComplianceInfo() 
        external 
        view 
        returns (
            string memory isinCode,
            string memory tokenType,
            string memory tokenJurisdiction,
            uint256 maxSupply,
            uint256 totalTransactions
        ) 
    {
        LibSecurityToken.SecurityTokenStorage storage sts = LibSecurityToken.securityTokenStorage();
        return (
            sts.isin,
            sts.instrumentType,
            sts.jurisdiction,
            sts.cap,
            sts.transactionCount
        );
    }
}
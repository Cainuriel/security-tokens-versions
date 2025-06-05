// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title SecurityToken
 * @dev A regulated ERC20 token with compliance features for security tokens
 * @notice This contract implements a security token with:
 *         - Role-based access control
 *         - Whitelist/blacklist functionality
 *         - Transaction recording for compliance
 *         - Pausable transfers
 *         - Supply cap enforcement
 *         - Upgradeable architecture
 * @author ISBE Tokens Team
 */
contract SecurityToken is 
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    ERC20CappedUpgradeable,
    AccessControlUpgradeable
{
    // =============================================================
    //                           CONSTANTS
    // =============================================================
    
    /// @notice Role constants don't interfere with upgrade layout as they are completely safe in upgradeable contracts.
    /// This is the recommended way by OpenZeppelin to define roles in AccessControl.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice ISIN (International Securities Identification Number) of the security
    string public isin;
    
    /// @notice Type of financial instrument (e.g., "bond", "equity", "fund")
    string public instrumentType;
    
    /// @notice Legal jurisdiction governing this security
    string public jurisdiction;

    /// @notice Mapping of addresses allowed to transfer tokens
    mapping(address => bool) public whitelist;
    
    /// @notice Mapping of addresses prohibited from transferring tokens
    mapping(address => bool) public blacklist;

    /// @notice Record of a token transfer for compliance tracking
    struct TransactionRecord {
        uint256 id;           // Unique transaction identifier
        address from;         // Sender address
        address to;          // Recipient address
        uint256 amount;      // Amount transferred
        uint256 timestamp;   // Block timestamp of the transaction
    }

    /// @notice Mapping from transaction ID to transaction record
    mapping(uint256 => TransactionRecord) private _transactionRecords;
    
    /// @notice Total number of recorded transactions
    uint256 public transactionCount;

    // =============================================================
    //                           EVENTS
    // =============================================================
    
    /// @notice Emitted when an address is added to the whitelist
    event WhitelistAdded(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is removed from the whitelist
    event WhitelistRemoved(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is added to the blacklist
    event BlacklistAdded(address indexed account, address indexed admin);
    
    /// @notice Emitted when an address is removed from the blacklist
    event BlacklistRemoved(address indexed account, address indexed admin);
    
    /// @notice Emitted when a transaction is reverted by an admin
    event TransactionReverted(uint256 indexed transactionId, address indexed admin);

    // =============================================================
    //                           ERRORS
    // =============================================================
    
    /// @notice Thrown when admin address is zero during initialization
    error InvalidAdminAddress();
    
    /// @notice Thrown when sender is not whitelisted
    error SenderNotWhitelisted(address sender);
    
    /// @notice Thrown when recipient is not whitelisted
    error RecipientNotWhitelisted(address recipient);
    
    /// @notice Thrown when sender is blacklisted
    error SenderBlacklisted(address sender);
    
    /// @notice Thrown when recipient is blacklisted
    error RecipientBlacklisted(address recipient);
    
    /// @notice Thrown when transaction record is invalid
    error InvalidTransactionRecord(uint256 transactionId);

    // =============================================================
    //                           MODIFIERS
    // =============================================================
    
    /// @notice Ensures the address is not the zero address
    modifier notZeroAddress(address _address) {
        require(_address != address(0), "Address cannot be zero");
        _;
    }

    // =============================================================
    //                           INITIALIZATION
    // =============================================================

    /**
     * @notice Initializes the SecurityToken contract
     * @dev This function replaces the constructor for upgradeable contracts
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param cap The maximum supply cap for the token
     * @param _isin The ISIN code for the security
     * @param _instrumentType The type of financial instrument
     * @param _jurisdiction The legal jurisdiction
     * @param admin The address that will receive all admin roles
     */
    function initialize(
        string memory name,
        string memory symbol,
        uint256 cap,
        string memory _isin,
        string memory _instrumentType,
        string memory _jurisdiction,
        address admin
    ) public virtual initializer {
        if (admin == address(0)) revert InvalidAdminAddress();

        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __ERC20Capped_init(cap);
        __AccessControl_init();

        isin = _isin;
        instrumentType = _instrumentType;
        jurisdiction = _jurisdiction;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // =============================================================
    //                         MINTING FUNCTIONS
    // =============================================================

    /**
     * @notice Mints new tokens to a specified address
     * @dev Only accounts with MINTER_ROLE can call this function
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) 
        public 
        onlyRole(MINTER_ROLE) 
        notZeroAddress(to)
    {
        _mint(to, amount);
    }

    // =============================================================
    //                         PAUSE FUNCTIONS
    // =============================================================

    /**
     * @notice Pauses all token transfers
     * @dev Only accounts with PAUSER_ROLE can call this function
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses all token transfers
     * @dev Only accounts with PAUSER_ROLE can call this function
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
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
        onlyRole(ADMIN_ROLE) 
        notZeroAddress(account)
    {
        whitelist[account] = true;
        emit WhitelistAdded(account, msg.sender);
    }

    /**
     * @notice Removes an address from the whitelist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to remove from the whitelist
     */
    function removeFromWhitelist(address account) 
        external 
        onlyRole(ADMIN_ROLE) 
        notZeroAddress(account)
    {
        whitelist[account] = false;
        emit WhitelistRemoved(account, msg.sender);
    }

    /**
     * @notice Checks if an address is whitelisted
     * @param account The address to check
     * @return True if the address is whitelisted, false otherwise
     */
    function isWhitelisted(address account) external view returns (bool) {
        return whitelist[account];
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
        onlyRole(ADMIN_ROLE) 
        notZeroAddress(account)
    {
        blacklist[account] = true;
        emit BlacklistAdded(account, msg.sender);
    }

    /**
     * @notice Removes an address from the blacklist
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param account The address to remove from the blacklist
     */
    function removeFromBlacklist(address account) 
        external 
        onlyRole(ADMIN_ROLE) 
        notZeroAddress(account)
    {
        blacklist[account] = false;
        emit BlacklistRemoved(account, msg.sender);
    }

    /**
     * @notice Checks if an address is blacklisted
     * @param account The address to check
     * @return True if the address is blacklisted, false otherwise
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklist[account];
    }

    // =============================================================
    //                    COMPLIANCE FUNCTIONS
    // =============================================================

    /**
     * @notice Reverts a previous transaction by transferring tokens back
     * @dev Only accounts with ADMIN_ROLE can call this function
     * @param transactionId The ID of the transaction to revert
     */
    function revertTransaction(uint256 transactionId) external onlyRole(ADMIN_ROLE) {
        TransactionRecord memory record = _transactionRecords[transactionId];
        
        if (record.from == address(0) || record.to == address(0)) {
            revert InvalidTransactionRecord(transactionId);
        }

        _transfer(record.to, record.from, record.amount);
        emit TransactionReverted(transactionId, msg.sender);
    }

    /**
     * @notice Gets the details of a transaction record
     * @param id The transaction ID to query
     * @return The transaction record
     */
    function getTransactionRecord(uint256 id) external view returns (TransactionRecord memory) {
        return _transactionRecords[id];
    }

    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Override of ERC20 _update function to add compliance checks and transaction recording
     * @param from The address tokens are transferred from
     * @param to The address tokens are transferred to
     * @param amount The amount of tokens being transferred
     */
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable)
    {        // Check if contract is paused (handled by parent class)
        // The pause check is automatically handled by the parent _update function

        // Compliance checks for sender (skip for minting)
        if (from != address(0)) {
            if (!whitelist[from]) {
                revert SenderNotWhitelisted(from);
            }
            if (blacklist[from]) {
                revert SenderBlacklisted(from);
            }
        }

        // Compliance checks for recipient (skip for burning)
        if (to != address(0)) {
            if (!whitelist[to]) {
                revert RecipientNotWhitelisted(to);
            }
            if (blacklist[to]) {
                revert RecipientBlacklisted(to);
            }
        }

        // Record transaction for compliance tracking
        transactionCount += 1;
        _transactionRecords[transactionCount] = TransactionRecord({
            id: transactionCount,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });

        // Execute the transfer
        super._update(from, to, amount);
    }

    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Returns the version of the contract
     * @return The version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @notice Returns comprehensive token information
     * @return name_ The token name
     * @return symbol_ The token symbol
     * @return decimals_ The number of decimals
     * @return totalSupply_ The total supply
     * @return cap_ The supply cap
     */
    function getTokenInfo() 
        external 
        view 
        returns (
            string memory name_,
            string memory symbol_,
            uint8 decimals_,
            uint256 totalSupply_,
            uint256 cap_
        ) 
    {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            cap()
        );
    }

    /**
     * @notice Returns security-specific metadata
     * @return isin_ The ISIN code
     * @return instrumentType_ The instrument type
     * @return jurisdiction_ The jurisdiction
     */
    function getSecurityInfo()
        external
        view
        returns (
            string memory isin_,
            string memory instrumentType_,
            string memory jurisdiction_
        )
    {
        return (isin, instrumentType, jurisdiction);
    }
}
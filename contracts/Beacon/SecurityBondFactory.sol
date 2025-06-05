// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/**
 * @title SecurityBondFactory
 * @dev Factory contract for creating SecurityToken instances using BeaconProxy pattern for upgradeability
 * @notice This contract creates multiple SecurityToken instances that can represent different financial instruments:
 *         - Bonds (debt securities)
 *         - Equity tokens (stock-like instruments)
 *         - Asset-backed securities
 *         - Other regulated financial instruments
 *         
 *         Each created token is a BeaconProxy that points to the same implementation contract,
 *         allowing all tokens to be upgraded simultaneously through the beacon pattern.
 *         
 * @dev Architecture Flow:
 *      1. SecurityToken Implementation → deployed once
 *      2. UpgradeableBeacon → points to implementation
 *      3. SecurityBondFactory → creates BeaconProxy instances
 *      4. Each BeaconProxy → independent SecurityToken with unique configuration
 *      
 * @author ISBE Security Tokens Team
 */
contract SecurityBondFactory is Ownable {
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice The beacon contract address that contains the implementation
    address public immutable beacon;    /// @notice Mapping from security token index to deployed token address
    mapping(uint256 => address) public deployedBonds;
    
    /// @notice Mapping from beneficiary address to total security tokens created for them
    mapping(address => uint256) public totalOfBondsCreatedByBeneficiary;
    
    /// @notice Mapping from security token address to its index in the deployedBonds array
    mapping(address => uint256) public indexOfDeployedBonds;
    
    /// @notice Total number of security tokens created by this factory
    uint256 public totalOfBondsCreated;

    // =============================================================
    //                           EVENTS
    // =============================================================
      /// @notice Emitted when a new security token is created
    /// @param tokenProxy The address of the newly created security token proxy
    /// @param beneficiary The address of the beneficiary for whom the token was created
    /// @param tokenIndex The index of the security token in the deployedBonds mapping
    event BondCreated(
        address indexed tokenProxy, 
        address indexed beneficiary, 
        uint256 indexed tokenIndex
    );

    // =============================================================
    //                           ERRORS
    // =============================================================
    
    /// @notice Thrown when beacon address is zero during construction
    error InvalidBeaconAddress();
    
    /// @notice Thrown when beneficiary address is zero
    error InvalidBeneficiaryAddress();
      /// @notice Thrown when security token index is out of bounds
    error BondIndexOutOfBounds(uint256 index);

    // =============================================================
    //                           CONSTRUCTOR
    // =============================================================
    
    /**
     * @notice Constructs the SecurityBondFactory contract
     * @dev Sets the beacon address and initializes ownership
     * @param _beacon The address of the beacon contract containing the implementation
     */
    constructor(address _beacon) Ownable(msg.sender) {
        if (_beacon == address(0)) revert InvalidBeaconAddress();
        beacon = _beacon;
    }

    // =============================================================
    //                         FACTORY FUNCTIONS
    // =============================================================
      /**
     * @notice Creates a new SecurityToken instance using BeaconProxy pattern
     * @dev Only the owner can create new security tokens. Each token created is a BeaconProxy
     *      that delegates calls to the implementation contract stored in the beacon.
     *      This allows all created tokens to be upgraded simultaneously.
     * 
     * @param initData The initialization data to be passed to the SecurityToken contract.
     *                 This should be the encoded call to SecurityToken.initialize() with:
     *                 - name: Token name (e.g., "Corporate Bond 2024")
     *                 - symbol: Token symbol (e.g., "CB24")
     *                 - cap: Maximum token supply
     *                 - isin: International Securities Identification Number
     *                 - instrumentType: Type of instrument ("bond", "equity", "debt", etc.)
     *                 - jurisdiction: Legal jurisdiction code (e.g., "US", "EU", "ES")
     *                 - admin: Address that will have admin privileges
     * 
     * @param beneficiary The address that will benefit from this token creation.
     *                    This is used for tracking and can be different from the admin.
     * 
     * @return The address of the newly created SecurityToken proxy
     * 
     * @dev Example usage:
     *      bytes memory initData = abi.encodeWithSignature(
     *          "initialize(string,string,uint256,string,string,string,address)",
     *          "Corporate Bond 2024", "CB24", 1000000e18, "US0123456789", "bond", "US", adminAddress
     *      );
     *      address newToken = factory.createBond(initData, beneficiaryAddress);
     */
    function createBond(
        bytes memory initData, 
        address beneficiary
    ) external onlyOwner returns (address) {
        if (beneficiary == address(0)) revert InvalidBeneficiaryAddress();
        
        // Create new BeaconProxy instance - this creates a new SecurityToken
        BeaconProxy proxy = new BeaconProxy(beacon, initData);
        address proxyAddress = address(proxy);

        // Store security token information
        deployedBonds[totalOfBondsCreated] = proxyAddress;
        indexOfDeployedBonds[proxyAddress] = totalOfBondsCreated;
        
        // Update counters
        totalOfBondsCreated++;
        totalOfBondsCreatedByBeneficiary[beneficiary]++;

        emit BondCreated(proxyAddress, beneficiary, totalOfBondsCreated - 1);
        return proxyAddress;
    }

    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================
      /**
     * @notice Gets the address of a security token by its index
     * @param index The index of the security token to query
     * @return The address of the security token at the given index
     */
    function getBondByIndex(uint256 index) external view returns (address) {
        if (index >= totalOfBondsCreated) revert BondIndexOutOfBounds(index);
        return deployedBonds[index];
    }

    /**
     * @notice Gets the total number of security tokens created for a specific beneficiary
     * @param beneficiary The address of the beneficiary
     * @return The total number of security tokens created for the beneficiary
     */
    function getBondsCountByBeneficiary(address beneficiary) external view returns (uint256) {
        return totalOfBondsCreatedByBeneficiary[beneficiary];
    }

    /**
     * @notice Gets the index of a security token by its address
     * @param bondAddress The address of the security token
     * @return The index of the security token
     */
    function getBondIndex(address bondAddress) external view returns (uint256) {
        return indexOfDeployedBonds[bondAddress];
    }

    /**
     * @notice Gets all deployed security token addresses
     * @dev This function can be gas-intensive for large numbers of tokens
     * @return bonds Array of all deployed security token addresses
     */
    function getAllBonds() external view returns (address[] memory bonds) {
        bonds = new address[](totalOfBondsCreated);
        for (uint256 i = 0; i < totalOfBondsCreated; i++) {
            bonds[i] = deployedBonds[i];
        }
        return bonds;
    }

    /**
     * @notice Gets a paginated list of deployed security tokens
     * @param offset The starting index for pagination
     * @param limit The maximum number of tokens to return
     * @return bonds Array of security token addresses within the specified range
     * @return total The total number of security tokens deployed
     */
    function getBondsPaginated(
        uint256 offset, 
        uint256 limit
    ) external view returns (address[] memory bonds, uint256 total) {
        total = totalOfBondsCreated;
        
        if (offset >= total) {
            return (new address[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        bonds = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            bonds[i - offset] = deployedBonds[i];
        }
        
        return (bonds, total);
    }

    /**
     * @notice Returns the version of the factory contract
     * @return The version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }    /**
     * @notice Checks if a given address is a security token created by this factory
     * @param bondAddress The address to check
     * @return True if the address is a security token created by this factory, false otherwise
     */
    function isBondCreatedByFactory(address bondAddress) external view returns (bool) {
        uint256 index = indexOfDeployedBonds[bondAddress];
        return index < totalOfBondsCreated && deployedBonds[index] == bondAddress;
    }
}
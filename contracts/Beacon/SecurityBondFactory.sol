// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/**
 * @title SecurityBondFactory
 * @dev Factory contract for creating SecurityToken instances using BeaconProxy for upgradeability
 * @notice This contract allows creating multiple instances of SecurityToken contracts
 *         that can be upgraded through the beacon proxy pattern
 * @author ISBE Security Tokens Team
 */
contract SecurityBondFactory is Ownable {
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice The beacon contract address that contains the implementation
    address public immutable beacon;

    /// @notice Mapping from bond index to deployed bond address
    mapping(uint256 => address) public deployedBonds;
    
    /// @notice Mapping from beneficiary address to total bonds created for them
    mapping(address => uint256) public totalOfBondsCreatedByBeneficiary;
    
    /// @notice Mapping from bond address to its index in the deployedBonds array
    mapping(address => uint256) public indexOfDeployedBonds;
    
    /// @notice Total number of bonds created by this factory
    uint256 public totalOfBondsCreated;

    // =============================================================
    //                           EVENTS
    // =============================================================
    
    /// @notice Emitted when a new bond is created
    /// @param bondProxy The address of the newly created bond proxy
    /// @param beneficiary The address of the beneficiary for whom the bond was created
    /// @param bondIndex The index of the bond in the deployedBonds mapping
    event BondCreated(
        address indexed bondProxy, 
        address indexed beneficiary, 
        uint256 indexed bondIndex
    );

    // =============================================================
    //                           ERRORS
    // =============================================================
    
    /// @notice Thrown when beacon address is zero during construction
    error InvalidBeaconAddress();
    
    /// @notice Thrown when beneficiary address is zero
    error InvalidBeneficiaryAddress();
    
    /// @notice Thrown when bond index is out of bounds
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
     * @notice Creates a new SecurityToken bond using BeaconProxy
     * @dev Only the owner can create new bonds
     * @param initData The initialization data to be passed to the SecurityToken contract
     * @param beneficiary The address that will benefit from this bond creation
     * @return The address of the newly created bond proxy
     */
    function createBond(
        bytes memory initData, 
        address beneficiary
    ) external onlyOwner returns (address) {
        if (beneficiary == address(0)) revert InvalidBeneficiaryAddress();
        
        // Create new BeaconProxy instance
        BeaconProxy proxy = new BeaconProxy(beacon, initData);
        address proxyAddress = address(proxy);

        // Store bond information
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
     * @notice Gets the address of a bond by its index
     * @param index The index of the bond to query
     * @return The address of the bond at the given index
     */
    function getBondByIndex(uint256 index) external view returns (address) {
        if (index >= totalOfBondsCreated) revert BondIndexOutOfBounds(index);
        return deployedBonds[index];
    }

    /**
     * @notice Gets the total number of bonds created for a specific beneficiary
     * @param beneficiary The address of the beneficiary
     * @return The total number of bonds created for the beneficiary
     */
    function getBondsCountByBeneficiary(address beneficiary) external view returns (uint256) {
        return totalOfBondsCreatedByBeneficiary[beneficiary];
    }

    /**
     * @notice Gets the index of a bond by its address
     * @param bondAddress The address of the bond
     * @return The index of the bond
     */
    function getBondIndex(address bondAddress) external view returns (uint256) {
        return indexOfDeployedBonds[bondAddress];
    }

    /**
     * @notice Gets all deployed bond addresses
     * @dev This function can be gas-intensive for large numbers of bonds
     * @return bonds Array of all deployed bond addresses
     */
    function getAllBonds() external view returns (address[] memory bonds) {
        bonds = new address[](totalOfBondsCreated);
        for (uint256 i = 0; i < totalOfBondsCreated; i++) {
            bonds[i] = deployedBonds[i];
        }
        return bonds;
    }

    /**
     * @notice Gets a paginated list of deployed bonds
     * @param offset The starting index for pagination
     * @param limit The maximum number of bonds to return
     * @return bonds Array of bond addresses within the specified range
     * @return total The total number of bonds deployed
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
    }

    /**
     * @notice Checks if a given address is a bond created by this factory
     * @param bondAddress The address to check
     * @return True if the address is a bond created by this factory, false otherwise
     */
    function isBondCreatedByFactory(address bondAddress) external view returns (bool) {
        uint256 index = indexOfDeployedBonds[bondAddress];
        return index < totalOfBondsCreated && deployedBonds[index] == bondAddress;
    }
}
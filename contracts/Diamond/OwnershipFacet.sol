// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './Librarys/LibDiamond.sol';

/**
 * @title OwnershipFacet
 * @author ISBE Security Tokens Team
 * @notice Facet contract for diamond ownership management
 * @dev This facet handles ownership transfer functionality for the diamond.
 *      Only the current owner can transfer ownership to a new address.
 *      Part of the EIP-2535 Diamond Standard implementation.
 */
contract OwnershipFacet {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the OwnershipFacet contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when ownership is transferred
     * @param previousOwner The address of the previous owner
     * @param newOwner The address of the new owner
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when caller is not the contract owner
    error NotContractOwner(address caller, address owner);
    
    /// @notice Thrown when trying to transfer ownership to zero address
    error NewOwnerIsZeroAddress();
    
    /// @notice Thrown when trying to transfer ownership to the same address
    error NewOwnerIsSameAsCurrent(address owner);

    /*//////////////////////////////////////////////////////////////
                            OWNERSHIP FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Transfers ownership of the diamond to a new address
     * @dev Only the current owner can call this function. Emits OwnershipTransferred event.
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external {
        LibDiamond.enforceIsContractOwner();
        
        if (_newOwner == address(0)) {
            revert NewOwnerIsZeroAddress();
        }
        
        address currentOwner = LibDiamond.contractOwner();
        if (_newOwner == currentOwner) {
            revert NewOwnerIsSameAsCurrent(currentOwner);
        }
        
        LibDiamond.setContractOwner(_newOwner);
        emit OwnershipTransferred(currentOwner, _newOwner);
    }

    /**
     * @notice Renounces ownership by transferring it to zero address
     * @dev WARNING: This will leave the contract without an owner, making ownership
     *      functions permanently inaccessible. Only use if you know what you're doing.
     */
    function renounceOwnership() external {
        LibDiamond.enforceIsContractOwner();
        address currentOwner = LibDiamond.contractOwner();
        LibDiamond.setContractOwner(address(0));
        emit OwnershipTransferred(currentOwner, address(0));
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the current owner of the diamond
     * @return owner_ The address of the current owner
     */
    function owner() external view returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }

    /**
     * @notice Checks if an address is the current owner
     * @param account The address to check
     * @return Whether the address is the current owner
     */
    function isOwner(address account) external view returns (bool) {
        return LibDiamond.contractOwner() == account;
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this facet contract
     * @return The version string
     */
    function ownershipFacetVersion() external pure returns (string memory) {
        return VERSION;
    }
}
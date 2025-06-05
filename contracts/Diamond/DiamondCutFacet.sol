// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IDiamondCut} from './Interfaces/Interfaces.sol';
import {LibDiamond} from './Librarys/LibDiamond.sol';

/**
 * @title DiamondCutFacet
 * @author ISBE Security Tokens Team
 * @notice Facet contract for diamond cutting operations
 * @dev This facet implements the IDiamondCut interface and handles adding, replacing,
 *      and removing facets from the diamond. Only the contract owner can perform cuts.
 *      Part of the EIP-2535 Diamond Standard implementation.
 */
contract DiamondCutFacet is IDiamondCut {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the DiamondCutFacet contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when caller is not the contract owner
    error NotContractOwner(address caller, address owner);

    /*//////////////////////////////////////////////////////////////
                              DIAMOND CUT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Add/replace/remove any number of functions and optionally execute a function with delegatecall
     * @dev This function implements the diamond cut operation as defined in EIP-2535
     * @param _diamondCut Contains the facet addresses and function selectors
     * @param _init The address of the contract or facet to execute _calldata
     * @param _calldata A function call, including function selector and arguments
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this facet contract
     * @return The version string
     */
    function diamondCutFacetVersion() external pure returns (string memory) {
        return VERSION;
    }

    /**
     * @notice Returns the current contract owner
     * @return The address of the contract owner
     */
    function owner() external view returns (address) {
        return LibDiamond.contractOwner();
    }

    /**
     * @notice Checks if an address is the contract owner
     * @param account The address to check
     * @return Whether the address is the contract owner
     */
    function isOwner(address account) external view returns (bool) {
        return LibDiamond.contractOwner() == account;
    }
}
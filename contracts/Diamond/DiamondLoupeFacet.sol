// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IDiamondLoupe, IERC165} from './Interfaces/Interfaces.sol';
import './Librarys/LibDiamond.sol';

/**
 * @title DiamondLoupeFacet
 * @author ISBE Security Tokens Team
 * @notice Facet contract for diamond introspection operations
 * @dev This facet implements the IDiamondLoupe interface and provides functions
 *      to inspect the diamond's facets and their functions. It also implements
 *      ERC-165 for interface detection. Part of the EIP-2535 Diamond Standard.
 */
contract DiamondLoupeFacet is IDiamondLoupe, IERC165 {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the DiamondLoupeFacet contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                           DIAMOND LOUPE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Gets all facets and their selectors
     * @dev Returns all facet addresses and their function selectors
     * @return facets_ Array of Facet structs containing addresses and selectors
     */
    function facets() external view override returns (Facet[] memory facets_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 numFacets = ds.facetAddresses.length;
        facets_ = new Facet[](numFacets);
        for (uint256 i; i < numFacets; i++) {
            address facetAddress_ = ds.facetAddresses[i];
            facets_[i].facetAddress = facetAddress_;
            facets_[i].functionSelectors = ds.facetFunctionSelectors[facetAddress_].functionSelectors;
        }
    }

    /**
     * @notice Gets all the function selectors supported by a specific facet
     * @param _facet The facet address to query
     * @return facetFunctionSelectors_ Array of function selectors
     */
    function facetFunctionSelectors(address _facet) external view override returns (bytes4[] memory facetFunctionSelectors_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetFunctionSelectors_ = ds.facetFunctionSelectors[_facet].functionSelectors;
    }

    /**
     * @notice Get all the facet addresses used by a diamond
     * @return facetAddresses_ Array of facet addresses
     */
    function facetAddresses() external view override returns (address[] memory facetAddresses_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddresses_ = ds.facetAddresses;
    }

    /**
     * @notice Gets the facet that supports the given selector
     * @param _functionSelector The function selector to query
     * @return facetAddress_ The facet address that implements the selector
     */
    function facetAddress(bytes4 _functionSelector) external view override returns (address facetAddress_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddress_ = ds.selectorToFacetAndPosition[_functionSelector].facetAddress;
    }

    /*//////////////////////////////////////////////////////////////
                              ERC-165 FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Query if a contract implements an interface
     * @dev Interface identification is specified in ERC-165
     * @param _interfaceId The interface identifier, as specified in ERC-165
     * @return True if the contract implements _interfaceId, false otherwise
     */
    function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return ds.supportedInterfaces[_interfaceId];
    }

    /*//////////////////////////////////////////////////////////////
                           ADDITIONAL VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the total number of facets in the diamond
     * @return The count of facets
     */
    function facetCount() external view returns (uint256) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return ds.facetAddresses.length;
    }    /**
     * @notice Returns the total number of function selectors in the diamond
     * @return total The count of all function selectors across all facets
     */
    function totalFunctionSelectors() external view returns (uint256 total) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 numFacets = ds.facetAddresses.length;
        for (uint256 i; i < numFacets; i++) {
            total += ds.facetFunctionSelectors[ds.facetAddresses[i]].functionSelectors.length;
        }
    }

    /**
     * @notice Checks if a facet address exists in the diamond
     * @param _facet The facet address to check
     * @return Whether the facet exists
     */
    function facetExists(address _facet) external view returns (bool) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return ds.facetFunctionSelectors[_facet].functionSelectors.length > 0;
    }

    /**
     * @notice Checks if a function selector exists in the diamond
     * @param _functionSelector The function selector to check
     * @return Whether the function selector exists
     */
    function functionExists(bytes4 _functionSelector) external view returns (bool) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return ds.selectorToFacetAndPosition[_functionSelector].facetAddress != address(0);
    }

    /*//////////////////////////////////////////////////////////////
                             UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the version of this facet contract
     * @return The version string
     */
    function diamondLoupeFacetVersion() external pure returns (string memory) {
        return VERSION;
    }

    /**
     * @notice Returns comprehensive diamond information
     * @return facetCount_ Total number of facets
     * @return functionCount Total number of function selectors
     * @return facetAddresses_ Array of all facet addresses
     */
    function getDiamondInfo() 
        external 
        view 
        returns (
            uint256 facetCount_,
            uint256 functionCount,
            address[] memory facetAddresses_
        ) 
    {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetCount_ = ds.facetAddresses.length;
        facetAddresses_ = ds.facetAddresses;
        
        for (uint256 i; i < facetCount_; i++) {
            functionCount += ds.facetFunctionSelectors[ds.facetAddresses[i]].functionSelectors.length;
        }
    }
}
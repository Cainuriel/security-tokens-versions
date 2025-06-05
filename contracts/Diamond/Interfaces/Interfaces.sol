// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Diamond Standard Interfaces
 * @author ISBE Security Tokens Team
 * @notice Collection of interfaces required for EIP-2535 Diamond Standard implementation
 * @dev These interfaces define the standard functions for diamond introspection,
 *      diamond cutting operations, and ERC-165 interface detection.
 */

/**
 * @title IDiamondLoupe
 * @notice Interface for diamond introspection as defined in EIP-2535
 * @dev Allows inspection of facets and their function selectors within a diamond
 */
interface IDiamondLoupe {
    /**
     * @notice Struct representing a facet with its address and function selectors
     * @param facetAddress The address of the facet contract
     * @param functionSelectors Array of function selectors supported by the facet
     */
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /**
     * @notice Gets all facets and their selectors
     * @return facets_ Array of Facet structs
     */
    function facets() external view returns (Facet[] memory facets_);
    
    /**
     * @notice Gets all the function selectors supported by a specific facet
     * @param _facet The facet address
     * @return facetFunctionSelectors_ Array of function selectors
     */
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory facetFunctionSelectors_);
    
    /**
     * @notice Get all the facet addresses used by a diamond
     * @return facetAddresses_ Array of facet addresses
     */
    function facetAddresses() external view returns (address[] memory facetAddresses_);
    
    /**
     * @notice Gets the facet that supports the given selector
     * @param _functionSelector The function selector
     * @return facetAddress_ The facet address
     */
    function facetAddress(bytes4 _functionSelector) external view returns (address facetAddress_);
}

/**
 * @title IDiamondCut
 * @notice Interface for diamond cutting operations as defined in EIP-2535
 * @dev Allows adding, replacing, and removing facets and their function selectors
 */
interface IDiamondCut {
    /**
     * @notice Enum defining the type of facet cut action
     * @param Add Add function selectors to a facet
     * @param Replace Replace function selectors in a facet
     * @param Remove Remove function selectors from a facet
     */
    enum FacetCutAction {Add, Replace, Remove}
    
    /**
     * @notice Struct defining a facet cut operation
     * @param facetAddress The address of the facet contract
     * @param action The type of action to perform
     * @param functionSelectors Array of function selectors to add, replace, or remove
     */
    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /**
     * @notice Add/replace/remove any number of functions and optionally execute a function with delegatecall
     * @param _diamondCut Contains the facet addresses and function selectors
     * @param _init The address of the contract or facet to execute _calldata
     * @param _calldata A function call, including function selector and arguments
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    /**
     * @notice Emitted when a diamond cut is executed
     * @param _diamondCut The array of facet cuts that were executed
     * @param _init The address used for initialization
     * @param _calldata The initialization call data
     */
    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}

/**
 * @title IERC165
 * @notice Interface of the ERC165 standard as defined in the EIP
 * @dev Interface for contracts that want to publish the interfaces they support
 */
interface IERC165 {
    /**
     * @notice Query if a contract implements an interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @return True if the contract implements interfaceId, false otherwise
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

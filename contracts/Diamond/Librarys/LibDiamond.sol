// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IDiamondCut} from '../Interfaces/Interfaces.sol';

/**
 * @title LibDiamond
 * @author ISBE Security Tokens Team
 * @notice Library implementing EIP-2535 Diamond Standard storage and operations
 * @dev This library provides the core functionality for the Diamond pattern including
 *      facet management, function selector routing, and ownership management.
 *      It uses diamond storage to maintain state across all facets.
 */
library LibDiamond {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Storage position for diamond data using diamond storage pattern
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("isbe.diamond.standard.storage");

    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Struct storing facet address and function selector position
     * @param facetAddress The address of the facet contract
     * @param functionSelectorPosition Position in the facetFunctionSelectors array
     */
    struct FacetAddressAndPosition {
        address facetAddress;
        uint96 functionSelectorPosition; // position in facetFunctionSelectors.functionSelectors array
    }

    /**
     * @notice Struct storing function selectors for a facet
     * @param functionSelectors Array of function selectors supported by the facet
     * @param facetAddressPosition Position of facet address in facetAddresses array
     */
    struct FacetFunctionSelectors {
        bytes4[] functionSelectors;
        uint256 facetAddressPosition; // position of facetAddress in facetAddresses array
    }

    /**
     * @notice Main diamond storage struct
     * @dev Contains all data needed for diamond functionality
     */
    struct DiamondStorage {
        /// @dev Maps function selector to facet address and position
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPosition;
        /// @dev Maps facet addresses to function selectors
        mapping(address => FacetFunctionSelectors) facetFunctionSelectors;
        /// @dev Array of all facet addresses
        address[] facetAddresses;
        /// @dev Used to implement ERC-165 interface detection
        mapping(bytes4 => bool) supportedInterfaces;
        /// @dev Owner of the diamond contract
        address contractOwner;
    }

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when ownership is transferred
     * @param previousOwner The address of the previous owner
     * @param newOwner The address of the new owner
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);    /**
     * @notice Emitted when a diamond cut is executed
     * @param _diamondCut The array of facet cuts that were executed
     * @param _init The address used for initialization
     * @param _calldata The initialization call data
     */
    event DiamondCut(IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when caller is not the contract owner
    error NotContractOwner(address caller, address owner);
    
    /// @notice Thrown when trying to add a function that already exists
    error FunctionAlreadyExists(bytes4 selector);
    
    /// @notice Thrown when trying to remove a function that doesn't exist
    error FunctionDoesNotExist(bytes4 selector);
    
    /// @notice Thrown when facet address has no code
    error FacetHasNoCode(address facet);

    /*//////////////////////////////////////////////////////////////
                              STORAGE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the diamond storage struct
     * @dev Uses diamond storage pattern to access the storage slot
     * @return ds The DiamondStorage struct containing all diamond data
     */
    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }    /*//////////////////////////////////////////////////////////////
                            OWNERSHIP FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets a new contract owner
     * @dev Emits OwnershipTransferred event
     * @param _newOwner The address of the new owner
     */
    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    /**
     * @notice Returns the current contract owner
     * @return contractOwner_ The address of the current owner
     */
    function contractOwner() internal view returns (address contractOwner_) {
        contractOwner_ = diamondStorage().contractOwner;
    }

    /**
     * @notice Enforces that the caller is the contract owner
     * @dev Reverts with NotContractOwner if caller is not the owner
     */
    function enforceIsContractOwner() internal view {
        address owner = diamondStorage().contractOwner;
        if (msg.sender != owner) {
            revert NotContractOwner(msg.sender, owner);
        }
    }    /*//////////////////////////////////////////////////////////////
                            DIAMOND CUT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Internal function to execute diamond cut operations
     * @dev Processes facet cuts and optionally calls initialization function
     * @param _diamondCut Array of facet cuts to execute
     * @param _init Address of initialization contract (can be address(0))
     * @param _calldata Initialization function call data (can be empty)
     */
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal {
        for (uint256 facetIndex; facetIndex < _diamondCut.length; facetIndex++) {
            IDiamondCut.FacetCutAction action = _diamondCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else {
                revert("LibDiamondCut: Incorrect FacetCutAction");
            }
        }
        emit DiamondCut(_diamondCut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    /**
     * @notice Adds functions to a facet
     * @dev If facet doesn't exist, it will be added to the diamond
     * @param _facetAddress The address of the facet contract
     * @param _functionSelectors Array of function selectors to add
     */
    function addFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "LibDiamondCut: No selectors in facet to cut");
        DiamondStorage storage ds = diamondStorage();        
        require(_facetAddress != address(0), "LibDiamondCut: Add facet can't be address(0)");
        uint96 selectorPosition = uint96(ds.facetFunctionSelectors[_facetAddress].functionSelectors.length);
        // add new facet address if it does not exist
        if (selectorPosition == 0) {
            addFacet(ds, _facetAddress);            
        }
        for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            require(oldFacetAddress == address(0), "LibDiamondCut: Can't add function that already exists");
            addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    /**
     * @notice Replaces existing functions with new facet implementations
     * @dev The function selectors must already exist in the diamond
     * @param _facetAddress The address of the new facet contract
     * @param _functionSelectors Array of function selectors to replace
     */
    function replaceFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "LibDiamondCut: No selectors in facet to cut");
        DiamondStorage storage ds = diamondStorage();
        require(_facetAddress != address(0), "LibDiamondCut: Add facet can't be address(0)");
        uint96 selectorPosition = uint96(ds.facetFunctionSelectors[_facetAddress].functionSelectors.length);
        // add new facet address if it does not exist
        if (selectorPosition == 0) {
            addFacet(ds, _facetAddress);
        }
        for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            require(oldFacetAddress != _facetAddress, "LibDiamondCut: Can't replace function with same function");
            removeFunction(ds, oldFacetAddress, selector);
            addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    function removeFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "LibDiamondCut: No selectors in facet to cut");
        DiamondStorage storage ds = diamondStorage();
        // if function does not exist then do nothing and return
        require(_facetAddress == address(0), "LibDiamondCut: Remove facet address must be address(0)");
        for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            removeFunction(ds, oldFacetAddress, selector);
        }
    }

    function addFacet(DiamondStorage storage ds, address _facetAddress) internal {
        enforceHasContractCode(_facetAddress, "LibDiamondCut: New facet has no code");
        ds.facetFunctionSelectors[_facetAddress].facetAddressPosition = ds.facetAddresses.length;
        ds.facetAddresses.push(_facetAddress);
    }    

    function addFunction(DiamondStorage storage ds, bytes4 _selector, uint96 _selectorPosition, address _facetAddress) internal {
        ds.selectorToFacetAndPosition[_selector].functionSelectorPosition = _selectorPosition;
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.push(_selector);
        ds.selectorToFacetAndPosition[_selector].facetAddress = _facetAddress;
    }

    function removeFunction(DiamondStorage storage ds, address _facetAddress, bytes4 _selector) internal {        
        require(_facetAddress != address(0), "LibDiamondCut: Can't remove function that doesn't exist");
        // an immutable function is a function defined directly in a diamond
        require(_facetAddress != address(this), "LibDiamondCut: Can't remove immutable function");
        // replace selector with last selector, then delete last selector
        uint256 selectorPosition = ds.selectorToFacetAndPosition[_selector].functionSelectorPosition;
        uint256 lastSelectorPosition = ds.facetFunctionSelectors[_facetAddress].functionSelectors.length - 1;
        // if not the same then replace _selector with lastSelector
        if (selectorPosition != lastSelectorPosition) {
            bytes4 lastSelector = ds.facetFunctionSelectors[_facetAddress].functionSelectors[lastSelectorPosition];
            ds.facetFunctionSelectors[_facetAddress].functionSelectors[selectorPosition] = lastSelector;
            ds.selectorToFacetAndPosition[lastSelector].functionSelectorPosition = uint96(selectorPosition);
        }
        // delete the last selector
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.pop();
        delete ds.selectorToFacetAndPosition[_selector];

        // if no more selectors for facet address then delete the facet address
        if (lastSelectorPosition == 0) {
            // replace facet address with last facet address and delete last facet address
            uint256 lastFacetAddressPosition = ds.facetAddresses.length - 1;
            uint256 facetAddressPosition = ds.facetFunctionSelectors[_facetAddress].facetAddressPosition;
            if (facetAddressPosition != lastFacetAddressPosition) {
                address lastFacetAddress = ds.facetAddresses[lastFacetAddressPosition];
                ds.facetAddresses[facetAddressPosition] = lastFacetAddress;
                ds.facetFunctionSelectors[lastFacetAddress].facetAddressPosition = facetAddressPosition;
            }
            ds.facetAddresses.pop();
            delete ds.facetFunctionSelectors[_facetAddress].facetAddressPosition;
        }
    }

    function initializeDiamondCut(address _init, bytes memory _calldata) internal {
        if (_init == address(0)) {
            return;
        }
        enforceHasContractCode(_init, "LibDiamondCut: _init address has no code");        
        (bool success, bytes memory error) = _init.delegatecall(_calldata);
        if (!success) {
            if (error.length > 0) {
                // bubble up error
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(error)
                    revert(add(32, error), returndata_size)
                }
            } else {
                revert("LibDiamondCut: _init function reverted");
            }
        }
    }

    function enforceHasContractCode(address _contract, string memory _errorMessage) internal view {
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_contract)
        }
        require(contractSize > 0, _errorMessage);
    }
}
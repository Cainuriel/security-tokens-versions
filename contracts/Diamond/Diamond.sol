// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IDiamondLoupe, IDiamondCut, IERC165} from './Interfaces/Interfaces.sol';
import './Librarys/LibDiamond.sol';

/**
 * @title Diamond
 * @author ISBE Security Tokens Team
 * @notice The main Diamond contract implementing EIP-2535 Diamond Standard
 * @dev This contract serves as a proxy that delegates function calls to various facets.
 *      It implements the diamond pattern allowing for modular, upgradeable smart contracts.
 *      The diamond can have multiple facets (implementation contracts) and uses a fallback
 *      function to route calls to the appropriate facet based on function selectors.
 */
contract Diamond {
    /*//////////////////////////////////////////////////////////////
                                 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Version of the Diamond contract
    string private constant VERSION = "1.0.0";

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when the diamond is deployed and initialized
     * @param owner The initial owner of the diamond
     * @param facetCount The number of facets added during initialization
     */
    event DiamondDeployed(address indexed owner, uint256 facetCount);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when a function selector doesn't exist in any facet
    error FunctionNotFound(bytes4 selector);

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Constructor to initialize the diamond with facets
     * @dev Sets the contract owner and performs the initial diamond cut to add facets.
     *      Also registers required ERC-165 interfaces for diamond introspection.
     * @param _diamondCut Array of FacetCut structs containing facet addresses and selectors
     * @param _init Address of initialization contract (can be address(0) if no initialization)
     * @param _calldata Initialization function call data (can be empty if no initialization)
     */
    constructor(
        IDiamondCut.FacetCut[] memory _diamondCut, 
        address _init, 
        bytes memory _calldata
    ) payable {        
        // Set the contract owner to the deployer
        LibDiamond.setContractOwner(msg.sender);
        
        // Perform initial diamond cut to add facets
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);

        // Register supported interfaces for ERC-165 compliance
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;

        emit DiamondDeployed(msg.sender, _diamondCut.length);
    }

    /*//////////////////////////////////////////////////////////////
                               FALLBACK FUNCTION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fallback function that delegates calls to appropriate facets
     * @dev This function is called when no other function matches the call signature.
     *      It looks up the facet address for the function selector and delegates the call.
     *      Uses assembly for gas efficiency and to properly handle return data.
     */
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        
        // Get diamond storage using assembly for gas efficiency
        assembly {
            ds.slot := position
        }
        
        // Look up the facet address for this function selector
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        
        if (facet == address(0)) {
            revert FunctionNotFound(msg.sig);
        }
        
        // Delegate call to the appropriate facet
        assembly {
            // Copy function selector and arguments to memory
            calldatacopy(0, 0, calldatasize())
            
            // Execute function call using delegatecall
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            
            // Copy return data to memory
            returndatacopy(0, 0, returndatasize())
            
            // Handle return value or revert
            switch result
                case 0 {
                    // Call failed, revert with return data
                    revert(0, returndatasize())
                }
                default {
                    // Call succeeded, return data
                    return(0, returndatasize())
                }
        }
    }

    /*//////////////////////////////////////////////////////////////
                               RECEIVE FUNCTION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Receive function to handle plain Ether transfers
     * @dev Allows the diamond to receive Ether without function call data
     */
    receive() external payable {
        // This function intentionally left empty to allow Ether reception
        // Any specific logic for handling received Ether should be implemented in facets
    }
}
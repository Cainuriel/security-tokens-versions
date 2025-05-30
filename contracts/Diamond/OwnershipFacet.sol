// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './Librarys/LibDiamond.sol';

contract OwnershipFacet {
    function transferOwnership(address _newOwner) external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    function owner() external view returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }
}
# SecurityToken.sol Patterns

## Table of Contents

- [Single SecurityToken.sol](#single-securitytokensol)
- [Security Token with Beacon Pattern](#security-token-with-beacon-pattern)
- [Diamond Security Token](#diamond-security-token)

# Single SecurityToken.sol

`SecurityToken.sol` is an extensible and secure ERC20 smart contract designed to represent regulated tokens (security tokens) on Ethereum. It uses OpenZeppelin's upgradeable modules and adds access controls, whitelist/blacklist functionality, and transaction recording.

## Main Features

- **Standard ERC20** with burning, pausing, and minting cap (cap) functions.
- **Role-based access control** (`ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`).
- **Whitelist and blacklist** to restrict transfers.
- **Transaction recording** for traceability and compliance.
- **Initializable** for upgradeable deployments.
- **Custom errors** for gas-efficient error handling.

---

## Main Functions

### Initialization

```solidity
function initialize(
    string memory name,
    string memory symbol,
    uint256 cap,
    string memory _isin,
    string memory _instrumentType,
    string memory _jurisdiction,
    address admin
) public virtual initializer
```
Initializes the token with its parameters and assigns main roles to the `admin`.

---

### Minting and control functions

- **mint(address to, uint256 amount)**  
  Allows accounts with `MINTER_ROLE` to mint new tokens.

- **pause()**  
  Allows accounts with `PAUSER_ROLE` to pause all transfers.

- **unpause()**  
  Allows accounts with `PAUSER_ROLE` to resume transfers.

---

### Whitelist and blacklist

- **addToWhitelist(address account)**  
  Adds an account to the whitelist (only `ADMIN_ROLE`).

- **removeFromWhitelist(address account)**  
  Removes an account from the whitelist (only `ADMIN_ROLE`).

- **addToBlacklist(address account)**  
  Adds an account to the blacklist (only `ADMIN_ROLE`).

- **removeFromBlacklist(address account)**  
  Removes an account from the blacklist (only `ADMIN_ROLE`).

---

### Transaction recording and reversal

- **getTransactionRecord(uint256 id)**  
  Returns details of a recorded transaction.

- **revertTransaction(uint256 transactionId)**  
  Allows an administrator to revert a recorded transaction, transferring tokens back.

---

### Metadata and public variables

- **isin**  
  ISIN code of the financial instrument.

- **instrumentType**  
  Type of instrument (e.g., "bond").

- **jurisdiction**  
  Applicable jurisdiction.

- **transactionCount**  
  Total number of recorded transactions.

---

## Security and compliance

- All transfers verify that sender and recipient are on the whitelist and not on the blacklist.
- Only accounts with appropriate roles can pause, mint, or modify lists.
- Each transfer is recorded for traceability and regulatory compliance.
- Uses modern custom errors for gas efficiency and better debugging.

---

## Usage example

```solidity
// Initialization (only once)
securityToken.initialize(
    "My Security Token",
    "MST",
    1000000 ether,
    "ISIN1234567890",
    "bond",
    "ES",
    adminAddress
);

// Minting
securityToken.mint(user, 1000 ether);

// Pause and resume
securityToken.pause();
securityToken.unpause();

// List management
securityToken.addToWhitelist(user);
securityToken.addToBlacklist(maliciousUser);

// Query transaction records
SecurityToken.TransactionRecord memory record = securityToken.getTransactionRecord(1);
```

---

# Security Token with Beacon Pattern

This pattern implements a security token system using OpenZeppelin's **Beacon Proxy** pattern, allowing efficient creation of multiple upgradeable token instances.

## System Architecture

The system consists of three main components:

1. **SecurityToken.sol**  
    Security token implementation contract that includes:
    - ERC20 Upgradeable: Basic token functionality
    - ERC20 Burnable: Token burning capability
    - ERC20 Pausable: Pause/resume transfers
    - ERC20 Capped: Maximum supply limit
    - Access Control: Role and permission system
    - Whitelist/Blacklist: Control of authorized addresses
    - Transaction Records: Transaction recording for auditing
    - Custom Errors: Gas-efficient error handling

2. **SecurityBondFactory.sol**  
    Factory contract that creates SecurityToken instances using BeaconProxy:
    - Creates new security tokens
    - Maintains registry of all created tokens
    - Uses Beacon pattern for efficient upgrades

3. **__CompileBeacon.sol**  
    Auxiliary contract for UpgradeableBeacon compilation in Hardhat.

## 🔑 Main Features

### Roles and Permissions

- `ADMIN_ROLE`: Whitelist/blacklist management and transaction reversal
- `MINTER_ROLE`: Creation of new tokens
- `PAUSER_ROLE`: Pause/resume contract
- `DEFAULT_ADMIN_ROLE`: General role administration

### Security Features

- **Whitelist:** Only authorized addresses can receive tokens
- **Blacklist:** Blocking of specific addresses
- **Pausable:** Ability to pause all operations
- **Transaction Reversal:** Transaction reversal by administrators
- **Audit Trail:** Complete record of all transactions
- **Custom Errors:** Gas-efficient error handling

### Instrument Metadata

- **ISIN:** International instrument identifier
- **Instrument Type:** Type of financial instrument
- **Jurisdiction:** Applicable legal jurisdiction

## 📁 File Structure

```
contracts/
├── SecurityToken.sol           # Security token implementation
├── SecurityBondFactory.sol     # Factory for creating instances
└── __CompileBeacon.sol         # Auxiliary for compilation
```

## 🚀 Deployment Guide

> **Note:** This pattern does **NOT** use `@openzeppelin/hardhat-upgrades` as it implements the Beacon pattern manually for greater control over the deployment process.

### Step-by-Step Deployment

1. **Deployment script**

    ```js
    // scripts/beaconDeploy.js
    const { ethers } = require("hardhat");

    async function main() {
      const [admin] = await ethers.getSigners();
      console.log("Deploying contracts with account:", admin.address);

      // 1. Deploy SecurityToken implementation
      const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
      const securityTokenImpl = await SecurityTokenFactory.deploy();
      await securityTokenImpl.waitForDeployment();
      
      const implAddress = await securityTokenImpl.getAddress();
      console.log("Implementation deployed at:", implAddress);

      // 2. Deploy UpgradeableBeacon manually
      const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
      const beacon = await BeaconFactory.deploy(implAddress, admin.address);
      await beacon.waitForDeployment();
      
      const beaconAddress = await beacon.getAddress();
      console.log("Beacon deployed at:", beaconAddress);

      // 3. Deploy Factory
      const Factory = await ethers.getContractFactory("SecurityBondFactory");
      const factory = await Factory.deploy(beaconAddress);
      await factory.waitForDeployment();
      
      const factoryAddress = await factory.getAddress();
      console.log("Factory deployed at:", factoryAddress);

      return {
         implementation: implAddress,
         beacon: beaconAddress,
         factory: factoryAddress
      };
    }

    main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
    ```

2. **Execute deployment**

    ```bash
    npx hardhat run scripts/beaconDeploy.js --network <network-name>
    ```

3. **Create a SecurityToken instance**

    ```js
    // scripts/beaconCreateToken.js
    async function createSecurityToken() {
      const [admin, user1] = await ethers.getSigners();
      
      // Get instances of deployed contracts
      const factory = await ethers.getContractAt("SecurityBondFactory", FACTORY_ADDRESS);
      const securityTokenImpl = await ethers.getContractAt("SecurityToken", IMPLEMENTATION_ADDRESS);
      
      // Prepare initialization data using the actual implementation
      const initData = securityTokenImpl.interface.encodeFunctionData("initialize", [
         "TestBond",              // name
         "TBND",                  // symbol
         ethers.parseUnits("1000000", 18), // cap (1M tokens)
         "ISIN1234567890",        // ISIN
         "bond",                  // instrumentType
         "ES",                    // jurisdiction
         admin.address            // admin
      ]);

      // Create the token
      const tx = await factory.createBond(initData, user1.address);
      const receipt = await tx.wait();
      
      // Get address of first created bond
      const bondAddress = await factory.deployedBonds(0);
      console.log("Security Token created at:", bondAddress);
      
      // Interact with the new token
      const bond = await ethers.getContractAt("SecurityToken", bondAddress);
      
      // Initial configuration
      await bond.addToWhitelist(admin.address);
      await bond.addToWhitelist(user1.address);
      
      // Initial token minting
      await bond.mint(user1.address, ethers.parseUnits("1000", 18));
      
      console.log("Token configured and initial minting completed");
      return bondAddress;
    }
    ```

## 🛠️ System Usage

### Create a new Security Token

```js
const factory = await ethers.getContractAt("SecurityBondFactory", factoryAddress);
const initData = /* initialization data */;
await factory.createBond(initData, beneficiaryAddress);
```

### Interact with a Security Token

```js
const token = await ethers.getContractAt("SecurityToken", tokenAddress);

// Add to whitelist
await token.addToWhitelist(userAddress);

// Mint tokens
await token.mint(userAddress, amount);

// Pause contract
await token.pause();

// View transaction records
const record = await token.getTransactionRecord(transactionId);
```

### Update implementation

```js
// Update all tokens to a new implementation
const NewSecurityToken = await ethers.getContractFactory("SecurityTokenV2");
const newImpl = await NewSecurityToken.deploy();
await beacon.upgradeTo(await newImpl.getAddress());
```

## 🛡️ Security Considerations

### Critical Roles

- The `DEFAULT_ADMIN_ROLE` has complete control over the contract
- Roles should be assigned carefully following the principle of least privilege
- Consider using multi-sig for administrative roles

### Important Validations

- All addresses must be on whitelist to receive tokens
- Addresses on blacklist are completely blocked
- Transactions are automatically recorded for auditing

### Upgrades

- The Beacon pattern allows updating all tokens simultaneously
- Upgrades should be thoroughly tested on testnet
- Maintain compatibility with existing storage layout

## 🧪 Testing

### Test Structure

Tests validate all system functionality using the BeaconProxy pattern:

```js
// test/beaconAndSecurity.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityToken (BeaconProxy architecture)", function () {
  let securityTokenImpl, beacon, factory, bond;
  let admin, user1, user2;

  before(async function () {
     [admin, user1, user2] = await ethers.getSigners();
     
     // Deploy implementation
     const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
     // ...setup code
     bond = await ethers.getContractAt("SecurityToken", bondAddress);
  });
  // Functionality tests...
});
```

#### Main Test Cases

- ✅ Correct deployment using Factory
- ✅ Minting and transfers with whitelist
- ✅ Automatic transaction recording
- ✅ Transaction reversal by ID
- ✅ Transfer blocking without whitelist
- ✅ Role and permission control
- ✅ Pause/resume functionality

```bash
# Run tests
npx hardhat test

# Coverage
npx hardhat coverage
```

# Diamond Security Token

A security token implementation using the Diamond pattern (EIP-2535) that enables modularity, upgradeability, and regulatory compliance.

## Architecture

### Diamond Pattern (EIP-2535)

The Diamond pattern allows creating modular contracts without size limits where functionalities are separated into multiple contracts called "facets". All calls are routed through a main contract (Diamond) that delegates execution to the corresponding facet.

```
┌─────────────────────────────────────────────────────────────────┐
│                          DIAMOND                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Diamond Storage                        │   │
│  │  • Function Selector → Facet Address mapping           │   │
│  │  • Facet Management                                     │   │
│  │  • Access Control                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
     │                    │                    │
┌────▼────┐        ┌─────▼─────┐        ┌────▼────┐
│ ERC20   │        │  Minting  │        │  Admin  │
│ Facet   │        │   Facet   │        │  Facet  │
└─────────┘        └───────────┘        └─────────┘
                           │
                   ┌───────▼────────┐
                   │  Compliance    │
                   │     Facet      │
                   └────────────────┘
```

## 📁 Contract Structure

### Core Diamond Contracts

#### `Diamond.sol`
Main contract that acts as a proxy and routes all calls to corresponding facets.

- **Fallback function:** Automatically routes calls using `delegatecall`
- **Constructor:** Initializes the diamond with initial facets
- **ERC165 Support:** Registers supported interfaces

#### `LibDiamond.sol`
Library that manages storage and logic for the Diamond pattern.

- **Diamond Storage:** Mapping of function selectors to facet addresses
- **Facet Management:** Add, replace, and remove facets
- **Owner Management:** Access control for modifications

---

### Standard Diamond Facets

#### `DiamondCutFacet.sol`
Allows modifying the diamond structure (add, replace, remove facets).

```solidity
function diamondCut(
    FacetCut[] calldata _diamondCut,
    address _init,
    bytes calldata _calldata
) external;
```

**Note:** This facet only contains core cutting functionality. Ownership functions (`owner()`, `isOwner()`) are handled by the OwnershipFacet to avoid function selector conflicts.

#### `DiamondLoupeFacet.sol`
Provides diamond introspection (query available facets and functions).

```solidity
function facets() external view returns (Facet[] memory);
function facetAddress(bytes4 _functionSelector) external view returns (address);
```

#### `OwnershipFacet.sol`
Handles diamond ownership management.

```solidity
function owner() external view returns (address);
function isOwner(address account) external view returns (bool);
function transferOwnership(address newOwner) external;
```

---

### Security Token Facets

#### `ERC20Facet.sol`
Implements basic ERC20 functionality with security controls.

- ✅ Transfer, approve, transferFrom
- ✅ Whitelist/blacklist verifications
- ✅ Transfer prevention when paused
- ✅ Automatic transaction recording
- ✅ Custom errors for gas efficiency

#### `MintingFacet.sol`
Handles token minting and burning.

- ✅ Mint with cap verification
- ✅ Burn and burnFrom
- ✅ Role-based access control
- ✅ Mint/burn transaction recording

#### `AdminFacet.sol`
Administrative and compliance functionalities.

- ✅ Pause/unpause contract
- ✅ Whitelist and blacklist management
- ✅ Role management (grant/revoke)
- ✅ Access control
- ✅ Custom errors for all admin operations

#### `ComplianceFacet.sol`
Regulatory compliance specific functionalities.

- ✅ Security token metadata (ISIN, type, jurisdiction)
- ✅ Transaction recording and querying
- ✅ Transaction reversal (emergencies)
- ✅ Role constants

---

### Storage Management

#### `LibSecurityToken.sol`
Library that centralizes all security token storage in a dedicated slot.

```solidity
struct SecurityTokenStorage {
    // ERC20 Storage
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    string name;
    string symbol;
    uint256 totalSupply;
    uint256 cap;
    
    // Security features
    mapping(bytes32 => mapping(address => bool)) roles;
    mapping(address => bool) whitelist;
    mapping(address => bool) blacklist;
    bool paused;
    
    // Compliance
    string isin;
    string instrumentType;
    string jurisdiction;
    uint256 transactionCount;
    mapping(uint256 => TransactionRecord) transactionRecords;
}
```

---

### Initialization

#### `DiamondInit.sol`
Initialization contract that sets up the initial state of the security token.

- ✅ ERC20 parameter configuration
- ✅ Security token metadata configuration
- ✅ Initial role assignment
- ✅ Cap and other limit configuration

---

## 🚀 Deployment

### Prerequisites

```bash
npm install
npx hardhat compile
```

### Deployment Script

The complete deployment script handles all facets and resolves function selector conflicts:

```javascript
// scripts/diamondDeploy.js
const { ethers } = require("hardhat");

async function main() {
  // 1. Deploy DiamondInit
  // 2. Deploy Standard Diamond Facets (DiamondCut, DiamondLoupe, Ownership)
  // 3. Deploy Security Token Facets (ERC20, Minting, Admin, Compliance)
  // 4. Prepare Diamond Cut with all facets
  // 5. Deploy Diamond with initialization
  // 6. Verify deployment
  // 7. Save deployment info
}
```

### Execute Deployment

```bash
# Compile contracts
npx hardhat compile

# Run deployment script
npx hardhat run scripts/diamondDeploy.js --network <NETWORK_NAME>

```

### Recent Improvements

The deployment script now includes:
- ✅ **Function selector conflict resolution** - Removed duplicate functions between facets
- ✅ **Comprehensive error handling** - Custom errors throughout all facets
- ✅ **Gas optimization** - Efficient selector mapping and storage usage
- ✅ **Detailed logging** - Complete deployment information and verification

---

## 🧪 Testing

### Comprehensive Test Suite

```bash
# Run all tests
npx hardhat test

# Run specific test files
npx hardhat test test/diamondAndSecurity.js
npx hardhat test test/beaconAndSecurity.js

# Generate coverage report
npx hardhat coverage
```

### Test Results

- ✅ **Diamond Architecture Tests:** 20/20 passing
- ✅ **Beacon Proxy Tests:** 5/5 passing  
- ✅ **Total Test Coverage:** 25/25 tests passing

---

## 📖 Usage

### Interact with the Diamond

```javascript
// Get facet instances
const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
const admin = await ethers.getContractAt("AdminFacet", diamondAddress);
const minting = await ethers.getContractAt("MintingFacet", diamondAddress);
const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);
const ownership = await ethers.getContractAt("OwnershipFacet", diamondAddress);

// Add user to whitelist
await admin.addToWhitelist(userAddress);

// Mint tokens
await minting.mint(userAddress, ethers.parseUnits("1000", 18));

// Transfer tokens
await erc20.connect(user).transfer(recipientAddress, ethers.parseUnits("100", 18));

// Query transactions
const txCount = await compliance.transactionCount();
const lastTx = await compliance.getTransactionRecord(txCount);

// Check ownership
const isOwner = await ownership.isOwner(adminAddress);
```

### Diamond Upgrades

```javascript
// Deploy new facet
const NewFacet = await ethers.getContractFactory("NewFacet");
const newFacet = await NewFacet.deploy();

// Prepare diamond cut
const cut = [{
  facetAddress: await newFacet.getAddress(),
  action: 0, // Add
  functionSelectors: getSelectors(newFacet)
}];

// Execute upgrade
const diamondCut = await ethers.getContractAt("DiamondCutFacet", diamondAddress);
await diamondCut.diamondCut(cut, ethers.ZeroAddress, "0x");
```

## 🔧 Development Tools

### Function Selector Checker

A utility script to detect function selector conflicts:

```bash
# Check for duplicate selectors
npx hardhat run scripts/checkSelectors.js
```

This tool helps prevent the "Can't add function that already exists" error during deployment.

## 🛡️ Security Features

### Access Control
- Role-based permissions with custom errors
- Multi-signature support for critical operations
- Owner-only functions for diamond modifications

### Compliance
- Automatic transaction recording
- Emergency transaction reversal
- Whitelist/blacklist enforcement
- Pausable functionality

### Upgrades
- Modular facet system
- Function selector conflict detection
- Storage layout preservation
- Comprehensive test coverage

---

## 📊 Production Deployment

### Successful Alastria Network Deployment (This network is not included in the hardhat.config.ts)

- **Diamond Address:** `0x0461df2b6ce85402abcD00e44A0B67fc6d72b6CE`
- **Total Facets:** 7
- **Total Function Selectors:** 69 (all unique)
- **Gas Used:** 8,571,840 
- **Network:** Alastria

All facets deployed and verified successfully with complete functionality.

## 🔧 Function Selector Conflict Resolution

During development, we encountered function selector conflicts between facets. This has been resolved through careful function distribution:

### Resolved Conflicts
- ✅ **`owner()` and `isOwner()`**: Removed from DiamondCutFacet, kept in OwnershipFacet
- ✅ **`hasRole()`**: Removed from ComplianceFacet, kept in AdminFacet  
- ✅ **`version()`**: Removed from AdminFacet, kept in ERC20Facet

### Development Tool
A utility script is available to check for selector conflicts:

```bash
npx hardhat run scripts/checkSelectors.js
```

This prevents the "Can't add function that already exists" error during deployment.

---

## 📊 Production Deployment Status

### Alastria Network Deployment ✅

- **Status**: Successfully deployed and verified
- **Diamond Address**: `0x0461df2b6ce85402abcD00e44A0B67fc6d72b6CE`
- **Total Facets**: 7 (all operational)
- **Function Selectors**: 69 unique selectors
- **Gas Usage**: 8,571,840 gas
- **Test Coverage**: 25/25 tests passing

### Deployment Features
- ✅ Complete Diamond architecture with all facets
- ✅ Function selector conflict resolution
- ✅ Custom error implementation throughout
- ✅ Role-based access control
- ✅ Whitelist/blacklist functionality
- ✅ Transaction recording and reversal
- ✅ Emergency pause functionality

---

## 🔄 Recent Improvements

### Test Framework Updates
- **Error Handling**: Migrated from string-based error assertions to custom error assertions
- **Coverage**: Achieved 100% test coverage across all facets
- **Custom Errors**: Implemented gas-efficient custom errors throughout the codebase

### Architecture Enhancements
- **Modularity**: Improved separation of concerns between facets
- **Gas Optimization**: Reduced deployment costs through selector optimization
- **Code Quality**: Enhanced readability and maintainability

---

## 📚 References

- [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535)
- [Diamond Standard Documentation](https://github.com/mudgen/diamond-1)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Security Token Standards](https://github.com/SecurityTokenStandard)


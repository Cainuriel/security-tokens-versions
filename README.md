
# Diamond Security Token

Una implementación de token de seguridad (security token) utilizando el patrón Diamond (EIP-2535) que permite modularidad, upgradeability y cumplimiento regulatorio.

## 🏗️ Arquitectura

### Patrón Diamond (EIP-2535)

El patrón Diamond permite crear contratos modulares sin límites de tamaño donde las funcionalidades están separadas en múltiples contratos llamados "facets". Todas las llamadas se enrutan a través de un contrato principal (Diamond) que delega la ejecución al facet correspondiente.

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
          ┌───────────────┴──────────────────┐
          │           Delegatecall           │
          └───────────────┬──────────────────┘
                          │
     ┌────────────────────┼────────────────────┐
     │                    │                    │
┌────▼────┐        ┌─────▼─────┐        ┌────▼────┐
│ ERC20   │        │  Minting  │        │  Admin  │
│ Facet   │        │   Facet   │        │  Facet  │
└─────────┘        └───────────┘        └─────────┘
                           │
                    ┌─────▼─────┐
                    │Compliance │
                    │   Facet   │
                    └───────────┘
```

## 📁 Estructura de Contratos

### Core Diamond Contracts

#### `Diamond.sol`
Contrato principal que actúa como proxy y enruta todas las llamadas a los facets correspondientes.

- **Fallback function:** Enruta automáticamente las llamadas usando `delegatecall`
- **Constructor:** Inicializa el diamond con los facets iniciales
- **ERC165 Support:** Registra interfaces soportadas

#### `LibDiamond.sol`
Librería que maneja el storage y la lógica del patrón Diamond.

- **Diamond Storage:** Mapeo de selectores de funciones a direcciones de facets
- **Facet Management:** Añadir, reemplazar y eliminar facets
- **Owner Management:** Control de acceso para modificaciones

---

### Standard Diamond Facets

#### `DiamondCutFacet.sol`
Permite modificar la estructura del diamond (añadir, reemplazar, eliminar facets).

```solidity
function diamondCut(
    FacetCut[] calldata _diamondCut,
    address _init,
    bytes calldata _calldata
) external;
```

#### `DiamondLoupeFacet.sol`
Proporciona introspección del diamond (consultar qué facets y funciones están disponibles).

```solidity
function facets() external view returns (Facet[] memory);
function facetAddress(bytes4 _functionSelector) external view returns (address);
```

---

### Security Token Facets

#### `ERC20Facet.sol`
Implementa la funcionalidad básica de ERC20 con controles de seguridad.

- ✅ Transfer, approve, transferFrom
- ✅ Verificaciones de whitelist/blacklist
- ✅ Prevención de transferencias cuando está pausado
- ✅ Registro automático de transacciones

#### `MintingFacet.sol`
Maneja el minteo y quema de tokens.

- ✅ Mint con verificación de cap
- ✅ Burn y burnFrom
- ✅ Control de acceso por roles
- ✅ Registro de transacciones de mint/burn

#### `AdminFacet.sol`
Funcionalidades administrativas y de cumplimiento.

- ✅ Pausar/despausar el contrato
- ✅ Gestión de whitelist y blacklist
- ✅ Gestión de roles (grant/revoke)
- ✅ Control de acceso

#### `ComplianceFacet.sol`
Funcionalidades específicas de cumplimiento regulatorio.

- ✅ Metadata del security token (ISIN, tipo, jurisdicción)
- ✅ Registro y consulta de transacciones
- ✅ Reversión de transacciones (emergencias)
- ✅ Constantes de roles

---

### Storage Management

#### `LibSecurityToken.sol`
Librería que centraliza todo el storage del security token en un slot dedicado.

```solidity
struct SecurityTokenStorage {
    // ERC20 Storage
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    uint256 totalSupply;
    string name;
    string symbol;
    
    // Security Token Specific
    string isin;
    string instrumentType;
    string jurisdiction;
    mapping(address => bool) whitelist;
    mapping(address => bool) blacklist;
    
    // Transaction Records
    mapping(uint256 => TransactionRecord) transactionRecords;
    uint256 transactionCount;
    
    // Access Control
    mapping(bytes32 => mapping(address => bool)) roles;
}
```

---

### Initialization

#### `DiamondInit.sol`
Contrato de inicialización que configura el estado inicial del security token.

- ✅ Configuración de parámetros ERC20
- ✅ Configuración de metadata del security token
- ✅ Asignación de roles iniciales
- ✅ Configuración de cap y otros límites

---

## 🚀 Despliegue



### Script de Despliegue

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy all facets
  console.log("📦 Deploying facets...");
  
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();
  
  const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
  const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
  await diamondLoupeFacet.waitForDeployment();
  
  const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
  const erc20Facet = await ERC20Facet.deploy();
  await erc20Facet.waitForDeployment();
  
  const MintingFacet = await ethers.getContractFactory("MintingFacet");
  const mintingFacet = await MintingFacet.deploy();
  await mintingFacet.waitForDeployment();
  
  const AdminFacet = await ethers.getContractFactory("AdminFacet");
  const adminFacet = await AdminFacet.deploy();
  await adminFacet.waitForDeployment();
  
  const ComplianceFacet = await ethers.getContractFactory("ComplianceFacet");
  const complianceFacet = await ComplianceFacet.deploy();
  await complianceFacet.waitForDeployment();

  // 2. Deploy DiamondInit
  console.log("🎯 Deploying DiamondInit...");
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.waitForDeployment();

  // 3. Prepare function selectors
  function getSelectors(contract) {
    const signatures = Object.keys(contract.interface.functions);
    return signatures.reduce((acc, val) => {
      if (val !== 'init(bytes)') {
        acc.push(contract.interface.getFunction(val).selector);
      }
      return acc;
    }, []);
  }

  // 4. Prepare diamond cut
  const cut = [
    {
      facetAddress: await diamondCutFacet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(diamondCutFacet)
    },
    {
      facetAddress: await diamondLoupeFacet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(diamondLoupeFacet)
    },
    {
      facetAddress: await erc20Facet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(erc20Facet)
    },
    {
      facetAddress: await mintingFacet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(mintingFacet)
    },
    {
      facetAddress: await adminFacet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(adminFacet)
    },
    {
      facetAddress: await complianceFacet.getAddress(),
      action: 0, // Add
      functionSelectors: getSelectors(complianceFacet)
    }
  ];

  // 5. Prepare initialization data
  const initData = diamondInit.interface.encodeFunctionData("init", [
    "Security Bond Token",    // name
    "SBT",                   // symbol
    ethers.parseUnits("1000000", 18), // cap
    "ISIN1234567890",        // isin
    "bond",                  // instrumentType
    "ES",                    // jurisdiction
    deployer.address         // admin
  ]);

  // 6. Deploy Diamond
  console.log("💎 Deploying Diamond...");
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    cut,
    await diamondInit.getAddress(),
    initData
  );
  await diamond.waitForDeployment();

  const diamondAddress = await diamond.getAddress();
  console.log("✅ Diamond deployed to:", diamondAddress);

  // 7. Verify deployment
  const diamondLoupe = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress);
  const facets = await diamondLoupe.facets();
  console.log(`✅ Diamond has ${facets.length} facets attached`);

  return {
    diamond: diamondAddress,
    facets: {
      diamondCut: await diamondCutFacet.getAddress(),
      diamondLoupe: await diamondLoupeFacet.getAddress(),
      erc20: await erc20Facet.getAddress(),
      minting: await mintingFacet.getAddress(),
      admin: await adminFacet.getAddress(),
      compliance: await complianceFacet.getAddress()
    }
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Ejecutar Despliegue

```bash

npx hardhat compile

npx hardhat run scripts/diamondDeploy.js --network <NETWORK_NAME>
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npx hardhat test

# Ejecutar tests específicos
npx hardhat test test/DiamondSecurityToken.test.js

# Ejecutar con cobertura
npx hardhat coverage
```

---

## 📖 Uso

### Interactuar con el Diamond

```javascript
// Obtener instancias de los facets
const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
const admin = await ethers.getContractAt("AdminFacet", diamondAddress);
const minting = await ethers.getContractAt("MintingFacet", diamondAddress);
const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

// Añadir usuario a whitelist
await admin.addToWhitelist(userAddress);

// Mintear tokens
await minting.mint(userAddress, ethers.parseUnits("1000", 18));

// Transferir tokens
await erc20.connect(user).transfer(recipientAddress, ethers.parseUnits("100", 18));

// Consultar transacciones
const txCount = await compliance.transactionCount();
const lastTx = await compliance.getTransactionRecord(txCount);
```

### Upgrades del Diamond

```javascript
// Desplegar nuevo facet
const NewFacet = await ethers.getContractFactory("NewFacet");
const newFacet = await NewFacet.deploy();

// Preparar diamond cut
const cut = [{
  facetAddress: await newFacet.getAddress(),
  action: 0, // Add
  functionSelectors: getSelectors(newFacet)
}];

// Ejecutar upgrade
const diamondCut = await ethers.getContractAt("DiamondCutFacet", diamondAddress);
await diamondCut.diamondCut(cut, ethers.ZeroAddress, "0x");
```

---

## 🛡️ Seguridad

### Controles Implementados

- ✅ Access Control: Roles granulares para diferentes operaciones
- ✅ Whitelist/Blacklist: Control de transferencias por dirección
- ✅ Pausable: Capacidad de pausar todas las transferencias
- ✅ Capped Supply: Límite máximo de tokens
- ✅ Transaction Recording: Registro inmutable de todas las transacciones
- ✅ Emergency Reversals: Capacidad de revertir transacciones en emergencias

### Mejores Prácticas

- **Gestión de Roles:** Usar diferentes addresses para diferentes roles
- **Upgrades:** Probar thoroughly en testnet antes de mainnet:

### Pre-Mainnet Checklist:
- [ ] Todos los unit tests pasan (100% coverage)
- [ ] Deployment script funciona en testnet
- [ ] Todas las funciones de facets funcionan correctamente
- [ ] Upgrades de facets funcionan sin perder data
- [ ] Access control funciona correctamente
- [ ] Whitelist/blacklist funcionan
- [ ] Pausable funciona
- [ ] Transaction recording funciona
- [ ] Gas costs son aceptables
- [ ] Auditoría de seguridad completada
- [ ] Tests de stress completados
- [ ] Documentación verificada

- **Emergency Procedures:** Establecer procedimientos claros para pausas y reversiones
- **Monitoring:** Implementar monitoring para transacciones sospechosas - ver anexo

---


---

## 📋 Ventajas del Patrón Diamond

- **Modularidad:** Funcionalidades separadas en facets independientes
- **No Límite de Tamaño:** Evita el límite de 24KB de contratos
- **Upgrades Granulares:** Actualizar facets individuales sin afectar otros
- **Reutilización:** Facets pueden reutilizarse en múltiples diamonds
- **Storage Organizado:** Cada librería maneja su propio storage
- **Gas Efficient:** Routing optimizado con assembly

---

## ⚠️ Consideraciones

- **Complejidad:** Mayor complejidad de desarrollo y testing
- **Gas Overhead:** Pequeño overhead por el routing
- **Debugging:** Más complejo debuggear problemas
- **Auditoría:** Requiere auditoría más exhaustiva

---

## 📚 Referencias

- [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535)
- [Diamond Standard Documentation](https://github.com/mudgen/diamond-1)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Security Token Standards](https://github.com/SecurityTokenStandard)


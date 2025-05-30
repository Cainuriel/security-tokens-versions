# Patrones con SecurityToken.sol

## Índice

- [Single SecurityToken.sol](#single-securitytokensol)
- [Security Token con Patrón Beacon](#security-token-con-patrón-beacon)
- [Diamond Security Token](#diamond-security-token)


# Single SecurityToken.sol

`SecurityToken.sol` es un contrato inteligente ERC20 extensible y seguro, diseñado para representar tokens regulados (security tokens) en Ethereum. Utiliza los módulos upgradeables de OpenZeppelin y añade controles de acceso, listas blanca/negra y registro de transacciones.

## Características principales

- **ERC20 estándar** con funciones de quemado, pausado y límite de emisión (cap).
- **Control de acceso** basado en roles (`ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`).
- **Listas blanca y negra** para restringir transferencias.
- **Registro de transacciones** para trazabilidad y cumplimiento.
- **Inicializable** para despliegues upgradeables.

---

## Funciones principales

### Inicialización

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
Inicializa el token con sus parámetros y asigna los roles principales al `admin`.

---

### Funciones de emisión y control

- **mint(address to, uint256 amount)**  
  Permite a cuentas con `MINTER_ROLE` emitir nuevos tokens.

- **pause()**  
  Permite a cuentas con `PAUSER_ROLE` pausar todas las transferencias.

- **unpause()**  
  Permite a cuentas con `PAUSER_ROLE` reanudar las transferencias.

---

### Listas blanca y negra

- **addToWhitelist(address account)**  
  Agrega una cuenta a la whitelist (solo `ADMIN_ROLE`).

- **removeFromWhitelist(address account)**  
  Elimina una cuenta de la whitelist (solo `ADMIN_ROLE`).

- **addToBlacklist(address account)**  
  Agrega una cuenta a la blacklist (solo `ADMIN_ROLE`).

- **removeFromBlacklist(address account)**  
  Elimina una cuenta de la blacklist (solo `ADMIN_ROLE`).

---

### Registro y reversión de transacciones

- **getTransactionRecord(uint256 id)**  
  Devuelve los detalles de una transacción registrada.

- **revertTransaction(uint256 transactionId)**  
  Permite a un administrador revertir una transacción registrada, transfiriendo los tokens de vuelta.

---

### Métadatos y variables públicas

- **isin**  
  Código ISIN del instrumento financiero.

- **instrumentType**  
  Tipo de instrumento (ej: "bond").

- **jurisdiction**  
  Jurisdicción aplicable.

- **transactionCount**  
  Número total de transacciones registradas.

---

## Seguridad y cumplimiento

- Todas las transferencias verifican que el emisor y receptor estén en la whitelist y no en la blacklist.
- Solo cuentas con los roles adecuados pueden pausar, mintear o modificar listas.
- Cada transferencia queda registrada para trazabilidad y cumplimiento normativo.

---

## Ejemplo de uso

```solidity
// Inicialización (solo una vez)
securityToken.initialize(
    "My Security Token",
    "MST",
    1000000 ether,
    "ISIN1234567890",
    "bond",
    "ES",
    adminAddress
);

// Minteo
securityToken.mint(user, 1000 ether);

// Pausar y reanudar
securityToken.pause();
securityToken.unpause();

// Gestión de listas
securityToken.addToWhitelist(user);
securityToken.addToBlacklist(maliciousUser);

// Consultar registro de transacciones
SecurityToken.TransactionRecord memory record = securityToken.getTransactionRecord(1);
```

---

# Security Token con Patrón Beacon

Este proyecto implementa un sistema de tokens de seguridad (Security Tokens) utilizando el patrón **Beacon Proxy** de OpenZeppelin, permitiendo la creación de múltiples instancias de tokens actualizables de manera eficiente.

## 🏗️ Arquitectura del Sistema

El sistema consta de tres componentes principales:

1. **SecurityToken.sol**  
    Contrato de implementación del token de seguridad que incluye:
    - ERC20 Upgradeable: Funcionalidad básica de token
    - ERC20 Burnable: Capacidad de quemar tokens
    - ERC20 Pausable: Pausar/reanudar transferencias
    - ERC20 Capped: Límite máximo de suministro
    - Access Control: Sistema de roles y permisos
    - Whitelist/Blacklist: Control de direcciones autorizadas
    - Transaction Records: Registro de transacciones para auditoría

2. **SecurityBondFactory.sol**  
    Factory contract que crea instancias de SecurityToken usando BeaconProxy:
    - Crea nuevos tokens de seguridad
    - Mantiene registro de todos los tokens creados
    - Utiliza el patrón Beacon para actualizaciones eficientes

3. **__CompileBeacon.sol**  
    Contrato auxiliar para compilación de UpgradeableBeacon en Hardhat.

## 🔑 Características Principales

### Roles y Permisos

- `ADMIN_ROLE`: Gestión de whitelist/blacklist y reversión de transacciones
- `MINTER_ROLE`: Creación de nuevos tokens
- `PAUSER_ROLE`: Pausar/reanudar el contrato
- `DEFAULT_ADMIN_ROLE`: Administración general de roles

### Funcionalidades de Seguridad

- **Whitelist:** Solo direcciones autorizadas pueden recibir tokens
- **Blacklist:** Bloqueo de direcciones específicas
- **Pausable:** Capacidad de pausar todas las operaciones
- **Transaction Reversal:** Reversión de transacciones por administradores
- **Audit Trail:** Registro completo de todas las transacciones

### Metadatos del Instrumento

- **ISIN:** Identificador internacional del instrumento
- **Instrument Type:** Tipo de instrumento financiero
- **Jurisdiction:** Jurisdicción legal aplicable

## 📁 Estructura de Archivos

```
contracts/
├── SecurityToken.sol           # Implementación del token de seguridad
├── SecurityBondFactory.sol     # Factory para crear instancias
└── __CompileBeacon.sol         # Auxiliar para compilación
```

## 🚀 Guía de Despliegue


> **Nota:** Este proyecto **NO** usa `@openzeppelin/hardhat-upgrades` ya que implementa el patrón Beacon manualmente para mayor control sobre el proceso de despliegue.

### Paso a Paso del Despliegue

1. **Script de despliegue**

    ```js
    // scripts/deploy.js
    const { ethers } = require("hardhat");

    async function main() {
      const [admin] = await ethers.getSigners();
      console.log("Deploying contracts with account:", admin.address);

      // 1. Desplegar la implementación de SecurityToken
      const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
      const securityTokenImpl = await SecurityTokenFactory.deploy();
      await securityTokenImpl.waitForDeployment();
      
      const implAddress = await securityTokenImpl.getAddress();
      console.log("Implementation deployed at:", implAddress);

      // 2. Desplegar el UpgradeableBeacon manualmente
      const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
      const beacon = await BeaconFactory.deploy(implAddress, admin.address);
      await beacon.waitForDeployment();
      
      const beaconAddress = await beacon.getAddress();
      console.log("Beacon deployed at:", beaconAddress);

      // 3. Desplegar el Factory
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

3. **Ejecutar el despliegue**

    ```bash
    npx hardhat run scripts/deploy.js --network <network-name>
    ```

4. **Crear una instancia de SecurityToken**

    ```js
    // scripts/beeaconCreateToken.js
    async function createSecurityToken() {
      const [admin, user1] = await ethers.getSigners();
      
      // Obtener las instancias de los contratos desplegados
      const factory = await ethers.getContractAt("SecurityBondFactory", FACTORY_ADDRESS);
      const securityTokenImpl = await ethers.getContractAt("SecurityToken", IMPLEMENTATION_ADDRESS);
      
      // Preparar datos de inicialización usando la implementación real
      const initData = securityTokenImpl.interface.encodeFunctionData("initialize", [
         "TestBond",              // name
         "TBND",                  // symbol
         ethers.parseUnits("1000000", 18), // cap (1M tokens)
         "ISIN1234567890",        // ISIN
         "bond",                  // instrumentType
         "ES",                    // jurisdiction
         admin.address            // admin
      ]);

      // Crear el token
      const tx = await factory.createBond(initData, user1.address);
      const receipt = await tx.wait();
      
      // Obtener la dirección del primer bond creado
      const bondAddress = await factory.deployedBonds(0);
      console.log("Security Token created at:", bondAddress);
      
      // Interactuar con el nuevo token
      const bond = await ethers.getContractAt("SecurityToken", bondAddress);
      
      // Configuración inicial
      await bond.addToWhitelist(admin.address);
      await bond.addToWhitelist(user1.address);
      
      // Mint tokens iniciales
      await bond.mint(user1.address, ethers.parseUnits("1000", 18));
      
      console.log("Token configured and initial minting completed");
      return bondAddress;
    }
    ```

## 🛠️ Uso del Sistema

### Crear un nuevo Security Token

```js
const factory = await ethers.getContractAt("SecurityBondFactory", factoryAddress);
const initData = /* datos de inicialización */;
await factory.createBond(initData, beneficiaryAddress);
```

### Interactuar con un Security Token

```js
const token = await ethers.getContractAt("SecurityToken", tokenAddress);

// Añadir a whitelist
await token.addToWhitelist(userAddress);

// Mint tokens
await token.mint(userAddress, amount);

// Pausar contrato
await token.pause();

// Ver registro de transacciones
const record = await token.getTransactionRecord(transactionId);
```

### Actualizar la implementación

```js
// Actualizar todos los tokens a una nueva implementación
const NewSecurityToken = await ethers.getContractFactory("SecurityTokenV2");
await upgrades.upgradeBeacon(beaconAddress, NewSecurityToken);
```

## 🛡️ Consideraciones de Seguridad

### Roles Críticos

- El `DEFAULT_ADMIN_ROLE` tiene control total sobre el contrato
- Los roles deben asignarse cuidadosamente y seguir el principio de menor privilegio
- Considerar usar multi-sig para roles administrativos

### Validaciones Importantes

- Todas las direcciones deben estar en whitelist para recibir tokens
- Las direcciones en blacklist están completamente bloqueadas
- Las transacciones se registran automáticamente para auditoría

### Actualizaciones

- El patrón Beacon permite actualizar todos los tokens simultáneamente
- Las actualizaciones deben probarse exhaustivamente en testnet
- Mantener compatibilidad con el storage layout existente

## 🧪 Testing

### Estructura de Tests

Los tests validan toda la funcionalidad del sistema usando el patrón BeaconProxy:

```js
// test/SecurityToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityToken (BeaconProxy architecture)", function () {
  let securityTokenImpl, beacon, factory, bond;
  let admin, user1, user2;

  before(async function () {
     [admin, user1, user2] = await ethers.getSigners();
     
     // Desplegar implementación
     const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
     securityTokenImpl = await SecurityTokenFactory.deploy();
     await securityTokenImpl.waitForDeployment();

     // Desplegar Beacon
     const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
     beacon = await BeaconFactory.deploy(
        await securityTokenImpl.getAddress(), 
        admin.address
     );
     await beacon.waitForDeployment();

     // Desplegar Factory
     const Factory = await ethers.getContractFactory("SecurityBondFactory");
     factory = await Factory.deploy(await beacon.getAddress());
     await factory.waitForDeployment();

     // Crear un bond de prueba
     const initData = securityTokenImpl.interface.encodeFunctionData("initialize", [
        "TestBond", "TBND", ethers.parseUnits("1000000", 18),
        "ISIN1234567890", "bond", "ES", admin.address
     ]);

     await factory.createBond(initData, user1.address);
     const bondAddress = await factory.deployedBonds(0);
     bond = await ethers.getContractAt("SecurityToken", bondAddress);
  });

  // Tests de funcionalidad...
});
```

#### Casos de Prueba Principales

- ✅ Despliegue correcto usando Factory
- ✅ Minting y transferencias con whitelist
- ✅ Registro automático de transacciones
- ✅ Reversión de transacciones por ID
- ✅ Bloqueo de transferencias sin whitelist
- ✅ Control de roles y permisos
- ✅ Funcionalidad de pausa/reanudación

```bash
# Ejecutar tests
npx hardhat test

# Coverage
npx hardhat coverage
```

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
// scripts/diamondDeploy.js
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


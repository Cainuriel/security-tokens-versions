const { ethers } = require("hardhat");

const FACTORY_ADDRESS = "0x6C40C3a129C382ca0FD957381D5801AC13c34728"; // 
const IMPLEMENTATION_ADDRESS = "0xD30B19eF8Eae6f6646F1eF1F56f4442879F3CAAc"; // 

  async function createSecurityToken() {
      const [admin] = await ethers.getSigners();
      user1 = "0x717E34E5019AebE1A596Fd3cB1c1119aD6fD8B69"; // dev alastria 12
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
      const tx = await factory.createBond(initData, user1);
      const receipt = await tx.wait();
      
      // Obtener la dirección del primer bond creado
      const bondAddress = await factory.deployedBonds(0);
      console.log("Security Token created at:", bondAddress);
      
      // Interactuar con el nuevo token
      const bond = await ethers.getContractAt("SecurityToken", bondAddress);
      
      // Configuración inicial
      await bond.addToWhitelist(admin.address);
      await bond.addToWhitelist(user1);
      console.log("added to whitelist:", admin.address, user1);
      // Mint tokens iniciales
      // await bond.mint(user1, ethers.parseUnits("1000", 18));
      
      // console.log("Token configured and initial minting completed");
      
    }

  createSecurityToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  //npx hardhat run scripts/beaconCreateToken.js --network <network_name>

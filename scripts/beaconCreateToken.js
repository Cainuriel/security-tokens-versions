const { ethers } = require("hardhat");

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
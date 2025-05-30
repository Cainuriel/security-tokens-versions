const { ethers } = require("hardhat");

    async function main() {
      const [admin] = await ethers.getSigners();
      console.log("Deploying contracts with account:", admin.address);

      // 1. Deploy SecurityToken
      const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
      const securityTokenImpl = await SecurityTokenFactory.deploy();
      await securityTokenImpl.waitForDeployment();
      
      const implAddress = await securityTokenImpl.getAddress();
      console.log("Implementation deployed at:", implAddress);

      // 2. Desploy UpgradeableBeacon
      const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
      const beacon = await BeaconFactory.deploy(implAddress, admin.address);
      await beacon.waitForDeployment();
      
      const beaconAddress = await beacon.getAddress();
      console.log("Beacon deployed at:", beaconAddress);

      // 3. Deploy factory
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
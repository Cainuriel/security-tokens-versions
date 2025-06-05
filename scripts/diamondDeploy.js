// scripts/deploy.js
// Diamond Security Token - Complete Deployment Script
// SPDX-License-Identifier: MIT

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  // Token Configuration
  token: {
    name: "Security Bond Token",
    symbol: "SBT",
    cap: ethers.parseUnits("1000000", 18), // 1M tokens max
    isin: "ES0000000000",
    instrumentType: "bond",
    jurisdiction: "ES"
  },
  
  // Gas Configuration
  gasLimit: {
    facetDeploy: 3000000,
    diamondDeploy: 8000000
  },
  
  // Verification delay (for etherscan)
  verificationDelay: 30000 // 30 seconds
};

// Utility functions
function getSelectors(contract) {

  const functionFragments = contract.interface.fragments.filter(f => f.type === "function");
//   console.log('functionFragments:', functionFragments.map(f => f.name));
  const selectors = functionFragments
    .filter(f => f.name !== "init")
    .map(f => contract.interface.getFunction(f.name).selector);
  return selectors;
}

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

async function saveDeploymentInfo(deploymentInfo, network) {
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filePath = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(
  filePath,
  JSON.stringify(deploymentInfo, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value,
    2
    )
  );
  console.log(`📄 Deployment info saved to: ${filePath}`);
}

// async function verifyContract(address, constructorArguments = [], contractName = "") {
//   try {
//     console.log(`🔍 Verifying ${contractName} at ${address}...`);
//     await hre.run("verify:verify", {
//       address: address,
//       constructorArguments: constructorArguments,
//     });
//     console.log(`✅ ${contractName} verified successfully`);
//   } catch (error) {
//     console.log(`❌ Verification failed for ${contractName}:`, error.message);
//   }
// }

async function main() {
  console.log("🚀 Starting Diamond Security Token Deployment...\n");
  
  // Get network and accounts
  const network = hre.network.name;
  const [deployer, admin, treasury] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🌐 Network: ${network}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`🔑 Admin: ${admin?.address || deployer.address}`);
  console.log(`💰 Treasury: ${treasury?.address || deployer.address}`);
  console.log(`🪙 Token: ${DEPLOYMENT_CONFIG.token.name} (${DEPLOYMENT_CONFIG.token.symbol})`);
  console.log(`📊 Cap: ${ethers.formatUnits(DEPLOYMENT_CONFIG.token.cap, 18)} tokens`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💳 Deployer balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low ETH balance for deployment");
  }
  console.log();

  const deploymentInfo = {
    network,
    deployer: deployer.address,
    admin: admin?.address || deployer.address,
    timestamp: new Date().toISOString(),
    config: DEPLOYMENT_CONFIG.token,
    contracts: {},
    facets: {},
    gasUsed: {}
  };

  let totalGasUsed = BigInt(0);

  try {
    // =======================================================================
    // STEP 1: Deploy Storage Libraries
    // =======================================================================
    console.log("📚 Step 1: Deploying Storage Libraries...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Note: Libraries are deployed automatically by Hardhat when referenced
    console.log("✅ Storage libraries will be deployed automatically with facets\n");

    // =======================================================================
    // STEP 2: Deploy Diamond Initialization Contract
    // =======================================================================
    console.log("🎯 Step 2: Deploying Diamond Initialization...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const DiamondInit = await ethers.getContractFactory("DiamondInit");
    const diamondInit = await DiamondInit.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await diamondInit.waitForDeployment();
    
    const diamondInitAddress = await diamondInit.getAddress();
    const diamondInitTx = await ethers.provider.getTransactionReceipt(diamondInit.deploymentTransaction().hash);
    totalGasUsed += diamondInitTx.gasUsed;

    deploymentInfo.contracts.diamondInit = diamondInitAddress;
    deploymentInfo.gasUsed.diamondInit = diamondInitTx.gasUsed.toString();

    console.log(`✅ DiamondInit deployed: ${diamondInitAddress}`);
    console.log(`⛽ Gas used: ${diamondInitTx.gasUsed.toLocaleString()}\n`);

    // =======================================================================
    // STEP 3: Deploy Standard Diamond Facets
    // =======================================================================
    console.log("💎 Step 3: Deploying Standard Diamond Facets...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await diamondCutFacet.waitForDeployment();
    
    const diamondCutAddress = await diamondCutFacet.getAddress();
    const diamondCutTx = await ethers.provider.getTransactionReceipt(diamondCutFacet.deploymentTransaction().hash);
    totalGasUsed += diamondCutTx.gasUsed;
    
    deploymentInfo.facets.diamondCut = {
      address: diamondCutAddress,
      selectors: getSelectors(diamondCutFacet)
    };
    deploymentInfo.gasUsed.diamondCut = diamondCutTx.gasUsed.toString();

    console.log(`✅ DiamondCutFacet deployed: ${diamondCutAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(diamondCutFacet).length}`);
    console.log(`⛽ Gas used: ${diamondCutTx.gasUsed.toLocaleString()}`);

    // Deploy DiamondLoupeFacet
    const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await diamondLoupeFacet.waitForDeployment();
    
    const diamondLoupeAddress = await diamondLoupeFacet.getAddress();
    const diamondLoupeTx = await ethers.provider.getTransactionReceipt(diamondLoupeFacet.deploymentTransaction().hash);
    totalGasUsed += diamondLoupeTx.gasUsed;

    deploymentInfo.facets.diamondLoupe = {
      address: diamondLoupeAddress,
      selectors: getSelectors(diamondLoupeFacet)
    };
    deploymentInfo.gasUsed.diamondLoupe = diamondLoupeTx.gasUsed.toString();

    console.log(`✅ DiamondLoupeFacet deployed: ${diamondLoupeAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(diamondLoupeFacet).length}`);
    console.log(`⛽ Gas used: ${diamondLoupeTx.gasUsed.toLocaleString()}`);

    // Deploy OwnershipFacet
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
    const ownershipFacet = await OwnershipFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await ownershipFacet.waitForDeployment();
    
    const ownershipAddress = await ownershipFacet.getAddress();
    const ownershipTx = await ethers.provider.getTransactionReceipt(ownershipFacet.deploymentTransaction().hash);
    totalGasUsed += ownershipTx.gasUsed;

    deploymentInfo.facets.ownership = {
      address: ownershipAddress,
      selectors: getSelectors(ownershipFacet)
    };
    deploymentInfo.gasUsed.ownership = ownershipTx.gasUsed.toString();

    console.log(`✅ OwnershipFacet deployed: ${ownershipAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(ownershipFacet).length}`);
    console.log(`⛽ Gas used: ${ownershipTx.gasUsed.toLocaleString()}\n`);

    // =======================================================================
    // STEP 4: Deploy Security Token Facets
    // =======================================================================
    console.log("🔐 Step 4: Deploying Security Token Facets...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Deploy ERC20Facet
    const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
    const erc20Facet = await ERC20Facet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await erc20Facet.waitForDeployment();
    
    const erc20Address = await erc20Facet.getAddress();
    const erc20Tx = await ethers.provider.getTransactionReceipt(erc20Facet.deploymentTransaction().hash);
    totalGasUsed += erc20Tx.gasUsed;

    deploymentInfo.facets.erc20 = {
      address: erc20Address,
      selectors: getSelectors(erc20Facet)
    };
    deploymentInfo.gasUsed.erc20 = erc20Tx.gasUsed.toString();

    console.log(`✅ ERC20Facet deployed: ${erc20Address}`);
    console.log(`📝 Function selectors: ${getSelectors(erc20Facet).length}`);
    console.log(`⛽ Gas used: ${erc20Tx.gasUsed.toLocaleString()}`);

    // Deploy MintingFacet
    const MintingFacet = await ethers.getContractFactory("MintingFacet");
    const mintingFacet = await MintingFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await mintingFacet.waitForDeployment();
    
    const mintingAddress = await mintingFacet.getAddress();
    const mintingTx = await ethers.provider.getTransactionReceipt(mintingFacet.deploymentTransaction().hash);
    totalGasUsed += mintingTx.gasUsed;

    deploymentInfo.facets.minting = {
      address: mintingAddress,
      selectors: getSelectors(mintingFacet)
    };
    deploymentInfo.gasUsed.minting = mintingTx.gasUsed.toString();

    console.log(`✅ MintingFacet deployed: ${mintingAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(mintingFacet).length}`);
    console.log(`⛽ Gas used: ${mintingTx.gasUsed.toLocaleString()}`);

    // Deploy AdminFacet
    const AdminFacet = await ethers.getContractFactory("AdminFacet");
    const adminFacet = await AdminFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await adminFacet.waitForDeployment();
    
    const adminFacetAddress = await adminFacet.getAddress();
    const adminFacetTx = await ethers.provider.getTransactionReceipt(adminFacet.deploymentTransaction().hash);
    totalGasUsed += adminFacetTx.gasUsed;

    deploymentInfo.facets.admin = {
      address: adminFacetAddress,
      selectors: getSelectors(adminFacet)
    };
    deploymentInfo.gasUsed.admin = adminFacetTx.gasUsed.toString();

    console.log(`✅ AdminFacet deployed: ${adminFacetAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(adminFacet).length}`);
    console.log(`⛽ Gas used: ${adminFacetTx.gasUsed.toLocaleString()}`);

    // Deploy ComplianceFacet
    const ComplianceFacet = await ethers.getContractFactory("ComplianceFacet");
    const complianceFacet = await ComplianceFacet.deploy({
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.facetDeploy
    });
    await complianceFacet.waitForDeployment();
    
    const complianceAddress = await complianceFacet.getAddress();
    const complianceTx = await ethers.provider.getTransactionReceipt(complianceFacet.deploymentTransaction().hash);
    totalGasUsed += complianceTx.gasUsed;

    deploymentInfo.facets.compliance = {
      address: complianceAddress,
      selectors: getSelectors(complianceFacet)
    };
    deploymentInfo.gasUsed.compliance = complianceTx.gasUsed.toString();

    console.log(`✅ ComplianceFacet deployed: ${complianceAddress}`);
    console.log(`📝 Function selectors: ${getSelectors(complianceFacet).length}`);
    console.log(`⛽ Gas used: ${complianceTx.gasUsed.toLocaleString()}\n`);

    // =======================================================================
    // STEP 5: Prepare Diamond Cut
    // =======================================================================
    console.log("⚔️  Step 5: Preparing Diamond Cut...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const cut = [
      {
        facetAddress: diamondCutAddress,
        action: 0, // Add
        functionSelectors: getSelectors(diamondCutFacet)
      },
      {
        facetAddress: diamondLoupeAddress,
        action: 0, // Add
        functionSelectors: getSelectors(diamondLoupeFacet)
      },
      {
        facetAddress: ownershipAddress,
        action: 0, // Add
        functionSelectors: getSelectors(ownershipFacet)
      },
      {
        facetAddress: erc20Address,
        action: 0, // Add
        functionSelectors: getSelectors(erc20Facet)
      },
      {
        facetAddress: mintingAddress,
        action: 0, // Add
        functionSelectors: getSelectors(mintingFacet)
      },
      {
        facetAddress: adminFacetAddress,
        action: 0, // Add
        functionSelectors: getSelectors(adminFacet)
      },
      {
        facetAddress: complianceAddress,
        action: 0, // Add
        functionSelectors: getSelectors(complianceFacet)
      }
    ];

    deploymentInfo.cut = cut.map(c => ({
      facetAddress: c.facetAddress,
      action: c.action,
      functionSelectorsCount: c.functionSelectors.length
    }));

    const totalSelectors = cut.reduce((sum, c) => sum + c.functionSelectors.length, 0);
    console.log(`📊 Total facets: ${cut.length}`);
    console.log(`📊 Total function selectors: ${totalSelectors}`);

    // =======================================================================
    // STEP 6: Prepare Initialization Data
    // =======================================================================
    console.log("\n🎛️  Step 6: Preparing Initialization Data...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const adminAddress = admin?.address || deployer.address;
    const initData = diamondInit.interface.encodeFunctionData("init", [
      DEPLOYMENT_CONFIG.token.name,
      DEPLOYMENT_CONFIG.token.symbol,
      DEPLOYMENT_CONFIG.token.cap,
      DEPLOYMENT_CONFIG.token.isin,
      DEPLOYMENT_CONFIG.token.instrumentType,
      DEPLOYMENT_CONFIG.token.jurisdiction,
      adminAddress
    ]);

    console.log(`✅ Initialization data prepared`);
    console.log(`👤 Admin address: ${adminAddress}`);
    console.log(`📝 Init data length: ${initData.length} bytes\n`);

    // =======================================================================
    // STEP 7: Deploy Diamond
    // =======================================================================
    console.log("💎 Step 7: Deploying Diamond Contract...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy(cut, diamondInitAddress, initData, {
      gasLimit: DEPLOYMENT_CONFIG.gasLimit.diamondDeploy
    });
    await diamond.waitForDeployment();

    const diamondAddress = await diamond.getAddress();
    const diamondTx = await ethers.provider.getTransactionReceipt(diamond.deploymentTransaction().hash);
    totalGasUsed += diamondTx.gasUsed;

    deploymentInfo.contracts.diamond = diamondAddress;
    deploymentInfo.gasUsed.diamond = diamondTx.gasUsed.toString();
    deploymentInfo.gasUsed.total = totalGasUsed.toString();

    console.log(`✅ Diamond deployed: ${diamondAddress}`);
    console.log(`⛽ Gas used: ${diamondTx.gasUsed.toLocaleString()}`);
    console.log(`⛽ Total gas used: ${totalGasUsed.toLocaleString()}\n`);

    // =======================================================================
    // STEP 8: Verify Deployment
    // =======================================================================
    console.log("🔍 Step 8: Verifying Deployment...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Get diamond instance with all facets
    const diamondLoupe = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress);
    const erc20Diamond = await ethers.getContractAt("ERC20Facet", diamondAddress);
    const adminDiamond = await ethers.getContractAt("AdminFacet", diamondAddress);
    const complianceDiamond = await ethers.getContractAt("ComplianceFacet", diamondAddress);

    // Verify facets are attached
    const facets = await diamondLoupe.facets();
    console.log(`✅ Diamond has ${facets.length} facets attached`);

    // Verify initialization
    console.log(`✅ Token name: ${await erc20Diamond.name()}`);
    console.log(`✅ Token symbol: ${await erc20Diamond.symbol()}`);
    console.log(`✅ Token cap: ${ethers.formatUnits(await complianceDiamond.cap(), 18)}`);
    console.log(`✅ ISIN: ${await complianceDiamond.isin()}`);

    // Verify admin has roles
    const adminRole = await complianceDiamond.ADMIN_ROLE();
    const hasAdminRole = await adminDiamond.hasRole(adminRole, adminAddress);
    console.log(`✅ Admin role granted: ${hasAdminRole}`);

    deploymentInfo.verification = {
      facetsCount: facets.length,
      tokenName: await erc20Diamond.name(),
      tokenSymbol: await erc20Diamond.symbol(),
      adminHasRole: hasAdminRole,
      timestamp: new Date().toISOString()
    };

    // =======================================================================
    // STEP 9: Post-Deployment Setup
    // =======================================================================
    console.log("\n⚙️  Step 9: Post-Deployment Setup...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Whitelist deployer and admin for initial operations
    if (adminAddress !== deployer.address) {
      console.log("🔑 Whitelisting admin and deployer...");
      await adminDiamond.addToWhitelist(adminAddress);
      await adminDiamond.addToWhitelist(deployer.address);
      console.log(`✅ Admin whitelisted: ${adminAddress}`);
      console.log(`✅ Deployer whitelisted: ${deployer.address}`);
    } else {
      console.log("🔑 Whitelisting deployer/admin...");
      await adminDiamond.addToWhitelist(deployer.address);
      console.log(`✅ Deployer/Admin whitelisted: ${deployer.address}`);
    }

    // Whitelist treasury if different
    if (treasury && treasury.address !== deployer.address && treasury.address !== adminAddress) {
      await adminDiamond.addToWhitelist(treasury.address);
      console.log(`✅ Treasury whitelisted: ${treasury.address}`);
    }

    // =======================================================================
    // STEP 10: Save Deployment Info
    // =======================================================================
    console.log("\n💾 Step 10: Saving Deployment Information...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await saveDeploymentInfo(deploymentInfo, network);

    // =======================================================================
    // STEP 11: Contract Verification (if on testnet/mainnet)
    // =======================================================================
    // if (network !== "hardhat" && network !== "localhost") {
    //   console.log("\n🔍 Step 11: Contract Verification...");
    //   console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
    //   console.log(`⏳ Waiting ${DEPLOYMENT_CONFIG.verificationDelay / 1000}s for Etherscan indexing...`);
    //   await delay(DEPLOYMENT_CONFIG.verificationDelay);

      // Verify all contracts
    //   await verifyContract(diamondInitAddress, [], "DiamondInit");
    //   await verifyContract(diamondCutAddress, [], "DiamondCutFacet");
    //   await verifyContract(diamondLoupeAddress, [], "DiamondLoupeFacet");
    //   await verifyContract(ownershipAddress, [], "OwnershipFacet");
    //   await verifyContract(erc20Address, [], "ERC20Facet");
    //   await verifyContract(mintingAddress, [], "MintingFacet");
    //   await verifyContract(adminFacetAddress, [], "AdminFacet");
    //   await verifyContract(complianceAddress, [], "ComplianceFacet");
    //   await verifyContract(diamondAddress, [cut, diamondInitAddress, initData], "Diamond");
    // }

    // =======================================================================
    // DEPLOYMENT SUMMARY
    // =======================================================================
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💎 Diamond Address: ${diamondAddress}`);
    console.log(`📊 Total Facets: ${facets.length}`);
    console.log(`⛽ Total Gas Used: ${totalGasUsed.toLocaleString()}`);
    console.log(`💰 Estimated Cost: ~${ethers.formatEther(totalGasUsed * BigInt("20000000000"))} ETH (20 gwei)`);
    console.log(`📄 Deployment Info: deployments/${network}.json`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n📋 Quick Start Commands:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`// Get diamond instance with all facets`);
    console.log(`const diamond = await ethers.getContractAt("ERC20Facet", "${diamondAddress}");`);
    console.log(`const admin = await ethers.getContractAt("AdminFacet", "${diamondAddress}");`);
    console.log(`const minting = await ethers.getContractAt("MintingFacet", "${diamondAddress}");`);
    console.log();
    console.log(`// Add user to whitelist and mint tokens`);
    console.log(`await admin.addToWhitelist(userAddress);`);
    console.log(`await minting.mint(userAddress, ethers.parseUnits("1000", 18));`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return {
      diamond: diamondAddress,
      facets: {
        diamondCut: diamondCutAddress,
        diamondLoupe: diamondLoupeAddress,
        ownership: ownershipAddress,
        erc20: erc20Address,
        minting: mintingAddress,
        admin: adminFacetAddress,
        compliance: complianceAddress
      },
      diamondInit: diamondInitAddress,
      gasUsed: totalGasUsed,
      deploymentInfo
    };

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Error:", error.message);
    console.error("\n🔍 Debugging Information:");
    console.error(`Network: ${network}`);
    console.error(`Deployer: ${deployer.address}`);
    // console.error(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
    
    // Save partial deployment info if available
    if (deploymentInfo.contracts.diamond || Object.keys(deploymentInfo.facets).length > 0) {
      deploymentInfo.error = {
        message: error.message,
        timestamp: new Date().toISOString()
      };
      await saveDeploymentInfo(deploymentInfo, `${network}-failed`);
      console.error(`📄 Partial deployment info saved to: deployments/${network}-failed.json`);
    }
    
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;

  // npx hardhat run scripts/diamondDeploy.js --network <network_name>

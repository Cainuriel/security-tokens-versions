// scripts/checkSelectors.js
// Debug script to check function selectors for each facet
const { ethers } = require("hardhat");

function getSelectors(contract) {
  const functionFragments = contract.interface.fragments.filter(f => f.type === "function");
  const selectors = functionFragments
    .filter(f => f.name !== "init")
    .map(f => ({
      name: f.name,
      selector: contract.interface.getFunction(f.name).selector
    }));
  return selectors;
}

function findDuplicateSelectors(facetSelectors) {
  const selectorMap = new Map();
  const duplicates = [];

  for (const [facetName, selectors] of Object.entries(facetSelectors)) {
    for (const { name, selector } of selectors) {
      if (selectorMap.has(selector)) {
        const existing = selectorMap.get(selector);
        duplicates.push({
          selector,
          function1: `${existing.facet}.${existing.name}`,
          function2: `${facetName}.${name}`
        });
      } else {
        selectorMap.set(selector, { facet: facetName, name });
      }
    }
  }

  return duplicates;
}

async function main() {
  console.log("🔍 Checking Function Selectors for All Facets...\n");

  try {
    // Get contract factories
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();

    const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
    await diamondLoupeFacet.waitForDeployment();

    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
    const ownershipFacet = await OwnershipFacet.deploy();
    await ownershipFacet.waitForDeployment();

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

    // Get selectors for each facet
    const facetSelectors = {
      DiamondCut: getSelectors(diamondCutFacet),
      DiamondLoupe: getSelectors(diamondLoupeFacet),
      Ownership: getSelectors(ownershipFacet),
      ERC20: getSelectors(erc20Facet),
      Minting: getSelectors(mintingFacet),
      Admin: getSelectors(adminFacet),
      Compliance: getSelectors(complianceFacet)
    };

    // Display selectors for each facet
    for (const [facetName, selectors] of Object.entries(facetSelectors)) {
      console.log(`📋 ${facetName}Facet Functions:`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      for (const { name, selector } of selectors) {
        console.log(`  ${name}: ${selector}`);
      }
      console.log(`Total: ${selectors.length} functions\n`);
    }

    // Check for duplicates
    const duplicates = findDuplicateSelectors(facetSelectors);
    
    if (duplicates.length > 0) {
      console.log("❌ DUPLICATE FUNCTION SELECTORS FOUND:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      for (const duplicate of duplicates) {
        console.log(`  Selector ${duplicate.selector}:`);
        console.log(`    • ${duplicate.function1}`);
        console.log(`    • ${duplicate.function2}`);
      }
      console.log("\n⚠️  These duplicates will cause Diamond deployment to fail!");
    } else {
      console.log("✅ NO DUPLICATE SELECTORS FOUND!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("All function selectors are unique. Diamond deployment should work.");
    }

    // Calculate total selectors
    const totalSelectors = Object.values(facetSelectors)
      .reduce((sum, selectors) => sum + selectors.length, 0);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Facets: ${Object.keys(facetSelectors).length}`);
    console.log(`Total Function Selectors: ${totalSelectors}`);
    console.log(`Unique Selectors: ${totalSelectors - duplicates.length}`);

  } catch (error) {
    console.error("❌ Error checking selectors:", error.message);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;


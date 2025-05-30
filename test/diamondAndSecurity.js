const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityToken (Diamond architecture)", function () {
  let DiamondInit;
  let diamondInit;
  let ERC20Facet;
  let erc20Facet;
  let MintingFacet;
  let mintingFacet;
  let AdminFacet;
  let adminFacet;
  let ComplianceFacet;
  let complianceFacet;
  let Diamond;
  let diamond;
  let DiamondCutFacet;
  let diamondCutFacet;
  let DiamondLoupeFacet;
  let diamondLoupeFacet;
  
  let admin;
  let user1;
  let user2;
  let diamondAddress;

  const initParams = {
    name: "TestBond",
    symbol: "TBND",
    cap: ethers.parseUnits("1000000", 18),
    isin: "ISIN1234567890",
    instrumentType: "bond",
    jurisdiction: "ES"
  };

  // Function selectors for facets
  function getSelectors(contract) {
    const signatures = Object.keys(contract.interface.functions);
    const selectors = signatures.reduce((acc, val) => {
      if (val !== 'init(bytes)') {
        acc.push(contract.interface.getFunction(val).selector);
      }
      return acc;
    }, []);
    return selectors;
  }

  before(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    // Deploy DiamondInit
    DiamondInit = await ethers.getContractFactory("DiamondInit");
    diamondInit = await DiamondInit.deploy();
    await diamondInit.waitForDeployment();

    // Deploy all facets
    ERC20Facet = await ethers.getContractFactory("ERC20Facet");
    erc20Facet = await ERC20Facet.deploy();
    await erc20Facet.waitForDeployment();

    MintingFacet = await ethers.getContractFactory("MintingFacet");
    mintingFacet = await MintingFacet.deploy();
    await mintingFacet.waitForDeployment();

    AdminFacet = await ethers.getContractFactory("AdminFacet");
    adminFacet = await AdminFacet.deploy();
    await adminFacet.waitForDeployment();

    ComplianceFacet = await ethers.getContractFactory("ComplianceFacet");
    complianceFacet = await ComplianceFacet.deploy();
    await complianceFacet.waitForDeployment();

    // Deploy DiamondCutFacet and DiamondLoupeFacet (needed for Diamond)
    DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();

    DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
    diamondLoupeFacet = await DiamondLoupeFacet.deploy();
    await diamondLoupeFacet.waitForDeployment();

    // Prepare diamond cut for initial deployment
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

    // Prepare initialization data
    const initData = diamondInit.interface.encodeFunctionData("init", [
      initParams.name,
      initParams.symbol,
      initParams.cap,
      initParams.isin,
      initParams.instrumentType,
      initParams.jurisdiction,
      admin.address,
    ]);

    // Deploy Diamond
    Diamond = await ethers.getContractFactory("Diamond");
    diamond = await Diamond.deploy(cut, await diamondInit.getAddress(), initData);
    await diamond.waitForDeployment();
    diamondAddress = await diamond.getAddress();

    console.log("Diamond deployed at:", diamondAddress);
  });

  describe("Diamond deployment and initialization", function () {
    it("should deploy diamond with all facets", async function () {
      expect(diamondAddress).to.be.properAddress;
      
      // Check if all facets are properly attached
      const diamondLoupe = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress);
      const facets = await diamondLoupe.facets();
      
      expect(facets.length).to.equal(6); // 6 facets total
      console.log(`Diamond has ${facets.length} facets attached`);
    });

    it("should initialize token parameters correctly", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      expect(await erc20.name()).to.equal(initParams.name);
      expect(await erc20.symbol()).to.equal(initParams.symbol);
      expect(await compliance.cap()).to.equal(initParams.cap);
      expect(await compliance.isin()).to.equal(initParams.isin);
      expect(await compliance.instrumentType()).to.equal(initParams.instrumentType);
      expect(await compliance.jurisdiction()).to.equal(initParams.jurisdiction);
    });

    it("should grant admin roles correctly", async function () {
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      const adminRole = await compliance.ADMIN_ROLE();
      const minterRole = await compliance.MINTER_ROLE();
      const pauserRole = await compliance.PAUSER_ROLE();

      expect(await adminFacetContract.hasRole(adminRole, admin.address)).to.be.true;
      expect(await adminFacetContract.hasRole(minterRole, admin.address)).to.be.true;
      expect(await adminFacetContract.hasRole(pauserRole, admin.address)).to.be.true;
    });
  });

  describe("ERC20 functionality", function () {
    it("should have correct initial state", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);

      expect(await erc20.totalSupply()).to.equal(0);
      expect(await erc20.decimals()).to.equal(18);
      expect(await erc20.balanceOf(admin.address)).to.equal(0);
    });

    it("should not allow transfers without whitelisting", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const minting = await ethers.getContractAt("MintingFacet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Mint some tokens first (admin should be whitelisted for minting)
      await adminFacetContract.addToWhitelist(admin.address);
      await minting.mint(admin.address, ethers.parseUnits("1000", 18));

      // Try to transfer without whitelisting recipient
      await expect(
        erc20.transfer(user1.address, ethers.parseUnits("100", 18))
      ).to.be.revertedWith("Recipient is not whitelisted");
    });

    it("should allow transfers when both parties are whitelisted", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Whitelist user1
      await adminFacetContract.addToWhitelist(user1.address);

      // Now transfer should work
      await erc20.transfer(user1.address, ethers.parseUnits("500", 18));
      
      expect(await erc20.balanceOf(user1.address)).to.equal(ethers.parseUnits("500", 18));
      expect(await erc20.balanceOf(admin.address)).to.equal(ethers.parseUnits("500", 18));
    });
  });

  describe("Minting functionality", function () {
    it("should allow minting by authorized role", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const minting = await ethers.getContractAt("MintingFacet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Whitelist user2 for minting
      await adminFacetContract.addToWhitelist(user2.address);

      const initialSupply = await erc20.totalSupply();
      await minting.mint(user2.address, ethers.parseUnits("1000", 18));

      expect(await erc20.totalSupply()).to.equal(initialSupply + ethers.parseUnits("1000", 18));
      expect(await erc20.balanceOf(user2.address)).to.equal(ethers.parseUnits("1000", 18));
    });

    it("should not allow minting above cap", async function () {
      const minting = await ethers.getContractAt("MintingFacet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      await adminFacetContract.addToWhitelist(user2.address);

      // Try to mint more than remaining cap
      await expect(
        minting.mint(user2.address, ethers.parseUnits("999000", 18)) // Close to cap limit
      ).to.be.revertedWith("ERC20Capped: cap exceeded");
    });

    it("should allow burning tokens", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const minting = await ethers.getContractAt("MintingFacet", diamondAddress);

      const initialBalance = await erc20.balanceOf(user2.address);
      const initialSupply = await erc20.totalSupply();

      await minting.connect(user2).burn(ethers.parseUnits("100", 18));

      expect(await erc20.balanceOf(user2.address)).to.equal(initialBalance - ethers.parseUnits("100", 18));
      expect(await erc20.totalSupply()).to.equal(initialSupply - ethers.parseUnits("100", 18));
    });
  });

  describe("Admin functionality", function () {
    it("should allow pausing and unpausing", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Pause the contract
      await adminFacetContract.pause();
      expect(await adminFacetContract.paused()).to.be.true;

      // Transfers should be blocked when paused
      await expect(
        erc20.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18))
      ).to.be.revertedWith("ERC20Pausable: token transfer while paused");

      // Unpause
      await adminFacetContract.unpause();
      expect(await adminFacetContract.paused()).to.be.false;
    });

    it("should manage whitelist correctly", async function () {
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Add to whitelist
      await adminFacetContract.addToWhitelist(user2.address);
      expect(await adminFacetContract.isWhitelisted(user2.address)).to.be.true;

      // Remove from whitelist
      await adminFacetContract.removeFromWhitelist(user2.address);
      expect(await adminFacetContract.isWhitelisted(user2.address)).to.be.false;
    });

    it("should manage blacklist correctly", async function () {
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Add to blacklist
      await adminFacetContract.addToBlacklist(user2.address);
      expect(await adminFacetContract.isBlacklisted(user2.address)).to.be.true;

      // Remove from blacklist
      await adminFacetContract.removeFromBlacklist(user2.address);
      expect(await adminFacetContract.isBlacklisted(user2.address)).to.be.false;
    });

    it("should prevent blacklisted users from transferring", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Whitelist user1 first, then blacklist
      await adminFacetContract.addToWhitelist(user1.address);
      await adminFacetContract.addToBlacklist(user1.address);

      await expect(
        erc20.connect(user1).transfer(admin.address, ethers.parseUnits("10", 18))
      ).to.be.revertedWith("Sender is blacklisted");
    });
  });

  describe("Compliance and transaction records", function () {
    it("should record transactions correctly", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);

      // Setup for transfer
      await adminFacetContract.removeFromBlacklist(user1.address);
      await adminFacetContract.addToWhitelist(user1.address);
      await adminFacetContract.addToWhitelist(user2.address);

      const initialTxCount = await compliance.transactionCount();

      // Make a transfer
      await erc20.connect(user1).transfer(user2.address, ethers.parseUnits("100", 18));

      const newTxCount = await compliance.transactionCount();
      expect(newTxCount).to.equal(initialTxCount + 1n);

      // Check transaction record
      const txRecord = await compliance.getTransactionRecord(newTxCount);
      expect(txRecord.from).to.equal(user1.address);
      expect(txRecord.to).to.equal(user2.address);
      expect(txRecord.amount).to.equal(ethers.parseUnits("100", 18));
      expect(txRecord.timestamp).to.be.gt(0);
    });

    it("should allow transaction reversal by admin", async function () {
      const erc20 = await ethers.getContractAt("ERC20Facet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      const txCount = await compliance.transactionCount();
      const txRecord = await compliance.getTransactionRecord(txCount);

      const user1BalanceBefore = await erc20.balanceOf(user1.address);
      const user2BalanceBefore = await erc20.balanceOf(user2.address);

      // Revert the last transaction
      await compliance.revertTransaction(txCount);

      // Check balances are restored
      const user1BalanceAfter = await erc20.balanceOf(user1.address);
      const user2BalanceAfter = await erc20.balanceOf(user2.address);

      expect(user1BalanceAfter).to.equal(user1BalanceBefore + txRecord.amount);
      expect(user2BalanceAfter).to.equal(user2BalanceBefore - txRecord.amount);

      // Should have created a new transaction record for the reversal
      const newTxCount = await compliance.transactionCount();
      expect(newTxCount).to.equal(txCount + 1n);
    });

    it("should not allow non-admin to revert transactions", async function () {
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);
      const txCount = await compliance.transactionCount();

      await expect(
        compliance.connect(user1).revertTransaction(txCount)
      ).to.be.revertedWith("AccessControl: account is missing role");
    });
  });

  describe("Role management", function () {
    it("should allow admin to grant and revoke roles", async function () {
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      const minterRole = await compliance.MINTER_ROLE();

      // Grant minter role to user1
      await adminFacetContract.grantRole(minterRole, user1.address);
      expect(await adminFacetContract.hasRole(minterRole, user1.address)).to.be.true;

      // Revoke minter role from user1
      await adminFacetContract.revokeRole(minterRole, user1.address);
      expect(await adminFacetContract.hasRole(minterRole, user1.address)).to.be.false;
    });

    it("should prevent unauthorized role management", async function () {
      const adminFacetContract = await ethers.getContractAt("AdminFacet", diamondAddress);
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      const minterRole = await compliance.MINTER_ROLE();

      await expect(
        adminFacetContract.connect(user1).grantRole(minterRole, user2.address)
      ).to.be.revertedWith("AccessControl: sender must be an admin");
    });
  });

  describe("Security token metadata", function () {
    it("should return correct metadata", async function () {
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      expect(await compliance.isin()).to.equal(initParams.isin);
      expect(await compliance.instrumentType()).to.equal(initParams.instrumentType);
      expect(await compliance.jurisdiction()).to.equal(initParams.jurisdiction);
      expect(await compliance.cap()).to.equal(initParams.cap);
    });

    it("should return correct role constants", async function () {
      const compliance = await ethers.getContractAt("ComplianceFacet", diamondAddress);

      const adminRole = await compliance.ADMIN_ROLE();
      const minterRole = await compliance.MINTER_ROLE();
      const pauserRole = await compliance.PAUSER_ROLE();
      const defaultAdminRole = await compliance.DEFAULT_ADMIN_ROLE();

      expect(adminRole).to.equal(ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")));
      expect(minterRole).to.equal(ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")));
      expect(pauserRole).to.equal(ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE")));
      expect(defaultAdminRole).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });
});
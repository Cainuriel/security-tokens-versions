import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
      evmVersion: "berlin", // for compatibility with isbe
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      accounts: process.env.ADMIN_WALLET_PRIV_KEY ? [process.env.ADMIN_WALLET_PRIV_KEY] : [],
      gasPrice: 400000000000,
      timeout: 120000, 
    },
    amoy: {
      url: "https://polygon-amoy.drpc.org",
      accounts: process.env.ADMIN_WALLET_PRIV_KEY ? [process.env.ADMIN_WALLET_PRIV_KEY] : [],
      gasPrice: 400000000000,
      timeout: 300000, 
    }
  },
};

export default config;

import { ContractAddresses } from "./types";

export const rpcEndpoints = {
  1: process.env.ETHEREUM_MAINNET_RPC_ENDPOINT,
  10: process.env.OPTIMISM_MAINNET_RPC_ENDPOINT,
  100: process.env.GNOSIS_CHAIN_MAINNET_RPC_ENDPOINT,
  137: process.env.POLYGON_MAINNET_RPC_ENDPOINT,
  42161: process.env.ARBITRUM_MAINNET_RPC_ENDPOINT,
};

export const lastBlocksKey = "lastBlocks";

export const contracts: Record<string, ContractAddresses> = {
  137: {
    AuthorizationRegistry: "0xF4277421bDA6a2E1C36b827fbf9F817A8d573888",
    WalletFactory: "0x88865532AB232aab74C69FEb0409A00133d053d8",
  },
};

export const botAddress = "0x84C215bBc7B8753cdb07991a619D51A14E09A8C0";
export const botPrivateKey = process.env.BOT_PRIVATE_KEY;

export const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const activeChains =
  (process.env.ACTIVE_CHAINS && process.env.ACTIVE_CHAINS.split(",")) ||
  Object.keys(rpcEndpoints);

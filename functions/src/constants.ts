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
    AuthorizationRegistry: "0x8B97090B11aC78d15723c49BF314C379E3768EAc",
    WalletFactory: "0x039F01ef5EbBfd6c59178E1Ac8F1107DcDf98169",
  },
};

export const botAddress = "0x84C215bBc7B8753cdb07991a619D51A14E09A8C0";
export const botPrivateKey = process.env.BOT_PRIVATE_KEY;

export const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

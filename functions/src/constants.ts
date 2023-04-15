export const rpcEndpoints = {
  1: process.env.ETHEREUM_MAINNET_RPC_ENDPOINT,
  10: process.env.OPTIMISM_MAINNET_RPC_ENDPOINT,
  100: process.env.GNOSIS_CHAIN_MAINNET_RPC_ENDPOINT,
  137: process.env.POLYGON_MAINNET_RPC_ENDPOINT,
  42161: process.env.ARBITRUM_MAINNET_RPC_ENDPOINT,
};

export const lastBlocksKey = "lastBlocks";

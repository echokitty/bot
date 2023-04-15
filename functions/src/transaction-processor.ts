import { BlockProcessor } from "./types";
import OneInchRouterTransactionProcessor from "./transaction-processors/1inch-processor";
import UniswapV3RouterTransactionProcessor from "./transaction-processors/uniswap-processor";

const transactionProcessors: Record<string, BlockProcessor> = {
  "0x1111111254EEB25477B68fb85Ed929f73A960582":
    new OneInchRouterTransactionProcessor(),
  "0xE592427A0AEce92De3Edee1F18E0157C05861564":
    new UniswapV3RouterTransactionProcessor(),
};

export default transactionProcessors;

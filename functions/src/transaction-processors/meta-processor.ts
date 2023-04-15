import { ethers } from "ethers";
import { BlockProcessor, Swap } from "../types";
import BaseProcessor from "./base-processor";
import OneInchRouterTransactionProcessor from "./1inch-processor";

export const transactionProcessors: Record<string, BlockProcessor> = {
  "0x1111111254EEB25477B68fb85Ed929f73A960582":
    new OneInchRouterTransactionProcessor(),
  // "0xE592427A0AEce92De3Edee1F18E0157C05861564":
  //   new UniswapV3RouterTransactionProcessor(),
};

class MetaProcessor extends BaseProcessor {
  parseTransaction(
    block: ethers.Block,
    transactionHash: string
  ): Promise<Swap | null> {
    const transaction = block.getPrefetchedTransaction(transactionHash);
    for (const [contractAddress, processor] of Object.entries(
      transactionProcessors
    )) {
      if (transaction.to === contractAddress) {
        return processor.parseTransaction(block, transactionHash);
      }
    }
    return null;
  }
}

export default MetaProcessor;

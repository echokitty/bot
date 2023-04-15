import { ethers } from "ethers";
import { Swap } from "../types.js";
import BaseProcessor from "./base-processor.js";

class UniswapV3RouterTransactionProcessor extends BaseProcessor {
  parseTransaction(
    block: ethers.Block,
    transactionHash: string
  ): Promise<Swap | null> {
    throw new Error("Method not implemented.");
  }
}

export default UniswapV3RouterTransactionProcessor;

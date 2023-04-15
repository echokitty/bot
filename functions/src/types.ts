import { ethers } from "ethers";

export type Swap = {
  fromToken: string;
  toToken: string;
  fromAmount: bigint;
  toAmount: bigint;
  timestamp: number;
  chainId: number;
};

export interface BlockProcessor {
  parseBlock(block: ethers.Block): Promise<Swap[]>;
  parseTransaction(
    block: ethers.Block,
    transactionHash: string
  ): Promise<Swap | null>;
}

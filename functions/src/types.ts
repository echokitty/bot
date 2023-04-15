import { ethers } from "ethers";

export type SwapDesc = {
  fromToken: string;
  toToken: string;
  fromAmount: bigint;
  toAmount: bigint;
};

export type Swap = {
  sender: string;
  blockNumber: number;
  timestamp: number;
  chainId: number;
  txHash: string;
  desc: SwapDesc;
};

export interface BlockProcessor {
  parseBlocks(block: ethers.Block[]): Promise<Swap[]>;
  parseBlock(block: ethers.Block): Promise<Swap[]>;
  parseTransaction(
    block: ethers.Block,
    transactionHash: string
  ): Promise<Swap | null>;
}

export type Position = {
  account: string;
  target: string;
};

export type ContractAddresses = {
  AuthorizationRegistry: string;
  WalletFactory: string;
};

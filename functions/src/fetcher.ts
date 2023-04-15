import { ethers } from "ethers";
import { range } from "./utils.js";
import { rpcEndpoints } from "./constants";

export type BlockNumbers = Record<string, number>;

export async function fetchBlocks(
  provider: ethers.Provider,
  fromBlock: number,
  toBlock: number
): Promise<ethers.Block[]> {
  return Promise.all(
    range(fromBlock, toBlock).map((blockNumber) =>
      provider.getBlock(blockNumber, true)
    )
  );
}

function getLatestBlock(chainId: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoints[chainId]);
  return provider.getBlockNumber();
}

export async function fetchLatestBlockNumbers(): Promise<BlockNumbers> {
  const chainIds = Object.keys(rpcEndpoints);
  const latestBlocks = await Promise.all(
    chainIds.map((chainId: string) => getLatestBlock(chainId))
  );
  return Object.fromEntries(
    chainIds.map((chainId, i) => [chainId, latestBlocks[i]])
  );
}

// export async function getPositions()

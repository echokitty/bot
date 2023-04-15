import { ethers } from "ethers";
import { range } from "./utils.js";

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

import { Database } from "firebase-admin/database";
import { rpcEndpoints } from "./constants";
import { ethers } from "ethers";

function getLatestBlock(chainId: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoints[chainId]);
  return provider.getBlockNumber();
}

async function getLatestBlocks(): Promise<Record<string, number>> {
  const latestBlocks = await Promise.all(
    Object.keys(rpcEndpoints).map((chainId: string) => getLatestBlock(chainId))
  );
  return Object.fromEntries(
    Object.keys(rpcEndpoints).map((chainId, i) => [chainId, latestBlocks[i]])
  );
}

export async function getBlocks(db: Database): Promise<Record<string, number>> {
  const blocksSnapshot = await db.ref("lastBlocks").get();
  const blocks = blocksSnapshot.val() as Record<string, number>;
  if (blocks) return blocks;
  return getLatestBlocks();
}

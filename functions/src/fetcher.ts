import { ethers } from "ethers";
import { range } from "./utils";
import { botAddress, contracts, rpcEndpoints } from "./constants";
import { Position } from "./types";
import * as abis from "./abis";

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

async function fetchSubwalletTarget(
  provider: ethers.Provider,
  subwalletAddress: string
): Promise<string> {
  const subwallet = new ethers.Contract(
    subwalletAddress,
    abis.subwallet,
    provider
  );
  const fragment = subwallet.getFunction("target");
  return fragment.staticCall();
}

async function fetchSubwallets(
  provider: ethers.Provider,
  walletAddress: string
): Promise<Position[]> {
  const wallet = new ethers.Contract(walletAddress, abis.wallet, provider);
  const subwallets = Array.from(await wallet.listSubwallets()) as string[];
  const targets = await Promise.all(
    subwallets.map((wallet) => fetchSubwalletTarget(provider, wallet))
  );
  return subwallets.map((subwallet, i) => {
    return {
      account: subwallet,
      target: targets[i],
    };
  });
}

export async function fetchPositions(
  provider: ethers.Provider,
  chainId: string
): Promise<Position[]> {
  const contractAddresses = contracts[chainId];
  const authorizationRegistry = new ethers.Contract(
    contractAddresses.AuthorizationRegistry,
    abis.authorizationRegistry,
    provider
  );
  const walletAddresses = Array.from(
    await authorizationRegistry.addressesManagedBy(botAddress)
  ) as string[];

  const positions = await Promise.all(
    walletAddresses.map((walletAddress) =>
      fetchSubwallets(provider, walletAddress)
    )
  );
  return positions.flat();
}

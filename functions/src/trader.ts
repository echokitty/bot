import { ethers } from "ethers";
import fetch from "node-fetch";
import { rpcEndpoints } from "./constants";
import { fetchBlocks, fetchPositions } from "./fetcher";
import { Swap } from "./types";
import { metaProcessor } from "./transaction-processors";

const dummyAddress = "0x80D1C008C8EEe2ba68C2B8103887A607e23c6182";

const getApiEndpoint = (chainId: number) =>
  `https://api.1inch.io/v5.0/${chainId}/swap`;

export async function getSwapData(
  swap: Swap,
  address: string,
  slippage = 1
): Promise<object> {
  const url = new URL(getApiEndpoint(swap.chainId));
  url.searchParams.set("fromTokenAddress", swap.desc.fromToken);
  url.searchParams.set("toTokenAddress", swap.desc.toToken);
  url.searchParams.set("amount", swap.desc.fromAmount.toString());
  url.searchParams.set("slippage", slippage.toString());
  url.searchParams.set("fromAddress", address);
  url.searchParams.set("disableEstimate", "true");
  const res = await fetch(url);
  const json = await res.json();
  return json as object;
}

export async function processChain(
  chainId: string,
  startBlock: number,
  endBlock: number
) {
  const provider = new ethers.JsonRpcProvider(rpcEndpoints[chainId]);
  const blocks = await fetchBlocks(provider, startBlock, endBlock);
  const positions = await fetchPositions(provider, chainId);
  const validSenders = Object.fromEntries(
    positions.map((p) => [p.target, p.account])
  );
  const allSwaps = await metaProcessor.parseBlocks(blocks);
  const targetSwaps = allSwaps.filter((swap) => validSenders[swap.sender]);
  const swapData = await Promise.all(
    targetSwaps.map((swap) => getSwapData(swap, validSenders[swap.sender]))
  );
  console.log(swapData);
}

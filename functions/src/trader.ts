import { Contract, ethers } from "ethers";
import fetch from "node-fetch";
import { botPrivateKey, rpcEndpoints } from "./constants";
import { fetchBlocks, fetchPositions } from "./fetcher";
import { Swap } from "./types";
import { metaProcessor } from "./transaction-processors";
import { format1inchSwap } from "./utils";
import * as abis from "./abis";

const getApiEndpoint = (chainId: number) =>
  `https://api.1inch.io/v5.0/${chainId}/swap`;

export async function getSwapData(
  swap: Swap,
  address: string,
  slippage = 1
): Promise<any> {
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

export async function scaleSwap(
  provider: ethers.Provider,
  swap: Swap,
  account: string
): Promise<Swap | null> {
  console.log(swap.desc.fromToken);
  const fromToken = new Contract(swap.desc.fromToken, abis.erc20, provider);
  const [balanceTarget, balanceOwn] = await Promise.all([
    fromToken.balanceOf(swap.sender, { blockTag: swap.blockNumber - 1 }),
    fromToken.balanceOf(account),
  ]);

  const scaledAmountIn =
    (balanceOwn * BigInt(swap.desc.fromAmount)) / balanceTarget;
  if (scaledAmountIn === BigInt(0)) {
    return null;
  }
  return { ...swap, desc: { ...swap.desc, fromAmount: scaledAmountIn } };
}

export async function fetchAllSwaps(
  provider: ethers.Provider,
  chainId: string,
  startBlock: number,
  endBlock: number
): Promise<any[]> {
  const blocks = await fetchBlocks(provider, startBlock, endBlock);
  const positions = await fetchPositions(provider, chainId);
  const validSenders = Object.fromEntries(
    positions.map((p) => [p.target, p.account])
  );
  const allSwaps = await metaProcessor.parseBlocks(blocks);
  const targetSwaps = allSwaps.filter((swap) => validSenders[swap.sender]);
  const scaledSwaps = (
    await Promise.all(
      targetSwaps.map((swap) =>
        scaleSwap(provider, swap, validSenders[swap.sender])
      )
    )
  ).filter((s) => s !== null);
  return (
    await Promise.all(
      scaledSwaps.map((swap) => getSwapData(swap, validSenders[swap.sender]))
    )
  ).map((s) => {
    return {
      to: s.tx.from,
      swap: format1inchSwap(s),
    };
  });
}

export async function executeSwap(
  provider: ethers.Provider,
  swap: any
): Promise<ethers.ContractTransactionResponse> {
  const wallet = new ethers.Wallet(botPrivateKey, provider);
  const subwallet = new ethers.Contract(swap.to, abis.subwallet, wallet);
  const feeData = await provider.getFeeData();
  const gasPrice = (feeData.gasPrice * BigInt(12)) / BigInt(10);
  return subwallet.executeSwap(swap.swap, { gasPrice });
}

export async function processChain(
  chainId: string,
  startBlock: number,
  endBlock: number
) {
  const provider = new ethers.JsonRpcProvider(rpcEndpoints[chainId]);
  const swapData = await fetchAllSwaps(provider, chainId, startBlock, endBlock);
  for (const swap of swapData) {
    const tx = await executeSwap(provider, swap);
    console.log("sent transaction", tx.hash);
    await tx.wait();
  }
}

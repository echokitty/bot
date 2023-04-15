import { Swap } from "./types.js";
import fetch from "node-fetch";

const dummyAddress = "0x80D1C008C8EEe2ba68C2B8103887A607e23c6182";

const getApiEndpoint = (chainId: number) =>
  `https://api.1inch.io/v5.0/${chainId}/swap`;

export async function getSwapData(swap: Swap, slippage = 1): Promise<object> {
  const url = new URL(getApiEndpoint(swap.chainId));
  url.searchParams.set("fromTokenAddress", swap.fromToken);
  url.searchParams.set("toTokenAddress", swap.toToken);
  url.searchParams.set("amount", swap.fromAmount.toString());
  url.searchParams.set("slippage", slippage.toString());
  url.searchParams.set("fromAddress", dummyAddress);
  url.searchParams.set("disableEstimate", "true");
  const res = await fetch(url);
  const json = await res.json();
  return json as object;
}

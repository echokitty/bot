import { ethers, toBeHex, toNumber } from "ethers";
import { Swap } from "../types.js";
import BaseProcessor from "./base-processor.js";

const zeroForOneMask = BigInt(1) << BigInt(255);
const poolMask = (BigInt(1) << BigInt(160)) - BigInt(1);

const abiCoder = ethers.AbiCoder.defaultAbiCoder();

const uniswapPoolABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

const clipperSwapBaseParams = [
  "address", // clipperExchange
  "address", // srcToken
  "address", // dstToken
  "uint256", // inputAmount
  "uint256", // outputAmount
  "uint256", // goodUntil
  "bytes32", // r
  "bytes32", // vs
];

const swapDescParams = [
  "address", // srcToken
  "address", // dstToken
  "address", // srcReceiver
  "address", // dstReceiver
  "uint256", // amount
  "uint256", // minReturnAmount
  "uint256", // flags
];

const uniswapBaseParams = [
  "uint256", // amountIn
  "uint256", // minReturn
  "uint256[]", // pools
];

const unoswapBaseParams = [
  "address", // srcToken
  "uint256", // amountIn
  "uint256", // minReturn
  "uint256[]", // pools
];

type SwapData = Omit<Swap, "timestamp" | "chainId">;

class OneInchRouterTransactionProcessor extends BaseProcessor {
  async parseTransaction(
    block: ethers.Block,
    transactionHash: string
  ): Promise<Swap | null> {
    const transaction = block.getPrefetchedTransaction(transactionHash);
    const result = await this._parseTransactionData(transaction);
    if (!result) return null;
    return {
      ...result,
      timestamp: block.timestamp,
      chainId: toNumber(transaction.chainId),
    };
  }

  private async _parseTransactionData(
    transaction: ethers.TransactionResponse
  ): Promise<SwapData | null> {
    const data = transaction.data;
    const selector = data.slice(0, 10);
    const rawArgs = "0x" + data.slice(10);
    switch (selector) {
      case "0x84bd6d29":
        return this.processClipperSwap(rawArgs);
      case "0x093d4fa5":
        return this.processClipperSwapTo(rawArgs);
      case "0xc805a666":
        return this.processClipperSwapToWithPermit(rawArgs);
      case "0x12aa3caf":
        return this.processSwap(rawArgs);
      case "0xe449022e":
        return this.processUniswapV3Swap(transaction.provider, rawArgs);
      case "0xbc80f1a8":
        return this.processUniswapV3SwapTo(transaction.provider, rawArgs);
      case "0x2521b930":
        return this.processUniswapV3SwapToWithPermit(
          transaction.provider,
          rawArgs
        );
      case "0x0502b1c5":
        return this.processUnoswap(transaction.provider, rawArgs);
      case "0xf78dc253":
        return this.processUnoswapTo(transaction.provider, rawArgs);
      case "0x3c15fd91":
        return this.processNoswapToWithPermit(transaction.provider, rawArgs);
      default:
        return null;
    }
  }

  processClipperSwap(rawArgs: string): SwapData {
    const decoded = abiCoder.decode(clipperSwapBaseParams, rawArgs);
    return this._clipperSwapToSwapData(decoded, 0);
  }

  processClipperSwapTo(rawArgs: string): SwapData {
    const decoded = abiCoder.decode(
      ["address"].concat(clipperSwapBaseParams), // prepend recipient
      rawArgs
    );
    return this._clipperSwapToSwapData(decoded, 1);
  }

  processClipperSwapToWithPermit(rawArgs: string): SwapData {
    const decoded = abiCoder.decode(
      // prepend recipient and append permit
      ["address"].concat(clipperSwapBaseParams).concat(["bytes"]),
      rawArgs
    );
    return this._clipperSwapToSwapData(decoded, 1);
  }

  _clipperSwapToSwapData(result: ethers.Result, offset: number): SwapData {
    return {
      fromToken: result[offset + 1],
      toToken: result[offset + 2],
      fromAmount: result[offset + 3],
      toAmount: result[offset + 4],
    };
  }

  processSwap(rawArgs: string): SwapData {
    const decoded = abiCoder.decode(
      [
        "address", // executor
        `tuple(${swapDescParams.join(",")})`, // desc
        "bytes", // permit
        "bytes", // data
      ],
      rawArgs
    );
    const swapDesc = decoded[1];
    return {
      fromToken: swapDesc[0],
      toToken: swapDesc[1],
      fromAmount: swapDesc[4],
      toAmount: swapDesc[5],
    };
  }

  async processUniswapV3Swap(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [amountIn, minReturn, pools] = abiCoder.decode(
      uniswapBaseParams,
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  processUniswapV3SwapTo(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [, amountIn, minReturn, pools] = abiCoder.decode(
      ["address"].concat(uniswapBaseParams), // prepend recipient
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  processUniswapV3SwapToWithPermit(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [, , amountIn, minReturn, pools] = abiCoder.decode(
      // prepend recipient and srcToken, append permit
      ["address", "address"].concat(uniswapBaseParams).concat("bytes"),
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  processUnoswap(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [, amountIn, minReturn, pools] = abiCoder.decode(
      unoswapBaseParams,
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  processUnoswapTo(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [, , amountIn, minReturn, pools] = abiCoder.decode(
      ["address"].concat(unoswapBaseParams), // prepend recipient
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  processNoswapToWithPermit(
    provider: ethers.Provider,
    rawArgs: string
  ): Promise<SwapData> {
    const [, , amountIn, minReturn, pools] = abiCoder.decode(
      // prepend recipient, append permit
      ["address"].concat(unoswapBaseParams).concat("bytes"),
      rawArgs
    );
    return this._processUniswapSwap(provider, amountIn, minReturn, pools);
  }

  async _processUniswapSwap(
    provider: ethers.Provider,
    amountIn: bigint,
    minReturn: bigint,
    pools: bigint[]
  ): Promise<SwapData> {
    const [tokenIn, tokenOut] = await Promise.all([
      this._getTokenFromPool(provider, pools[0], true),
      this._getTokenFromPool(provider, pools[pools.length - 1], false),
    ]);
    return {
      fromToken: tokenIn,
      toToken: tokenOut,
      fromAmount: amountIn,
      toAmount: minReturn,
    };
  }

  async _getTokenFromPool(
    provider: ethers.Provider,
    pool: bigint,
    getSrc: boolean
  ): Promise<string> {
    const zeroForOne = (pool & zeroForOneMask) === BigInt(0);
    const poolAddress = toBeHex(pool & poolMask);
    const poolContract = new ethers.Contract(
      poolAddress,
      uniswapPoolABI,
      provider
    );
    return poolContract[zeroForOne === getSrc ? "token0" : "token1"]();
  }
}

export default OneInchRouterTransactionProcessor;

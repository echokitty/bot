import { Swap } from "../types";
import { getSwapData } from "../trader";
import { nativeTokenAddress, rpcEndpoints } from "../constants";
import { ethers } from "ethers";
import * as abis from "../abis";

const swaps: Swap[] = [
  {
    chainId: 137,
    sender: "0x5596D991Bf7753F0f14e1C5B59AbBEA626725401",
    timestamp: 1681573555,
    txHash: "0x",
    desc: {
      fromAmount: BigInt("10000000000000000"),
      toAmount: BigInt(0),
      fromToken: nativeTokenAddress,
      toToken: "0x3809dcDd5dDe24B37AbE64A5a339784c3323c44F", // trust swap
    },
  },
  {
    chainId: 137,
    sender: "0x5596D991Bf7753F0f14e1C5B59AbBEA626725401",
    timestamp: 1681573555,
    txHash: "0x",
    desc: {
      fromAmount: BigInt("5000000000000000"),
      toAmount: BigInt(0),
      fromToken: nativeTokenAddress,
      toToken: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // usdt
    },
  },
];

const walletAddress = "0x9B6B2862357d7D3232fd115E3d7379Dfe4846fc6";
const target = "0x5596D991Bf7753F0f14e1C5B59AbBEA626725401";

const format1inchSwap = (swap: any) => {
  const tx = swap.tx;
  return [[tx.to, tx.data, tx.value], swap.toToken.address];
};

const encoder = ethers.AbiCoder.defaultAbiCoder();
const provider = new ethers.JsonRpcProvider(rpcEndpoints[137]);
const wallet = new ethers.Contract(walletAddress, abis.wallet, provider);
const salt = ethers.keccak256(ethers.randomBytes(32));

// const selector = "0x142bd6f3";
const subwalletParamsSig = "(address,((address,bytes,uint256),address)[])";
const subwalletSignature = `createSubwallet(bytes32,${subwalletParamsSig})`;
const selector = ethers
  .keccak256(Buffer.from(subwalletSignature, "ascii"))
  .slice(0, 10);
console.log(selector);
// console.log(tx);

wallet.getPredictedSubwalletAddress(salt, target).then((predictedAddress) => {
  Promise.all(swaps.map((swap) => getSwapData(swap, predictedAddress)))
    .then((oneInchSwaps) => oneInchSwaps.map((s) => format1inchSwap(s)))
    .then(
      (rawSwaps) =>
        selector +
        encoder
          .encode(["bytes32", subwalletParamsSig], [salt, [target, rawSwaps]])
          .slice(2)
    )
    .then(console.log);
});

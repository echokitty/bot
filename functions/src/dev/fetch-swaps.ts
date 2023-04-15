import { ethers } from "ethers";
import { rpcEndpoints } from "../constants";
import { fetchPositions } from "../fetcher";
import { fetchAllSwaps, processChain } from "../trader";
// import { fetchBlocks } from "./fetcher";
// import { fetchTransactions } from "./transaction-manager";

const provider = new ethers.JsonRpcProvider(rpcEndpoints[137]);
fetchPositions(provider, "137").then(console.log);

processChain("137", 41565709, 41565740).then(console.log);

// fetchTransactions(provider, 17049116, 17049116 + 100)
//   .then(console.log)
//   .catch(console.error);

// const processor = new OneInchRouterTransactionProcessor();

// fetchBlocks(provider, 17051669 - 10, 17051669)
//   .then((blocks) =>
//     Promise.all(blocks.map((block) => processor.parseBlock(block)))
//   )
//   .then((swaps) => swaps.flat())
//   .then((swaps) => getSwapData(swaps[0]))
//   .then(console.log);

// fetchEvents(provider, 17050106, 17050185, [
//   "0x1111111254eeb25477b68fb85ed929f73a960582",
// ])
//   .then(console.log)
//   .catch(console.error);

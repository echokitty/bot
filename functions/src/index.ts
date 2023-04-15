// import * as functions from "firebase-functions";

import OneInchRouterTransactionProcessor from "./transaction-processors/1inch-processor";
import { getSwapData } from "./trader";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// import { fetchEvents } from "./event-manager";

import { rpcEndpoints } from "./constants";
import { ethers } from "ethers";
import { fetchBlocks } from "./fetcher";
// import { fetchTransactions } from "./transaction-manager";

const provider = new ethers.JsonRpcProvider(rpcEndpoints[1]);

// fetchTransactions(provider, 17049116, 17049116 + 100)
//   .then(console.log)
//   .catch(console.error);

const processor = new OneInchRouterTransactionProcessor();

fetchBlocks(provider, 17051669 - 10, 17051669)
  .then((blocks) =>
    Promise.all(blocks.map((block) => processor.parseBlock(block)))
  )
  .then((swaps) => swaps.flat())
  .then((swaps) => getSwapData(swaps[0]))
  .then(console.log);

// fetchEvents(provider, 17050106, 17050185, [
//   "0x1111111254eeb25477b68fb85ed929f73a960582",
// ])
//   .then(console.log)
//   .catch(console.error);

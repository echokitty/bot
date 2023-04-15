import * as functions from "firebase-functions";

import { database } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getBlocks, initializeBlockNumbers, persistBlocks } from "./database";
import { fetchLatestBlockNumbers } from "./fetcher";
import { processChain } from "./trader";

initializeApp();

export const runTrader = functions.https.onRequest(
  async (request, response) => {
    const db = database();
    const previousBlocks = await getBlocks(db);
    if (!previousBlocks) {
      initializeBlockNumbers(db);
      return;
    }

    const latestBlocks = await fetchLatestBlockNumbers();

    const promises = Object.keys(latestBlocks).map((chainId) =>
      processChain(chainId, previousBlocks[chainId], latestBlocks[chainId])
    );
    await Promise.all(promises);

    persistBlocks(db, latestBlocks);

    response.send("Done");
  }
);

// import OneInchRouterTransactionProcessor from "./transaction-processors/1inch-processor";
// import { getSwapData } from "./trader";
// import { fetchEvents } from "./event-manager";
// import { rpcEndpoints } from "./constants";
// import { ethers } from "ethers";
// import { fetchBlocks } from "./fetcher";
// import { fetchTransactions } from "./transaction-manager";

// const provider = new ethers.JsonRpcProvider(rpcEndpoints[1]);

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

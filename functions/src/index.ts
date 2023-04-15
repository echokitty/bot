import * as functions from "firebase-functions";

import { database } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getBlocks, initializeBlockNumbers, persistBlocks } from "./database";
import { fetchLatestBlockNumbers } from "./fetcher";
import { processChain } from "./trader";
import { activeChains } from "./constants";

initializeApp();

export const runTrader = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const db = database();
    const previousBlocks = await getBlocks(db);
    if (!previousBlocks) {
      initializeBlockNumbers(db);
      return;
    }

    const latestBlocks = await fetchLatestBlockNumbers();

    const promises = Object.keys(latestBlocks)
      .filter((chainId) => activeChains.includes(chainId))
      .map((chainId) =>
        processChain(chainId, previousBlocks[chainId], latestBlocks[chainId])
      );
    await Promise.all(promises);

    persistBlocks(db, latestBlocks);
  });

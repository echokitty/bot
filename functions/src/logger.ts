import * as functions from "firebase-functions";
import { BlockNumbers } from "./fetcher";

const logBlock = (chainId: string, block: number) =>
  functions.logger.info("chain id: ", chainId, "block: ", block, {
    structuredData: true,
  });

export const logBlockNumbers = (blockNumbers: BlockNumbers) =>
  Object.entries(blockNumbers).forEach(([chainId, blockNumber]) =>
    logBlock(chainId, blockNumber)
  );

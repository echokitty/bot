import { Block } from "ethers";
import { BlockProcessor, Swap } from "../types";

abstract class BaseProcessor implements BlockProcessor {
  parseBlocks(blocks: Block[]): Promise<Swap[]> {
    return Promise.all(blocks.map((block) => this.parseBlock(block))).then(
      (swaps) => swaps.flat()
    );
  }
  parseBlock(block: Block): Promise<Swap[]> {
    return Promise.all(
      block.transactions.map((tx) => this.parseTransaction(block, tx))
    ).then((swaps) => swaps.filter((swap) => swap !== null));
  }

  abstract parseTransaction(
    block: Block,
    transactionHash: string
  ): Promise<Swap | null>;
}

export default BaseProcessor;

import { Database } from "firebase-admin/database";
import { BlockNumbers, fetchLatestBlockNumbers } from "./fetcher";
import { lastBlocksKey } from "./constants";

export async function initializeBlockNumbers(db: Database) {
  const initialBlocks = await fetchLatestBlockNumbers();
  await db.ref(lastBlocksKey).set(initialBlocks);
}

export async function getBlocks(
  db: Database
): Promise<Record<string, number> | null> {
  const blocksSnapshot = await db.ref(lastBlocksKey).get();
  const blocks = blocksSnapshot.val() as Record<string, number>;
  if (blocks) return blocks;
  return null;
}

export async function persistBlocks(db: Database, blocks: BlockNumbers) {
  await db.ref(lastBlocksKey).set(blocks);
}

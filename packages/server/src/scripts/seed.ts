/**
 * Seed MongoDB from an ND-JSON file (one JSON object per line)
 *
 * Usage (from repo root):
 *   pnpm --filter server exec ts-node ./src/scripts/seed.ts ./dataset/companies.json
 */

import 'dotenv/config';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { connect, model, Schema } from 'mongoose';

// ── CLI arg & file check ────────────────────────────────────────────────────
const [, , argPath] = process.argv;
const filePath = resolve(argPath ?? '.\\dataset\\companies.json');

console.log(`Seeding from ${filePath}`);

// ── Setup Mongo ─────────────────────────────────────────────────────────────
(async () => {
  await connect(process.env.MONGO_URL!, { dbName: 'companies' });
})();
const AnyCompany = model('Company', new Schema({}, { strict: false }));

// ── Batch helpers ───────────────────────────────────────────────────────────
const BATCH = 1_000;
let batch: any[] = [];
let total = 0;

async function flush() {
  if (!batch.length) return;

  await AnyCompany.insertMany(batch, { ordered: false }).catch(() => void 0);

  total += batch.length;
  process.stdout.write(`\rInserted ${total} docs…`);
  batch = [];
}

// ── Stream ND-JSON file ─────────────────────────────────────────────────────
const rl = createInterface({
  input: createReadStream(filePath, { encoding: 'utf8' }),
  crlfDelay: Infinity,
});

(async () => {
  for await (const raw of rl) {
    const line = raw.trim().replace(/,$/, ''); // drop trailing commas
    if (!line) continue;

    try {
      const doc = JSON.parse(line);
      batch.push(doc);
      if (batch.length >= BATCH) await flush();
    } catch {
      console.warn(`Skipped malformed line: ${line.slice(0, 80)}…`);
    }
  }
  await flush(); // leftovers
  console.timeEnd('⏱Total');
  console.log(`\nSeed complete — imported ${total} documents`);
  process.exit(0);
})();

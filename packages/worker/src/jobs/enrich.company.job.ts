// worker/src/enrich.ts
import 'dotenv/config';
import { Job } from 'bullmq';
import OpenAI from 'openai';
import { connect, model, Schema, Document } from 'mongoose';
import { scrape } from './scrape.company.job';

// Validate env vars
const { MONGO_URL, OPENAI_API_KEY } = process.env;
if (!MONGO_URL) {
  console.error('MONGO_URL is not defined');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not defined');
  process.exit(1);
}

// Connect to MongoDB once
connect(MONGO_URL, { dbName: 'fuseai' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define a loose Model for Company (we only update `summary` here)
interface CompanyDoc extends Document {
  id: string;
  website?: string;
  summary?: string;
}

const CompanyModel = model<CompanyDoc>(
  'Company',
  new Schema({}, { strict: false }),
  'companies',
);

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// The job processor
export async function enrich(job: Job<{ companyId: string }>) {
  const { companyId } = job.data;
  console.log(`🛠  [${job.id}] Starting enrichment for ${companyId}`);

  // Load the company document
  let company: CompanyDoc | null;
  try {
    company = await CompanyModel.findOne({ id: companyId }).exec();
    if (!company) {
      console.warn(`[${job.id}] Company ${companyId} not found, skipping`);
      return;
    }
  } catch (err) {
    console.error(`[${job.id}] Mongo load error for ${companyId}`, err);
    throw err;  // let BullMQ retry
  }

  // Skip if no URL
  if (!company.website) {
    console.warn(`[${job.id}] No website on ${companyId}, skipping`);
    return;
  }

  // Scrape snippet
  let snippet: string;
  try {
    const { snippet: text } = await scrape(
      company.website.startsWith('http') ? company.website : `https://${company.website}`
    );
    snippet = text;
  } catch (err) {
    console.error(`[${job.id}] Scraper error for ${companyId}`, err);
    throw err;
  }

  // Summarize with OpenAI
  let summary: string;
  try {
    type CP = Parameters<typeof openai.chat.completions.create>[0];
    type Messages = CP['messages'];

    const messages: Messages = [
      {
        role: 'system',
        content: 'Summarize the company in ≤80 words (product focus, ICP). Respond in plain text.',
      },
      { role: 'user', content: snippet },
    ];

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.5,
    });
    summary = resp.choices[0].message?.content?.trim() ?? '';
  } catch (err) {
    console.error(`[${job.id}] OpenAI error for ${companyId}`, err);
    throw err;
  }

  // Persist the summary
  try {
    await CompanyModel.updateOne({ id: companyId }, { $set: { summary } }).exec();
    console.log(`[${job.id}] Summary saved for ${companyId}`);
  } catch (err) {
    console.error(`[${job.id}] Mongo update error for ${companyId}`, err);
    throw err;
  }
}

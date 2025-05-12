import { Worker } from 'bullmq';
import { enrich } from './jobs/enrich.company.job';

new Worker('enrich', async (job) => {
  if (job.name === 'enrich-company') {
    return await enrich(job);
  }
}, { connection: { url: process.env.REDIS_URL } });

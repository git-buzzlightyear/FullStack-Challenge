import 'dotenv/config';
import { z } from 'zod';

export const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGO_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  OPENAI_API_KEY: z.string(),
});

export const env = schema.parse(process.env);

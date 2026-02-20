import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  CORS_ORIGIN: z.string().default('*'),
  MAX_FILE_MB: z.coerce.number().default(200),
  MAX_DURATION_MIN: z.coerce.number().default(12),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  KEEP_UPLOADS: z.coerce.boolean().default(false),
  SCORE_MODE: z.enum(['llm', 'deterministic', 'blend']).default('blend'),
  CLEANUP_ENABLED: z.coerce.boolean().default(true),
  CLEANUP_INTERVAL_MIN: z.coerce.number().default(30),
  UPLOAD_TTL_HOURS: z.coerce.number().default(24),
  JOB_TTL_HOURS: z.coerce.number().default(72),
  REPORT_TTL_HOURS: z.coerce.number().default(168),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(60000),
  OPENAI_MAX_TOKENS: z.coerce.number().default(4096)
});

export const env = envSchema.parse(process.env);

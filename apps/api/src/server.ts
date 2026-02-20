import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { ensureDirs } from './services/storage.js';
import { analysisRoutes } from './routes/analysis.js';

const app = Fastify({ logger: { level: 'info', transport: { target: 'pino-pretty' } } });

await ensureDirs();
await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN });
await app.register(multipart, { limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024 } });
await app.register(rateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW });
await app.register(analysisRoutes);

app.get('/health', async () => ({ ok: true }));

app.listen({ port: 3001, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

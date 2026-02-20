import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { startArtifactCleanupLoop } from './services/cleanup.js';
import { ensureDirs } from './services/storage.js';
import { analysisRoutes } from './routes/analysis.js';
import { fail } from './utils/envelope.js';

const app = Fastify({ logger: { level: 'info', transport: { target: 'pino-pretty' } } });

app.addHook('preSerialization', async (request, reply, payload) => {
  if (reply.statusCode >= 400) return payload;
  if (payload && typeof payload === 'object' && 'ok' in (payload as Record<string, unknown>) && 'requestId' in (payload as Record<string, unknown>)) {
    return payload;
  }
  return { requestId: request.id, ok: true, data: payload };
});

app.setErrorHandler(async (error, request, reply) => {
  const statusCode = (error as any).statusCode ?? 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  return reply.status(statusCode).send(fail(message, request.id));
});

await ensureDirs();
await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN });
await app.register(multipart, { limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024 } });
await app.register(rateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW });
await app.register(analysisRoutes);

const cleanupTimer = startArtifactCleanupLoop(app.log);

app.get('/health', async () => ({ status: 'ok' }));

app.listen({ port: 3001, host: '0.0.0.0' }).catch((err) => {
  if (cleanupTimer) clearInterval(cleanupTimer);
  app.log.error(err);
  process.exit(1);
});

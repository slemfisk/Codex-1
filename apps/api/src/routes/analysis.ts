import type { FastifyInstance } from 'fastify';
import { startAnalysis } from '../services/pipeline.js';
import { fail } from '../utils/envelope.js';
import { readJob, readReport } from '../services/storage.js';

export async function analysisRoutes(app: FastifyInstance) {
  app.post('/api/analyze', async (request, reply) => {
    try {
      const file = await request.file();
      if (!file) return reply.status(400).send(fail('Missing file', request.id));
      const fields = file.fields as Record<string, { value: string }>;
      const metadata = fields.metadata?.value ?? '{}';
      const analysis_options = fields.analysis_options?.value ?? '{}';
      const data = await startAnalysis(file, metadata, analysis_options);
      return data;
    } catch (error: any) {
      return reply.status(400).send(fail(error.message ?? 'Analyze failed', request.id));
    }
  });

  app.get('/api/analysis/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await readJob<any>(id);
    if (!job) return reply.status(404).send(fail('Job not found', request.id));
    const report = await readReport<any>(id);
    const safeData = {
      id: job.id,
      status: job.status,
      stage: job.stage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error,
      report: report?.report ?? null
    };
    return safeData;
  });
}

import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import type { MultipartFile } from '@fastify/multipart';
import { env } from '../config/env.js';
import { analysisOptionsSchema, metadataSchema, type AnalysisResponse } from '../types/schemas.js';
import { extractFeatures, buildEnergyCurve } from './audio.js';
import { segmentByEnergy } from './segmentation.js';
import { deterministicScores, blendScores, finalizeOverall } from './scoring.js';
import { compileSuno } from './suno.js';
import { generateCritique } from './llm.js';
import { runValidators } from './validators.js';
import { dirs, fileSizeMb, removeUpload, writeJob, writeReport } from './storage.js';

export async function startAnalysis(file: MultipartFile, metadataRaw: string, optionsRaw: string) {
  const id = randomUUID();
  const metadata = metadataSchema.parse(JSON.parse(metadataRaw || '{}'));
  const options = analysisOptionsSchema.parse(JSON.parse(optionsRaw || '{}'));

  const ext = path.extname(file.filename || 'upload.wav').toLowerCase();
  if (!['.wav', '.mp3', '.flac', '.aiff'].includes(ext)) {
    throw new Error('Unsupported audio format');
  }

  const uploadPath = path.join(dirs.uploads, `${id}${ext}`);
  await pipeline(file.file, createWriteStream(uploadPath));
  const size = await fileSizeMb(uploadPath);
  if (size > env.MAX_FILE_MB) throw new Error(`File exceeds MAX_FILE_MB=${env.MAX_FILE_MB}`);

  await writeJob(id, { id, status: 'processing', stage: 'ingest', metadata, options, uploadPath, createdAt: new Date().toISOString() });
  processAnalysis(id, uploadPath, metadata, options).catch(console.error);
  return { id, status: 'processing' as const };
}

async function processAnalysis(id: string, uploadPath: string, metadata: any, options: any) {
  let confidence = 1;
  const internal_warnings: string[] = [];
  const setStage = (stage: string) => writeJob(id, { id, status: 'processing', stage, metadata, options, uploadPath });

  await setStage('audio feature extraction');
  const features = await extractFeatures(uploadPath);
  if ((features.duration_s ?? 0) / 60 > env.MAX_DURATION_MIN) {
    await writeJob(id, { id, status: 'failed', error: `Audio exceeds MAX_DURATION_MIN=${env.MAX_DURATION_MIN}` });
    return;
  }
  if (!features.extraction_complete) {
    confidence -= 0.2;
    internal_warnings.push('Feature extraction incomplete.');
  }

  await setStage('segmentation');
  const energy = await buildEnergyCurve(uploadPath);
  const section_segments = segmentByEnergy(energy, features.duration_s);

  await setStage('deterministic scoring');
  const deterministic = finalizeOverall(deterministicScores(features));

  await setStage('LLM qualitative critique');
  const llm = await generateCritique(metadata, options, features, section_segments);
  if (llm.usedRetry) confidence -= 0.1;

  await setStage('validators');
  const blended = blendScores(deterministic, llm.response.scores, env.SCORE_MODE);
  if (blended.diverged) confidence -= 0.1;
  internal_warnings.push(...blended.warnings);

  const reportBase: AnalysisResponse = {
    ...llm.response,
    scores: blended.scores,
    section_segments,
    suno_v5: compileSuno(metadata, options, features, section_segments),
    debug: { confidence: 1, internal_warnings: [] }
  };

  const validator = runValidators(reportBase, features);
  confidence -= validator.deduction;
  internal_warnings.push(...validator.warnings);

  await setStage('persist report');
  const report: AnalysisResponse = {
    ...reportBase,
    debug: {
      confidence: Number(Math.max(0, Math.min(1, confidence)).toFixed(2)),
      internal_warnings
    }
  };

  await writeReport(id, { id, metadata, options, features, report });
  await writeJob(id, { id, status: 'completed', stage: 'completed', completedAt: new Date().toISOString() });

  if (!env.KEEP_UPLOADS) await removeUpload(uploadPath);
}

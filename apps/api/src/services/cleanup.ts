import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { dirs } from './storage.js';

type CleanupStats = {
  uploadsDeleted: number;
  jobsDeleted: number;
  reportsDeleted: number;
};

async function cleanupDir(dir: string, ttlHours: number): Promise<number> {
  const now = Date.now();
  const ttlMs = ttlHours * 60 * 60 * 1000;
  const entries = await readdir(dir);
  let deleted = 0;

  await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(dir, entry);
    try {
      const fileStat = await stat(filePath);
      if (now - fileStat.mtimeMs > ttlMs) {
        await unlink(filePath);
        deleted += 1;
      }
    } catch {
      // best effort cleanup
    }
  }));

  return deleted;
}

export async function runArtifactCleanup(logger: { info: (msg: string) => void; warn: (msg: string) => void }) {
  try {
    const stats: CleanupStats = {
      uploadsDeleted: await cleanupDir(dirs.uploads, env.UPLOAD_TTL_HOURS),
      jobsDeleted: await cleanupDir(dirs.jobs, env.JOB_TTL_HOURS),
      reportsDeleted: await cleanupDir(dirs.reports, env.REPORT_TTL_HOURS)
    };

    logger.info(
      `Artifact cleanup completed: uploads=${stats.uploadsDeleted}, jobs=${stats.jobsDeleted}, reports=${stats.reportsDeleted}`
    );
  } catch (error) {
    logger.warn(`Artifact cleanup failed: ${String(error)}`);
  }
}

export function startArtifactCleanupLoop(logger: { info: (msg: string) => void; warn: (msg: string) => void }) {
  if (!env.CLEANUP_ENABLED) {
    logger.info('Artifact cleanup scheduler disabled by CLEANUP_ENABLED=false.');
    return null;
  }

  const intervalMs = Math.max(1, env.CLEANUP_INTERVAL_MIN) * 60 * 1000;
  void runArtifactCleanup(logger);

  return setInterval(() => {
    void runArtifactCleanup(logger);
  }, intervalMs);
}

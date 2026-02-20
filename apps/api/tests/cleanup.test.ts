import { mkdtemp, mkdir, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

describe('cleanup service', () => {
  it('deletes expired files based on ttl and keeps fresh files', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'soniccritique-cleanup-'));
    const uploads = path.join(root, 'uploads');
    const jobs = path.join(root, 'jobs');
    const reports = path.join(root, 'reports');
    await Promise.all([mkdir(uploads), mkdir(jobs), mkdir(reports)]);

    const oldUpload = path.join(uploads, 'old.wav');
    const newUpload = path.join(uploads, 'new.wav');
    const oldJob = path.join(jobs, 'old.json');
    const oldReport = path.join(reports, 'old.json');

    await Promise.all([
      writeFile(oldUpload, 'x'),
      writeFile(newUpload, 'x'),
      writeFile(oldJob, '{}'),
      writeFile(oldReport, '{}')
    ]);

    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const newDate = new Date(Date.now() - 5 * 60 * 1000);
    await Promise.all([
      utimes(oldUpload, oldDate, oldDate),
      utimes(oldJob, oldDate, oldDate),
      utimes(oldReport, oldDate, oldDate),
      utimes(newUpload, newDate, newDate)
    ]);

    vi.resetModules();
    vi.doMock('../src/config/env.js', () => ({
      env: {
        CLEANUP_ENABLED: true,
        CLEANUP_INTERVAL_MIN: 30,
        UPLOAD_TTL_HOURS: 1,
        JOB_TTL_HOURS: 1,
        REPORT_TTL_HOURS: 1
      }
    }));
    vi.doMock('../src/services/storage.js', () => ({
      dirs: { uploads, jobs, reports }
    }));

    const { runArtifactCleanup } = await import('../src/services/cleanup.js');
    const logger = { info: vi.fn(), warn: vi.fn() };

    await runArtifactCleanup(logger);

    await expect(stat(oldUpload)).rejects.toThrow();
    await expect(stat(oldJob)).rejects.toThrow();
    await expect(stat(oldReport)).rejects.toThrow();
    await expect(stat(newUpload)).resolves.toBeTruthy();
    expect(logger.info).toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});


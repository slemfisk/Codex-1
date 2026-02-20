import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
export const dirs = {
  uploads: path.join(root, 'uploads'),
  jobs: path.join(root, 'jobs'),
  reports: path.join(root, 'reports')
};

export async function ensureDirs() {
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })));
}

export async function writeJob(id: string, payload: unknown) {
  await writeFile(path.join(dirs.jobs, `${id}.json`), JSON.stringify(payload, null, 2));
}

export async function readJob<T>(id: string): Promise<T | null> {
  try {
    const data = await readFile(path.join(dirs.jobs, `${id}.json`), 'utf8');
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function writeReport(id: string, payload: unknown) {
  await writeFile(path.join(dirs.reports, `${id}.json`), JSON.stringify(payload, null, 2));
}

export async function readReport<T>(id: string): Promise<T | null> {
  try {
    const data = await readFile(path.join(dirs.reports, `${id}.json`), 'utf8');
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function removeUpload(filePath: string) {
  await rm(filePath, { force: true });
}

export async function fileSizeMb(filePath: string) {
  const s = await stat(filePath);
  return s.size / (1024 * 1024);
}

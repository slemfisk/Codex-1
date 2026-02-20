import { spawn } from 'node:child_process';

export type AudioFeatures = {
  lufs_integrated: number | null;
  true_peak_dbtp: number | null;
  rms: number | null;
  peak: number | null;
  crest_factor_proxy: number | null;
  low_end_ratio: number | null;
  stereo_width_index: number | null;
  duration_s: number | null;
  extraction_complete: boolean;
};

const execCmd = (args: string[]) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn('ffmpeg', args);
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('close', (code) => (code === 0 ? resolve(stderr) : reject(new Error(stderr))));
  });

export function parseEbur128(log: string): { lufs_integrated: number | null; true_peak_dbtp: number | null } {
  const iMatch = log.match(/I:\s*(-?\d+\.?\d*)\s*LUFS/);
  const tpMatch = log.match(/Peak:\s*(-?\d+\.?\d*)\s*dBFS/);
  return {
    lufs_integrated: iMatch ? Number(iMatch[1]) : null,
    true_peak_dbtp: tpMatch ? Number(tpMatch[1]) : null
  };
}

const parseStats = (log: string, key: string): number | null => {
  const m = log.match(new RegExp(`${key}:\\s*(-?\\d+\\.?\\d*)`, 'i'));
  return m ? Number(m[1]) : null;
};

export async function extractFeatures(filePath: string): Promise<AudioFeatures> {
  let lufs: number | null = null;
  let tp: number | null = null;
  let rms: number | null = null;
  let peak: number | null = null;
  let duration: number | null = null;
  try {
    const ebur = await execCmd(['-hide_banner', '-i', filePath, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
    const parsed = parseEbur128(ebur);
    lufs = parsed.lufs_integrated;
    tp = parsed.true_peak_dbtp;
    const durMatch = ebur.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
    if (durMatch) {
      duration = Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]);
    }
  } catch {}

  let lowEnd: number | null = null;
  let width: number | null = null;
  try {
    const stats = await execCmd(['-hide_banner', '-i', filePath, '-af', 'astats=metadata=1:reset=1', '-f', 'null', '-']);
    rms = parseStats(stats, 'RMS level dB');
    peak = parseStats(stats, 'Peak level dB');
    const mid = Math.abs(parseStats(stats, 'RMS level dB') ?? 0.0001);
    const side = Math.abs(parseStats(stats, 'RMS trough dB') ?? 0.0001);
    width = Number((side / mid).toFixed(3));
  } catch {}

  try {
    const lowLog = await execCmd(['-hide_banner', '-i', filePath, '-af', 'highpass=f=20,lowpass=f=120,astats=metadata=1:reset=1', '-f', 'null', '-']);
    const fullLog = await execCmd(['-hide_banner', '-i', filePath, '-af', 'astats=metadata=1:reset=1', '-f', 'null', '-']);
    const low = Math.abs(parseStats(lowLog, 'RMS level dB') ?? 0);
    const full = Math.abs(parseStats(fullLog, 'RMS level dB') ?? 0.0001);
    lowEnd = Number((low / full).toFixed(3));
  } catch {}

  const crest = rms !== null && peak !== null ? Number((Math.abs(peak - rms)).toFixed(2)) : null;
  const extraction_complete = [lufs, tp, rms, peak, crest, lowEnd, width].every((v) => v !== null);

  return {
    lufs_integrated: lufs,
    true_peak_dbtp: tp,
    rms,
    peak,
    crest_factor_proxy: crest,
    low_end_ratio: lowEnd,
    stereo_width_index: width,
    duration_s: duration,
    extraction_complete
  };
}

export async function buildEnergyCurve(filePath: string): Promise<number[]> {
  try {
    const log = await execCmd(['-hide_banner', '-i', filePath, '-af', 'astats=metadata=1:reset=0.5', '-f', 'null', '-']);
    return [...log.matchAll(/RMS level dB:\s*(-?\d+\.?\d*)/g)].map((m) => Math.abs(Number(m[1]))).slice(0, 600);
  } catch {
    return [];
  }
}

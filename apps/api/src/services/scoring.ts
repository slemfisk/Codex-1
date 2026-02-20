import type { Scores } from '../types/schemas.js';
import type { AudioFeatures } from './audio.js';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function deterministicScores(f: AudioFeatures): Scores {
  const loudness = f.lufs_integrated ?? -16;
  const peak = f.true_peak_dbtp ?? -2;
  const width = f.stereo_width_index ?? 0.7;
  const crest = f.crest_factor_proxy ?? 8;

  return {
    sonic_character: clamp(78 + (f.low_end_ratio ?? 0.5) * 20 - Math.max(0, (loudness + 7) * 2)),
    arrangement: clamp(70 + (f.duration_s && f.duration_s > 220 ? 8 : 0)),
    mix_balance: clamp(75 + width * 12 - Math.max(0, peak + 0.3) * 10),
    emotional_impact: clamp(72 + (f.low_end_ratio ?? 0.4) * 15 + (crest > 9 ? 5 : -2)),
    technical_execution: clamp(74 - Math.abs(loudness + 9) * 2 - Math.max(0, peak + 0.5) * 12),
    overall: 0
  } as Scores;
}

export function finalizeOverall(scores: Scores): Scores {
  const values = [scores.sonic_character, scores.arrangement, scores.mix_balance, scores.emotional_impact, scores.technical_execution];
  return { ...scores, overall: clamp(values.reduce((a, b) => a + b, 0) / values.length) };
}

export function blendScores(det: Scores, llm: Scores, mode: 'llm' | 'deterministic' | 'blend'): { scores: Scores; warnings: string[]; diverged: boolean } {
  const warnings: string[] = [];
  const result: Scores = { ...det };
  let diverged = false;
  for (const k of Object.keys(det) as (keyof Scores)[]) {
    const d = det[k];
    const l = llm[k];
    if (Math.abs(d - l) > 20) {
      diverged = true;
      warnings.push(`Score divergence on ${k}: deterministic=${d}, llm=${l}`);
    }
    result[k] = mode === 'blend' ? clamp(d * 0.55 + l * 0.45) : mode === 'llm' ? l : d;
  }

  const vals = Object.values(result);
  const std = Math.sqrt(vals.map((v) => (v - vals.reduce((a, b) => a + b, 0) / vals.length) ** 2).reduce((a, b) => a + b, 0) / vals.length);
  if (vals.every((v) => v > 92) || new Set(vals).size <= 2 || std < 2.5) {
    warnings.push('Score inflation pattern detected; normalizing range.');
    (Object.keys(result) as (keyof Scores)[]).forEach((k, idx) => (result[k] = clamp(result[k] - 4 + (idx % 3))));
  }
  return { scores: finalizeOverall(result), warnings, diverged };
}

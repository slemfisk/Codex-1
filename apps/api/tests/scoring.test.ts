import { describe, expect, it } from 'vitest';
import { blendScores, deterministicScores, finalizeOverall } from '../src/services/scoring.js';

describe('scoring', () => {
  it('generates deterministic scores', () => {
    const s = finalizeOverall(deterministicScores({
      lufs_integrated: -8,
      true_peak_dbtp: -0.5,
      rms: -12,
      peak: -0.5,
      crest_factor_proxy: 11,
      low_end_ratio: 0.6,
      stereo_width_index: 1,
      duration_s: 200,
      extraction_complete: true
    }));
    expect(s.overall).toBeGreaterThan(0);
  });

  it('detects divergence', () => {
    const out = blendScores(
      { sonic_character: 40, arrangement: 40, mix_balance: 40, emotional_impact: 40, technical_execution: 40, overall: 40 },
      { sonic_character: 90, arrangement: 90, mix_balance: 90, emotional_impact: 90, technical_execution: 90, overall: 90 },
      'blend'
    );
    expect(out.diverged).toBe(true);
  });
});

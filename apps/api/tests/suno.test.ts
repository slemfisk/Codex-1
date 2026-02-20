import { describe, expect, it } from 'vitest';
import { compileSuno } from '../src/services/suno.js';

describe('compileSuno', () => {
  it('returns required structure tags and variants', () => {
    const out = compileSuno({ genre_hint: 'house', references: [] }, { depth: 'standard', tone: 'producer', include_action_list: true, include_timestamps: true, include_suno: true, vocals: 'male' }, {
      lufs_integrated: -8,
      true_peak_dbtp: -0.3,
      rms: -10,
      peak: -0.3,
      crest_factor_proxy: 9,
      low_end_ratio: 0.55,
      stereo_width_index: 1,
      duration_s: 180,
      extraction_complete: true
    }, [{ name: 'intro', start_s: 0, end_s: 10, confidence: 0.8, notes: 'x' }]);

    expect(out.structure_tags).toContain('[Intro]');
    expect(out.variants).toHaveLength(3);
  });
});

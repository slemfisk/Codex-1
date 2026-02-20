import { describe, expect, it } from 'vitest';
import { parseEbur128 } from '../src/services/audio.js';

describe('parseEbur128', () => {
  it('extracts LUFS and peak', () => {
    const log = 'I: -8.4 LUFS\nPeak: -0.7 dBFS';
    expect(parseEbur128(log)).toEqual({ lufs_integrated: -8.4, true_peak_dbtp: -0.7 });
  });
});

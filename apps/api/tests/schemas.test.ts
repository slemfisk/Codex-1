import { describe, expect, it } from 'vitest';
import { analysisResponseSchema } from '../src/types/schemas.js';

describe('analysisResponseSchema', () => {
  it('validates strict structure', () => {
    const parsed = analysisResponseSchema.parse({
      summary: 'x',
      sections: [
        { title: 'Sonic Character & Texture', bullets: ['12345678', 'abcdefgh'] },
        { title: 'Arrangement & Flow', bullets: ['12345678', 'abcdefgh'] },
        { title: 'Mix Translation & Balance', bullets: ['12345678', 'abcdefgh'] },
        { title: 'Emotional Impact & Marketability', bullets: ['12345678', 'abcdefgh'] },
        { title: 'Technical Execution', bullets: ['12345678', 'abcdefgh'] }
      ],
      scores: { sonic_character: 80, arrangement: 80, mix_balance: 80, emotional_impact: 80, technical_execution: 80, overall: 80 },
      action_list: [
        { priority: 'high', task: 'abcdef', why: 'abcdefgh', how: 'abcdefgh' },
        { priority: 'medium', task: 'abcdef', why: 'abcdefgh', how: 'abcdefgh' },
        { priority: 'low', task: 'abcdef', why: 'abcdefgh', how: 'abcdefgh' }
      ],
      section_segments: [{ name: 'intro', start_s: 0, end_s: 10, confidence: 0.8, notes: 'ok' }],
      suno_v5: {
        style_prompt: 'style',
        structure_tags: '[Intro] [Build] [Drop] [Breakdown] [Final Drop] [Outro]',
        lyric_skeleton: null,
        negative_constraints: ['x'],
        variants: [
          { name: 'Closer to original', style_prompt: 'a', structure_tags: 'b' },
          { name: 'More unique', style_prompt: 'a', structure_tags: 'b' },
          { name: 'More cinematic', style_prompt: 'a', structure_tags: 'b' }
        ]
      },
      debug: { confidence: 0.8, internal_warnings: [] }
    });
    expect(parsed.sections).toHaveLength(5);
  });
});

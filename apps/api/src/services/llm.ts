import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { env } from '../config/env.js';
import { analysisResponseSchema, type AnalysisOptions, type Metadata } from '../types/schemas.js';
import type { AudioFeatures } from './audio.js';
import type { Section } from './segmentation.js';

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: env.OPENAI_TIMEOUT_MS }) : null;

export async function generateCritique(metadata: Metadata, options: AnalysisOptions, features: AudioFeatures, sections: Section[]) {
  const jsonSchema = zodToJsonSchema(analysisResponseSchema.omit({ debug: true, suno_v5: true, section_segments: true }), 'AnalysisResponse');
  const prompt = `You are SonicCritique, a strict producer-grade analyst. Return decisive critique with exactly five titled sections and 3-7 concrete action items. Avoid filler. Metadata: ${JSON.stringify(metadata)} Options: ${JSON.stringify(options)} Features: ${JSON.stringify(features)} Sections: ${JSON.stringify(sections)}`;

  if (!client) {
    return {
      response: {
        summary: 'Energetic production with strong low-end identity but mix headroom and arrangement pacing need targeted revisions.',
        sections: [
          { title: 'Sonic Character & Texture', bullets: ['Low-end carries the identity, but sub overlap around kick fundamental reduces articulation.', 'Transient detail in upper percussion is masked by broad-band saturation in choruses.'] },
          { title: 'Arrangement & Flow', bullets: ['Intro establishes motif quickly but build automation arrives late, reducing tension arc.', 'Drop-to-breakdown contrast works, yet the final drop needs a fresh counter motif.'] },
          { title: 'Mix Translation & Balance', bullets: ['Integrated loudness is competitive, though true peak margin is too tight for streaming conversion safety.', 'Stereo width is wide in synth layers but mono center loses vocal/lead authority.'] },
          { title: 'Emotional Impact & Marketability', bullets: ['Hook cadence is memorable and club-oriented, helping immediate recall.', 'Current topline contour is familiar; a bolder rhythmic displacement would increase uniqueness.'] },
          { title: 'Technical Execution', bullets: ['Dynamic control is mostly stable, but crest-factor collapse in final section flattens impact.', 'Automation hand-offs between risers and impacts need cleaner gain staging.'] }
        ],
        scores: { sonic_character: 82, arrangement: 76, mix_balance: 71, emotional_impact: 78, technical_execution: 73, overall: 76 },
        action_list: [
          { priority: 'high', task: 'Carve 45-70Hz pocket between kick and sub', why: 'Current spectral masking blurs groove definition on large systems.', how: 'Use dynamic EQ keyed by kick and shorten sub decay 40-60ms.', suggested_tools: ['FabFilter Pro-Q', 'Trackspacer'] },
          { priority: 'high', task: 'Increase pre-drop tension automation depth', why: 'Build lacks escalating energy before impact.', how: 'Automate filter resonance/noise riser gain and widen snare roll stereo over last 8 bars.' },
          { priority: 'medium', task: 'Recover crest factor in final drop', why: 'Limiter over-grabs and reduces emotional payoff.', how: 'Lower pre-limiter bus by 1.5dB and shift clipping earlier on drum bus.' }
        ]
      },
      usedRepair: false,
      usedRetry: false,
      usedTimeoutRecovery: false
    };
  }

  let usedRetry = false;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await client.responses.create({
        model: env.OPENAI_MODEL,
        max_output_tokens: env.OPENAI_MAX_TOKENS,
        text: {
          format: {
            type: 'json_schema',
            name: 'analysis_response',
            schema: jsonSchema,
            strict: true
          }
        },
        input: prompt
      });
      const parsed = JSON.parse(completion.output_text);
      const validated = analysisResponseSchema.omit({ debug: true, suno_v5: true, section_segments: true }).parse(parsed);
      return { response: validated, usedRepair: false, usedRetry, usedTimeoutRecovery: false };
    } catch (err: any) {
      if (attempt === 0) {
        usedRetry = true;
        continue;
      }
      throw err;
    }
  }
  throw new Error('LLM generation failed');
}

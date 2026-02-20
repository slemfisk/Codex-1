import { z } from 'zod';

export const metadataSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  genre_hint: z.string().optional(),
  bpm_hint: z.number().optional(),
  key_hint: z.string().optional(),
  intent: z.string().optional(),
  references: z.array(z.string()).default([])
});

export const analysisOptionsSchema = z.object({
  depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
  tone: z.enum(['producer', 'a_and_r', 'mix_engineer']).default('producer'),
  include_action_list: z.boolean().default(true),
  include_timestamps: z.boolean().default(true),
  include_suno: z.boolean().default(true),
  vocals: z.enum(['none', 'male', 'female']).default('none')
});

export const scoreSchema = z.object({
  sonic_character: z.number().int().min(0).max(100),
  arrangement: z.number().int().min(0).max(100),
  mix_balance: z.number().int().min(0).max(100),
  emotional_impact: z.number().int().min(0).max(100),
  technical_execution: z.number().int().min(0).max(100),
  overall: z.number().int().min(0).max(100)
});

const sectionSchema = z.object({
  title: z.enum([
    'Sonic Character & Texture',
    'Arrangement & Flow',
    'Mix Translation & Balance',
    'Emotional Impact & Marketability',
    'Technical Execution'
  ]),
  bullets: z.array(z.string().min(8)).min(2)
});

export const actionItemSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  task: z.string().min(6),
  why: z.string().min(8),
  how: z.string().min(8),
  suggested_tools: z.array(z.string()).optional()
});

export const analysisResponseSchema = z.object({
  summary: z.string(),
  sections: z.array(sectionSchema).length(5),
  scores: scoreSchema,
  action_list: z.array(actionItemSchema).min(3).max(7),
  section_segments: z.array(z.object({
    name: z.string(),
    start_s: z.number(),
    end_s: z.number(),
    confidence: z.number().min(0).max(1),
    notes: z.string()
  })),
  suno_v5: z.object({
    style_prompt: z.string(),
    structure_tags: z.string(),
    lyric_skeleton: z.string().nullable(),
    negative_constraints: z.array(z.string()),
    variants: z.array(z.object({
      name: z.enum(['Closer to original', 'More unique', 'More cinematic']),
      style_prompt: z.string(),
      structure_tags: z.string()
    })).length(3)
  }),
  debug: z.object({
    confidence: z.number().min(0).max(1),
    internal_warnings: z.array(z.string())
  })
});

export type Metadata = z.infer<typeof metadataSchema>;
export type AnalysisOptions = z.infer<typeof analysisOptionsSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
export type Scores = z.infer<typeof scoreSchema>;

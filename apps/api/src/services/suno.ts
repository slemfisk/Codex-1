import type { AnalysisOptions, Metadata } from '../types/schemas.js';
import type { AudioFeatures } from './audio.js';
import type { Section } from './segmentation.js';

export function compileSuno(metadata: Metadata, options: AnalysisOptions, features: AudioFeatures, sections: Section[]) {
  const bpm = metadata.bpm_hint ? `${metadata.bpm_hint} BPM` : 'tempo inferred from groove';
  const key = metadata.key_hint ?? 'modal center inferred';
  const base = [
    `${metadata.genre_hint ?? 'Modern electronic'} production with ${metadata.intent ?? 'festival-ready'} intent.`,
    `${bpm}, key center ${key}.`,
    `Focus on ${features.low_end_ratio && features.low_end_ratio > 0.55 ? 'heavy low-end' : 'balanced low-end'}, ${features.stereo_width_index && features.stereo_width_index > 1 ? 'wide stereo image' : 'focused center image'}.`,
    'Punchy drums, defined transients, and polished mix translation across club and streaming playback.'
  ];
  const vocalsBlock = options.vocals === 'male'
    ? '[Vocal: Male Only]\n[Vocal Style: Commanding, Confident, Powerful]\n[Vocal Performance: Energetic, stadium-scale delivery]\n[Vocal FX: Subtle distortion, slapback delay, stereo double tracking]\n[Vocal Mix Notes: Dry lead in verses, wide doubled chorus vocals, echo stutter on drops]'
    : '';
  const structure = '[Intro] [Build] [Drop] [Breakdown] [Final Drop] [Outro]';
  const lyric = options.vocals === 'none' ? null : 'Verse: resolve conflict with momentum\nHook: short commanding phrase\nBridge: tension and release\nFinal hook: expanded octave adlibs';

  const style_prompt = `${base.join('\n')}${vocalsBlock ? `\n${vocalsBlock}` : ''}`;
  return {
    style_prompt,
    structure_tags: `${structure} ${sections.map((s) => `[${s.name}]`).join(' ')}`,
    lyric_skeleton: lyric,
    negative_constraints: ['avoid muddy sub-bass', 'avoid over-compressed master', 'avoid static arrangement loops'],
    variants: [
      { name: 'Closer to original' as const, style_prompt, structure_tags: structure },
      { name: 'More unique' as const, style_prompt: `${style_prompt}\nIntroduce asymmetric percussion and surprising harmonic turn in breakdown.`, structure_tags: structure },
      { name: 'More cinematic' as const, style_prompt: `${style_prompt}\nAdd wide brass swells and hybrid orchestral risers for cinematic scale.`, structure_tags: structure }
    ]
  };
}

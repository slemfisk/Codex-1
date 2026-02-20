import type { AnalysisResponse } from '../types/schemas.js';
import type { AudioFeatures } from './audio.js';

const vaguePatterns = [/make it better/i, /improve dynamics/i, /more vibe/i, /fix it/i];

export function runValidators(report: AnalysisResponse, features: AudioFeatures) {
  let deduction = 0;
  const warnings: string[] = [];

  report.sections.forEach((s) => {
    if (s.bullets.length < 2) {
      deduction += 0.05;
      warnings.push(`Section ${s.title} has insufficient bullets.`);
    }
  });

  if (report.action_list.length < 3 || report.action_list.length > 7) {
    deduction += 0.1;
    warnings.push('Action list length outside 3-7.');
  }

  report.action_list.forEach((item) => {
    if (vaguePatterns.some((p) => p.test(`${item.task} ${item.why} ${item.how}`))) {
      deduction += 0.05;
      warnings.push('Vague action item phrasing detected.');
    }
  });

  const anchorHits = report.sections.filter((s) => /(LUFS|stereo|sidechain|transient|crest|true peak|dynamic range)/i.test(s.bullets.join(' '))).length;
  if (anchorHits < 3) {
    deduction += 0.1;
    warnings.push('Insufficient technical anchoring across sections.');
  }

  const flattened = report.sections.flatMap((s) => s.bullets.map((b) => b.toLowerCase()));
  if (new Set(flattened).size < flattened.length - 2) {
    deduction += 0.05;
    warnings.push('Repetition cluster detected in section bullets.');
  }

  const text = JSON.stringify(report.sections);
  if ((/lufs|true peak|stereo width|dynamic range/i.test(text)) && !features.extraction_complete) {
    deduction += 0.1;
    warnings.push('Text references unavailable features (truth gating).');
  }

  if (report.scores.mix_balance < 55 && /excellent|perfect|flawless/i.test(text)) {
    deduction += 0.1;
    warnings.push('Sentiment contradiction with low scores.');
  }

  return { deduction, warnings };
}

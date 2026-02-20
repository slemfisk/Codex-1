export type Section = { name: string; start_s: number; end_s: number; confidence: number; notes: string };

export function segmentByEnergy(energyCurve: number[], durationS: number | null): Section[] {
  const duration = durationS ?? 180;
  if (energyCurve.length < 10) {
    return [
      { name: 'intro', start_s: 0, end_s: duration * 0.15, confidence: 0.4, notes: 'Fallback segmentation due to sparse curve.' },
      { name: 'build', start_s: duration * 0.15, end_s: duration * 0.35, confidence: 0.4, notes: 'Fallback build.' },
      { name: 'drop', start_s: duration * 0.35, end_s: duration * 0.55, confidence: 0.4, notes: 'Fallback drop.' },
      { name: 'breakdown', start_s: duration * 0.55, end_s: duration * 0.75, confidence: 0.4, notes: 'Fallback breakdown.' },
      { name: 'outro', start_s: duration * 0.75, end_s: duration, confidence: 0.4, notes: 'Fallback outro.' }
    ];
  }

  const sorted = [...energyCurve].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.35)];
  const high = sorted[Math.floor(sorted.length * 0.75)];
  const idxBuild = energyCurve.findIndex((v) => v <= low);
  const idxDrop = energyCurve.findIndex((v) => v >= high);
  const idxBreak = energyCurve.slice(idxDrop + 1).findIndex((v) => v <= low * 1.05) + idxDrop + 1;

  const toSec = (idx: number) => (idx / energyCurve.length) * duration;
  const buildS = Math.max(15, toSec(Math.max(1, idxBuild)));
  const dropS = Math.max(buildS + 10, toSec(Math.max(idxDrop, idxBuild + 2)));
  const breakS = Math.max(dropS + 10, toSec(Math.max(idxBreak, idxDrop + 2)));

  return [
    { name: 'intro', start_s: 0, end_s: buildS * 0.65, confidence: 0.71, notes: 'Low-energy opening identified.' },
    { name: 'build', start_s: buildS * 0.65, end_s: dropS, confidence: 0.78, notes: 'Energy ramp before first impact.' },
    { name: 'drop', start_s: dropS, end_s: breakS, confidence: 0.81, notes: 'Peak-energy zone.' },
    { name: 'breakdown', start_s: breakS, end_s: duration * 0.86, confidence: 0.73, notes: 'Energy pullback and reset.' },
    { name: 'outro', start_s: duration * 0.86, end_s: duration, confidence: 0.68, notes: 'Terminal decay and release.' }
  ];
}

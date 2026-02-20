const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function submitAnalysis(payload: { file: File; metadata: any; analysis_options: any }) {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('metadata', JSON.stringify(payload.metadata));
  form.append('analysis_options', JSON.stringify(payload.analysis_options));
  const res = await fetch(`${base}/api/analyze`, { method: 'POST', body: form });
  return res.json();
}

export async function fetchAnalysis(id: string) {
  const res = await fetch(`${base}/api/analysis/${id}`);
  return res.json();
}

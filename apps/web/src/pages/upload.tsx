import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { submitAnalysis } from '../lib/api';

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [genre, setGenre] = useState('');
  const [intent, setIntent] = useState('');
  const [progress, setProgress] = useState<string | null>(null);
  const navigate = useNavigate();

  const analyze = async () => {
    if (!file) return;
    setProgress('Uploading');
    const defaults = JSON.parse(localStorage.getItem('sc_defaults') || '{"depth":"standard","tone":"producer","include_suno":true,"vocals":"none","include_action_list":true,"include_timestamps":true}');
    const response = await submitAnalysis({
      file,
      metadata: { genre_hint: genre, intent, references: [] },
      analysis_options: defaults
    });
    const id = response.data.id;
    const storageKey = `soniccritique:audio:${id}`;
    const existingObjectUrl = localStorage.getItem(storageKey);
    if (existingObjectUrl) {
      URL.revokeObjectURL(existingObjectUrl);
    }
    if (selectedPreviewUrl) {
      localStorage.setItem(storageKey, selectedPreviewUrl);
    }
    setProgress('Analyzing');
    navigate(`/analysis/${id}`);
  };

  const onFileChange = (nextFile: File | null) => {
    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl);
    }
    if (!nextFile) {
      setFile(null);
      setSelectedPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setSelectedPreviewUrl(objectUrl);
  };

  return (
    <div className="space-y-6">
      <motion.div whileHover={{ scale: 1.01 }} className="rounded-xl border border-dashed border-accent p-8 text-center">
        <input type="file" accept="audio/*" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} className="mb-3" />
        <p className="text-zinc-400">Drag & drop audio (wav/mp3/flac/aiff) or click to upload</p>
        {file && <p className="mt-2 text-sm text-accent">Selected: {file.name}</p>}
      </motion.div>

      <Card>
        <h2 className="mb-3 font-semibold">Metadata Drawer</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded bg-zinc-900 p-2" placeholder="Genre hint" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <input className="rounded bg-zinc-900 p-2" placeholder="Intent" value={intent} onChange={(e) => setIntent(e.target.value)} />
        </div>
      </Card>

      <Button onClick={analyze} disabled={!file}>Analyze</Button>
      {progress && <div className="fixed inset-0 grid place-items-center bg-black/70 text-xl">{progress} → Rendering</div>}
    </div>
  );
}

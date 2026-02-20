import { useState } from 'react';
import { Button, Card } from '../components/ui';

export function SettingsPage() {
  const [defaults, setDefaults] = useState(() => JSON.parse(localStorage.getItem('sc_defaults') || '{"depth":"standard","tone":"producer","include_suno":true,"vocals":"none","include_action_list":true,"include_timestamps":true}'));

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">Analysis Defaults</h2>
      <select className="rounded bg-zinc-900 p-2" value={defaults.depth} onChange={(e) => setDefaults({ ...defaults, depth: e.target.value })}><option>quick</option><option>standard</option><option>deep</option></select>
      <select className="rounded bg-zinc-900 p-2" value={defaults.tone} onChange={(e) => setDefaults({ ...defaults, tone: e.target.value })}><option>producer</option><option>a_and_r</option><option>mix_engineer</option></select>
      <select className="rounded bg-zinc-900 p-2" value={defaults.vocals} onChange={(e) => setDefaults({ ...defaults, vocals: e.target.value })}><option>none</option><option>male</option><option>female</option></select>
      <label><input type="checkbox" checked={defaults.include_suno} onChange={(e) => setDefaults({ ...defaults, include_suno: e.target.checked })} /> Include Suno</label>
      <Button onClick={() => localStorage.setItem('sc_defaults', JSON.stringify(defaults))}>Save defaults</Button>
    </Card>
  );
}

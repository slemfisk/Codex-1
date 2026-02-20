import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';
import { fetchAnalysis } from '../lib/api';

export function AnalysisPage() {
  const { id = '' } = useParams();
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetchAnalysis(id);
      setPayload(res.data);
      if (res.data.status === 'completed') clearInterval(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, [id]);

  const report = payload?.report;
  const scores = report?.scores ?? {};
  const confidence = report?.debug?.confidence;

  const sunoBlock = useMemo(() => report?.suno_v5 ? `${report.suno_v5.style_prompt}\n${report.suno_v5.structure_tags}` : '', [report]);

  if (!payload) return <p>Loading...</p>;
  if (payload.status !== 'completed') return <p>Job status: {payload.stage ?? payload.status}</p>;

  return (
    <div className="space-y-4">
      <audio controls className="w-full" src={`http://localhost:3001/uploads/${id}`} />
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(scores).map(([k, v]) => <Card key={k}><p className="text-xs text-zinc-400">{k}</p><p className="text-2xl font-bold">{String(v)}</p></Card>)}
      </div>
      <Card>
        <p>Confidence: {(confidence * 100).toFixed(0)}%</p>
        <details><summary>Diagnostics</summary><ul className="list-disc pl-4">{report.debug.internal_warnings.map((w: string) => <li key={w}>{w}</li>)}</ul></details>
      </Card>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="mix">Mix</TabsTrigger><TabsTrigger value="arrangement">Arrangement</TabsTrigger><TabsTrigger value="actions">Actions</TabsTrigger><TabsTrigger value="suno">Suno v5</TabsTrigger><TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Card>{report.summary}</Card></TabsContent>
        <TabsContent value="mix"><Card>{report.sections[2].bullets.map((b: string) => <p key={b}>• {b}</p>)}</Card></TabsContent>
        <TabsContent value="arrangement"><Card>{report.sections[1].bullets.map((b: string) => <p key={b}>• {b}</p>)}</Card></TabsContent>
        <TabsContent value="actions"><Card>{report.action_list.map((a: any) => <p key={a.task}>[{a.priority}] {a.task}</p>)}</Card></TabsContent>
        <TabsContent value="suno"><Card><pre className="whitespace-pre-wrap">{sunoBlock}</pre><Button onClick={() => navigator.clipboard.writeText(sunoBlock)}>Copy</Button></Card></TabsContent>
        <TabsContent value="export"><Card><pre className="text-xs">{JSON.stringify(report, null, 2)}</pre></Card></TabsContent>
      </Tabs>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("checking...");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${apiBase}/health/ping`)
      .then(r => r.json())
      .then(d => setStatus(d.status || "unknown"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <main style={{fontFamily:"ui-sans-serif, system-ui", padding:24}}>
      <h1 style={{fontSize:28, marginBottom:8}}>Codex App Suite</h1>
      <p>API status: <b>{status}</b></p>
      <p style={{marginTop:16, opacity:.8}}>
        Next step: wire tools (Remix, 3D, Dungeon, Scripts, Storyteller, Scraper, Social Graph) to shared API.
      </p>
    </main>
  );
}

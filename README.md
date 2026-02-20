# SonicCritique

SonicCritique is a full-stack TypeScript music intelligence platform. It analyzes uploaded audio and returns:
- producer-grade schema-validated critique JSON
- deterministic/LLM/blended scores with confidence telemetry
- v1 energy-based section segmentation
- Suno AI v5 prompt-engine output and variants

## Tech Stack
- **Monorepo**: npm workspaces
- **API**: Fastify, Zod, OpenAI SDK, zod-to-json-schema, Pino, Vitest
- **Web**: React + TypeScript + Vite, TailwindCSS, shadcn-style UI primitives, Framer Motion, React Router

## Requirements
- Node.js >= 20
- ffmpeg installed and available on PATH

## Setup
```bash
npm install
cp apps/api/.env.example apps/api/.env
```

Optional web env (for API URL override):
```bash
echo "VITE_API_BASE=http://localhost:3001" > apps/web/.env
```

Edit `apps/api/.env` with your `OPENAI_API_KEY` (optional fallback exists if key is omitted).

## Run
### 1) Start API
```bash
npm run dev -w apps/api
```
API is available at `http://localhost:3001`.

### 2) Start Web
```bash
npm run dev -w apps/web
```
Web is available at `http://localhost:3000`.

Web uses `VITE_API_BASE` when set; otherwise it defaults to `http://localhost:3001`.

## Test
```bash
npm run test -w apps/api
```

## Build
```bash
npm run build
```

## Production note
`CORS_ORIGIN=*` is for development only. Lock to specific origins in production.

## Artifact retention
- API cleanup scheduler is controlled by:
  - `CLEANUP_ENABLED` (default `true`)
  - `CLEANUP_INTERVAL_MIN` (default `30`)
  - `UPLOAD_TTL_HOURS` (default `24`)
  - `JOB_TTL_HOURS` (default `72`)
  - `REPORT_TTL_HOURS` (default `168`)

## Endpoints
- `POST /api/analyze` multipart fields: `file`, `metadata`, `analysis_options`
- `GET /api/analysis/:id`

All endpoint responses are wrapped in `{requestId, ok, data|error}`.

## Audio playback behavior
- Web playback is browser-only and uses a local object URL from the upload session.
- The UI does **not** fetch audio from API storage.

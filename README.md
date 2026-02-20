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

## Endpoints
- `POST /api/analyze` multipart fields: `file`, `metadata`, `analysis_options`
- `GET /api/analysis/:id`

All endpoint responses are wrapped in `{requestId, ok, data|error}`.

# SonicCritique Architecture

## Monorepo
- `apps/api`: Fastify + TypeScript analysis service.
- `apps/web`: React + Vite frontend.

## API Pipeline Stages
1. **ingest**: multipart upload accepted, persisted to `uploads/`.
2. **audio feature extraction**: ffmpeg `ebur128` + `astats` parse LUFS, true peak, RMS, peak, crest proxy, low-end ratio, stereo width.
3. **segmentation**: energy-curve segmentation (intro/build/drop/breakdown/outro).
4. **deterministic scoring**: heuristic producer metrics from measured features.
5. **llm qualitative critique**: OpenAI Structured Outputs JSON schema contract.
6. **validators**: integrity, anchoring, consistency/truth-gating, repetition, divergence checks.
7. **confidence scoring**: 1.0 baseline minus deductions; clamp to 0..1.
8. **suno v5 compiler**: style prompt, structure tags, lyric skeleton, negative constraints, variants.
9. **persist**: write report to `reports/`, job status to `jobs/`, cleanup uploads depending on `KEEP_UPLOADS`.

## API Contracts
All endpoints return envelope:
```json
{ "requestId": "uuid", "ok": true, "data": {} }
```
or
```json
{ "requestId": "uuid", "ok": false, "error": { "message": "..." } }
```

## Frontend Contracts
- `POST /api/analyze`: creates job and returns id.
- `GET /api/analysis/:id`: polls status until `completed`, then renders report tabs and Suno output.
- Audio preview is browser-only (object URL stored in session state), not an API file fetch.

## Persistence
No database in v0.1. JSON artifacts are persisted on disk:
- `apps/api/uploads/`
- `apps/api/jobs/`
- `apps/api/reports/`

## TTL Cleanup
- A periodic cleanup loop prunes stale files from `uploads/`, `jobs/`, and `reports/` using `ARTIFACT_TTL_MIN`.

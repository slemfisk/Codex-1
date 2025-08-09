# Codex App Suite

One shared AI + backend powering 7 tools:
1) AI Music Remix Generator
2) Procedural 3D Scene Builder
3) AI Dungeon Master
4) Automation Script Hub
5) Interactive Data Storyteller
6) Web Scraper Builder
7) Social Graph Mapper

## Quickstart

1) Copy .env.example to .env and fill values or add them in your platform's env settings.
2) Build & run:
```bash
docker compose up -d --build
```
3) Check:
- API: http://localhost:8000/health/ping  -> {"status":"ok"}
- Web: http://localhost:3000
- MinIO Console: http://localhost:9001 (minio / minio12345)

## Test the queue
```bash
docker compose exec api python -c "from app.queue import example_job; print(example_job.delay(2,3).get(timeout=10))"
```

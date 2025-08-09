from fastapi import FastAPI
from .routers import health

app = FastAPI(title="Codex App Suite API")
app.include_router(health.router, prefix="/health", tags=["health"])

@app.get("/")
def root():
    return {"name": "Codex App Suite API"}

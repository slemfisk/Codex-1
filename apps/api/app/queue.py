import os
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery_app = Celery("codex_suite", broker=redis_url, backend=redis_url)

@celery_app.task
def example_job(x, y):
    return x + y

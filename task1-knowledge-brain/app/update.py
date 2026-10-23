from app.ingest import ingest_articles


def run_update() -> dict:
    ingest_articles()
    return {"status": "ok", "message": "Knowledge base update completed"}
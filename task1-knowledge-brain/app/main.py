from datetime import datetime, timezone
from pathlib import Path
import json

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.llm import generate_answer
from app.retriever import search
from app.update import run_update


app = FastAPI(
    title="AI Tech Consultant - Knowledge Brain",
    version="0.1.0",
)


class QueryRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=10)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/query")
def query_knowledge(request: QueryRequest) -> dict:
    results = search(request.query, request.top_k)

    context = "\n\n".join(
        f"""
Title: {result["title"]}
Category: {result["category"]}
Folder: {result["folder"]}
URL: {result["url"]}
Content:
{result["content"]}
"""
        for result in results
    )

    if not results:
        return {
            "query": request.query,
            "answer": "I don't know based on the available knowledge base.",
            "sources": [],
        }

    best_distance = results[0]["distance"]

    if best_distance > 1.0:
        return {
            "query": request.query,
            "answer": "I don't know based on the available knowledge base.",
            "sources": [],
        }

    answer = generate_answer(request.query, context)

        # Remove duplicate articles while preserving retrieval order.
    unique_sources = []
    seen_urls = set()

    for result in results:
        if result["url"] in seen_urls:
            continue

        seen_urls.add(result["url"])

        unique_sources.append(
            {
                "title": result["title"],
                "url": result["url"],
                "category": result["category"],
                "folder": result["folder"],
            }
        )

    return {
        "query": request.query,
        "answer": answer,
        "sources": unique_sources,
    }


@app.post("/update")
def update_knowledge() -> dict:
    return run_update()


@app.post("/escalate")
def escalate_question(request: QueryRequest) -> dict:
    results = search(request.query, request.top_k)

    context = "\n\n".join(
        f"""
Title: {result["title"]}
URL: {result["url"]}
Content:
{result["content"]}
"""
        for result in results
    )

    answer = generate_answer(request.query, context)

    answer_lower = answer.lower()

    should_escalate = (
        not results
        or "don't know" in answer_lower
        or "do not know" in answer_lower
        or "cannot answer" in answer_lower
        or "can't answer" in answer_lower
        or "don't have enough information" in answer_lower
        or "not enough information" in answer_lower
    )

    if not should_escalate:
        return {
            "escalated": False,
            "answer": answer,
        }

    Path("data").mkdir(exist_ok=True)

    task = {
        "query": request.query,
        "answer": answer,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
    }

    with open("data/human_tasks.jsonl", "a", encoding="utf-8") as file:
        file.write(json.dumps(task) + "\n")

    return {
        "escalated": True,
        "message": "Question sent to human expert.",
        "task": task,
    }


@app.get("/human-tasks")
def get_human_tasks() -> dict:
    path = Path("data/human_tasks.jsonl")

    if not path.exists():
        return {"tasks": []}

    tasks = []

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                tasks.append(json.loads(line))

    return {"tasks": tasks}

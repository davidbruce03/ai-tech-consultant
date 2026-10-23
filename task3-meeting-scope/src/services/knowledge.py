import os

import requests
from dotenv import load_dotenv

load_dotenv()

TASK1_API = os.getenv("TASK1_API", "http://127.0.0.1:8000")


def query_knowledge(question: str) -> dict:
    response = requests.post(
        f"{TASK1_API}/query",
        json={
            "query": question,
            "top_k": 5,
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()
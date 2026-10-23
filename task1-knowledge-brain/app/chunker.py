import json
from pathlib import Path


ARTICLES_FILE = Path("data/articles.jsonl")
CHUNKS_FILE = Path("data/chunks.jsonl")

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def chunk_text(text: str) -> list[str]:
    words = text.split()

    chunks = []

    start = 0

    while start < len(words):
        end = start + CHUNK_SIZE

        chunk = " ".join(words[start:end])

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


def create_chunks() -> None:
    with (
        ARTICLES_FILE.open("r", encoding="utf-8") as articles_file,
        CHUNKS_FILE.open("w", encoding="utf-8") as chunks_file,
    ):
        chunk_id = 0

        for line in articles_file:
            if not line.strip():
                continue

            article = json.loads(line)

            chunks = chunk_text(article["content"])

            for chunk in chunks:
                chunk_id += 1

                record = {
                    "chunk_id": chunk_id,
                    "url": article["url"],
                    "title": article["title"],
                    "category": article["category"],
                    "folder": article["folder"],
                    "content": chunk,
                }

                chunks_file.write(
                    json.dumps(
                        record,
                        ensure_ascii=False,
                    )
                    + "\n"
                )

    print(f"Created {chunk_id} chunks.")


if __name__ == "__main__":
    create_chunks()

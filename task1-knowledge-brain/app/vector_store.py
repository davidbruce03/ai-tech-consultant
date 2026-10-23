import json
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


CHUNKS_FILE = Path("data/chunks.jsonl")
DB_DIR = Path("data/chroma")

COLLECTION_NAME = "knowledge_brain"
MODEL_NAME = "all-MiniLM-L6-v2"


def build_vector_store() -> None:
    print("Loading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    client = chromadb.PersistentClient(
        path=str(DB_DIR)
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME
    )

    documents = []
    metadatas = []
    ids = []

    with CHUNKS_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            chunk = json.loads(line)

            ids.append(str(chunk["chunk_id"]))
            documents.append(chunk["content"])

            metadatas.append(
                {
                    "url": chunk["url"],
                    "title": chunk["title"],
                    "category": chunk["category"],
                    "folder": chunk["folder"],
                }
            )

    print(f"Embedding {len(documents)} chunks...")

    embeddings = model.encode(
        documents,
        show_progress_bar=True,
    )

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
    )

    print(f"Stored {len(documents)} chunks in ChromaDB.")


if __name__ == "__main__":
    build_vector_store()

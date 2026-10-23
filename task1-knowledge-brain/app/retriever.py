import chromadb
from sentence_transformers import SentenceTransformer


DB_DIR = "data/chroma"
COLLECTION_NAME = "knowledge_brain"
MODEL_NAME = "all-MiniLM-L6-v2"


model = SentenceTransformer(MODEL_NAME)

client = chromadb.PersistentClient(
    path=DB_DIR
)

collection = client.get_collection(
    name=COLLECTION_NAME
)


def search(query: str, top_k: int = 5) -> list[dict]:
    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    matches = []

    for i, document in enumerate(results["documents"][0]):
        metadata = results["metadatas"][0][i]
        distance = results["distances"][0][i]

        matches.append(
            {
                "content": document,
                "url": metadata["url"],
                "title": metadata["title"],
                "category": metadata["category"],
                "folder": metadata["folder"],
                "distance": results["distances"][0][i],
            }
        )

    return matches


if __name__ == "__main__":
    query = input("Question: ")

    results = search(query)

    for index, result in enumerate(results, start=1):
        print()
        print(f"--- Result {index} ---")
        print(f"Title: {result['title']}")
        print(f"Category: {result['category']}")
        print(f"URL: {result['url']}")
        print(f"Content: {result['content'][:500]}")

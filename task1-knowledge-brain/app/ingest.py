import json
from pathlib import Path

from app.fetcher import fetch_page
from app.parser import parse_article
from app.sitemap import get_sitemap_urls


SITEMAP_URL = "https://support.brilliantdirectories.com/support/sitemap.xml"

ARTICLES_FILE = Path("data/articles.jsonl")
FAILURES_FILE = Path("data/failures.jsonl")


def load_completed_urls() -> set[str]:
    if not ARTICLES_FILE.exists():
        return set()

    completed = set()

    with ARTICLES_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            article = json.loads(line)
            completed.add(article["url"])

    return completed


def save_failure(url: str, error: Exception) -> None:
    with FAILURES_FILE.open("a", encoding="utf-8") as file:
        file.write(
            json.dumps(
                {
                    "url": url,
                    "error": str(error),
                },
                ensure_ascii=False,
            )
            + "\n"
        )


def ingest_articles(limit: int | None = None) -> None:
    urls = get_sitemap_urls(SITEMAP_URL)
    article_urls = [url for url in urls if "/articles/" in url]

    completed_urls = load_completed_urls()

    remaining_urls = [
        url for url in article_urls
        if url not in completed_urls
    ]

    if limit is not None:
        remaining_urls = remaining_urls[:limit]

    print(f"Total articles: {len(article_urls)}")
    print(f"Already completed: {len(completed_urls)}")
    print(f"To process: {len(remaining_urls)}")

    ARTICLES_FILE.parent.mkdir(parents=True, exist_ok=True)

    with ARTICLES_FILE.open("a", encoding="utf-8") as file:
        for index, url in enumerate(remaining_urls, start=1):
            print(f"[{index}/{len(remaining_urls)}] {url}")

            try:
                html = fetch_page(url)
                article = parse_article(html, url)

                file.write(
                    json.dumps(
                        article,
                        ensure_ascii=False,
                    )
                    + "\n"
                )

                file.flush()

                print(f"    Saved: {article['title']}")

            except Exception as error:
                print(f"    FAILED: {error}")
                save_failure(url, error)


if __name__ == "__main__":
    ingest_articles()

import json
from pathlib import Path

from app.fetcher import fetch_page
from app.parser import parse_article


FAILURES_FILE = Path("data/failures.jsonl")
ARTICLES_FILE = Path("data/articles.jsonl")


def retry_failures() -> None:
    if not FAILURES_FILE.exists():
        print("No failures file found.")
        return

    failures = [
        json.loads(line)
        for line in FAILURES_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    if not failures:
        print("No failed URLs to retry.")
        return

    print(f"Retrying {len(failures)} failed URLs...")

    remaining_failures = []

    with ARTICLES_FILE.open("a", encoding="utf-8") as articles_file:
        for index, failure in enumerate(failures, start=1):
            url = failure["url"]

            print(f"[{index}/{len(failures)}] {url}")

            try:
                html = fetch_page(
                    url,
                    retries=5,
                    delay=5.0,
                )

                article = parse_article(html, url)

                articles_file.write(
                    json.dumps(
                        article,
                        ensure_ascii=False,
                    )
                    + "\n"
                )

                articles_file.flush()

                print(f"    Saved: {article['title']}")

            except Exception as error:
                print(f"    FAILED AGAIN: {error}")

                remaining_failures.append(
                    {
                        "url": url,
                        "error": str(error),
                    }
                )

    FAILURES_FILE.write_text(
        "".join(
            json.dumps(failure, ensure_ascii=False) + "\n"
            for failure in remaining_failures
        ),
        encoding="utf-8",
    )

    print()
    print(f"Recovered: {len(failures) - len(remaining_failures)}")
    print(f"Still failed: {len(remaining_failures)}")


if __name__ == "__main__":
    retry_failures()

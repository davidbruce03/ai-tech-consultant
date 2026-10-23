import time

import httpx


def fetch_page(
    url: str,
    retries: int = 3,
    delay: float = 2.0,
) -> str:
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        try:
            response = httpx.get(
                url,
                timeout=30.0,
                follow_redirects=True,
            )
            response.raise_for_status()

            time.sleep(1)

            return response.text

        except httpx.HTTPError as error:
            last_error = error
            print(f"Attempt {attempt}/{retries} failed: {url}")

            if attempt < retries:
                time.sleep(delay)

    raise RuntimeError(
        f"Failed to fetch {url} after {retries} attempts"
    ) from last_error

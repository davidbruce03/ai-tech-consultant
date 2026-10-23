from bs4 import BeautifulSoup


def parse_article(html: str, url: str) -> dict[str, str | list[str]]:
    soup = BeautifulSoup(html, "html.parser")

    article = soup.select_one("#article-body")

    if article is None:
        raise ValueError("Article content not found")

    title_element = article.select_one("h1.post-title")

    if title_element is None:
        raise ValueError("Article title not found")

    title = title_element.get_text(" ", strip=True)

    # Remove elements that are not part of the actual knowledge content.
    for element in article.select(".the-article-link, script, style"):
        element.decompose()
    for element in article.select("h1.post-title"):
        element.decompose()

    content = article.get_text("\n", strip=True)

    breadcrumbs = soup.select(".breadcrumb a")
    breadcrumb_text = [
        item.get_text(" ", strip=True)
        for item in breadcrumbs
    ]

    category = breadcrumb_text[1] if len(breadcrumb_text) > 1 else ""
    folder = breadcrumb_text[2] if len(breadcrumb_text) > 2 else ""

    images = [
        image.get("src")
        for image in article.select("img[src]")
        if image.get("src")
    ]

    return {
        "url": url,
        "title": title,
        "content": content,
        "category": category,
        "folder": folder,
        "images": images,
    }

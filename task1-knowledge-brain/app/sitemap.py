from xml.etree import ElementTree

import httpx


def get_sitemap_urls(sitemap_url: str) -> list[str]:
    response = httpx.get(sitemap_url, timeout=30.0)
    response.raise_for_status()

    root = ElementTree.fromstring(response.text)

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    return [
        element.text
        for element in root.findall("sm:url/sm:loc", namespace)
        if element.text
    ]

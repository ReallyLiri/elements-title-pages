#!/usr/bin/env python3

import csv
import os
import re
from urllib.parse import urlparse
from collections import defaultdict

CSV_FILES = [
    'public/docs/EiP.csv',
    'public/docs/EiP-secondary.csv'
]
PDF_OUTPUT_DIR = 'pdf/docs'
GOOGLE_BOOKS_PATTERN = r'/books/edition/([^/]+)/([^/?]+)'
GOOGLE_BOOKS_DOWNLOAD_URL = 'https://{netloc}/books/download/{name}.pdf?id={book_id}&output=pdf'


def convert_google_books_url(url):
    if not url:
        return None

    parsed = urlparse(url)
    if 'google' not in parsed.netloc:
        return None

    match = re.search(GOOGLE_BOOKS_PATTERN, url)
    if not match:
        return None

    name, book_id = match.groups()
    return GOOGLE_BOOKS_DOWNLOAD_URL.format(netloc=parsed.netloc, name=name, book_id=book_id)


def convert_books_url(url):
    if not url:
        return None

    parsed = urlparse(url)
    if 'google' in parsed.netloc:
        return convert_google_books_url(url)

    return None


def get_domain(url):
    try:
        clean_url = url.split(';')[0] if ';' in url else url
        parsed = urlparse(clean_url)
        netloc = parsed.netloc
        if not netloc:
            return 'unknown'

        parts = netloc.split('.')
        if len(parts) >= 2:
            return '.'.join(parts[-2:])
        return netloc
    except:
        return 'unknown'


def main():
    missing_by_domain = defaultdict(list)

    for csv_file in CSV_FILES:
        if not os.path.exists(csv_file):
            print(f"CSV file not found: {csv_file}")
            continue

        with open(csv_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                key = row.get('key', '').strip()
                scan_url = row.get('scan_url', '').strip()

                if not key or not scan_url:
                    continue

                safe_key = key.replace('/', '_')
                pdf_path = f"{PDF_OUTPUT_DIR}/{safe_key}.pdf"

                if not os.path.exists(pdf_path):
                    domain = get_domain(scan_url)
                    download_url = convert_books_url(scan_url)
                    display_url = download_url if download_url else scan_url
                    missing_by_domain[domain].append(f"{key} :: {display_url}")

    for domain in sorted(missing_by_domain.keys()):
        print(f"\n{domain}:")
        for entry in missing_by_domain[domain]:
            print(f"  {entry}")


if __name__ == '__main__':
    main()

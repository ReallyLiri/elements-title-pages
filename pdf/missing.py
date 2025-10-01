#!/usr/bin/env python3

import csv
import os
from urllib.parse import urlparse
from collections import defaultdict

CSV_FILES = [
    'public/docs/EiP.csv',
    'public/docs/EiP-secondary.csv'
]
PDF_OUTPUT_DIR = 'pdf/docs'


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
                    missing_by_domain[domain].append(f"{key} :: {scan_url}")

    for domain in sorted(missing_by_domain.keys()):
        print(f"\n{domain}:")
        for entry in missing_by_domain[domain]:
            print(f"  {entry}")


if __name__ == '__main__':
    main()

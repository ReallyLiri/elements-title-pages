#!/usr/bin/env python3

import csv
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

import requests
from tqdm import tqdm

CSV_FILES = [
    'public/docs/EiP.csv',
    'public/docs/EiP-secondary.csv'
]
PDF_OUTPUT_DIR = 'pdf/docs'
GOOGLE_BOOKS_PATTERN = r'/books/edition/([^/]+)/([^/?]+)'
GOOGLE_BOOKS_DOWNLOAD_URL = 'https://{netloc}/books/download/{name}.pdf?id={book_id}&output=pdf'
REQUEST_TIMEOUT = 30
DEFAULT_MAX_WORKERS = os.cpu_count() or 4


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


def download_pdf(url, filepath):
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)
        return True, None
    except Exception as e:
        return False, str(e)


def download_single_pdf(args):
    key, scan_url = args
    safe_key = key.replace('/', '_')
    pdf_path = f"{PDF_OUTPUT_DIR}/{safe_key}.pdf"

    if os.path.exists(pdf_path):
        return key, "skipped", "already exists"

    clean_url = scan_url.split(';')[0] if ';' in scan_url else scan_url
    download_url = convert_books_url(clean_url)
    if not download_url:
        return key, "skipped", "unsupported URL or invalid format"

    success, error = download_pdf(download_url, pdf_path)
    if success:
        return key, "success", None
    else:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        return key, "error", error


def process_csv_file(csv_path, max_workers=DEFAULT_MAX_WORKERS):
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return

    os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

    download_tasks = []
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            key = row.get('key', '').strip()
            scan_url = row.get('scan_url', '').strip()
            if key and scan_url:
                download_tasks.append((key, scan_url))

    if not download_tasks:
        print(f"No valid download tasks found in {csv_path}")
        return

    print(f"Processing {len(download_tasks)} items from {csv_path}")

    success_count = 0
    error_count = 0
    skipped_count = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single_pdf, task): task for task in download_tasks}

        with tqdm(total=len(download_tasks), desc=f"Processing {os.path.basename(csv_path)}") as pbar:
            for future in as_completed(futures):
                key, status, message = future.result()

                if status == "success":
                    success_count += 1
                    pbar.set_postfix(success=success_count, errors=error_count, skipped=skipped_count)
                elif status == "error":
                    error_count += 1
                    tqdm.write(f"Error downloading {key}: {message}")
                    pbar.set_postfix(success=success_count, errors=error_count, skipped=skipped_count)
                elif status == "skipped":
                    skipped_count += 1
                    pbar.set_postfix(success=success_count, errors=error_count, skipped=skipped_count)

                pbar.update(1)

    print(f"Completed {os.path.basename(csv_path)}: {success_count} downloaded, {error_count} errors, {skipped_count} skipped")


def main():
    for csv_file in CSV_FILES:
        process_csv_file(csv_file)


if __name__ == '__main__':
    main()

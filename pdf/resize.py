#!/usr/bin/env python3

import os
import subprocess
import concurrent.futures
from os import makedirs
from pathlib import Path


def get_file_size_mb(filepath):
    return os.path.getsize(filepath) / (1024 * 1024)


def compress_pdf(pdf_path):
    input_path = Path(pdf_path)
    output_path = input_path.parent / "small" / input_path.name

    command = [
        "GS",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_path}",
        str(input_path)
    ]

    try:
        print(f"Compressing {input_path.name}...")
        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode == 0:
            original_size = get_file_size_mb(input_path)
            compressed_size = get_file_size_mb(output_path)
            compression_ratio = compressed_size / original_size

            if compression_ratio > 0.6:
                print(f"✗ {input_path.name}: Compression insufficient ({compression_ratio:.1%}), deleting output")
                os.remove(output_path)
                return False
            else:
                print(f"✓ {input_path.name}: {original_size:.1f}MB → {compressed_size:.1f}MB")
                return True
        else:
            print(f"✗ Failed to compress {input_path.name}: {result.stderr}")
            return False

    except Exception as e:
        print(f"✗ Error compressing {input_path.name}: {e}")
        return False


def main():
    docs_dir = Path("pdf/docs")
    makedirs(docs_dir / "small", exist_ok=True)

    if not docs_dir.exists():
        print(f"Directory {docs_dir} does not exist!")
        return

    large_pdfs = []

    for pdf_file in docs_dir.glob("*.pdf"):
        size_mb = get_file_size_mb(pdf_file)
        if size_mb >= 50:
            large_pdfs.append(pdf_file)
            print(f"Found large PDF: {pdf_file.name} ({size_mb:.1f}MB)")

    if not large_pdfs:
        print("No PDFs found that are 50MB or larger.")
        return

    print(f"\nProcessing {len(large_pdfs)} PDFs in parallel...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(compress_pdf, pdf) for pdf in large_pdfs]

        for future in concurrent.futures.as_completed(futures):
            future.result()

    print("\nCompression complete!")


if __name__ == "__main__":
    main()

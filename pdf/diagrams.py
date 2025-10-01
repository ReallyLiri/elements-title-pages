#!/usr/bin/env python3

import os
import subprocess
from os import makedirs
from pathlib import Path

DOCS_DIR = "pdf/docs"
DIAGRAMS_DIR_NAME = "diagrams"
DETECTION_CWD = Path.home() / "s-ved-object-detection"
DETECT_SCRIPT = "detect.py"

makedirs(f"${DOCS_DIR}/${DIAGRAMS_DIR_NAME}", exist_ok=True)


def process_pdf(pdf_path):
    pdf_name = pdf_path.stem
    parent_dir = pdf_path.parent

    command = [
        "uv", "run", DETECT_SCRIPT,
        "--source", str(pdf_path.absolute()),
        "--project", str((parent_dir / DIAGRAMS_DIR_NAME).absolute()),
        "--name", pdf_name
    ]

    cwd = DETECTION_CWD

    try:
        print(f"Processing {pdf_path.name}...")
        result = subprocess.run(command, cwd=cwd)

        if result.returncode == 0:
            print(f"✓ Successfully processed {pdf_path.name}")
            return True
        else:
            print(f"✗ Failed to process {pdf_path.name}")
            return False

    except Exception as e:
        print(f"✗ Error processing {pdf_path.name}: {e}")
        return False


def main():
    docs_dir = Path(DOCS_DIR)

    if not docs_dir.exists():
        print(f"Directory {docs_dir} does not exist!")
        return

    pdf_files = list(docs_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in {DOCS_DIR} directory.")
        return

    print(f"Found {len(pdf_files)} PDF files to process...")

    success_count = 0
    for pdf_file in pdf_files:
        if process_pdf(pdf_file):
            success_count += 1

    print(f"\nProcessing complete! {success_count}/{len(pdf_files)} files processed successfully.")


if __name__ == "__main__":
    main()

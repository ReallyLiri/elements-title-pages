from tools import read_csv
from collections import defaultdict
import re

file_path = "../public/docs/EiP.csv"
entries, fieldnames = read_csv(file_path)

split_fields = [
    "EUCLID REF",
    "VERBS",
    "OTHER NAMES",
    "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO"
]


def normalize(s):
    return re.sub(r"\s+", "", s).lower()


problems = defaultdict(set)

for entry in entries:
    title = entry.get("title", "").strip()
    if title == "?" or title == "":
        continue
    key = entry.get("key", "")

    if not title or not key:
        continue

    norm_title = normalize(title)

    for field in fieldnames:
        if not field.isupper():
            continue

        value = entry.get(field, "").strip()
        if not value:
            continue

        if field in split_fields:
            parts = value.split(", ")
            for part in parts:
                if part and normalize(part) not in norm_title:
                    problems[key].add(field)
        else:
            if normalize(value) not in norm_title:
                problems[key].add(field)

for key, fields in problems.items():
    title = next((entry.get("title", "") for entry in entries if entry.get("key", "") == key), "")
    print(f">>> {key}: Problematic fields:")
    for field in sorted(fields):
        entry_value = next((entry.get(field, "") for entry in entries if entry.get("key", "") == key), "")
        if field in split_fields:
            norm_title = normalize(title)
            parts = entry_value.split(", ")
            problematic_parts = [part for part in parts if part and normalize(part) not in norm_title]
            problematic_value = ", ".join(problematic_parts)
            print(f"    {field}: \"{problematic_value.replace('\n', '\\n')}\"")
        else:
            print(f"    {field}: \"{entry_value.replace('\n', '\\n')}\"")

from tools import read_csv
from collections import defaultdict

file_path = "../public/docs/EiP.csv"
entries, fieldnames = read_csv(file_path)

split_fields = [
    "EUCLID MENTIONED IN TITLE PAGE", "TITLE: VERBS",
    "OTHER NAMES", "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO"
]

problems = defaultdict(set)

for entry in entries:
    title = entry.get("title", "").strip()
    key = entry.get("key", "")

    if not title or not key:
        continue

    for field in fieldnames:
        if not field.isupper():
            continue

        value = entry.get(field, "").strip()
        if not value:
            continue

        if field in split_fields:
            parts = value.split(", ")
            for part in parts:
                if part and part not in title:
                    problems[key].add(field)
        else:
            if value not in title:
                problems[key].add(field)

for key, fields in problems.items():
    print(f">>> {key}: Problematic fields: {', '.join(sorted(fields))}")

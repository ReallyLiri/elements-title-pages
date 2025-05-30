from tools import read_csv

file_path = "../public/docs/EiP.csv"
entries, fieldnames = read_csv(file_path)

split_fields = [
    "EUCLID MENTIONED IN TITLE PAGE", "TITLE: VERBS",
    "OTHER NAMES", "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO"
]

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
                    print(f">>> {key}: {field} value '{part}' not found in title")
        else:
            if value not in title:
                print(f">>> {key}: {field} value '{value}' not found in title")

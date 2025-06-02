import json
import os

from features import *
from tools import read_csv, google_translate, write_csv, openai_query
from tqdm import tqdm
import time

file_path = "../public/docs/EiP.csv"

entries, fieldnames = read_csv(file_path)

_DELETE_OLD_OUTPUT = True
_TRANSLATE_GOOGLE = False
_TRANSLATE_OPENAI = False
_TITLE_FEATURES = True
_TITLE_FEATURES_MERGE = True

_TITLE_FEATURES_FILTER = lambda curr_entry: curr_entry["key"] == "Rome 1574"
_FEATURES = [
    INSTITUTIONS
]

if _TITLE_FEATURES and _DELETE_OLD_OUTPUT:
    if os.path.exists("out"):
        for f in os.listdir("out"):
            os.remove(os.path.join("out", f))
        print("Deleted old output files.")

if not os.path.exists("out"):
    os.makedirs("out")


def strip_surrounding_quotes(s: str) -> str:
    s = s.strip().replace("', '", ", ")
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        return s[1:-1].strip()
    return s

run_id = time.strftime("%d_%H-%M")
print(f"Run ID: {run_id}")

instructions = prompt(_FEATURES)
if _TITLE_FEATURES:
    print(f"Using prompt:\n{instructions}\n")

if _TITLE_FEATURES_MERGE or _TITLE_FEATURES:
    if len(_FEATURES) == 0:
        raise ValueError("No features specified for title processing.")
    print(f"Processing {len([e for e in entries if _TITLE_FEATURES_FILTER(e)])} entries with features: {[f.name for f in _FEATURES]}")

for i in tqdm(range(len(entries)), desc="Processing entries"):
    entry = entries[i]

    if _TRANSLATE_GOOGLE and entry["language"] != "ENGLISH" and entry["title_EN"] == "":
        translations, languages = (
            google_translate([entry["title"], entry["colophon"], entry["imprint"]])
        )
        entries[i]["title_EN"], entries[i]["colophon_EN"], entries[i]["imprint_EN"] = translations

    if _TRANSLATE_OPENAI and entry["language"] != "ENGLISH" and entry["title_EN"] == "":
        for key in ["title", "colophon", "imprint"]:
            if entry[key] != "":
                translation = openai_query(
                    "Translate this text to English",
                    entry[key],
                    "Translate the text to English, preserving the original meaning and context. Do not add any additional information or context. Please preserve the original formatting, whitespace, line breaks (even at the middle of a sentence) and punctuation as much as possible.",
                    max_tokens=None
                )
                entries[i][f"{key}_EN"] = translation

    if _TITLE_FEATURES and _TITLE_FEATURES_FILTER(entry):
        if len(entry["title"]) < 20:
            continue
        out_path = f'out/{entry["key"].replace("/", "_")}.json'
        result = openai_query(
            f"language: {entry['language']}{' and ' + entry['language 2'] if entry['language 2'] != '' else ''}",
            entry["title"],
            instructions,
            max_tokens=None
        )
        with open(out_path, "w") as f:
            f.write(result)

    if _TITLE_FEATURES_MERGE:
        out_path = f'out/{entry["key"].replace("/", "_")}.json'
        if not os.path.exists(out_path):
            continue
        if not _TITLE_FEATURES_FILTER(entry):
            continue
        entry["tagger"] = f"ai_{run_id}"
        with open(out_path, "r") as f:
            features = f.read().replace("```json", "").replace("```", "").strip()
        try:
            features_dict = json.loads(features)
            for key, value in features_dict.items():
                entries[i][key] = (
                    ", ".join([strip_surrounding_quotes(v) for v in value])
                    if isinstance(value, list)
                    else strip_surrounding_quotes(value))
        except Exception as e:
            print(f"Error processing features for {entry['key']}: {e}")
            continue

write_csv(entries, file_path, fieldnames)

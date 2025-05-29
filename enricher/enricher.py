import json
import os

from tools import read_csv, google_translate, write_csv, openai_query
from tqdm import tqdm

file_path = "../public/docs/EiP.csv"

entries, fieldnames = read_csv(file_path)

_TRANSLATE_GOOGLE = False
_TRANSLATE_OPENAI = False
_TITLE_FEATURES = True
_TITLE_FEATURES_MERGE = False
_TITLE_FEATURES_FORMULATE = False

for i in tqdm(range(len(entries)), desc="Processing entries"):
    entry = entries[i]
    if _TRANSLATE_GOOGLE and entry["language"] != "ENGLISH" and entry["title_EN"] == "":
        translations, languages = (
            google_translate([entry["title"], entry["colophon"], entry["imprint"]])
        )
        entries[i]["title_EN"], entries[i]["colophon_EN"], entries[i]["imprint_EN"] = translations

    if _TRANSLATE_OPENAI and entry["language"] != "ENGLISH" and entry["books"] == "":
        for key in ["title", "colophon", "imprint"]:
            if entry[key] != "":
                translation = openai_query(
                    "Translate this text to English",
                    entry[key],
                    "Translate the text to English, preserving the original meaning and context. Do not add any additional information or context.",
                    max_tokens=None
                )
                entries[i][f"{key}_EN"] = translation

    if _TITLE_FEATURES and entry["TITLE: BASE CONTENT"] == "":
        out_path = f"out/{entry["key"].replace("/", "_")}.json"
        if os.path.exists(out_path):
            continue
        result = openai_query(
            f"language: {entry['language']}{entry['language 2'] != "" and f' and {entry["language 2"]}' or ''}",
            entry["title"],
            """
You are an AI agent designed to extract structured metadata from historical title pages of French translations of Euclid’s Elements.

You will be given:
- The transcribed text of a title page.
- The language of the transcription.

Your task is to extract specific paratextual features from the transcription and return them as a JSON object. Each field should contain the exact quoted text(s) from the input, with no modifications, rephrasing, or interpretation. Include the original whitespaces and punctuation as they appear in the transcription.

Return only a valid JSON. Do not include any other output.

Output format:
{
  "baseContent": [...],
  "baseContentDescription": [...],
  "supplementaryContent": [...],
  "adapterAttribution": [...],
  "adapterDescription": [...],
  "patronageDedication": [...],
  "editionStatement": [...],
  "publishingPrivileges": [...],
  "verbs": [...],
  "explicitLanguageReferences": [...],
  "referencesToOtherEducationalAuthorities": [...],
  "printInformation": [...]
}

Definitions:
- baseContent: Minimal title or identity of the main work.
- baseContentDescription: Any elaboration on the base content.
- supplementaryContent: Additions beyond the main text.
- adapterAttribution: Name(s) of author, translator, or commentator.
- adapterDescription: Titles, credentials, or affiliations of the adapter.
- patronageDedication: Any mentions of patrons or dedications.
- editionStatement: Claims regarding edition, corrections, revisions.
- publishingPrivileges: Mentions of legal/royal privilege or permission.
- verbs: Action verbs describing what the adapter did.
- explicitLanguageReferences: Mentions of source and/or target languages.
- referencesToOtherEducationalAuthorities: Mentions of ancient or contemporary scholars.
- printInformation: City, year, printer name, or address, if mentioned.
""",
            max_tokens=None
        )
        with open(out_path, "w") as f:
            f.write(result)

    if _TITLE_FEATURES_MERGE:
        out_path = f"out/{entry["key"].replace("/", "_")}.json"
        if not os.path.exists(out_path):
            continue
        with open(out_path, "r") as f:
            features = f.read()
        try:
            features_dict = json.loads(features)
            feature_to_column = {
                "baseContent": "TITLE: BASE CONTENT",
                "baseContentDescription": "TITLE: CONTENT DESC",
                "supplementaryContent": "TITLE: ADDITIONAL CONTENT",
                "adapterAttribution": "TITLE: AUTHOR NAME",
                "adapterDescription": "TITLE: AUTHOR DESCRIPTION",
                "patronageDedication": "TITLE: PATRON REF",
                "editionStatement": "TITLE: EDITION INFO",
                "publishingPrivileges": "TITLE: PRIVILEGES",
                "verbs": "TITLE: VERBS",
                "explicitLanguageReferences": "EXPLICITLY STATED: TRANSLATED FROM",
                "referencesToOtherEducationalAuthorities": "OTHER NAMES",
            }
            for key, value in features_dict.items():
                column = feature_to_column.get(key)
                if not column:
                    continue
                entries[i][column] = ", ".join(value) if isinstance(value, list) else value
        except Exception as e:
            print(f"Error processing features for {entry['key']}: {e}")
            continue

write_csv(entries, file_path, fieldnames)

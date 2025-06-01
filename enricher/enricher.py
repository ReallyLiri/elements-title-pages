import json
import os

from tools import read_csv, google_translate, write_csv, openai_query
from tqdm import tqdm

file_path = "../public/docs/EiP.csv"

entries, fieldnames = read_csv(file_path)

_TRANSLATE_GOOGLE = False
_TRANSLATE_OPENAI = False
_TITLE_FEATURES = False
_TITLE_FEATURES_MERGE = True

if not os.path.exists("out"):
    os.makedirs("out")


def strip_surrounding_quotes(s: str) -> str:
    s = s.strip().replace("', '", ", ")
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        return s[1:-1].strip()
    return s


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

    if _TITLE_FEATURES and entry["tagger"] != "mia":
        if len(entry["title"]) < 20:
            continue
        out_path = f"out/{entry["key"].replace("/", "_")}.json"
        result = openai_query(
            f"language: {entry['language']}{entry['language 2'] != "" and f' and {entry["language 2"]}' or ''}",
            entry["title"],
            """
You are an AI agent designed to extract structured metadata from historical title pages of French translations of Euclid’s Elements.

You will be given:
- The transcribed text of a title page.
- The language of the transcription.

Your task is to extract specific paratextual features from the transcription and return them as a JSON object.
Each field should contain the exact quoted text(s) from the input, with no modifications, rephrasing, or interpretation. Include the original whitespaces, line breaks and punctuation as they appear in the transcription.
Some text may apply to more than one field, so you may return the same text portions in multiple fields if applicable.

Return only a valid JSON. Do not include any other output.

Output format:
{
  "baseContent": "...", // a single quote or empty if not applicable
  "adapterAttribution": "...", // a single quote or empty if not applicable
  "adapterDescription": "...", // a single quote or empty if not applicable
  "adapterDescription2": "...", // a single quote or empty if not applicable
  "patronageDedication": "...", // a single quote or empty if not applicable
  "editionStatement": "...", // a single quote or empty if not applicable
  "publishingPrivileges": "...", // a single quote or empty if not applicable
  "verbs": [...], // zero or more quotes
  "explicitLanguageReferences": [...], // zero or more quotes
  "referencesToOtherEducationalAuthorities": [...], // zero or more quotes
  "euclidMentions": [...], // zero or more quotes
  "euclidDescription": "...", // a single quote or empty if not applicable
  "euclidDescription2": "...", // a single quote or empty if not applicable
  "intendedAudience": "...", // a single quote or empty if not applicable
  "intendedAudience2": "...", // a single quote or empty if not applicable
  "elementsDesignation": "...", // a single quote or empty if not applicable
  "greekDesignation": "..." // a single quote or empty if not applicable
}

Definitions:
- baseContent: The minimal designation of the book’s main content, typically appearing at the beginning of the title page, without elaboration.
- adapterAttribution: The name of the contemporary adapter (author, editor, translator, commentator, etc.) as it appears on the title page.
- adapterDescription: Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations.
- adapterDescription2: Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations. (an additional quote if applicable).
- patronageDedication: Mentions of patrons or dedication.
- editionStatement: Any information that is highlighted as relevant for this specific edition such as claims regarding the corrections and revisions introduced in it.
- publishingPrivileges: Mentions of royal privileges or legal permissions granted for printing.
- verbs: Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.
- explicitLanguageReferences: Mentions of the source language (e.g., Latin or Greek) and/or the target language.
- referencesToOtherEducationalAuthorities: Mentions of other scholars, either ancients, such as Theon of Alexandria, or contemporary, like Simon Stevin.
- euclidMentions: Euclid's name as it appears on the title page.
- euclidDescription: Any descriptors found alongside Euclid’s name, such as mentioning him being a mathematician.
- euclidDescription2: Any descriptors found alongside Euclid’s name, such as mentioning him being a mathematician. (an additional quote if applicable).
- intendedAudience: Explicit mentions of the work's intended recipients or audience.
- intendedAudience2: Explicit mentions of the work's intended recipients or audience. (an additional quote if applicable).
- elementsDesignation: The designation of the Elements, such as 'Elements of Geometry' or 'Euclid’s Elements', as it appears on the title page.
- greekDesignation: Greek designation of the book in non-Greek books.
```   
""",
            max_tokens=None
        )
        with open(out_path, "w") as f:
            f.write(result)

    if _TITLE_FEATURES_MERGE:
        out_path = f"out/{entry["key"].replace("/", "_")}.json"
        if not os.path.exists(out_path):
            continue
        if entry["tagger"] == "mia":
            continue
        entry["tagger"] = "ai"
        with open(out_path, "r") as f:
            features = f.read().replace("```json", "").replace("```", "").strip()
        try:
            features_dict = json.loads(features)
            feature_to_column = {
                "baseContent": "BASE CONTENT",
                "adapterAttribution": "AUTHOR NAME",
                "adapterDescription": "AUTHOR DESCRIPTION",
                "adapterDescription2": "AUTHOR DESCRIPTION 2",
                "patronageDedication": "PATRON REF",
                "editionStatement": "EDITION INFO",
                "publishingPrivileges": "PRIVILEGES",
                "verbs": "VERBS",
                "explicitLanguageReferences": "EXPLICITLY STATED: TRANSLATED FROM",
                "referencesToOtherEducationalAuthorities": "OTHER NAMES",
                "euclidMentions": "EUCLID REF",
                "euclidDescription": "EUCLID DESCRIPTION",
                "euclidDescription2": "EUCLID DESCRIPTION 2",
                "intendedAudience": "EXPLICIT RECIPIENT",
                "intendedAudience2": "EXPLICIT RECIPIENT 2",
                "elementsDesignation": "ELEMENTS DESIGNATION",
                "greekDesignation": "GREEK DESIGNATION",
            }
            for key, value in features_dict.items():
                column = feature_to_column.get(key)
                if not column:
                    continue
                entries[i][column] = (
                    ", ".join([strip_surrounding_quotes(v) for v in value])
                    if isinstance(value, list)
                    else strip_surrounding_quotes(value))
        except Exception as e:
            print(f"Error processing features for {entry['key']}: {e}")
            continue

write_csv(entries, file_path, fieldnames)

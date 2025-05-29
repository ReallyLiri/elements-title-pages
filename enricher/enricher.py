from tools import read_csv, google_translate, write_csv, openai_query
from tqdm import tqdm

file_path = "../public/docs/EiP.csv"

entries, fieldnames = read_csv(file_path)

_TRANSLATE_GOOGLE = False
_TRANSLATE_OPENAI = False
_FEATURES = True

for entry in tqdm(entries, desc="Processing entries"):
    if _TRANSLATE_GOOGLE and entry["language"] != "ENGLISH" and entry["title_EN"] == "":
        translations, languages = (
            google_translate([entry["title"], entry["colophon"], entry["imprint"]])
        )
        entry["title_EN"], entry["colophon_EN"], entry["imprint_EN"] = translations

    if _TRANSLATE_OPENAI and entry["language"] != "ENGLISH" and entry["title_EN"] == "":
        for key in ["title", "colophon", "imprint"]:
            if entry[key] != "":
                translation = openai_query(
                    "Translate this text to English",
                    entry[key],
                    "Translate the text to English, preserving the original meaning and context. Do not add any additional information or context.",
                    max_tokens=None
                )
                entry[f"{key}_EN"] = translation
    if _FEATURES and not entry["TITLE: BASE CONTENT"] == "":
        pass

write_csv(entries, file_path, fieldnames)

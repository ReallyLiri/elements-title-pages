import base64
import json

from tqdm import tqdm

from tools import openai_client, write_csv, read_csv, strip_surrounding_quotes

#file_path = "../public/docs/EiP.csv"
file_path = "../public/docs/EiP-secondary.csv"

_EXTRACT_FEATURES = False
_MERGE_FEATURES = True

entries, fieldnames = read_csv(file_path)
for field in [
    "has_red",
    "tp_design",
    "num_of_types",
    "frame_type",
    "engraving",
    "printer_device",
    "hour_glass",
    "font_types",
    "has_calligraphic_features",
    "calligraphic_features",
]:
    if field not in fieldnames:
        fieldnames.append(field)

for i in tqdm(range(len(entries)), desc="Processing entries"):
    entry = entries[i]
    if not entry["tp_url"]:
        continue
    out_path = f'out/{entry["key"].replace("/", "_")}.json'
    if _EXTRACT_FEATURES:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                max_tokens=None,
                temperature=0,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": """
You are an AI agent designed to extract structured metadata from historical title pages of translations of Euclid’s Elements.

You will be given a scanned image of an original title page.

Your task is to extract specific features from the image and return them as a JSON object.
Return only a valid JSON. Do not include any other output.

Output format:
{
    "has_red": boolean,
    "tp_design": <oneof "typographic", "custom", "standard">,
    "num_of_types": integer,
    "frame_type": <oneof "none", "woodcut", "line">,
    "engraving": <oneof "none", "woodcut", "copperplate">,
    "printer_device": boolean, 
    "hour_glass": boolean,
    "font_types": [list of strings from: "italics", "roman", "majuscule roman", "blackletter"],
    "calligraphic_features": string
}

With the following definitions:
- "has_red": true if the title page text contains any red ink, false otherwise. Ignore any background colors or stamps.
- "tp_design": the design of the title page, one of "typographic" (if it is a typographic only title page), "custom" (Unique, handcrafted designs tailored specifically for the book), or "standard" (Common, reused templates employed by a printer across multiple works).
- "num_of_types": the number of different typefaces used in the title page. Consider different font sizes as different typefaces.
- "frame_type": the type of frame used in the title page, one of "none" (no frame), "woodcut" (a woodcut frame), or "line" (a line frame).
- "engraving": the type of engraving used in the title page, one of "none" (no engraving), "woodcut" (a woodcut engraving), or "copperplate" (a copperplate engraving).
- "printer_device": true if the title page contains any printer's device, false otherwise.
- "hour_glass": true if the title page is formatted in an hourglass or a top-only hourglass shape, false otherwise.
- "font_types": a list of typefaces used in the title page, from the following options: "italics", "roman", "majuscule roman", "blackletter". If no typefaces are used, return an empty list.
- "calligraphic_features": a description of calligraphic features present in the title page, if any. If no calligraphic features are present, return an empty string. Ignore any handwritten text that was not part of the original print.
                         """.strip()},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": entry["tp_url"],
                                },
                            },
                        ],
                    }
                ],
            )
            if len(response.choices) != 1:
                print("!!! Unexpected response from OpenAI", response)
            if response.choices[0].finish_reason != 'stop':
                print("!!! OpenAI did not finish processing the request", response)
            with open(out_path, "w") as f:
                f.write(response.choices[0].message.content.strip())
        except Exception as e:
            print("!!! Error querying OpenAI", e)

    if _MERGE_FEATURES:
        with open(out_path, "r") as f:
            features = f.read().replace("```json", "").replace("```", "").strip()
        try:
            features_dict = json.loads(features)
            for key, value in features_dict.items():
                entries[i][key] = (
                    ", ".join([strip_surrounding_quotes(v) for v in value])
                    if isinstance(value, list)
                    else strip_surrounding_quotes(value)
                    if isinstance(value, str)
                    else value)
        except Exception as e:
            print(f"Error processing features for {entry['key']}: {e}")
            continue

write_csv(entries, file_path, fieldnames)

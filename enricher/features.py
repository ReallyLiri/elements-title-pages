from enum import Enum


class Feature:
    def __init__(self, name: str, description: str, is_list: bool = False):
        self.name = name
        self.description = description
        self.is_list = is_list

    def __repr__(self):
        return f"Feature(name={self.name}, description={self.description}, is_list={self.is_list})"

BASE_CONTENT = Feature(
    "BASE CONTENT",
    "The minimal designation of the book’s main content, typically appearing at the beginning of the title page, without elaboration."
)
ADAPTER_ATTRIBUTION = Feature(
    "AUTHOR NAME",
    "The name of the contemporary adapter (author, editor, translator, commentator, etc.) as it appears on the title page."
)
ADAPTER_DESCRIPTION = Feature(
    "AUTHOR DESCRIPTION",
    "Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations."
)
ADAPTER_DESCRIPTION2 = Feature(
    "AUTHOR DESCRIPTION 2",
    "Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations. (an additional quote if applicable)."
)
PATRONAGE_DEDICATION = Feature(
    "PATRON REF",
    "Mentions of patrons or dedication."
)
EDITION_STATEMENT = Feature(
    "EDITION INFO",
    "Any information that is highlighted as relevant for this specific edition such as claims regarding the corrections and revisions introduced in it."
)
PUBLISHING_PRIVILEGES = Feature(
    "PRIVILEGES",
    "Mentions of royal privileges or legal permissions granted for printing."
)
VERBS = Feature(
    "VERBS",
    "Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.",
    is_list=True
)
EXPLICIT_LANGUAGE_REFERENCES = Feature(
    "EXPLICITLY STATED: TRANSLATED FROM",
    "Mentions of the source language (e.g., Latin or Greek) and/or the target language.",
    is_list=True
)
REFERENCES_TO_OTHER_EDUCATIONAL_AUTHORITIES = Feature(
    "OTHER NAMES",
    "Mentions of other scholars, either ancients, such as Theon of Alexandria, or contemporary, like Simon Stevin.",
    is_list=True
)
EUCLID_MENTIONS = Feature(
    "EUCLID REF",
    "Euclid's name as it appears on the title page.",
    is_list=True
)
EUCLID_DESCRIPTION = Feature(
    "EUCLID DESCRIPTION",
    "Any descriptors found alongside Euclid’s name, such as mentioning him being a mathematician.",
    is_list=True
)
EUCLID_DESCRIPTION2 = Feature(
    "EUCLID DESCRIPTION 2",
    "Any descriptors found alongside Euclid’s name, such as mentioning him being a mathematician. (an additional quote if applicable).",
    is_list=True
)
INTENDED_AUDIENCE = Feature(
    "RECIPIENT",
    "Explicit mentions of the work's intended recipients or audience.",
    is_list=True
)
INTENDED_AUDIENCE2 = Feature(
    "RECIPIENT 2",
    "Explicit mentions of the work's intended recipients or audience. (an additional quote if applicable).",
    is_list=True
)
ELEMENTS_DESIGNATION = Feature(
    "ELEMENTS DESIGNATION",
    "The designation of the Elements, such as 'Elements of Geometry' or 'Euclid’s Elements', as it appears on the title page."
)
GREEK_DESIGNATION = Feature(
    "GREEK DESIGNATION",
    "Greek designation of the book in non-Greek books."
)
INSTITUTIONS = Feature(
    "INSTITUTIONS",
    "Mentions of institutions, such as societies or universities, associated with the book.",
    is_list=True
)

def prompt(features : list[Feature]) -> str:
    output_formats = []
    definitions = []
    for feature in features:
        definitions.append(f'- {feature.name}: {feature.description}')
        if feature.is_list:
            output_formats.append(f'  "{feature.name}": [...], // zero or more quotes')
        else:
            output_formats.append(f'  "{feature.name}": "...", // a single quote or empty if not applicable')
    output_format = ",\n".join(output_formats)
    definitions_str = "\n".join(definitions)
    return """
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
""" + output_format + """
}

Definitions: 
""" + definitions_str + """
"""
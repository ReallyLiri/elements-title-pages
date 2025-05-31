import { Feature } from "../types";

export const CSV_PATH = "/docs/EiP.csv";

export const TILE_HEIGHT = 400;
export const TILE_WIDTH = 400;

export const MIN_YEAR = 1482;
export const MAX_YEAR = 1703;

export const ItemTypes = {
  elements: "Elements",
  secondary: "Complementary",
};

export const FeatureToColumnName: Record<Feature, string[]> = {
  "Elements Designation": ["TITLE: ELEMENTS DESIGNATION"],
  "Base Content": ["TITLE: BASE CONTENT"],
  "Base Content Description": ["TITLE: CONTENT DESC", "TITLE: CONTENT DESC 2"],
  "Adapter Attribution": ["TITLE: AUTHOR NAME", "TITLE: AUTHOR NAME 2"],
  "Adapter Description": [
    "TITLE: AUTHOR DESCRIPTION",
    "TITLE: AUTHOR DESCRIPTION 2",
  ],
  "Patronage Dedication": ["TITLE: PATRON REF"],
  "Edition Statement": ["TITLE: EDITION INFO", "TITLE: EDITION INFO 2"],
  "Supplementary Content": [
    "TITLE: ADDITIONAL CONTENT",
    "TITLE: ADDITIONAL CONTENT 2",
  ],
  "Publishing Privileges": ["TITLE: PRIVILEGES"],
  "Other Educational Authorities": [
    "OTHER NAMES",
    "EUCLID MENTIONED IN TITLE PAGE",
  ],
  "Explicit Language References": [
    "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO",
  ],
  "Euclid Description": [
    "TITLE: EUCLID DESCRIPTION",
    "TITLE: EUCLID DESCRIPTION 2",
  ],
  Verbs: ["TITLE: VERBS"],
  Recipients: ["TITLE: EXPLICIT RECIPIENT", "TITLE: EXPLICIT RECIPIENT 2"],
  "Greek designation": ["TITLE: GREEK IN NON GREEK BOOKS"],
};

export const FeaturesToSplit: Partial<Record<Feature, boolean>> = {
  "Other Educational Authorities": true,
  "Explicit Language References": true,
  Verbs: true,
};

export const FeaturesNotSelectedByDefault: Feature[] = [
  "Greek designation",
  "Elements Designation",
];

export const FeatureToColor: Record<Feature, string> = {
  "Base Content": "#FADADD",
  "Base Content Description": "#AEC6CF",
  "Adapter Attribution": "#909fd7",
  "Adapter Description": "#FFDAB9",
  "Patronage Dedication": "#D4C5F9",
  "Edition Statement": "#FFC1CC",
  "Supplementary Content": "#9783d2",
  "Publishing Privileges": "#D1E7E0",
  "Other Educational Authorities": "#e567ac",
  "Explicit Language References": "#e59c67",
  "Euclid Description": "#b0e57c",
  Verbs: "#954caf",
  Recipients: "#F7E779",
  "Elements Designation": "#A3D5C3",
  "Greek designation": "#F0B2A1",
};

export const FeatureToTooltip: Record<Feature, string> = {
  "Base Content":
    "The minimal designation of the book's main content, typically appearing at the beginning of the title page, without elaboration.",
  "Base Content Description":
    "Additional elements extending beyond the base content, describing it or highlighting the book's special features.",
  "Adapter Attribution":
    "The name of the contemporary adapter (author, editor, translator, commentator, etc.) as it appears on the title page.",
  "Adapter Description":
    "Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations.",
  "Patronage Dedication": "Mentions of patrons.",
  "Edition Statement":
    "Any information that is highlighted as relevant for this specific edition.",
  "Supplementary Content": "Additional content included in the book.",
  "Publishing Privileges":
    "Mentions of royal privileges or legal permissions granted for printing.",
  "Other Educational Authorities":
    "Mentions of other scholars, either ancients, such as Theon of Alexandria, or contemporary, like Simon Stevin.",
  "Euclid Description":
    "Statements describing the work as a translation of Euclid's Elements, or as a commentary on it, or as an edition of it.",
  "Explicit Language References":
    "Statements identifying the source language (e.g., Latin or Greek) and/or the target language.",
  Verbs:
    "Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.",
  Recipients: "Explicit mentions of the work's recipients.",
  "Elements Designation":
    "The designation of the Elements, such as 'Elements of Geometry' or 'Euclid's Elements', as it appears on the title page.",
  "Greek designation": "Greek designation of the book in non-Greek books.",
};

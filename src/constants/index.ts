import { Feature } from "../types";

export const CSV_PATH_ELEMENTS = "/docs/EiP.csv";
export const CSV_PATH_SECONDARY = "/docs/EiP-secondary.csv";

export const TILE_HEIGHT = 400;
export const TILE_WIDTH = 400;

export const MIN_YEAR = 1482;
export const MAX_YEAR = 1703;

export const ItemTypes = {
  elements: "Elements",
  secondary: "Complementary",
};

export const FeatureToColumnName: Record<Feature, string[]> = {
  "Elements Designation": ["ELEMENTS DESIGNATION"],
  "Base Content": ["BASE CONTENT"],
  "Base Content Description": ["CONTENT DESC", "CONTENT DESC 2"],
  "Adapter Attribution": ["AUTHOR NAME", "AUTHOR NAME 2"],
  "Adapter Description": ["AUTHOR DESCRIPTION", "AUTHOR DESCRIPTION 2"],
  "Patronage Dedication": ["PATRON REF"],
  "Edition Statement": ["EDITION INFO", "EDITION INFO 2"],
  "Supplementary Content": ["ADDITIONAL CONTENT", "ADDITIONAL CONTENT 2"],
  "Publishing Privileges": ["PRIVILEGES"],
  "Euclid References": ["EUCLID REF"],
  "Other Educational Authorities": ["OTHER NAMES"],
  "Explicit Language References": [
    "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO",
  ],
  "Euclid Description": ["EUCLID DESCRIPTION", "EUCLID DESCRIPTION 2"],
  Verbs: ["VERBS"],
  "Intended Audience": ["EXPLICIT RECIPIENT", "EXPLICIT RECIPIENT 2"],
  "Greek designation": ["GREEK IN NON GREEK BOOKS"],
  Institutions: ["INSTITUTIONS"],
  "Bound With": ["BOUND WITH"],
};

export const FeaturesToSplit: Partial<Record<Feature, boolean>> = {
  "Euclid References": true,
  "Other Educational Authorities": true,
  "Explicit Language References": true,
  Verbs: true,
  Institutions: true,
  "Elements Designation": true,
  "Bound With": true,
};

export const FeaturesNotSelectedByDefault: Feature[] = [
  "Greek designation",
  "Elements Designation",
  "Base Content Description",
  "Supplementary Content",
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
  "Euclid References": "#F0E68C",
  "Other Educational Authorities": "#e567ac",
  "Explicit Language References": "#e59c67",
  "Euclid Description": "#b0e57c",
  Verbs: "#954caf",
  "Intended Audience": "#E4A0D8",
  "Elements Designation": "#A3D5C3",
  "Greek designation": "#F0B2A1",
  Institutions: "#B0C4DE",
  "Bound With": "#FFB6C1",
};

export const FeatureToTooltip: Record<Feature, string> = {
  "Base Content":
    "The minimal designation of the book’s main content, typically appearing at the beginning of the title page, without elaboration.",
  "Base Content Description":
    "Additional elements extending beyond the base content, describing it or highlighting the book’s special features.",
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
  "Euclid References": "Euclid's name as it appears on the title page.",
  "Other Educational Authorities":
    "Mentions of other scholars, either ancients, such as Theon of Alexandria, or contemporary, like Simon Stevin.",
  "Euclid Description":
    "Any descriptors found alongside the Euclid's name, such as mentioning him being a mathematician.",
  "Explicit Language References":
    "Mentions of the source language (e.g., Latin or Greek) and/or the target language.",
  Verbs:
    "Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.",
  "Intended Audience":
    "Explicit mentions of the work's intended recipients or audience.",
  "Elements Designation":
    "The designation of the Elements, such as 'Elements of Geometry' or 'Euclid’s Elements', as it appears on the title page.",
  "Greek designation": "Greek designation of the book in non-Greek books.",
  Institutions:
    "Mentions of institutions, such as societies or universities, associated with the book.",
  "Bound With":
    "TBC",
};

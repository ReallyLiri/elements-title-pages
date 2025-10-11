export type Mode = "texts" | "images";

export type Feature =
  | "Base Content"
  | "Base Content Description"
  | "Adapter Attribution"
  | "Adapter Description"
  | "Patronage Dedication"
  | "Edition Statement"
  | "Supplementary Content"
  | "Publishing Privileges"
  | "Euclid References"
  | "Other Educational Authorities"
  | "Explicit Language References"
  | "Euclid Description"
  | "Verbs"
  | "Intended Audience"
  | "Elements Designation"
  | "Greek designation"
  | "Institutions"
  | "Bound With"
  | "Enriched With"
  | "Date in Imprint"
  | "Publisher in Imprint"
  | "Place in Imprint"
  | "Privileges in Imprint"
  | "Dedication in Imprint"
  | "Adapter Attribution in Imprint"
  | "Adapter Description in Imprint";

export type FilterGroup =
  | "General"
  | "Elements"
  | "Title Page"
  | "Material"
  | "Diagrams";

export type Range = {
  start: number;
  end: number;
};

type YesNoBool = "Yes" | "No";

export type Item = {
  key: string;
  year: string;
  cities: string[];
  languages: string[];
  authors: string[];
  imageUrl: string | null;
  hasTitle: string;
  title: string;
  titleEn: string | null;
  imprint: string | null;
  imprintEn: string | null;
  scanUrl: string[] | null;
  features: Partial<Record<Feature, string[]>>;
  type: string;
  format: string | null;
  elementsBooks: Range[];
  elementsBooksExpanded: number[];
  additionalContent: string[];
  volumesCount: number | null;
  class: string | null;
  colorInTitle: string | null;
  titlePageDesign: string | null;
  titlePageNumberOfTypes: number | null;
  titlePageFrameType: string | null;
  titlePageEngraving: string | null;
  hasPrintersDevice: YesNoBool | null;
  fontTypes: string[];
  calligraphicFeatures: string | null;
  notes: string | null;
  study_corpora: string[];
  tp_illustration: string;
  otherNamesClassification: string[] | null;
  hasIntendedAudience: YesNoBool | null;
  hasPatronageDedication: YesNoBool | null;
  hasAdapterAttribution: YesNoBool | null;
  hasPublishingPrivileges: YesNoBool | null;
  hasGreekDesignation: YesNoBool | null;
  explicitLanguageReferences: string[] | null;
  institutions: string[] | null;
  otherNames: string[] | null;
  diagrams_extracted: string;
  has_diagrams: string;
  dotted_lines_b79_cases: string;
  dotted_lines_b10_case: string;
  dotted_lines_b2_cases: string[];
  dotted_lines_geo_cases: string[];
  dotted_lines_other_cases: string[];
  dotted_lines_cases: string[];
};

export type RadioProps = {
  name: string;
  options: [string, string];
  value: boolean;
  onChange: (value: boolean) => void;
};

export type ItemProps = {
  item: Item;
  height: number;
  width: number;
  mode: Mode;
  features: Feature[] | null;
};

export type City = {
  city: string;
  lon: number;
  lat: number;
};

export type DottedLine = {
  key: string;
  type: string;
  has_diagrams: string;
  uc_b79_token: string;
  uc_b10: string;
  uc_b2: string;
  uc_geo_dotted: string;
  uc_other: string;
  quality: string;
};

export type EditionCopy = {
  key: string;
  scan_url: string;
  annotation: string;
  vol: string;
};

export const FLOATING_CITY = "s.l.";
export const FLOATING_CITY_ENTRY: City = {
  city: FLOATING_CITY,
  lon: -16,
  lat: 42,
};

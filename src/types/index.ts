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
  scanUrl: string | null;
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

export const FLOATING_CITY = "s.l.";
export const FLOATING_CITY_ENTRY: City = {
  city: FLOATING_CITY,
  lon: -16,
  lat: 42,
};

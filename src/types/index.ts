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
  | "Enriched With";

export type Item = {
  key: string;
  year: string;
  cities: string[];
  languages: string[];
  authors: string[];
  imageUrl: string | null;
  title: string;
  titleEn: string | null;
  imprint: string | null;
  imprintEn: string | null;
  features: Partial<Record<Feature, string[]>>;
  type: string;
  format: string | null;
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
  features: Feature[];
};

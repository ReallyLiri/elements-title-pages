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
  | "Other Educational Authorities"
  | "Explicit Language References"
  | "Euclid Description"
  | "Verbs"
  | "Recipients"
  | "Elements Designation"
  | "Greek designation";

export type Item = {
  key: string;
  year: string;
  cities: string[];
  languages: string[];
  authors: string[];
  imageUrl: string | null;
  title: string;
  titleEn: string | null;
  features: Partial<Record<Feature, string[]>>;
  type: string;
  format: string | null;
};

export type Range = {
  start: number;
  end: number;
  feature: Feature;
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

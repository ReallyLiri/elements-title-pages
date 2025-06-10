import { FLOATING_CITY } from "../types";

const formatCompare = (a: string, b: string): number => {
  const order = [
    "folio",
    "folio in 8s",
    "quarto",
    "quarto in 8s",
    "sexto",
    "octavo",
    "duodecimo",
    "octodecimo",
  ];
  a = a.toLocaleLowerCase();
  b = b.toLocaleLowerCase();
  const aIndex = order.indexOf(a);
  const bIndex = order.indexOf(b);
  if (aIndex === -1 && bIndex === -1) {
    return a.localeCompare(b);
  } else if (aIndex === -1) {
    return 1;
  } else if (bIndex === -1) {
    return -1;
  } else {
    return aIndex - bIndex;
  }
};

export type Filterable = {
  displayName: string;
  isArray?: boolean;
  customCompareFn?: (a: unknown, b: unknown) => number;
};

export const filterFields: {
  [key: string]: Filterable;
} = {
  type: {
    displayName: "Book Classification",
  },
  languages: {
    displayName: "Languages",
    isArray: true,
  },
  cities: {
    displayName: "Cities",
    isArray: true,
    customCompareFn: ((a: string, b: string) => {
      if (a === FLOATING_CITY) return -1;
      if (b === FLOATING_CITY) return 1;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    }) as (a: unknown, b: unknown) => number,
  },
  authors: {
    displayName: "Authors",
    isArray: true,
  },
  elementsBooksExpanded: {
    displayName: "Elements Books",
    isArray: true,
  },
  format: {
    displayName: "Edition Format",
    customCompareFn: formatCompare as (a: unknown, b: unknown) => number,
  },
  volumesCount: { displayName: "Number of Volumes" },
  additionalContent: {
    displayName: "Additional Content",
    isArray: true,
    customCompareFn: (a: unknown, b: unknown) =>
      (a as string).localeCompare(b as string),
  },
  class: { displayName: "Wardhaugh Class" },
  hasTitle: { displayName: "Has Title Page Image" },
  colorInTitle: { displayName: "Colors in Title Page" },
  titlePageDesign: { displayName: "Title Page Design" },
  titlePageNumberOfTypes: {
    displayName: "Title Page Number of Types",
  },
  titlePageFrameType: { displayName: "Title Page Frame Type" },
  titlePageEngraving: { displayName: "Title Page Engraving" },
  hasPrintersDevice: { displayName: "Title Page has Printer's Device" },
  hasHourGlassShape: { displayName: "Title Page with Hourglass Shape" },
  fontTypes: {
    displayName: "Title Page Font Types",
    isArray: true,
  },
};

import { FLOATING_CITY, Range } from "../types";

const formatCompare = (a: string, b: string): number => {
  const order = [
    "folio",
    "quarto",
    "sexto",
    "octavo",
    "duodecimo",
    "sextodecimo",
    "octodecimo",
    "vincesimo-quarto",
    "uncategorized",
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

export type ItemProperty = {
  displayName: string;
  isArray?: boolean;
  customCompareFn?: (a: unknown, b: unknown) => number;
  isTitlePageImageFeature?: boolean;
  groupByJoinArray?: boolean;
  notFilterable?: boolean;
  notGroupable?: boolean;
};

function parseRangeIfNeeded(a: Range | string): Range {
  if (!(typeof a === "string")) {
    return a;
  }
  if (a === "None") {
    return { start: 100, end: 100 };
  }
  const parts = (a as string).split("-");
  return {
    start: parseInt(parts[0]),
    end: parseInt(parts[parts.length - 1]),
  };
}

export const itemProperties: {
  [key: string]: ItemProperty;
} = {
  type: {
    displayName: "Book Classification",
  },
  languages: {
    displayName: "Languages",
    isArray: true,
    groupByJoinArray: true,
  },
  cities: {
    displayName: "Cities",
    isArray: true,
    customCompareFn: ((a: string, b: string) => {
      if (a === FLOATING_CITY) return -1;
      if (b === FLOATING_CITY) return 1;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    }) as (a: unknown, b: unknown) => number,
    groupByJoinArray: true,
  },
  authors: {
    displayName: "Authors",
    isArray: true,
    groupByJoinArray: true,
  },
  elementsBooks: {
    displayName: "Elements Books",
    isArray: true,
    notFilterable: true,
    customCompareFn: ((a: Range | string, b: Range | string) => {
      const rangeA: Range = parseRangeIfNeeded(a);
      const rangeB: Range = parseRangeIfNeeded(b);
      if (rangeA.start === rangeB.start) {
        return rangeA.end - rangeB.end;
      }
      return rangeA.start - rangeB.start;
    }) as (a: unknown, b: unknown) => number,
  },
  elementsBooksExpanded: {
    displayName: "Elements Books",
    isArray: true,
    notGroupable: true,
  },
  format: {
    displayName: "Edition Format",
    customCompareFn: formatCompare as (a: unknown, b: unknown) => number,
  },
  volumesCount: { displayName: "Number of Volumes" },
  additionalContent: {
    displayName: "Additional Content",
    isArray: true,
  },
  class: { displayName: "Wardhaugh Class" },
  hasTitle: { displayName: "Has Title Page Image" },
  colorInTitle: {
    displayName: "Colors in Title Page",
    isTitlePageImageFeature: true,
  },
  titlePageDesign: {
    displayName: "Title Page Design",
    isTitlePageImageFeature: true,
  },
  titlePageNumberOfTypes: {
    displayName: "Title Page Number of Types",
    isTitlePageImageFeature: true,
  },
  titlePageFrameType: {
    displayName: "Title Page Frame Type",
    isTitlePageImageFeature: true,
  },
  titlePageEngraving: {
    displayName: "Title Page Engraving",
    isTitlePageImageFeature: true,
  },
  hasPrintersDevice: {
    displayName: "Title Page has Printer's Device",
    isTitlePageImageFeature: true,
  },
  fontTypes: {
    displayName: "Title Page Font Types",
    isTitlePageImageFeature: true,
    isArray: true,
  },
};

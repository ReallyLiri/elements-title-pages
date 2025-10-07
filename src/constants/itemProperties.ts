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

export const dottedLinesCasesCompare = (a: string, b: string): number => {
  if (a === "Uncatalogued" && b === "Uncatalogued") return 0;
  if (a === "Uncatalogued") return 1;
  if (b === "Uncatalogued") return -1;

  const parseCase = (caseStr: string) => {
    const romanToNumber = (roman: string): number => {
      const romanMap: { [key: string]: number } = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
        IX: 9,
        X: 10,
        XI: 11,
        XII: 12,
        XIII: 13,
        XIV: 14,
        XV: 15,
        XVI: 16,
      };
      return romanMap[roman] || 999;
    };

    // Handle range format like "VII-IX"
    const rangeMatch = caseStr.match(/^([IVX]+)-([IVX]+)$/);
    if (rangeMatch) {
      const [, startRoman] = rangeMatch;
      const startBook = romanToNumber(startRoman);
      return {
        book: startBook,
        section: "",
        sectionOrder: 999,
        number: 0,
        remainder: "",
      };
    }

    // Handle standard format like "I.Def.2", "III.5", "I throughout"
    const match = caseStr.match(
      /^([IVX]+)(?:\.(.+?)(?:\.(\d+))?)?(?:\s+(.+))?$/,
    );
    if (!match)
      return { book: 999, section: "", sectionOrder: 999, number: 999 };

    const [, bookRoman, section, numberStr, remainder] = match;
    const book = romanToNumber(bookRoman);
    const number = numberStr ? parseInt(numberStr, 10) : 0;

    const sectionOrder =
      section === "Def"
        ? 0
        : section === "Post"
          ? 1
          : section === "CN"
            ? 2
            : 999;

    return {
      book,
      section: section || "",
      sectionOrder,
      number,
      remainder: remainder || "",
    };
  };

  const parsedA = parseCase(a);
  const parsedB = parseCase(b);

  if (parsedA.book !== parsedB.book) {
    return parsedA.book - parsedB.book;
  }

  if (parsedA.sectionOrder !== parsedB.sectionOrder) {
    return parsedA.sectionOrder - parsedB.sectionOrder;
  }

  if (parsedA.number !== parsedB.number) {
    return parsedA.number - parsedB.number;
  }

  return a.localeCompare(b);
};

export type ItemProperty = {
  displayName: string;
  isArray?: boolean;
  customCompareFn?: (a: unknown, b: unknown) => number;
  isTitlePageImageFeature?: boolean;
  isTitlePageTextFeature?: boolean;
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
    displayName: "Elements Books (ranges)",
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
    customCompareFn: ((a: string, b: string): number => {
      if (a === "None") return 1;
      if (b === "None") return -1;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    }) as (a: unknown, b: unknown) => number,
  },
  additionalContent: {
    displayName: "Additional Content",
    isArray: true,
  },
  class: { displayName: "Wardhaugh Class" },
  diagrams_extracted: {
    displayName: "Diagrams Extracted",
  },
  dotted_lines_cases: {
    displayName: "Dotted Lines Cases",
    isArray: true,
    customCompareFn: dottedLinesCasesCompare as (
      a: unknown,
      b: unknown,
    ) => number,
  },
  has_diagrams: {
    displayName: "Has Diagrams",
  },
  study_corpora: {
    displayName: "Study Corpus",
    isArray: true,
  },
  format: {
    displayName: "Edition Format",
    customCompareFn: formatCompare as (a: unknown, b: unknown) => number,
  },
  volumesCount: { displayName: "Number of Volumes" },
  hasTitle: { displayName: "Has Title Page" },
  colorInTitle: {
    displayName: "Colors on Title Page",
    isTitlePageImageFeature: true,
  },
  titlePageDesign: {
    displayName: "Title Page Design",
    isTitlePageImageFeature: true,
  },
  titlePageNumberOfTypes: {
    displayName: "Number of Types on Title Page",
    isTitlePageImageFeature: true,
    customCompareFn: ((a: string | null, b: string | null): number => {
      if (a?.includes("Digital")) {
        return 1;
      }
      if (b?.includes("Digital")) {
        return -1;
      }
      const aNum = parseInt(a || "0");
      const bNum = parseInt(b || "0");
      return aNum - bNum;
    }) as (a: unknown, b: unknown) => number,
  },
  titlePageFrameType: {
    displayName: "Frame Type of Title Page",
    isTitlePageImageFeature: true,
  },
  titlePageEngraving: {
    displayName: "Title Page Engraving",
    isTitlePageImageFeature: true,
  },
  fontTypes: {
    displayName: "Types Present on Title Page",
    isTitlePageImageFeature: true,
    isArray: true,
  },
  otherNames: {
    displayName: "Educational Mentioned Authority on Title Page",
    isArray: true,
  },
  tp_illustration: {
    displayName: "Illustration on Title Page",
  },
  otherNamesClassification: {
    displayName: "Other Educational Authorities Mentioned on Title Page",
    isArray: true,
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasIntendedAudience: {
    displayName: "Intended Audience Mentioned on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasPatronageDedication: {
    displayName: "Patronage Dedication Present on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasAdapterAttribution: {
    displayName: "Adapter Attribution Present on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasAdapterDescription: {
    displayName: "Adapter Description Present on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasPublishingPrivileges: {
    displayName: "Publishing Privileges Present on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  hasGreekDesignation: {
    displayName: "Greek Designation Present on Title Page",
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  explicitLanguageReferences: {
    displayName: "Explicit Language References on Title Page",
    isArray: true,
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
  institutions: {
    displayName: "Institutions Mentioned on Title Page",
    isArray: true,
    notFilterable: true,
    isTitlePageTextFeature: true,
  },
};

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
  ...{
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
  },
  ...(import.meta.env.DEV
    ? {
        tp_study_corpus: {
          displayName: "Title Page Study Corpus",
        },
        otherNames: {
          displayName: "Educational Mentioned Authority on Title Page",
          isArray: true,
        },
        tp_illustration: {
          displayName: "Illustration on Title Page",
        }
      }
    : {}),
};

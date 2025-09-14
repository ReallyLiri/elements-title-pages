import {
  City,
  Feature,
  FLOATING_CITY,
  FLOATING_CITY_ENTRY,
  Item,
  Range,
} from "../types";
import { startCase, uniq } from "lodash";
import Papa from "papaparse";
import { Dispatch, SetStateAction } from "react";
import {
  CSV_PATH_CITIES,
  CSV_PATH_ELEMENTS,
  CSV_PATH_SECONDARY,
  FeaturesToSplit,
  FeatureToColumnName,
  ItemTypes,
} from "../constants";
import { Point } from "react-simple-maps";
import { groupByMap } from "./util.ts";

const parseBooks = (
  booksRaw: string | null,
): {
  elementsBooks: Range[];
  elementsBooksExpanded: number[];
  additionalContent: string[];
} => {
  if (!booksRaw) {
    return {
      elementsBooks: [],
      elementsBooksExpanded: [],
      additionalContent: [],
    };
  }

  const elementsBooks: Range[] = [];
  const elementsBooksExpanded: number[] = [];
  const additionalContent: string[] = [];

  const entries = booksRaw
    .split(";")
    .map((e) => e.replaceAll("(enunciations)", "").trim())
    .filter((e) => e);

  for (const entry of entries) {
    const match = entry.match(/^"?Elements\s+(.+?)"?$/i);
    if (!match) {
      additionalContent.push(startCase(entry.toLowerCase()));
      continue;
    }

    const parts = match[1]
      .split(",")
      .map((p) => p.trim().replace(/[–-]/g, "-")); // normalize dash

    for (const part of parts) {
      if (part === "?") {
        continue;
      }
      const rangeMatch = part.match(/^(\d+)-(\d+)$/);
      const singleMatch = part.match(/^(\d+)$/);

      if (rangeMatch) {
        elementsBooks.push({
          start: parseInt(rangeMatch[1], 10),
          end: parseInt(rangeMatch[2], 10),
        });
        for (
          let i = parseInt(rangeMatch[1], 10);
          i <= parseInt(rangeMatch[2], 10);
          i++
        ) {
          elementsBooksExpanded.push(i);
        }
      } else if (singleMatch) {
        const num = parseInt(singleMatch[1], 10);
        elementsBooks.push({ start: num, end: num });
        elementsBooksExpanded.push(num);
      } else {
        console.error(`Unrecognized book format: ${part}`);
      }
    }
  }

  return { elementsBooks, elementsBooksExpanded, additionalContent };
};

const ifEmpty = <T>(arr: T[], defaultValue: T[]): T[] =>
  arr.length === 0 ? defaultValue : arr;

const toYesNo = (value: string): "Yes" | "No" => {
  return value === "True" ? "Yes" : "No";
};

function parseExplicitLanguages(langs: string) {
  return langs
    .split(/, | et | en | & /)
    .map((input) => {
      const normalized = input
        .replaceAll("-", "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const rules = [
        {
          match:
            /latin|latina|latino|latine|latein|latijn|latinum|latinit|la tine|latijnsche/,
          lang: "Latin",
        },
        { match: /greek|graec|græc|grec|griech/, lang: "Greek" },
        { match: /fran[çc]ois|francois|french/, lang: "French" },
        { match: /italien|italian|italiana|thoscana|toscana/, lang: "Italian" },
        {
          match: /spanish|espanol|española|traduzidas|castellano|hispanice/,
          lang: "Spanish",
        },
        { match: /german|teutsch|teutscher|deutsch/, lang: "German" },
        {
          match: /nederduyts|nederduytse|neerduid|neerduyts|neerdvyt|niderland/,
          lang: "Dutch",
        },
        { match: /arabic/, lang: "Arabic" },
        { match: /english|englishe/, lang: "English" },
        {
          match: /romance|vulgar|volgar|vvlgare|vernacul|en nostre langve/,
          lang: "general-vernacular",
        },
      ];

      for (const { match, lang } of rules) {
        if (match.test(normalized)) return lang;
      }

      return normalized ? "Other" : "";
    })
    .filter(Boolean)
    .map((lang) => startCase(lang.toLowerCase()));
}

function parseInstitutions(institutions: string) {
  return institutions
    .split(/, | et | en | & /)
    .map((input) => {
      const normalized = input
        .replaceAll("-", "")
        .replaceAll("\n", "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const rules = [
        {
          match:
            /\b(?:(?:la\s*)?(?:compagnie|compañ[ií]a|compania))\s+de\s+(?:jesus|iesvs|jesvs)|\b(?:soc\.?|soci[eé]t\.?|societate|societ\.)\s*(?:jesu|iesv|jesv)|\b(?:societatis)(?:\s+(?:jesu|iesv))?(?:\s+gymnasio)?\b|\bsociety of jesus\b|\bjesuite\b|\bpanormitano.*sicili\b|\bherbipolitano.*franconi\b|\bgymnasio.*(?:jesu|iesv|jesv)\b/i,
          label: "Jesuits",
        },
      ];

      for (const { match, label } of rules) {
        if (match.test(normalized)) return label;
      }

      return normalized ? "Other" : "";
    })
    .filter(Boolean)
    .map((lang) => startCase(lang.toLowerCase()));
}

function mapOtherName(s: string): string {
  switch (s) {
    case "contemporary":
      return "Contemporary scholars";
    case "ancient":
      return "Other ancient scholars by name";
    case "ancient general":
      return "Ancient scholars as a group";
  }
  return startCase(s.toLowerCase());
}

export const loadEditionsData = (
  setItems: Dispatch<SetStateAction<Item[]>>,
  setFloatingCity = false,
) => {
  Promise.all([
    fetch(CSV_PATH_ELEMENTS).then((response) => response.text()),
    fetch(CSV_PATH_SECONDARY).then((response) => response.text()),
  ])
    .then(([elementsText, secondaryText]) => {
      const processData = (csvText: string, type: keyof typeof ItemTypes) => {
        return new Promise<Item[]>((resolve) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const items = (result.data as Record<string, unknown>[])
                .map((raw) => {
                  const hasTitle =
                    Boolean(raw["title"]) && raw["title"] !== "?";
                  const hasTitleImage = Boolean(raw["tp_url"]) && hasTitle;
                  return {
                    key: raw["key"] as string,
                    year: raw["year"] as string,
                    cities: ifEmpty(
                      [raw["city"] as string, raw["city 2"] as string].filter(
                        Boolean,
                      ) as string[],
                      setFloatingCity ? [FLOATING_CITY] : [],
                    ),
                    languages: [
                      startCase((raw["language"] as string).toLowerCase()),
                      startCase((raw["language 2"] as string).toLowerCase()),
                    ].filter(Boolean) as string[],
                    authors:
                      (raw["author (normalized)"] as string | null)?.split(
                        ", ",
                      ) || [],
                    imageUrl: (raw["tp_url"] || raw["tp_url_alt"]) as
                      | string
                      | null,
                    title: raw["title"] as string,
                    titleEn: raw["title_EN"] as string | null,
                    imprint: raw["imprint"] as string | null,
                    imprintEn: raw["imprint_EN"] as string | null,
                    scanUrl:
                      (raw["scan_url"] as string | null)?.split(";")[0] || null,
                    type: ItemTypes[type],
                    format: raw["format"] as string | null,
                    ...parseBooks(raw["books"] as string | null),
                    volumesCount: raw["volumesCount"]
                      ? parseInt(raw["volumesCount"] as string)
                      : null,
                    class: raw["wClass"] as string | null,
                    hasTitle:
                      Boolean(raw["tp_url"]) &&
                      Boolean(raw["title"]) &&
                      raw["title"] !== "?"
                        ? "Yes"
                        : Boolean(raw["title"]) && raw["title"] !== "?"
                          ? "Yes (no digital facsimile)"
                          : "No",
                    colorInTitle: hasTitleImage
                      ? raw["has_red"] === "True"
                        ? "Black and Red"
                        : "Black"
                      : null,
                    titlePageDesign: hasTitleImage
                      ? startCase(
                          (raw["tp_design"] as string | null)?.toLowerCase(),
                        )
                      : null,
                    titlePageNumberOfTypes: hasTitleImage
                      ? raw["num_of_types"]
                        ? parseInt(raw["num_of_types"] as string)
                        : null
                      : null,
                    titlePageFrameType: hasTitleImage
                      ? startCase(
                          (raw["frame_type"] as string | null)?.toLowerCase(),
                        )
                      : null,
                    titlePageEngraving: hasTitleImage
                      ? startCase(
                          (raw["engraving"] as string | null)?.toLowerCase(),
                        )
                      : null,
                    hasPrintersDevice: hasTitleImage
                      ? toYesNo(raw["printer_device"] as string)
                      : null,
                    fontTypes: hasTitleImage
                      ? (raw["font_types"] as string | null)
                          ?.split(", ")
                          .map((type) => startCase(type.toLowerCase()))
                          .filter(Boolean) || []
                      : [],
                    calligraphicFeatures: hasTitleImage
                      ? startCase(
                          (
                            raw["calligraphic_features"] as string | null
                          )?.toLowerCase(),
                        )
                      : null,
                    otherNamesClassification: hasTitle
                      ? ((raw["other_names_classification"] as string | null)
                          ?.split(", ")
                          .map((s) => mapOtherName(s))
                          .concat(raw["EUCLID REF"] ? ["Euclid"] : [])
                          .filter(Boolean) ?? [])
                      : null,
                    hasIntendedAudience: hasTitle
                      ? raw["EXPLICIT RECIPIENT"] || raw["EXPLICIT RECIPIENT 2"]
                        ? "Yes"
                        : "No"
                      : null,
                    hasPatronageDedication: hasTitle
                      ? raw["PATRON REF"] || raw["IMPRINT DEDICATION"]
                        ? "Yes"
                        : "No"
                      : null,
                    hasAdapterAttribution: hasTitle
                      ? raw["AUTHOR NAME"] || raw["AUTHOR NAME 2"]
                        ? "Yes"
                        : "No"
                      : null,
                    hasPublishingPrivileges: hasTitle
                      ? raw["PRIVILEGES"] || raw["IMPRINT PRIVILEGES"]
                        ? "Yes"
                        : "No"
                      : null,
                    hasGreekDesignation: hasTitle
                      ? raw["GREEK IN NON GREEK BOOKS"]
                        ? "Yes"
                        : "No"
                      : null,
                    explicitLanguageReferences: hasTitle
                      ? parseExplicitLanguages(
                          `${raw["EXPLICITLY STATED: TRANSLATED FROM"] || ""}, ${raw["EXPLICITLY STATED: TRANSLATED TO"] || ""}`,
                        )
                      : null,
                    institutions: hasTitle
                      ? parseInstitutions(
                          (raw["INSTITUTIONS"] as string | null) || "",
                        )
                      : null,
                    features: Object.keys(FeatureToColumnName).reduce(
                      (acc, feature) => {
                        acc[feature as Feature] = FeatureToColumnName[
                          feature as Feature
                        ]
                          .filter((column) => !!raw[column])
                          .map((column) => raw[column] as string)
                          .flatMap((text) =>
                            FeaturesToSplit[feature as Feature]
                              ? uniq(text.split(", "))
                              : [text],
                          );
                        if (feature === "Elements Designation") {
                          acc[feature as Feature] =
                            !raw["ELEMENTS DESIGNATION"] && type === "elements"
                              ? [raw["BASE CONTENT"] as string]
                              : raw["ELEMENTS DESIGNATION"] === "none" &&
                                  type === "elements"
                                ? []
                                : acc[feature as Feature];
                        }
                        return acc;
                      },
                      {} as Partial<Record<Feature, string[]>>,
                    ),
                  };
                })
                .filter((item) => !!item.key);
              resolve(items);
            },
          });
        });
      };

      return Promise.all([
        processData(elementsText, "elements"),
        processData(secondaryText, "secondary"),
      ]);
    })
    .then(([elementsItems, secondaryItems]) => {
      const allItems = [...elementsItems, ...secondaryItems];
      setItems(
        allItems.sort(
          (a, b) => a.year.localeCompare(b.year) || a.key.localeCompare(b.key),
        ),
      );
    })
    .catch((error) => console.error("Error reading CSV:", error));
};

export const loadCitiesAsync = async (): Promise<Record<string, Point>> => {
  const response = await fetch(CSV_PATH_CITIES);
  const data = await response.text();
  const cities = Papa.parse<City>(data.trim(), { header: true }).data;
  cities.push(FLOATING_CITY_ENTRY);
  return groupByMap(
    cities,
    (city) => city.city,
    (city) => [city.lon, city.lat],
  );
};

export const authorDisplayName = (author: string) => {
  author = author.replace("(?)", "").replace("?", "").trim();
  const parts = author.split(" ");
  if (parts.length == 1) {
    return author;
  }
  return `${parts.slice(1).join(" ").trim()}, ${parts[0]}`;
};

export function openScan(item: Item) {
  if (!item.scanUrl) {
    return;
  }
  return window.open(item.scanUrl, "_blank")?.focus();
}

export function openImage(item: Item) {
  return window.open(item.imageUrl, "_blank")?.focus();
}

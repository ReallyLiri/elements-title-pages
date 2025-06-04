import { City, Feature, FLOATING_CITY_ENTRY, Item, Range } from "../types";
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
  additionalContent: string[];
} => {
  if (!booksRaw) {
    return { elementsBooks: [], additionalContent: [] };
  }

  const elementsBooks: Range[] = [];
  const additionalContent: string[] = [];

  const entries = booksRaw
    .split(";")
    .map((e) => e.trim())
    .filter((e) => e && !/enunciations/i.test(e));

  for (const entry of entries) {
    const match = entry.match(/^"?Elements\s+(.+?)"?$/i);
    if (!match) {
      additionalContent.push(entry);
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
      } else if (singleMatch) {
        const num = parseInt(singleMatch[1], 10);
        elementsBooks.push({ start: num, end: num });
      } else {
        console.error(`Unrecognized book format: ${part}`);
      }
    }
  }

  return { elementsBooks, additionalContent };
};

export const loadEditionsData = (
  setItems: Dispatch<SetStateAction<Item[]>>,
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
                  return {
                    key: raw["key"] as string,
                    year: raw["year"] as string,
                    cities: [
                      raw["city"] as string,
                      raw["city 2"] as string,
                    ].filter((city) => city) as string[],
                    languages: [
                      startCase((raw["language"] as string).toLowerCase()),
                      startCase((raw["language 2"] as string).toLowerCase()),
                    ].filter((city) => city) as string[],
                    authors:
                      (raw["author (normalized)"] as string | null)?.split(
                        ", ",
                      ) || [],
                    imageUrl: raw["tp_url"] as string | null,
                    title: raw["title"] as string,
                    titleEn: raw["title_EN"] as string | null,
                    imprint: raw["imprint"] as string | null,
                    imprintEn: raw["imprint_EN"] as string | null,
                    scanUrl: raw["scan_url"] as string | null,
                    type: ItemTypes[type],
                    format: raw["format"] as string | null,
                    ...parseBooks(raw["books"] as string | null),
                    volumesCount: raw["volumes_count"]
                      ? parseInt(raw["volumes_count"] as string)
                      : null,
                    class: raw["wClass"] as string | null,
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

export const extract = (items: Item[], property: keyof Item) =>
  items
    .reduce((acc, item) => {
      if (item[property]) {
        if (Array.isArray(item[property])) {
          item[property].forEach((value) => {
            if (!acc.includes(value)) {
              acc.push(value);
            }
          });
        } else {
          const value = item[property] as string;
          if (!acc.includes(value)) {
            acc.push(value);
          }
        }
      }
      return acc;
    }, [] as string[])
    .sort();

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

export function imageClicked(item: Item) {
  return window
    .open(item.imageUrl?.replace("i.imgur.com", "rimgo.catsarch.com"), "_blank")
    ?.focus();
}

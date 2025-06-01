import { Item } from "../types";
import { startCase, uniq } from "lodash";
import Papa from "papaparse";
import { Dispatch, SetStateAction } from "react";
import {
  FeatureToColumnName,
  FeaturesToSplit,
  ItemTypes,
  CSV_PATH_ELEMENTS,
  CSV_PATH_SECONDARY,
} from "../constants";
import { Feature } from "../types";

export const loadData = (
  setItems: Dispatch<SetStateAction<Item[] | undefined>>,
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
                    type: ItemTypes[type],
                    format: raw["format"] as string | null,
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

export const authorDisplayName = (author: string) => {
  const parts = author.split(" ");
  return `${parts.slice(1).join(" ").trim()}, ${parts[0]}`;
};

export function imageClicked(item: Item) {
  return window
    .open(item.imageUrl?.replace("i.imgur.com", "rimgo.catsarch.com"), "_blank")
    ?.focus();
}

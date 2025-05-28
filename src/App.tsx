import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import Select from "react-select";
import { css } from "@emotion/react";
import { images } from "./images.ts";
import { startCase } from "lodash";

const CSV_PATH = "/docs/EiP.csv";

type Item = {
  key: string;
  year: string;
  cities: string[];
  languages: string[];
  authors: string[];
  imageUrl: string | null;
  title: string;
  features: Partial<Record<Feature, string[]>>;
};

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  .basic-multi-select {
    color: black;
    min-width: 12rem;
    max-width: 40rem;
  }
`;

const Row = styled.div<{ justifyStart?: boolean; gap?: number }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyStart }) => (justifyStart ? "start" : "center")};
  align-items: center;
  gap: ${({ gap }) => (gap !== undefined ? gap : 2)}rem;
  width: 100%;
  max-width: 96vw;
  flex-wrap: wrap;
`;

const Column = styled.div<{ minWidth?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-width: ${({ minWidth }) => minWidth || "unset"};
  max-width: 90vw;
`;

const Text = styled.div<{ size: number; bold?: boolean }>`
  font-family: "Frank Ruhl Libre", serif;
  font-size: ${({ size }) => size}rem;
  font-weight: ${({ bold }) => (bold ? "bold" : "normal")};
  text-align: center;
`;

const loadData = (setItems: Dispatch<SetStateAction<Item[] | undefined>>) => {
  fetch(CSV_PATH)
    .then((response) => response.text())
    .then((csvText) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setItems(
            (result.data as Record<string, unknown>[])
              //.filter((raw) => !!raw["TITLE: FORMULATION"])
              .map((raw) => ({
                key: raw["key"] as string,
                year: raw["year"] as string,
                cities: [raw["city"] as string, raw["city 2"] as string].filter(
                  (city) => city,
                ) as string[],
                languages: [
                  startCase((raw["language"] as string).toLowerCase()),
                  startCase((raw["language 2"] as string).toLowerCase()),
                ].filter((city) => city) as string[],
                authors:
                  (raw["author (normalized)"] as string | null)?.split(", ") ||
                  [],
                imageUrl: images[raw["key"] as string],
                title: raw["title"] as string,
                features: Object.keys(FeatureToColumnName).reduce(
                  (acc, feature) => {
                    acc[feature as Feature] = FeatureToColumnName[
                      feature as Feature
                    ]
                      .filter((column) => !!raw[column])
                      .map((column) => raw[column] as string)
                      .flatMap((text) =>
                        FeaturesToSplit[feature as Feature]
                          ? text.split(", ")
                          : [text],
                      );
                    return acc;
                  },
                  {} as Partial<Record<Feature, string[]>>,
                ),
              }))
              .filter((item) => !!item.key)
              .sort(
                (a, b) =>
                  a.year.localeCompare(b.year) || a.key.localeCompare(b.key),
              ),
          );
        },
      });
    })
    .catch((error) => console.error("Error reading CSV:", error));
};

const extract = (items: Item[], property: keyof Item) =>
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

const authorDisplayName = (author: string) => {
  const parts = author.split(" ");
  return `${parts.slice(1).join(" ").trim()}, ${parts[0]}`;
};

const OptionLabel = ({
  option,
  tooltip,
}: {
  option: string;
  tooltip: string;
}) => (
  <span data-tooltip-id="features" data-tooltip-content={tooltip}>
    {option}
  </span>
);

const MultiSelect = ({
  name,
  options,
  onChange,
  defaultValues,
  colors,
  tooltips,
  labelFn,
}: {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
  defaultValues?: string[];
  colors?: Record<string, string>;
  tooltips?: Record<string, string>;
  labelFn?: (opt: string) => string;
}) => (
  <Select
    isMulti
    name={name}
    defaultValue={defaultValues?.map((v) => ({
      value: v,
      label: tooltips ? (
        <OptionLabel option={v} tooltip={tooltips[v]} />
      ) : labelFn ? (
        labelFn(v)
      ) : (
        v
      ),
    }))}
    options={options.map((option) => ({
      value: option,
      label: tooltips ? (
        <OptionLabel option={option} tooltip={tooltips[option]} />
      ) : labelFn ? (
        labelFn(option)
      ) : (
        option
      ),
    }))}
    className="basic-multi-select"
    classNamePrefix="select"
    onChange={(selected) => onChange(selected.map((option) => option.value))}
    placeholder={`Select ${name}`}
    styles={
      colors
        ? {
            option: (styles, { data }) => {
              console.error(data);
              return {
                ...styles,
                backgroundColor: colors[data.value],
              };
            },
            multiValue: (styles, { data }) => {
              return {
                ...styles,
                backgroundColor: colors[data.value],
              };
            },
          }
        : undefined
    }
  />
);

type Mode = "texts" | "images";

const Tile = css`
  border-radius: 1rem;
  clip-path: inset(0 round 1rem);
`;

const TextTile = styled.div<{ alignCenter: boolean }>`
  ${Tile};
  background-color: aliceblue;
  color: black;
  padding: 1rem;
  overflow: auto;
  height: 90%;
  width: 90%;
  line-height: 1.8;
  text-align: ${({ alignCenter }) => (alignCenter ? "center" : "start")};
`;

const NoImageTile = styled.div`
  ${Tile};
  height: 80%;
  width: 80%;
  background-color: rgba(240, 248, 255, 0.2);
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageTile = styled.img`
  ${Tile};
  max-height: 90%;
  max-width: 90%;
  cursor: pointer;
`;

type ItemProps = {
  item: Item;
  height: number;
  width: number;
  mode: Mode;
  features: Feature[];
};

const highlightText = (
  text: string,
  features: Feature[],
  mapping: Item["features"],
): string => {
  let highlighted = text;
  features.forEach((feature) => {
    mapping[feature]?.forEach((text) => {
      const style =
        feature === "Verbs"
          ? `border: 2px solid ${FeatureToColor[feature]}; padding: 2px; border-radius: 8px;`
          : `background-color: ${FeatureToColor[feature]}; padding: 2px; border-radius: 8px;`;
      highlighted = highlighted.replaceAll(
        text.trim(),
        `<span style="${style}">${text}</span>`,
      );
    });
  });
  highlighted = highlighted.replaceAll("\n", "<br/>");
  highlighted = highlighted.replace(
    /\[(.*?)]:/g,
    "<span style='font-size: 0.8rem; opacity: .8'>[$1]:</span>",
  );
  return highlighted;
};

const ItemView = ({ item, height, width, mode, features }: ItemProps) => (
  <Column style={{ height, width }}>
    <div>
      {item.year} {item.authors.join(" & ")}, {item.cities.join(", ")}
    </div>
    {mode === "texts" && (
      <TextTile
        alignCenter={!!item.imageUrl}
        dangerouslySetInnerHTML={{
          __html: highlightText(item.title, features, item.features),
        }}
      />
    )}
    {mode === "images" &&
      (item.imageUrl ? (
        <ImageTile
          src={item.imageUrl}
          onClick={() =>
            window
              .open(
                item.imageUrl?.replace("i.imgur.com", "rimgo.catsarch.com"),
                "_blank",
              )
              ?.focus()
          }
        />
      ) : (
        <NoImageTile>Not Available</NoImageTile>
      ))}
  </Column>
);

type RadioProps = {
  name: string;
  options: [string, string];
  value: boolean;
  onChange: (value: boolean) => void;
};

const Radio = ({ name, options, value, onChange }: RadioProps) => (
  <Row justifyStart>
    <div>{name}:</div>
    <label>
      <input
        type="radio"
        checked={!value}
        onChange={(ev) => onChange(!ev.target.checked)}
      />
      {options[0]}
    </label>
    <label>
      <input
        type="radio"
        checked={value}
        onChange={(ev) => onChange(ev.target.checked)}
      />
      {options[1]}
    </label>
  </Row>
);

type Feature =
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
  | "Verbs";

const FeatureToColumnName: Record<Feature, string[]> = {
  "Base Content": ["TITLE: BASE CONTENT"],
  "Base Content Description": ["TITLE: CONTENT DESC", "TITLE: CONTENT DESC 2"],
  "Adapter Attribution": ["TITLE: AUTHOR NAME"],
  "Adapter Description": [
    "TITLE: AUTHOR DESCRIPTION",
    "TITLE: AUTHOR DESCRIPTION 2",
  ],
  "Patronage Dedication": ["TITLE: PATRON REF"],
  "Edition Statement": ["TITLE: EDITION INFO"],
  "Supplementary Content": [
    "TITLE: ADDITIONAL CONTENT",
    "TITLE: ADDITIONAL CONTENT 2",
  ],
  "Publishing Privileges": ["TITLE: PRIVILEGES"],
  "Other Educational Authorities": ["OTHER NAMES"],
  "Explicit Language References": [
    "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO",
  ],
  Verbs: ["TITLE: VERBS"],
};

const FeaturesToSplit: Partial<Record<Feature, boolean>> = {
  "Other Educational Authorities": true,
  "Explicit Language References": true,
  Verbs: true,
};

const FeatureToColor: Record<Feature, string> = {
  "Base Content": "#FADADD",
  "Base Content Description": "#AEC6CF",
  "Adapter Attribution": "#909fd7",
  "Adapter Description": "#FFDAB9",
  "Patronage Dedication": "#D4C5F9",
  "Edition Statement": "#FFC1CC",
  "Supplementary Content": "#9783d2",
  "Publishing Privileges": "#D1E7E0",
  "Other Educational Authorities": "#e567ac",
  "Explicit Language References": "#e59c67",
  Verbs: "#954caf",
};

const FeatureToTooltip: Record<Feature, string> = {
  "Base Content":
    "The minimal designation of the book’s main content, typically appearing at the beginning of the title page, without elaboration.",
  "Base Content Description":
    "Additional elements extending beyond the base content, describing it or highlighting the book’s special features.",
  "Adapter Attribution":
    "The name of the contemporary adapter (author, editor, translator, commentator, etc.) as it appears on the title page.",
  "Adapter Description":
    "Any descriptors found alongside the adapter name, such as academic titles, ranks, or affiliations.",
  "Patronage Dedication": "Mentions of patrons.",
  "Edition Statement":
    "Any information that is highlighted as relevant for this specific edition.",
  "Supplementary Content": "Additional content included in the book.",
  "Publishing Privileges":
    "Mentions of royal privileges or legal permissions granted for printing.",
  "Other Educational Authorities":
    "Mentions of other scholars, either ancients, such as Theon of Alexandria, or contemporary, like Simon Stevin.",
  "Explicit Language References":
    "Statements identifying the source language (e.g., Latin or Greek) and/or the target language.",
  Verbs:
    "Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.",
};

function App() {
  const [items, setItems] = useState<Item[]>();
  const [mode, setMode] = useState<Mode>("texts");
  const [cities, setCities] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [requireImage, setRequireImage] = useState<boolean>(false);
  const [features, setFeatures] = useState<Feature[]>(
    Object.keys(FeatureToColumnName) as Feature[],
  );
  const tileHeight = 400;
  const tileWidth = 400;

  const allCities = useMemo(
    () => (items ? extract(items, "cities") : []),
    [items],
  );

  const allAuthors = useMemo(
    () =>
      items
        ? extract(items, "authors").sort((a, b) =>
            authorDisplayName(a).localeCompare(authorDisplayName(b)),
          )
        : [],
    [items],
  );

  const allLanguages = useMemo(
    () =>
      (items ? extract(items, "languages") : []).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items?.filter((item) => {
      if (cities.length) {
        if (!item.cities.some((city) => cities.includes(city))) {
          return false;
        }
      }
      if (authors.length) {
        if (
          item.authors.length > 0 &&
          !item.authors.some((a) => authors.includes(a))
        ) {
          return false;
        }
      }
      if (languages.length) {
        if (
          item.languages.length > 0 &&
          !item.languages.some((l) => languages.includes(l))
        ) {
          return false;
        }
      }
      if (mode === "images" && requireImage) {
        if (!item.imageUrl) {
          return false;
        }
      }
      return true;
    });
  }, [items, cities, authors, languages, mode, requireImage]);

  console.warn(filteredItems);

  useEffect(() => loadData(setItems), []);

  return (
    <Container>
      <Row>
        <Text bold size={1}>
          <Text size={2.8}>TITLE PAGES</Text>
          <Text size={1}>in Printed Translations, of</Text>
          <Text size={1.6}>
            the <i>Elements</i>
          </Text>
          <Text size={1.6}>1482–1703</Text>
        </Text>
      </Row>
      <Column minWidth="min(820px, 100%)">
        <Row justifyStart>
          <div>
            <Radio
              name="Mode"
              options={["Texts", "Scans"]}
              value={mode === "images"}
              onChange={(b) => setMode(b ? "images" : "texts")}
            />
          </div>
        </Row>
        <Row justifyStart>
          <div>Filters:</div>
          <MultiSelect
            name="Authors"
            options={allAuthors}
            onChange={setAuthors}
            labelFn={authorDisplayName}
          />
          <MultiSelect name="Cities" options={allCities} onChange={setCities} />
          <MultiSelect
            name="Languages"
            options={allLanguages}
            onChange={setLanguages}
          />
        </Row>
        {mode === "texts" && (
          <Row justifyStart>
            <span>Highlight Segments:</span>
            <MultiSelect
              name="Features"
              defaultValues={features}
              options={Object.keys(FeatureToColumnName)}
              onChange={(f) => setFeatures(f as Feature[])}
              colors={FeatureToColor}
              tooltips={FeatureToTooltip}
            />
          </Row>
        )}
        {mode === "images" && (
          <Radio
            name="Scans"
            options={["All", "Available"]}
            value={requireImage}
            onChange={setRequireImage}
          />
        )}
      </Column>
      <Row>
        {filteredItems?.map((item) => (
          <ItemView
            key={item.key}
            height={tileHeight}
            width={tileWidth}
            item={item}
            mode={mode}
            features={features}
          />
        ))}
      </Row>
      <Text size={1}>
        À la Croisée des Hyperliens, chez la scribe fatiguée et sa féline
        passivement investie, MMXXV.
      </Text>
      <div />
    </Container>
  );
}

export default App;

import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import Select from "react-select";
import { css } from "@emotion/react";
import { images } from "./images.ts";

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

const Row = styled.div<{ justifyStart?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyStart }) => (justifyStart ? "start" : "center")};
  align-items: center;
  gap: 2rem;
  width: 100%;
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

const Title = styled.span`
  font-size: 2rem;
  font-weight: bold;
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
              .filter((raw) => !!raw["TITLE: FORMULATION"])
              .map((raw) => ({
                key: raw["key"] as string,
                year: raw["year"] as string,
                cities: [raw["city"] as string, raw["city 2"] as string].filter(
                  (city) => city,
                ) as string[],
                languages: [
                  raw["language"] as string,
                  raw["language 2"] as string,
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
              .filter((item) => item.languages.includes("FRENCH"))
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

const MultiSelect = ({
  name,
  options,
  onChange,
  defaultValues,
  colors,
}: {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
  defaultValues?: string[];
  colors?: Record<string, string>;
}) => (
  <Select
    isMulti
    name={name}
    defaultValue={defaultValues?.map((v) => ({ value: v, label: v }))}
    options={options.map((option) => ({
      value: option,
      label: option,
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

const TextTile = styled.div`
  ${Tile};
  background-color: aliceblue;
  color: black;
  padding: 1rem;
  overflow: auto;
  height: 90%;
  width: 90%;
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
  return highlighted;
};

const ItemView = ({ item, height, width, mode, features }: ItemProps) => (
  <Column style={{ height, width }}>
    <div>
      {item.year} {item.authors.join(" & ")}, {item.cities.join(", ")}
    </div>
    {mode === "texts" && (
      <TextTile
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
  | "Base content"
  | "Content description"
  | "Author"
  | "Author description"
  | "Euclid mentioned"
  | "Patron"
  | "Edition information"
  | "Additional content"
  | "Privileges"
  | "Other names"
  | "From language"
  | "To language"
  | "Verbs";

const FeatureToColumnName: Record<Feature, string[]> = {
  "Base content": ["TITLE: BASE CONTENT"],
  "Content description": ["TITLE: CONTENT DESC", "TITLE: CONTENT DESC 2"],
  Author: ["TITLE: AUTHOR NAME"],
  "Author description": [
    "TITLE: AUTHOR DESCRIPTION",
    "TITLE: AUTHOR DESCRIPTION 2",
  ],
  "Euclid mentioned": ["EUCLID MENTIONED IN TITLE PAGE"],
  Patron: ["TITLE: PATRON REF"],
  "Edition information": ["TITLE: EDITION INFO"],
  "Additional content": [
    "TITLE: ADDITIONAL CONTENT",
    "TITLE: ADDITIONAL CONTENT 2",
  ],
  Privileges: ["TITLE: PRIVILEGES"],
  "Other names": ["OTHER NAMES"],
  "From language": ["EXPLICITLY STATED: TRANSLATED FROM"],
  "To language": ["EXPLICITLY STATED: TRANSLATED TO"],
  Verbs: ["TITLE: VERBS"],
};

const FeaturesToSplit: Partial<Record<Feature, boolean>> = {
  "Euclid mentioned": true,
  "Other names": true,
  "From language": true,
  "To language": true,
  Verbs: true,
};

const FeatureToColor: Record<Feature, string> = {
  "Base content": "#FADADD",
  "Content description": "#AEC6CF",
  Author: "#909fd7",
  "Author description": "#FFDAB9",
  "Euclid mentioned": "#FFFACD",
  Patron: "#D4C5F9",
  "Edition information": "#FFC1CC",
  "Additional content": "#9783d2",
  Privileges: "#D1E7E0",
  "Other names": "#e567ac",
  "From language": "#25b47e",
  "To language": "#e59c67",
  Verbs: "#954caf",
};

function App() {
  const [items, setItems] = useState<Item[]>();
  const [mode, setMode] = useState<Mode>("texts");
  const [cities, setCities] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
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
    () => (items ? extract(items, "authors") : []),
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
      if (mode === "images" && requireImage) {
        if (!item.imageUrl) {
          return false;
        }
      }
      return true;
    });
  }, [items, cities, authors, mode, requireImage]);

  useEffect(() => loadData(setItems), []);

  return (
    <Container>
      <Row>
        <Title>
          Title Pages in French Printed Translations of the <i>Elements</i>,
          1564–1700
        </Title>
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
          />
          <MultiSelect name="Cities" options={allCities} onChange={setCities} />
        </Row>
        {mode === "texts" && (
          <Row justifyStart>
            <span>Highlight Features:</span>
            <MultiSelect
              name="Features"
              defaultValues={features}
              options={Object.keys(FeatureToColumnName)}
              onChange={(f) => setFeatures(f as Feature[])}
              colors={FeatureToColor}
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
    </Container>
  );
}

export default App;

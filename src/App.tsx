import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import Select from "react-select";
import { useWindowSize } from "@uidotdev/usehooks";
import { css } from "@emotion/react";

const CSV_PATH = "/docs/EiP.csv";

type Item = {
  key: string;
  year: string;
  cities: string[];
  languages?: string[];
  author: string | null;
  imageUrl: string | null;
  title: string;
  titleFormulation: string | null;
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
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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
                author: raw["author (normalized)"] as string | null,
                imageUrl: raw["title page url"] as string | null,
                title: raw["title"] as string,
                titleFormulation: raw["TITLE: FORMULATION"] as string | null,
              }))
              .filter((item) => !!item.titleFormulation),
          );
        },
      });
    })
    .catch((error) => console.error("Error reading CSV:", error));
};

const extract = (items: Item[], property: keyof Item) =>
  items.reduce((acc, item) => {
    if (item[property]) {
      if (Array.isArray(item[property])) {
        item[property].forEach((value) => {
          if (!acc.includes(value)) {
            acc.push(value);
          }
        });
      } else {
        acc.push(item[property]);
      }
    }
    return acc;
  }, [] as string[]);

const MultiSelect = ({
  name,
  options,
  onChange,
}: {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
}) => (
  <Select
    isMulti
    name={name}
    options={options.map((option) => ({
      value: option,
      label: option,
    }))}
    className="basic-multi-select"
    classNamePrefix="select"
    onChange={(selected) => onChange(selected.map((option) => option.value))}
    placeholder={`Select ${name}`}
  />
);

type Mode = "texts" | "images";

type ItemProps = {
  item: Item;
  height: number;
  width: number;
  mode: Mode;
};

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

const ItemView = ({ item, height, width, mode }: ItemProps) => (
  <Column style={{ height, width }}>
    <div>
      {item.year} {item.author}, {item.cities.join(", ")}
    </div>
    {mode === "texts" && <TextTile>{item.title}</TextTile>}
    {mode === "images" &&
      (item.imageUrl ? (
        <ImageTile
          src={item.imageUrl}
          onClick={() => window.open(item.imageUrl!, "_blank")?.focus()}
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
  <Row>
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

function App() {
  const [items, setItems] = useState<Item[]>();
  const [mode, setMode] = useState<Mode>("texts");
  const [cities, setCities] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<boolean>(true);
  const [requireImage, setRequireImage] = useState<boolean>(false);
  const { width } = useWindowSize();
  const [tileColumns, setTileColumns] = useState(1);
  const tileHeight = 400;
  const tileWidth = 400;

  const allCities = useMemo(
    () => (items ? extract(items, "cities") : []),
    [items],
  );

  const allAuthors = useMemo(
    () => (items ? extract(items, "author") : []),
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
        if (item.author && !authors.includes(item.author)) {
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

  useEffect(() => {
    if (width) {
      setTileColumns(Math.max(1, Math.floor(width / tileWidth)));
    }
  }, [width]);

  const itemsMatrix = useMemo(() => {
    return filteredItems?.reduce((acc, item, index) => {
      const rowIndex = Math.floor(index / tileColumns);
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      acc[rowIndex].push(item);
      return acc;
    }, [] as Item[][]);
  }, [filteredItems, tileColumns]);

  return (
    <Container>
      <Row>
        <Title>Elements Title Pages</Title>
      </Row>
      <Row>
        <div>Mode:</div>
        <Select
          name="mode"
          defaultValue={mode}
          options={[
            {
              // @ts-expect-error ...
              value: "texts",
              label: "Texts",
            },
            {
              // @ts-expect-error ...
              value: "images",
              label: "Scans",
            },
          ]}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={(selected) =>
            // @ts-expect-error ...
            setMode(selected.value)
          }
        />
        <div>Filters:</div>
        <MultiSelect
          name="Authors"
          options={allAuthors}
          onChange={setAuthors}
        />
        <MultiSelect name="Cities" options={allCities} onChange={setCities} />
      </Row>
      {mode === "texts" && (
        <Radio
          name="Highlights"
          options={["Hide", "Show"]}
          value={highlights}
          onChange={setHighlights}
        />
      )}
      {mode === "images" && (
        <Radio
          name="Scans"
          options={["All", "Require"]}
          value={requireImage}
          onChange={setRequireImage}
        />
      )}
      {itemsMatrix?.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {(rowIndex % 2 === 0 ? row : row.reverse()).map((item, itemIndex) => (
            <ItemView
              key={itemIndex}
              height={tileHeight}
              width={tileWidth}
              item={item}
              mode={mode}
            />
          ))}
        </Row>
      ))}
    </Container>
  );
}

export default App;

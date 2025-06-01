import styled from "@emotion/styled";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Papa from "papaparse";
import Select from "react-select";
import { css } from "@emotion/react";
import { startCase, uniq } from "lodash";
import RangeSlider from "./RangeSlider";
import useLocalStorageState from "use-local-storage-state";

const CSV_PATH = "/docs/EiP.csv";

const TILE_HEIGHT = 400;
const TILE_WIDTH = 400;

const MIN_YEAR = 1482;
const MAX_YEAR = 1703;

const ItemTypes = {
  elements: "Elements",
  secondary: "Complementary",
};

type Item = {
  key: string;
  year: string;
  cities: string[];
  languages: string[];
  authors: string[];
  imageUrl: string | null;
  title: string;
  titleEn: string | null;
  features: Partial<Record<Feature, string[]>>;
  type: string;
  format: string | null;
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
    @media (max-width: 600px) {
      width: 80vw;
    }
  }
`;

const Row = styled.div<{
  justifyStart?: boolean;
  gap?: number;
  rowGap?: number;
  noWrap?: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyStart }) => (justifyStart ? "start" : "center")};
  align-items: center;
  gap: ${({ gap }) => (gap !== undefined ? gap : 2)}rem;
  ${({ rowGap }) => rowGap && `row-gap: ${rowGap}`};
  width: 100%;
  max-width: 96vw;
  flex-wrap: ${({ noWrap }) => (noWrap ? "nowrap" : "wrap")};
  @media (max-width: 600px) {
    gap: ${({ gap }) => (gap !== undefined ? gap : 1)}rem;
  }
`;

const ResetButton = styled.button`
  background-color: aliceblue;
  color: #282828ff;
  border: unset;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background-color: #e3ecf5ff;
  }
`;

const ToggleButton = styled(ResetButton)<{ isOpen: boolean }>`
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
`;

const Column = styled.div<{ minWidth?: string; alignItems?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: ${(props) => props.alignItems || "center"};
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
                  type: ItemTypes[raw["type"] as keyof typeof ItemTypes],
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
                          !raw["ELEMENTS DESIGNATION"] &&
                          raw["type"] === "elements"
                            ? [raw["BASE CONTENT"] as string]
                            : raw["ELEMENTS DESIGNATION"] === "none" &&
                                raw["type"] === "elements"
                              ? []
                              : acc[feature as Feature];
                      }
                      return acc;
                    },
                    {} as Partial<Record<Feature, string[]>>,
                  ),
                };
              })
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
  value,
}: {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
  defaultValues?: string[];
  colors?: Record<string, string>;
  tooltips?: Record<string, string>;
  labelFn?: (opt: string) => string;
  value?: string[];
}) => (
  <Select
    isMulti
    name={name}
    value={value?.map((v) => ({
      value: v,
      label: tooltips ? (
        <OptionLabel option={v} tooltip={tooltips[v]} />
      ) : labelFn ? (
        labelFn(v)
      ) : (
        v
      ),
    }))}
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

const ScrollbarStyle = css`
  ::-webkit-scrollbar-track {
    background-color: inherit;
  }

  ::-webkit-scrollbar {
    width: 0.5rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #666;
    border-radius: 0.5rem;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #666 inherit;
  }
`;

const TextTile = styled.div<{ alignCenter: boolean }>`
  ${Tile};
  ${ScrollbarStyle};
  background-color: aliceblue;
  color: black;
  padding: 1rem;
  overflow: auto;
  height: 90%;
  width: 90%;
  line-height: 1.8;
  text-align: ${({ alignCenter }) => (alignCenter ? "center" : "start")};
  position: relative;
`;

const ExpandIcon = styled.div`
  position: absolute;
  top: -0.2rem;
  right: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  @media (max-width: 600px) {
    display: none;
  }
`;

const ImageExpandIcon = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  background-color: aliceblue;
  color: black;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  @media (max-width: 600px) {
    display: none;
  }
`;

const ScrollToTopButton = styled(ResetButton)`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition:
    opacity 0.3s,
    transform 0.3s;
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

const ImageTile = styled.div`
  position: relative;
  max-height: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: start;
`;

const StyledImage = styled.img<{ large?: boolean }>`
  ${Tile};
  max-height: ${({ large }) => (large ? "100%" : "90%")};
  max-width: ${({ large }) => (large ? "100%" : "90%")};
  cursor: pointer;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ hasImage: boolean }>`
  background-color: aliceblue;
  min-height: 24rem;
  min-width: 32rem;
  max-width: ${({ hasImage }) => (hasImage ? "90vw" : "60vw")};
  color: black;
  border-radius: 1rem;
  padding: 2rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ModalClose = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
`;

const ModalTitle = styled.div`
  color: darkgray;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ModalMainTitle = styled(Row)`
  font-size: 1.4rem;
  gap: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ModalTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  overflow: auto;
  max-height: calc(90vh - 6rem);
`;

const ModalTextColumn = styled.div<{ isImage?: boolean }>`
  ${ScrollbarStyle};
  flex: 1;
  overflow-y: ${({ isImage }) => (isImage ? "hidden" : "auto")};
  line-height: 1.8;
`;

type ItemProps = {
  item: Item;
  height: number;
  width: number;
  mode: Mode;
  features: Feature[];
};

const LanguagesInfo = styled.div`
  font-size: 0.9rem;
  color: lightgray;
  text-align: center;
`;

const highlightText = (
  text: string,
  features: Feature[],
  mapping: Item["features"],
): string => {
  let highlighted = text;
  features
    .sort((a, b) => mapping[a]?.length || 0 - (mapping[b]?.length || 0))
    .forEach((feature) => {
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

function imageClicked(item: Item) {
  return window
    .open(item.imageUrl?.replace("i.imgur.com", "rimgo.catsarch.com"), "_blank")
    ?.focus();
}

const ItemView = ({ item, height, width, mode, features }: ItemProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Column style={{ height, width }}>
      <div>
        {item.year} {item.authors.join(" & ") || "s.n."},{" "}
        {item.cities.join(", ") || "s.l."}
        <LanguagesInfo>{item.languages.join(" & ")}</LanguagesInfo>
      </div>
      {mode === "texts" && (
        <>
          {item.title === "?" ? (
            <NoImageTile>No title page</NoImageTile>
          ) : (
            <>
              <TextTile alignCenter={!!item.imageUrl}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: highlightText(item.title, features, item.features),
                  }}
                />
                <ExpandIcon title="Expand" onClick={() => setModalOpen(true)}>
                  ⤢
                </ExpandIcon>
              </TextTile>
            </>
          )}
        </>
      )}
      {mode === "images" &&
        (item.imageUrl ? (
          <ImageTile>
            <StyledImage
              src={item.imageUrl}
              onClick={() => imageClicked(item)}
            />
            <ImageExpandIcon
              title="Expand"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              ⤢
            </ImageExpandIcon>
          </ImageTile>
        ) : (
          <NoImageTile>Not Available</NoImageTile>
        ))}

      {modalOpen && (
        <Modal onClick={() => setModalOpen(false)}>
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            hasImage={!!item.imageUrl}
          >
            <ModalClose title="Close" onClick={() => setModalOpen(false)}>
              ✕
            </ModalClose>
            <ModalMainTitle>
              <span>{item.year}</span>
              <span>{item.authors.join(" & ") || "s.n."}</span>
              <span>{item.cities.join(", ") || "s.l."}</span>
              <span>{item.languages.join(" & ")}</span>
            </ModalMainTitle>
            <ModalTextContainer>
              {item.imageUrl && (
                <ModalTextColumn isImage>
                  <StyledImage
                    large
                    src={item.imageUrl}
                    onClick={() => imageClicked(item)}
                  />
                </ModalTextColumn>
              )}
              <ModalTextColumn>
                <ModalTitle>Original Text</ModalTitle>
                <div
                  dangerouslySetInnerHTML={{
                    __html: highlightText(item.title, features, item.features),
                  }}
                />
              </ModalTextColumn>
              {item.titleEn && (
                <ModalTextColumn>
                  <ModalTitle>English Translation</ModalTitle>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item.titleEn, [], {}),
                    }}
                  />
                </ModalTextColumn>
              )}
            </ModalTextContainer>
          </ModalContent>
        </Modal>
      )}
    </Column>
  );
};

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
  | "Euclid Description"
  | "Verbs"
  | "Recipients"
  | "Elements Designation"
  | "Greek designation";

const FeatureToColumnName: Record<Feature, string[]> = {
  "Elements Designation": ["ELEMENTS DESIGNATION"],
  "Base Content": ["BASE CONTENT"],
  "Base Content Description": ["CONTENT DESC", "CONTENT DESC 2"],
  "Adapter Attribution": ["AUTHOR NAME", "AUTHOR NAME 2"],
  "Adapter Description": [
    "AUTHOR DESCRIPTION",
    "AUTHOR DESCRIPTION 2",
  ],
  "Patronage Dedication": ["PATRON REF"],
  "Edition Statement": ["EDITION INFO", "EDITION INFO 2"],
  "Supplementary Content": [
    "ADDITIONAL CONTENT",
    "ADDITIONAL CONTENT 2",
  ],
  "Publishing Privileges": ["PRIVILEGES"],
  "Other Educational Authorities": [
    "OTHER NAMES",
    "EUCLID REF",
  ],
  "Explicit Language References": [
    "EXPLICITLY STATED: TRANSLATED FROM",
    "EXPLICITLY STATED: TRANSLATED TO",
  ],
  "Euclid Description": [
    "EUCLID DESCRIPTION",
    "EUCLID DESCRIPTION 2",
  ],
  Verbs: ["VERBS"],
  Recipients: ["EXPLICIT RECIPIENT", "EXPLICIT RECIPIENT 2"],
  "Greek designation": ["GREEK IN NON GREEK BOOKS"],
};

const FeaturesToSplit: Partial<Record<Feature, boolean>> = {
  "Other Educational Authorities": true,
  "Explicit Language References": true,
  Verbs: true,
};

// todo: Lir fyi
const FeaturesNotSelectedByDefault: Feature[] = [
  "Greek designation",
  "Elements Designation",
  "Base Content Description",
  "Supplementary Content",
];

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
  "Euclid Description": "#b0e57c",
  Verbs: "#954caf",
  Recipients: "#F7E779",
  "Elements Designation": "#A3D5C3",
  "Greek designation": "#F0B2A1",
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
  "Euclid Description":
    "Statements describing the work as a translation of Euclid’s Elements, or as a commentary on it, or as an edition of it.",
  "Explicit Language References":
    "Statements identifying the source language (e.g., Latin or Greek) and/or the target language.",
  Verbs:
    "Action verbs such as traduit (translated), commenté (commented), augmenté (expanded) that describe the role the contemporary scholar played in bringing about the work.",
  Recipients: "Explicit mentions of the work's recipients.",
  "Elements Designation":
    "The designation of the Elements, such as 'Elements of Geometry' or 'Euclid’s Elements', as it appears on the title page.",
  "Greek designation": "Greek designation of the book in non-Greek books.",
};

function App() {
  const [items, setItems] = useState<Item[] | undefined>();
  const [mode, setMode] = useLocalStorageState<Mode>("mode", {
    defaultValue: "texts",
  });
  const [cities, setCities] = useLocalStorageState<string[]>("cities", {
    defaultValue: [],
  });
  const [authors, setAuthors] = useLocalStorageState<string[]>("authors", {
    defaultValue: [],
  });
  const [languages, setLanguages] = useLocalStorageState<string[]>(
    "languages",
    {
      defaultValue: [],
    },
  );
  const [types, setTypes] = useLocalStorageState<string[]>("types", {
    defaultValue: ["Elements"],
  });
  const [formats, setFormats] = useLocalStorageState<string[]>("formats", {
    defaultValue: [],
  });
  const [requireImage, setRequireImage] = useLocalStorageState<boolean>(
    "requireImage",
    {
      defaultValue: false,
    },
  );
  const [yearRange, setYearRange] = useLocalStorageState<[number, number]>(
    "yearRange",
    {
      defaultValue: [MIN_YEAR, MAX_YEAR],
    },
  );
  const [features, setFeatures] = useLocalStorageState<Feature[]>("features", {
    defaultValue: Object.keys(FeatureToColumnName) as Feature[],
  });
  const [controlsOpen, setControlsOpen] = useLocalStorageState<boolean>(
    "controlsOpen",
    {
      defaultValue: true,
    },
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollTop(scrollTop > 200);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  const allTypes = useMemo(
    () => (items ? extract(items, "type") : []),
    [items],
  );

  const allFormats = useMemo(
    () => (items ? extract(items, "format").filter(Boolean) : []),
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
      if (types.length) {
        if (!types.includes(item.type)) {
          return false;
        }
      }
      if (formats.length) {
        if (!item.format || !formats.includes(item.format)) {
          return false;
        }
      }
      if (mode === "images" && requireImage) {
        if (!item.imageUrl) {
          return false;
        }
      }
      const year = parseInt(item.year);
      if (!isNaN(year) && (year < yearRange[0] || year > yearRange[1])) {
        return false;
      }
      return true;
    });
  }, [
    items,
    cities,
    authors,
    languages,
    types,
    formats,
    mode,
    requireImage,
    yearRange,
  ]);

  useEffect(() => {
    if (!items) {
      loadData(setItems);
    }
  }, [items, setItems]);

  return (
    <Container>
      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} title="Scroll to top">
          ↑
        </ScrollToTopButton>
      )}
      <Row>
        <Text bold size={1}>
          <Text size={2.8}>TITLE PAGES</Text>
          <Text size={1}>in Printed Translations, of</Text>
          <Text size={1.6}>
            the <i>Elements</i>
          </Text>
          <Text size={1.6}>
            {MIN_YEAR}–{MAX_YEAR}
          </Text>
        </Text>
      </Row>
      <Column minWidth="min(820px, 90%)">
        <Row justifyStart>
          <ToggleButton
            onClick={() => setControlsOpen(!controlsOpen)}
            isOpen={controlsOpen}
          >
            <span>{controlsOpen ? "▲" : "▼"}</span>
            {controlsOpen ? "Hide Controls" : "Show Controls"}
            <span>{controlsOpen ? "▲" : "▼"}</span>
          </ToggleButton>
        </Row>

        {controlsOpen && (
          <>
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
                value={authors}
              />
              <MultiSelect
                name="Cities"
                options={allCities}
                onChange={setCities}
                value={cities}
              />
              <MultiSelect
                name="Languages"
                options={allLanguages}
                onChange={setLanguages}
                value={languages}
              />
              <MultiSelect
                name="Types"
                options={allTypes}
                onChange={setTypes}
                value={types}
              />
              <MultiSelect
                name="Formats"
                options={allFormats}
                onChange={setFormats}
                value={formats}
              />
            </Row>
            <Row justifyStart>
              <RangeSlider
                name="Year Range"
                value={yearRange}
                min={MIN_YEAR}
                max={MAX_YEAR}
                onChange={setYearRange}
              />
            </Row>
            {mode === "texts" && (
              <Row justifyStart>
                <Column alignItems="end">
                  <span>Highlight Segments:</span>
                  <ResetButton
                    onClick={() =>
                      // filter out features not selected by default
                      setFeatures(
                        Object.keys(FeatureToColumnName).filter(
                          (f) =>
                            !FeaturesNotSelectedByDefault.includes(
                              f as Feature,
                            ),
                        ) as Feature[],
                      )
                    }
                  >
                    Reset
                  </ResetButton>
                </Column>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <MultiSelect
                    name="Features"
                    value={features}
                    options={Object.keys(FeatureToColumnName)}
                    onChange={(f) => setFeatures(f as Feature[])}
                    colors={FeatureToColor}
                    tooltips={FeatureToTooltip}
                  />
                </div>
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
          </>
        )}
      </Column>
      <Row rowGap={6}>
        {filteredItems?.map((item) => (
          <ItemView
            key={item.key}
            height={TILE_HEIGHT}
            width={TILE_WIDTH}
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

export { Row };
export default App;

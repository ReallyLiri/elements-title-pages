import React, { useCallback, useEffect, useMemo, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { Feature, Item, Mode } from "./types";
import {
  Column,
  Container,
  ResetButton,
  Row,
  ScrollToTopButton,
  Text,
  ToggleButton,
} from "./components/common.ts";
import {
  FeaturesNotSelectedByDefault,
  FeatureToColor,
  FeatureToColumnName,
  FeatureToTooltip,
  MAX_YEAR,
  MIN_YEAR,
} from "./constants";
import { authorDisplayName, extract, loadData } from "./utils/dataUtils";
import MultiSelect from "./components/filters/MultiSelect";
import Radio from "./components/filters/Radio";
import RangeSlider from "./components/filters/RangeSlider";
import ItemView from "./components/features/ItemView";

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
            height={400}
            width={400}
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

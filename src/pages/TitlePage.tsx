import { isEmpty } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { Feature, Mode } from "../types";
import {
  Column,
  Container,
  ResetButton,
  Row,
  ScrollToTopButton,
  Text,
  ToggleButton,
} from "../components/common";
import {
  FeaturesNotSelectedByDefault,
  FeatureToColor,
  FeatureToColumnName,
  FeatureToTooltip,
  MAX_YEAR,
  MIN_YEAR,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "../constants";
import MultiSelect from "../components/tps/filters/MultiSelect";
import Radio from "../components/tps/filters/Radio";
import ItemView from "../components/tps/features/ItemView";
import { useFilter } from "../contexts/FilterContext";

function TitlePage() {
  const { filteredItems } = useFilter();

  const [mode, setMode] = useLocalStorageState<Mode>("tp-mode", {
    defaultValue: "texts",
  });
  const [requireImage, setRequireImage] = useLocalStorageState<boolean>(
    "tp-requireImage",
    {
      defaultValue: false,
    },
  );
  const [features, setFeatures] = useLocalStorageState<Feature[]>(
    "tp-features",
    {
      defaultValue: Object.keys(FeatureToColumnName) as Feature[],
    },
  );
  const [requiredFeatures, setRequiredFeatures] = useLocalStorageState<
    Feature[]
  >("tp-requiredFeatures", {
    defaultValue: [] as Feature[],
  });
  const [controlsOpen, setControlsOpen] = useLocalStorageState<boolean>(
    "tp-controlsOpen",
    {
      defaultValue: false,
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

  // Further filter the already filtered items from the global context
  const pageFilteredItems = useMemo(() => {
    return filteredItems?.filter((item) => {
      // Apply title page specific filters
      if (requiredFeatures.length) {
        const hasFeature =
          item.title !== "?" &&
          requiredFeatures.every(
            (f) => !isEmpty(item.features[f]?.filter(Boolean)),
          );
        if (!hasFeature) {
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
  }, [filteredItems, requiredFeatures, mode, requireImage]);

  return (
    <Container style={{ position: "relative", margin: "2rem 0" }}>
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
            {mode === "texts" && (
              <Row justifyStart noWrap>
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
                <Column alignItems="end">
                  <span>Required Features:</span>
                  <ResetButton onClick={() => setRequiredFeatures([])}>
                    Reset
                  </ResetButton>
                </Column>
                <div>
                  <MultiSelect
                    name="Required features"
                    options={Object.keys(FeatureToColumnName)}
                    onChange={(f) => setRequiredFeatures(f as Feature[])}
                    value={requiredFeatures}
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
        {pageFilteredItems?.map((item) => (
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

export default TitlePage;

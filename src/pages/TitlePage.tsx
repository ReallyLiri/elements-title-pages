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
} from "../components/common";
import {
  FeaturesNotSelectedByDefault,
  FeatureToColor,
  FeatureToColumnName,
  FeatureToTooltip,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "../constants";
import MultiSelect from "../components/tps/filters/MultiSelect";
import Radio from "../components/tps/filters/Radio";
import ItemView from "../components/tps/features/ItemView";
import { useFilter } from "../contexts/FilterContext";
import { Switch, SwitchOption } from "../components/map/Switch.tsx";

function TitlePage() {
  const { filteredItems } = useFilter();

  const [titlePagesModeOn, setTitlePagesModeOn] = useLocalStorageState<boolean>(
    "tp-on",
    {
      defaultValue: false,
    },
  );
  const [mode, setMode] = useLocalStorageState<Mode>("tp-mode", {
    defaultValue: "images",
  });
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

  const pageFilteredItems = useMemo(() => {
    return filteredItems?.filter((item) => {
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
      return true;
    });
  }, [filteredItems, requiredFeatures]);

  return (
    <Container style={{ position: "relative", margin: "2rem 0" }}>
      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} title="Scroll to top">
          ↑
        </ScrollToTopButton>
      )}
      <Column minWidth="min(820px, 90%)">
        <Row>
          <Switch>
            <SwitchOption
              selected={titlePagesModeOn}
              onClick={() => setTitlePagesModeOn(true)}
              title="Include only selected values"
            >
              Title Pages Research View
            </SwitchOption>
            <SwitchOption
              selected={!titlePagesModeOn}
              onClick={() => {
                setMode("images");
                setTitlePagesModeOn(false);
              }}
              title="Exclude all selected values"
            >
              Title Pages Research Off
            </SwitchOption>
          </Switch>
        </Row>
        {titlePagesModeOn && (
          <>
            <Radio
              name="View"
              options={["Texts", "Images"]}
              value={mode === "images"}
              onChange={(b) => setMode(b ? "images" : "texts")}
            />
            <Row justifyStart noWrap>
              <Column alignItems="end">
                <span>Highlight Segments:</span>
                <ResetButton
                  onClick={() =>
                    setFeatures(
                      Object.keys(FeatureToColumnName).filter(
                        (f) =>
                          !FeaturesNotSelectedByDefault.includes(f as Feature),
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
            features={titlePagesModeOn ? features : null}
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

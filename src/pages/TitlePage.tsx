import { useCallback, useEffect, useState } from "react";
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
import { IoWarning } from "react-icons/io5";
import styled from "@emotion/styled";
import Switch from "react-switch";
import { MARKER_3 } from "../utils/colors.ts";

const NoteLine = styled(Row)`
  opacity: 0.8;
`;

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

  return (
    <Container style={{ position: "relative", margin: "2rem 0" }}>
      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} title="Scroll to top">
          ↑
        </ScrollToTopButton>
      )}
      <Column minWidth="min(820px, 90%)">
        <Row gap={0.5}>
          Title Pages Experiment View{" "}
          <Switch
            onColor={MARKER_3}
            activeBoxShadow={`0 0 2px 3px ${MARKER_3}`}
            onChange={() =>
              setTitlePagesModeOn((b) => {
                if (b) {
                  setMode("texts");
                }
                return !b;
              })
            }
            checked={titlePagesModeOn}
          />
        </Row>
        {titlePagesModeOn && (
          <>
            <Radio
              name="Show"
              options={["Texts", "Images"]}
              value={mode === "images"}
              onChange={(b) => setMode(b ? "images" : "texts")}
            />
            <Row justifyStart noWrap>
              <Column alignItems="end">
                <span>Highlight Segments:</span>
              </Column>
              <MultiSelect
                name="Features"
                value={features}
                options={Object.keys(FeatureToColumnName)}
                onChange={(f) => setFeatures(f as Feature[])}
                colors={FeatureToColor}
                tooltips={FeatureToTooltip}
                className="features-multi-select"
              />
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
            </Row>
            <NoteLine gap={0.5}>
              <IoWarning /> Highlighted features were partially identified using
              an LLM and may not be accurate.
            </NoteLine>
          </>
        )}
      </Column>
      <Row rowGap={6}>
        {filteredItems
          ?.sort((a, b) => {
            if (!a.year) return 1;
            if (!b.year) return -1;
            return a.year.localeCompare(b.year);
          })
          .map((item) => (
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
        À la Croisée des Hyperliens, chez le scribe fatigué et son félin
        passivement investi, MMXXV.
      </Text>
      <div />
    </Container>
  );
}

export default TitlePage;

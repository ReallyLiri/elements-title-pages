import { Feature, Item } from "../../types";
import {
  collectRanges,
  segmentTextByCharacter,
} from "../../utils/highlightUtils";
import { FeatureToColor } from "../../constants";
import styled from "@emotion/styled";

const Container = styled.div`
  position: relative;
  white-space: pre-wrap;
`;

const TextWrapper = styled.span`
  position: relative;
  display: inline-block;
`;

const Text = styled.span<{ zIndex: number }>`
  position: relative;
  z-index: ${(props) => props.zIndex};
  padding: 2px;
`;

type HighlightedTextProps = {
  text: string;
  features: Feature[];
  mapping: Item["features"];
};

export const HighlightedText = ({
  text,
  features,
  mapping,
}: HighlightedTextProps) => {
  const ranges = collectRanges(
    text,
    features.sort(
      (a, b) => (mapping[a]?.length || 0) - (mapping[b]?.length || 0),
    ),
    mapping,
  );
  const segments = segmentTextByCharacter(text, ranges);

  return (
    <Container>
      {segments.map((seg, i) => (
        <TextWrapper key={i}>
          {seg.features.map((feature, j) => (
            <div
              key={j}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: "8px",
                ...(feature === "Verbs"
                  ? {
                      zIndex: 100,
                      border: `2px solid ${FeatureToColor[feature]}`,
                      width: `calc(100% + 4px)`,
                      height: `calc(100% + 4px)`,
                      transform: `translate(-4px, -4px)`,
                    }
                  : {
                      zIndex: j,
                      padding: 2,
                      transform: `translate(-${(seg.features.length - 1 - j) * 2}px, -${(seg.features.length - 1 - j) * 2}px)`,
                      height: `calc(100% + ${(seg.features.length - 1 - j) * 4}px)`,
                      width: `calc(100% + ${(seg.features.length - 1 - j) * 4}px)`,
                      backgroundColor: FeatureToColor[feature as Feature],
                    }),
              }}
            />
          ))}
          <Text zIndex={seg.features.length}>{seg.text}</Text>
        </TextWrapper>
      ))}
    </Container>
  );
};

const highlightTextV1 = (
  text: string,
  features: Feature[],
  mapping: Item["features"],
): string => {
  let highlighted = text;

  features
    .sort((a, b) => (mapping[b]?.length || 0) - (mapping[a]?.length || 0))
    .forEach((feature) => {
      mapping[feature]?.forEach((phrase) => {
        const style =
          feature === "Verbs"
            ? `border: 2px solid ${FeatureToColor[feature]}; padding: 2px; border-radius: 8px;`
            : `background-color: ${FeatureToColor[feature]}; padding: 2px; border-radius: 8px;`;

        const normalized = phrase.replace(/\s+/g, "");
        const pattern = normalized
          .split("")
          .map((char) => escapeRegExpLoose(char) + "(?:\\s+|\\n)*")
          .join("");
        const regex = new RegExp(pattern, "giu");

        highlighted = highlighted.replace(regex, (match) => {
          return `<span style="${style}">${match}</span>`;
        });
      });
    });

  highlighted = highlighted.replaceAll("\n", "<br/>");
  highlighted = highlighted.replace(
    /\[(.*?)]:/g,
    "<span style='font-size: 0.8rem; opacity: .8'>[$1]:</span>",
  );
  return highlighted;
};

function escapeRegExpLoose(str: string): string {
  return str.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

const HighlightedTextV1 = ({
  text,
  features,
  mapping,
}: HighlightedTextProps) => (
  <div
    dangerouslySetInnerHTML={{
      __html: highlightTextV1(text, features, mapping),
    }}
  />
);

export default HighlightedTextV1;

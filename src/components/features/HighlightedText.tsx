import { Feature, Item } from "../../types";
import { FeatureToColor } from "../../constants";
import { trimEnd } from "lodash";

type HighlightedTextProps = {
  text: string;
  features: Feature[];
  mapping: Item["features"];
};

const highlightLayers = (
  text: string,
  features: Feature[],
  mapping: Item["features"],
): string[] => {
  const layers: string[] = [];
  const allPositions: Array<{
    start: number;
    end: number;
    feature: Feature;
    featureIndex: number;
  }> = [];

  features.forEach((feature, featureIndex) => {
    const phrases = mapping[feature];
    if (!phrases?.length) return;

    phrases.forEach((phrase) => {
      const normalized = phrase.replace(/\s+|-/g, "");
      const pattern = normalized
        .split("")
        .map((char) => escapeRegExpLoose(char) + "(?:\\s+|\\n|-)*")
        .join("");

      const regex = new RegExp(pattern, "giu");
      const matches = Array.from(text.matchAll(regex));

      matches.forEach((match) => {
        if (match.index !== undefined) {
          allPositions.push({
            start: match.index,
            end: match.index + match[0].length,
            feature,
            featureIndex,
          });
        }
      });
    });
  });

  features.forEach((feature, featureIndex) => {
    const phrases = mapping[feature];
    if (!phrases?.length) return;

    let layer = text;

    phrases
      .map((phrase) => trimEnd(phrase.trim(), ",."))
      .forEach((phrase) => {
        const normalized = phrase.replace(/\s+|-/g, "");
        const pattern = normalized
          .split("")
          .map((char) => escapeRegExpLoose(char) + "(?:\\s+|\\n|-)*")
          .join("");
        const regex = new RegExp(pattern, "giu");

        layer = layer.replace(regex, (match) => {
          const shadowSize =
            2 + calculateIntersections(feature, featureIndex, allPositions) * 2;

          const style =
            feature === "Verbs"
              ? `outline: 2px solid ${FeatureToColor[feature]}; outline-offset: 1px; border-radius: 8px;`
              : `background-color: ${FeatureToColor[feature]}; box-shadow: 0 0 0 ${shadowSize}px ${FeatureToColor[feature]}; border-radius: 8px;`;

          return `<span style="${style}">${match}</span>`;
        });
      });

    layer = layer.replaceAll("\n", "<br/>");
    layers.push(layer);
  });

  return layers;
};

function calculateIntersections(
  feature: Feature,
  featureIndex: number,
  allPositions: Array<{
    start: number;
    end: number;
    feature: Feature;
    featureIndex: number;
  }>,
): number {
  let intersections = 0;

  const currentFeaturePositions = allPositions.filter(
    (p) => p.feature === feature && p.featureIndex === featureIndex,
  );

  if (currentFeaturePositions.length === 0) return 0;

  const higherLayerPositions = allPositions.filter(
    (p) => p.featureIndex > featureIndex,
  );

  currentFeaturePositions.forEach((currentPos) => {
    higherLayerPositions.forEach((higherPos) => {
      if (
        currentPos.start <= higherPos.end &&
        currentPos.end >= higherPos.start
      ) {
        intersections++;
      }
    });
  });

  return intersections;
}

const HighlightedText = ({ text, features, mapping }: HighlightedTextProps) => {
  text = text.replace(
    /\[(.*?)]:/g,
    "<span style='font-size: 0.8rem; opacity: .8'>[$1]:</span>",
  );
  const layers = highlightLayers(
    text,
    features.sort(
      (a, b) => (mapping[a]?.length || 0) - (mapping[b]?.length || 0),
    ),
    mapping,
  );

  return (
    <div style={{ position: "relative", whiteSpace: "pre-wrap" }}>
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            color: "transparent",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: i,
          }}
          dangerouslySetInnerHTML={{ __html: layer }}
        />
      ))}
      <div
        style={{ position: "relative", zIndex: layers.length }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

function escapeRegExpLoose(str: string): string {
  return str.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

export default HighlightedText;

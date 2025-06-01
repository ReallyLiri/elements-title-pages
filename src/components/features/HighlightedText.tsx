import { Feature, Item } from "../../types";
import { FeatureToColor } from "../../constants";
import { trimEnd } from "lodash";
import { useEffect, useState, useMemo, memo } from "react";

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
    const phrases = mapping[feature]?.filter((f) => f.trim().length >= 2);
    if (!phrases) {
      return;
    }

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
          const shadowSize = Math.min(
            6,
            2 + calculateIntersections(feature, featureIndex, allPositions) * 2,
          );

          const style =
            feature === "Verbs"
              ? `outline: 2px solid ${FeatureToColor[feature]}; outline-offset: 2px; border-radius: 8px;`
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

function escapeRegExpLoose(str: string): string {
  return str.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

const getTotalLength = (arr?: string[]) =>
  arr?.reduce((sum, str) => sum + str.length, 0) || 0;

const HighlightedText = memo(
  ({ text, features, mapping }: HighlightedTextProps) => {
    const [isReady, setIsReady] = useState(false);
    const [processedLayers, setProcessedLayers] = useState<string[]>([]);
    const [processedText, setProcessedText] = useState("");

    const computeHighlights = useMemo(() => {
      return new Promise<{ layers: string[]; processedText: string }>(
        (resolve) => {
          setTimeout(() => {
            const formattedText = text.replace(
              /\[(.*?)]:/g,
              "<span style='font-size: 0.8rem; opacity: .8'>[$1]:</span>",
            );

            const sortedFeatures = features.sort((a, b) => {
              if (a === "Verbs") return 1;
              if (b === "Verbs") return -1;
              return getTotalLength(mapping[b]) - getTotalLength(mapping[a]);
            });

            const layers = highlightLayers(
              formattedText,
              sortedFeatures,
              mapping,
            );
            resolve({ layers, processedText: formattedText });
          }, 0);
        },
      );
    }, [text, features, mapping]);

    useEffect(() => {
      setIsReady(false);
      let isMounted = true;

      computeHighlights.then(({ layers, processedText }) => {
        if (isMounted) {
          setProcessedLayers(layers);
          setProcessedText(processedText);
          setIsReady(true);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [computeHighlights]);

    if (!isReady) {
      return (
        <div style={{ position: "relative", whiteSpace: "pre-wrap" }}>
          <div
            style={{ position: "relative" }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: "relative", whiteSpace: "pre-wrap" }}>
        {processedLayers.map((layer, i) => (
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
          style={{ position: "relative", zIndex: processedLayers.length }}
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      </div>
    );
  },
);

export default HighlightedText;

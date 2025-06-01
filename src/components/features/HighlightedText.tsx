import { Feature, Item } from "../../types";
import { FeatureToColor } from "../../constants";

type HighlightedTextProps = {
  text: string;
  features: Feature[];
  mapping: Item["features"];
};

function escapeRegExpLoose(str: string): string {
  return str.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

function buildSpans(
  text: string,
  mapping: Record<string, string[]>,
): string[][] {
  const spans: string[][] = Array.from({ length: text.length }, () => []);

  Object.entries(mapping).forEach(([feature, phrases]) => {
    phrases.forEach((phrase) => {
      const normalized = phrase.replace(/\s+/g, "");
      const pattern = normalized
        .split("")
        .map((char) => escapeRegExpLoose(char) + "(?:\\s+|\\n)*")
        .join("");
      const regex = new RegExp(pattern, "giu");

      let match;
      while ((match = regex.exec(text)) !== null) {
        for (let i = match.index; i < match.index + match[0].length; i++) {
          if (i < spans.length) spans[i].push(feature);
        }
      }
    });
  });

  return spans;
}

function segmentByFeatures(
  text: string,
  spans: string[][],
): { text: string; features: string[] }[] {
  const segments: { text: string; features: string[] }[] = [];

  let i = 0;
  while (i < text.length) {
    const currentFeatures = spans[i];
    let j = i + 1;
    while (
      j < text.length &&
      JSON.stringify(spans[j]) === JSON.stringify(currentFeatures)
    ) {
      j++;
    }

    segments.push({
      text: text.slice(i, j),
      features: currentFeatures,
    });

    i = j;
  }

  return segments;
}

const HighlightedText = ({ text, features, mapping }: HighlightedTextProps) => {
  const spans = buildSpans(text, mapping);
  const segments = segmentByFeatures(text, spans);

  const featureLayers = features.filter((f) => f !== "Verbs");

  return (
    <div style={{ position: "relative", whiteSpace: "pre-wrap" }}>
      {featureLayers.map((feature, z) => (
        <div
          key={feature}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            color: "transparent",
            zIndex: z,
          }}
        >
          {segments.map((seg, i) => {
            if (!seg.features.includes(feature)) {
              return <span key={i}>{seg.text}</span>;
            }

            const overlap = seg.features.filter((f) => f !== feature).length;
            const shadowSize = 4 + overlap * 2;

            const style = {
              backgroundColor: FeatureToColor[feature],
              boxShadow: overlap
                ? `0 0 0 ${shadowSize}px ${FeatureToColor[feature]}`
                : undefined,
              borderRadius: 8,
              display: "inline-block",
              padding: "0 2px",
            };

            return (
              <span key={i} style={style}>
                {seg.text}
              </span>
            );
          })}
        </div>
      ))}

      <div style={{ position: "relative", zIndex: features.length }}>
        {segments.map((seg, i) => {
          if (!seg.features.includes("Verbs")) {
            return <span key={i}>{seg.text}</span>;
          }

          const style = {
            outline: `2px solid ${FeatureToColor["Verbs"]}`,
            outlineOffset: 2,
            borderRadius: 8,
            display: "inline-block",
            padding: "0 2px",
          };

          return (
            <span key={i} style={style}>
              {seg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default HighlightedText;

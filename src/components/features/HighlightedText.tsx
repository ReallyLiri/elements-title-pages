import { Feature, Item } from "../../types";
import { FeatureToColor } from "../../constants";

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

  features.forEach((feature) => {
    const phrases = mapping[feature];
    if (!phrases?.length) return;

    let layer = text;

    phrases.forEach((phrase) => {
      const style =
        feature === "Verbs"
          ? `outline: 2px solid ${FeatureToColor[feature]}; outline-offset: 2px; border-radius: 8px;`
          : `background-color: ${FeatureToColor[feature]}; box-shadow: 0 0 0 4px ${FeatureToColor[feature]}; border-radius: 8px;`;

      const normalized = phrase.replace(/\s+/g, "");
      const pattern = normalized
        .split("")
        .map((char) => escapeRegExpLoose(char) + "(?:\\s+|\\n)*")
        .join("");
      const regex = new RegExp(pattern, "giu");

      layer = layer.replace(
        regex,
        (match) => `<span style="${style}">${match}</span>`,
      );
    });

    layer = layer.replaceAll("\n", "<br/>");
    layers.push(layer);
  });

  return layers;
};

const HighlightedText = ({ text, features, mapping }: HighlightedTextProps) => {
  const layers = highlightLayers(text, features, mapping);

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

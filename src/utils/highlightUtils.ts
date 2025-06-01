import { Feature, Item, Range } from "../types";
import { FeatureToColor } from "../constants";

export function collectRanges(
  text: string,
  features: Feature[],
  mapping: Item["features"],
): Range[] {
  const ranges: Range[] = [];
  for (const feature of features) {
    const matches = mapping[feature] ?? [];
    matches
      .sort((a, b) => b.length - a.length)
      .forEach((match) => {
        const escaped = match.trim();
        if (!escaped) return;
        let startIndex = 0;
        while ((startIndex = text.indexOf(escaped, startIndex)) !== -1) {
          ranges.push({
            start: startIndex,
            end: startIndex + escaped.length,
            feature,
          });
          startIndex += escaped.length;
        }
      });
  }

  const sorted = [...ranges].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });

  const merged: Range[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (
      last &&
      last.feature === range.feature &&
      last.end >= range.start - 1 // merge if overlapping or adjacent
    ) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

export function segmentTextByCharacter(text: string, ranges: Range[]) {
  const segments: { text: string; features: string[] }[] = [];

  const featureMap: string[][] = Array.from({ length: text.length }, () => []);

  for (const range of ranges) {
    for (let i = range.start; i < range.end; i++) {
      featureMap[i].push(range.feature);
    }
  }

  let i = 0;
  while (i < text.length) {
    const currentFeatures = featureMap[i];
    let j = i + 1;
    while (
      j < text.length &&
      JSON.stringify(featureMap[j]) === JSON.stringify(currentFeatures)
    ) {
      j++;
    }
    const currText = text.slice(i, j);
    if (currText.trim() !== "") {
      segments.push({
        text: text.slice(i, j),
        features: currentFeatures,
      });
    }
    i = j;
  }

  return segments;
}

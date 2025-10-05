import {
  DIAGRAMS_CROPS_FOLDER,
  DIAGRAMS_PATH_BASE,
  GITHUB_CONTENT_URL,
} from "../constants";

export interface DiagramsResult {
  images: string[];
  hasNoDiagrams: boolean;
  error?: string;
}

export const buildDiagramImageUrl = (
  key: string,
  imageName: string,
): string => {
  return `${GITHUB_CONTENT_URL}/${DIAGRAMS_PATH_BASE}/${key}/${DIAGRAMS_CROPS_FOLDER}/${imageName}`;
};

export const fetchDiagrams = async (key: string): Promise<DiagramsResult> => {
  if (!key) {
    return {
      images: [],
      hasNoDiagrams: false,
      error: "No key provided",
    };
  }

  try {
    const response = await fetch(`/docs/diagrams/${key}.json`);

    if (!response.ok) {
      return {
        images: [],
        hasNoDiagrams: true,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return {
      images: [],
      hasNoDiagrams: false,
      error: "Failed to load diagrams",
    };
  }
};

export const fetchDiagramDirectories = async (): Promise<Set<string>> => {
  try {
    const response = await fetch("/docs/diagram-directories.json");

    if (!response.ok) {
      console.error("Failed to fetch diagram directories");
      return new Set();
    }

    const directories = await response.json();
    return new Set(directories);
  } catch (error) {
    console.error("Error fetching diagram directories:", error);
    return new Set();
  }
};

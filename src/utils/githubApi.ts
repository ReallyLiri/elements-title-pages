import {
  GITHUB_API_BASE_URL,
  GITHUB_RAW_BASE_URL,
  DIAGRAMS_PATH_BASE,
  DIAGRAMS_NONE_FILE,
  DIAGRAMS_CROPS_FOLDER,
} from "../constants";

interface GitHubFile {
  name: string;
  type: string;
  download_url?: string;
}

export interface DiagramsResult {
  images: string[];
  hasNoDiagrams: boolean;
  error?: string;
}

const buildApiUrl = (path: string): string => {
  return `${GITHUB_API_BASE_URL}/contents/${path}`;
};

export const buildDiagramImageUrl = (
  key: string,
  imageName: string,
): string => {
  return `${GITHUB_RAW_BASE_URL}/${DIAGRAMS_PATH_BASE}/${key}/${DIAGRAMS_CROPS_FOLDER}/${imageName}`;
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
    const cropsUrl = buildApiUrl(
      `${DIAGRAMS_PATH_BASE}/${key}/${DIAGRAMS_CROPS_FOLDER}`,
    );
    const cropsResponse = await fetch(cropsUrl);

    if (!cropsResponse.ok) {
      return {
        images: [],
        hasNoDiagrams: true,
      };
    }

    const cropsData = await cropsResponse.json();

    if (Array.isArray(cropsData)) {
      const jpgFiles = cropsData
        .filter((file: GitHubFile) => file.name.endsWith(".jpg"))
        .map((file: GitHubFile) => file.name);

      return {
        images: jpgFiles,
        hasNoDiagrams: jpgFiles.length === 0,
      };
    }

    return {
      images: [],
      hasNoDiagrams: true,
    };
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return {
      images: [],
      hasNoDiagrams: false,
      error: "Failed to load diagrams",
    };
  }
};

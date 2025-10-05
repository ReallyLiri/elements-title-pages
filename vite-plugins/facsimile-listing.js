import fs from "fs";
import path from "path";
import { config } from "dotenv";

config();

const GITHUB_API_BASE =
  "https://api.github.com/repos/ReallyLiri/elements-facsimile/contents";
const DIAGRAMS_PATH = "docs/diagrams";
const OUTPUT_DIR = "public/docs";
const GITHUB_PAT = process.env.GITHUB_PAT;

function getHeaders() {
  const headers = {
    "User-Agent": "elements-title-pages-build",
  };

  if (GITHUB_PAT) {
    headers["Authorization"] = `token ${GITHUB_PAT}`;
  }

  return headers;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 403) {
        const resetTime = response.headers.get("X-RateLimit-Reset");
        const remaining = response.headers.get("X-RateLimit-Remaining");
        console.warn(
          `Rate limit hit (${remaining} remaining), retrying in ${Math.pow(2, i)} seconds...`,
        );
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          console.warn(`Rate limit resets at: ${resetDate.toISOString()}`);
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        );
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function generateDiagramDirectories() {
  const outputPath = path.join(OUTPUT_DIR, "diagram-directories.json");

  try {
    console.log("Fetching diagram directories from GitHub API...");
    const data = await fetchWithRetry(`${GITHUB_API_BASE}/${DIAGRAMS_PATH}`);

    if (Array.isArray(data)) {
      const directories = data
        .filter((item) => item.type === "dir")
        .map((item) => item.name);

      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(directories, null, 2));
      console.log(
        `Generated ${outputPath} with ${directories.length} directories`,
      );
    }
  } catch (error) {
    console.error("Failed to generate diagram directories:", error);
  }
}

async function generateDiagramData(key) {
  const outputPath = path.join(OUTPUT_DIR, "diagrams", `${key}.json`);

  if (fs.existsSync(outputPath)) {
    return;
  }

  try {
    const cropsUrl = `${GITHUB_API_BASE}/${DIAGRAMS_PATH}/${key}/crops`;
    const cropsData = await fetchWithRetry(cropsUrl);

    if (Array.isArray(cropsData)) {
      const images = cropsData
        .filter((file) => file.name.endsWith(".jpg"))
        .map((file) => file.name);

      const result = { images, hasNoDiagrams: images.length === 0 };

      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(
        `Generated diagrams data for ${key}: ${images.length} images`,
      );
    }
  } catch (error) {
    const result = { images: [], hasNoDiagrams: true };
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  }
}

async function generateAllDiagramData() {
  const directoriesPath = path.join(OUTPUT_DIR, "diagram-directories.json");

  if (!fs.existsSync(directoriesPath)) {
    console.log(
      "No diagram directories file found, skipping diagram data generation",
    );
    return;
  }

  const directories = JSON.parse(fs.readFileSync(directoriesPath, "utf8"));
  const missingDirectories = directories.filter(dir => {
    const outputPath = path.join(OUTPUT_DIR, "diagrams", `${dir}.json`);
    return !fs.existsSync(outputPath);
  });

  if (missingDirectories.length === 0) {
    console.log("All diagram data files already exist, skipping...");
    return;
  }

  console.log(
    `Generating diagram data for ${missingDirectories.length} of ${directories.length} directories...`,
  );

  for (const dir of missingDirectories) {
    await generateDiagramData(dir);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export function facsimileListingPlugin() {
  return {
    name: "facsimile-listing",
    async buildStart() {
      await generateDiagramDirectories();
      await generateAllDiagramData();
    },
  };
}

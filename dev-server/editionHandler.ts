import type { IncomingMessage, ServerResponse } from "http";
import {
  getCsvFilePath,
  loadCsvData,
  saveCsvData,
  parseRequestBody,
  sendJsonResponse,
  sendErrorResponse,
} from "./common";

const EDITION_API_PATH = "/api/edition";

interface EditionRequestBody {
  key?: string;
  year?: string;
  city?: string;
  language?: string;
  "author (normalized)"?: string;
  title?: string;
  title_EN?: string;
  type?: "elements" | "secondary";
  "publisher (normalized)"?: string;
  imprint?: string;
  imprint_EN?: string;
  ustc_id?: string;
  scan_url?: string;
  tp_url?: string;
  notes?: string;
}

const addEditionToCsv = (edition: EditionRequestBody): void => {
  const csvFile = getCsvFilePath(edition.type || "secondary");
  const parsed = loadCsvData(csvFile);

  if (edition.key) {
    const existingIndex = parsed.data.findIndex((row) => row.key === edition.key);
    if (existingIndex !== -1) {
      throw new Error(`Edition with key ${edition.key} already exists`);
    }
  }

  const newRow: Record<string, string> = {
    key: edition.key || "",
    year: edition.year || "",
    city: edition.city || "",
    language: edition.language || "",
    "author (normalized)": edition["author (normalized)"] || "",
    title: edition.title || "",
    title_EN: edition.title_EN || "",
    type: edition.type || "secondary",
    "publisher (normalized)": edition["publisher (normalized)"] || "",
    imprint: edition.imprint || "",
    imprint_EN: edition.imprint_EN || "",
    ustc_id: edition.ustc_id || "",
    scan_url: edition.scan_url || "",
    tp_url: edition.tp_url || "",
    notes: edition.notes || "",
  };

  parsed.data.push(newRow);
  saveCsvData(csvFile, parsed.data);
};

export const isEditionRequest = (req: IncomingMessage): boolean => {
  return req.method === "POST" && req.url === EDITION_API_PATH;
};

export const handleEditionRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const edition = await parseRequestBody<EditionRequestBody>(req);

    if (edition.type && !["elements", "secondary"].includes(edition.type)) {
      sendErrorResponse(
        res,
        400,
        'Invalid type field. Must be "elements" or "secondary"',
      );
      return;
    }

    addEditionToCsv(edition);
    sendJsonResponse(res, 201, { success: true, key: edition.key || "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("already exists")) {
      sendErrorResponse(res, 409, message);
    } else if (message.includes("not found")) {
      sendErrorResponse(res, 404, message);
    } else {
      sendErrorResponse(res, 500, `Error creating edition: ${message}`);
    }
  }
};

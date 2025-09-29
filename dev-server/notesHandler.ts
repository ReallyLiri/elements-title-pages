import type { IncomingMessage, ServerResponse } from "http";
import {
  getCsvFilePath,
  loadCsvData,
  saveCsvData,
  parseRequestBody,
  sendJsonResponse,
  sendErrorResponse,
} from "./common";

const NOTES_API_PATH = "/api/notes/";

interface NotesRequestBody {
  note: string;
  type: string;
}

const updateNotesInCsv = (key: string, note: string, type: string): void => {
  const csvFile = getCsvFilePath(type);
  const parsed = loadCsvData(csvFile);

  const rowIndex = parsed.data.findIndex((row) => row.key === key);
  if (rowIndex === -1) {
    throw new Error(`Item with key ${key} not found`);
  }

  parsed.data[rowIndex].notes = note || "";
  saveCsvData(csvFile, parsed.data);
};

export const isNotesRequest = (req: IncomingMessage): boolean => {
  return req.method === "POST" && !!req.url?.startsWith(NOTES_API_PATH);
};

export const handleNotesRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const key = decodeURIComponent(req.url!.replace(NOTES_API_PATH, ""));

    if (!key) {
      sendErrorResponse(res, 400, "Missing key parameter");
      return;
    }

    const { note, type } = await parseRequestBody<NotesRequestBody>(req);
    updateNotesInCsv(key, note, type);
    sendJsonResponse(res, 200, { success: true, key, note });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("not found")) {
      sendErrorResponse(res, 404, message);
    } else {
      sendErrorResponse(res, 500, `Error updating notes: ${message}`);
    }
  }
};

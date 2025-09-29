import fs from "fs";
import Papa from "papaparse";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

const NOTES_API_PATH = '/api/notes/';

interface NotesRequestBody {
  note: string;
  type: string;
}

const parseRequestBody = (req: IncomingMessage): Promise<NotesRequestBody> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

const updateNotesInCsv = (key: string, note: string, type: string): void => {
  const csvFile = type === 'Elements' ? 'public/docs/EiP.csv' : 'public/docs/EiP-secondary.csv';
  const csvPath = path.resolve(csvFile);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvFile}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse<Record<string, string>>(csvContent, { header: true });

  const rowIndex = parsed.data.findIndex((row) => row.key === key);
  if (rowIndex === -1) {
    throw new Error(`Item with key ${key} not found`);
  }

  parsed.data[rowIndex].notes = note || '';

  const updatedCsv = Papa.unparse(parsed.data);
  fs.writeFileSync(csvPath, updatedCsv);
};

const sendJsonResponse = (res: ServerResponse, statusCode: number, data: object): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const sendErrorResponse = (res: ServerResponse, statusCode: number, message: string): void => {
  res.statusCode = statusCode;
  res.end(message);
};

export const isNotesRequest = (req: IncomingMessage): boolean => {
  return req.method === 'POST' && !!req.url?.startsWith(NOTES_API_PATH);
};

export const handleNotesRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const key = decodeURIComponent(req.url!.replace(NOTES_API_PATH, ''));

    if (!key) {
      sendErrorResponse(res, 400, 'Missing key parameter');
      return;
    }

    const { note, type } = await parseRequestBody(req);
    updateNotesInCsv(key, note, type);
    sendJsonResponse(res, 200, { success: true, key, note });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('not found')) {
      sendErrorResponse(res, 404, message);
    } else {
      sendErrorResponse(res, 500, `Error updating notes: ${message}`);
    }
  }
};
import fs from "fs";
import Papa from "papaparse";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

export const getCsvFilePath = (type: string): string => {
  return type === "Elements" || type === "elements"
    ? "public/docs/EiP.csv"
    : "public/docs/EiP-secondary.csv";
};

export const loadCsvData = (
  filePath: string,
): Papa.ParseResult<Record<string, string>> => {
  const csvPath = path.resolve(filePath);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  return Papa.parse<Record<string, string>>(csvContent, { header: true });
};

export const saveCsvData = (
  filePath: string,
  data: Record<string, string>[],
): void => {
  const csvPath = path.resolve(filePath);
  const updatedCsv = Papa.unparse(data);
  fs.writeFileSync(csvPath, updatedCsv);
};

export const parseRequestBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error: unknown) {
        console.error(error);
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
};

export const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  data: object,
): void => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
};

export const sendErrorResponse = (
  res: ServerResponse,
  statusCode: number,
  message: string,
): void => {
  res.statusCode = statusCode;
  res.end(message);
};

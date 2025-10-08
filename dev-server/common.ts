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

export const parseMultipartFormData = (
  req: IncomingMessage,
): Promise<{
  fields: Record<string, string>;
  files: Record<string, { name: string; data: Buffer }>;
}> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers["content-type"] || "";
        const boundary = contentType.split("boundary=")[1];

        if (!boundary) {
          reject(new Error("No boundary found in content-type"));
          return;
        }

        const parts = buffer.toString("binary").split(`--${boundary}`);
        const fields: Record<string, string> = {};
        const files: Record<string, { name: string; data: Buffer }> = {};

        for (const part of parts) {
          if (part.includes("Content-Disposition")) {
            const lines = part.split("\r\n");
            const dispositionLine = lines.find((line) =>
              line.includes("Content-Disposition"),
            );

            if (dispositionLine) {
              const nameMatch = dispositionLine.match(/name="([^"]+)"/);
              const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);

              if (nameMatch) {
                const fieldName = nameMatch[1];
                const contentStartIndex = part.indexOf("\r\n\r\n") + 4;
                const contentEndIndex = part.lastIndexOf("\r\n");

                if (filenameMatch) {
                  const filename = filenameMatch[1];
                  const fileData = Buffer.from(
                    part.substring(contentStartIndex, contentEndIndex),
                    "binary",
                  );
                  files[fieldName] = { name: filename, data: fileData };
                } else {
                  const value = part.substring(
                    contentStartIndex,
                    contentEndIndex,
                  );
                  fields[fieldName] = value;
                }
              }
            }
          }
        }

        resolve({ fields, files });
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
};

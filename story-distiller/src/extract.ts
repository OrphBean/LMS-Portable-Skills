import * as fs from "fs";
import * as path from "path";

// Extract plain text from a story file. Handles plain text/markdown directly
// and uses lightweight libraries for Word (.docx) and PDF.

const MAX_INGEST_BYTES = 50 * 1024 * 1024; // 50 MB cap on any single source

function readBuffer(file: string): Buffer {
  const st = fs.statSync(file);
  if (st.size > MAX_INGEST_BYTES) {
    throw new Error(`file too large (${st.size} bytes > 50 MB): ${file}`);
  }
  return fs.readFileSync(file);
}

async function docxToText(buffer: Buffer): Promise<string> {
  const mammoth = require("mammoth");
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

async function pdfToText(buffer: Buffer): Promise<string> {
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return (data && data.text) || "";
}

// Returns extracted text or throws with a user-readable reason.
export async function extractText(file: string): Promise<string> {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".txt" || ext === ".md" || ext === ".markdown") {
    // Drop a UTF-8 BOM if present.
    let s = readBuffer(file).toString("utf-8");
    if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
    return s;
  }

  if (ext === ".docx") {
    return docxToText(readBuffer(file));
  }

  if (ext === ".pdf") {
    return pdfToText(readBuffer(file));
  }

  // Best-effort fallback: read as text (handles .rst, .log, and any stray file).
  return readBuffer(file).toString("utf-8");
}

// Extract text from an uploaded buffer (UI path), choosing by extension.
export async function extractTextFromBuffer(name: string, buffer: Buffer): Promise<string> {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".docx") return docxToText(buffer);
  if (ext === ".pdf") return pdfToText(buffer);
  let s = buffer.toString("utf-8");
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s;
}

export const SUPPORTED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".docx",
  ".pdf",
  ".rst",
  ".log",
  ".text",
]);

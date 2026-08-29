import * as fs from "fs";
import * as path from "path";
import {
  SUPPORTED_EXTENSIONS,
  CORPUS_DESCRIPTOR_FILE,
  CORPUS_METADATA_FILE,
  MAX_FILE_SIZE_BYTES,
  MAX_DIRECTORY_DEPTH,
  MAX_DIRECTORY_ENTRIES,
} from "./constants";

function readTextSafe(filePath: string, maxBytes = MAX_FILE_SIZE_BYTES): string | null {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return null;
    if (stat.size > maxBytes * 8) {
      // Read head + tail of very large files rather than refusing outright.
      const fd = fs.openSync(filePath, "r");
      const headBytes = Math.floor(maxBytes * 0.8);
      const tailBytes = maxBytes - headBytes;
      const headBuf = Buffer.alloc(headBytes);
      const tailBuf = Buffer.alloc(tailBytes);
      fs.readSync(fd, headBuf, 0, headBytes, 0);
      fs.readSync(fd, tailBuf, 0, tailBytes, stat.size - tailBytes);
      fs.closeSync(fd);
      const head = headBuf.toString("utf-8").replace(/\uFFFD.*$/, "");
      const tail = tailBuf.toString("utf-8").replace(/^.*?\uFFFD/, "");
      return `${head}\n\n[... middle omitted ...]\n\n${tail}`;
    }
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function isContentFile(fileName: string): boolean {
  if (!SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase())) return false;
  if (fileName === CORPUS_DESCRIPTOR_FILE || fileName === CORPUS_METADATA_FILE) return false;
  return true;
}

function readCorpusDescription(corpusDir: string, name: string): string {
  const descriptor = path.join(corpusDir, CORPUS_DESCRIPTOR_FILE);
  try {
    if (fs.existsSync(descriptor)) {
      const text = fs.readFileSync(descriptor, "utf-8");
      // First non-heading paragraph, capped.
      const paragraph = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .join(" ")
        .trim();
      if (paragraph) return paragraph.slice(0, 500);
    }
    const metadata = path.join(corpusDir, CORPUS_METADATA_FILE);
    if (fs.existsSync(metadata)) {
      const parsed = JSON.parse(fs.readFileSync(metadata, "utf-8"));
      if (typeof parsed.description === "string" && parsed.description) {
        return parsed.description.slice(0, 500);
      }
    }
  } catch {}
  return name;
}

export interface ScannedFile {
  corpus: string;
  name: string;
  path: string;
  content: string;
  lastModified: number;
  sizeBytes: number;
}

function walkFiles(
  dir: string,
  corpus: string,
  baseDir: string,
  depth: number,
  maxFiles: number,
  out: ScannedFile[],
): void {
  if (depth > MAX_DIRECTORY_DEPTH) return;

  let children: fs.Dirent[];
  try {
    children = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  let count = 0;
  for (const child of children) {
    if (count >= maxFiles) break;
    const childAbs = path.join(dir, child.name);
    try {
      if (child.isDirectory()) {
        walkFiles(childAbs, corpus, baseDir, depth + 1, maxFiles - count, out);
      } else if (child.isFile() && isContentFile(child.name)) {
        const stat = fs.statSync(childAbs);
        const content = readTextSafe(childAbs);
        if (content === null) continue;
        out.push({
          corpus,
          name: child.name,
          path: childAbs,
          content,
          lastModified: stat.mtimeMs,
          sizeBytes: stat.size,
        });
        count++;
      }
    } catch {
      continue;
    }
  }
}

// Each immediate subfolder of the KB root is one corpus. A corpus's relative
// path (from the KB root) is its unique name, so nested folder trees can be
// grouped under a single corpus.
export function scanCorpora(
  knowledgeBaseDir: string,
  maxFilesPerCorpus: number,
): Array<{ name: string; dir: string; description: string; files: ScannedFile[] }> {
  if (!fs.existsSync(knowledgeBaseDir)) return [];
  const corpora: Array<{ name: string; dir: string; description: string; files: ScannedFile[] }> = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(knowledgeBaseDir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of entries) {
    let dir: string;
    try {
      dir = path.join(knowledgeBaseDir, entry.name);
      if (!fs.statSync(dir).isDirectory()) continue;
    } catch {
      continue;
    }

    const files: ScannedFile[] = [];
    walkFiles(dir, entry.name, knowledgeBaseDir, 0, maxFilesPerCorpus, files);
    if (files.length === 0) continue;

    corpora.push({
      name: entry.name,
      dir,
      description: readCorpusDescription(dir, entry.name),
      files,
    });
  }

  return corpora;
}

// Simple list of corpus names (for tool hints / validation).
export function listCorpusNames(knowledgeBaseDir: string): string[] {
  return scanCorpora(knowledgeBaseDir, 1).map((c) => c.name);
}

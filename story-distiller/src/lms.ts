import * as fs from "fs";
import * as path from "path";

// LM Studio writes the running local server's port to
// Data/dot-lmstudio/.internal/http-server.json. The port changes each time the
// app starts, so we auto-detect it instead of assuming 1234.
export function detectBaseUrl(): string | null {
  const file = path.resolve(
    __dirname,
    "..",
    "..",
    "Data",
    "dot-lmstudio",
    ".internal",
    "http-server.json",
  );
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as { port?: number };
      if (parsed.port) return `ws://127.0.0.1:${parsed.port}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveBaseUrl(explicit: string | null | undefined): string {
  const trimmed = (explicit || "").trim();
  return trimmed || detectBaseUrl() || "ws://127.0.0.1:1234";
}

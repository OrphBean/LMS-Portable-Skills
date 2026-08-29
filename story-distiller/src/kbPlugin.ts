import * as fs from "fs";
import * as path from "path";

// The knowledge-base plugin keeps durable settings (knowledgeBaseDir,
// defaultCorpora, etc.) in `plugin-data/lms-knowledge-base/settings.json`.
// `assignedCorpora`/`autoRetrieve` are per-chat, but the plugin now falls back
// to `defaultCorpora` when a chat hasn't set its own. We merge newly-written
// corpora into that durable list so they are auto-assigned everywhere.

export function kbPluginSettingsPath(): string {
  return path.resolve(
    __dirname,
    "..",
    "..",
    "Data",
    "dot-lmstudio",
    "plugin-data",
    "lms-knowledge-base",
    "settings.json",
  );
}

export function kbPluginIndexPath(): string {
  return path.resolve(
    __dirname,
    "..",
    "..",
    "Data",
    "dot-lmstudio",
    "plugin-data",
    "lms-knowledge-base",
    "index.json",
  );
}

export interface KbSettings {
  knowledgeBaseDir?: string;
  embeddingModel?: string;
  chunkChars?: number;
  chunkOverlapChars?: number;
  maxFilesPerCorpus?: number;
  defaultCorpora?: string[];
}

export function readKbSettings(): KbSettings {
  const file = kbPluginSettingsPath();
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8")) as KbSettings;
    }
  } catch {
    /* corrupt config: start fresh but preserve nothing */
  }
  return {};
}

// The knowledge base root the plugin actually reads, if it has configured one.
export function knowledgeBaseDirFromSettings(): string | null {
  const d = readKbSettings().knowledgeBaseDir;
  return typeof d === "string" && d ? d : null;
}

export function writeKbSettings(settings: KbSettings): void {
  const file = kbPluginSettingsPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2), "utf-8");
}

// Merge corpus names into the durable default assignment (non-destructive:
// preserves every existing key, keeps existing corpora, appends new ones).
// The KB plugin only rebuilds its vector index when index.json is absent, so we
// invalidate the derived index to force a lazy re-index (with the new corpus) on
// the next search. index.json is derived and safe to regenerate.
export function assignCorporaToKb(corpora: string[]): string[] {
  const settings = readKbSettings();
  const existing = Array.isArray(settings.defaultCorpora)
    ? settings.defaultCorpora.filter((c) => typeof c === "string" && c)
    : [];
  const merged = [...new Set([...existing, ...corpora.filter(Boolean)])];
  writeKbSettings({ ...settings, defaultCorpora: merged });
  invalidateIndex();
  return merged;
}

export function invalidateIndex(): void {
  try {
    const idx = kbPluginIndexPath();
    if (fs.existsSync(idx)) fs.unlinkSync(idx);
  } catch {
    /* ignore */
  }
}

export function listAssignedCorpora(): string[] {
  const settings = readKbSettings();
  return Array.isArray(settings.defaultCorpora) ? settings.defaultCorpora : [];
}

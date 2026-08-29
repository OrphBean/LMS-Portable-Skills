import * as fs from "fs";
import {
  PLUGIN_DATA_DIR,
  SETTINGS_FILE,
  DEFAULT_KNOWLEDGE_BASE_DIR,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_CHUNK_CHARS,
  DEFAULT_CHUNK_OVERLAP_CHARS,
  RESET_TO_DEFAULT_SENTINEL,
  CONFIG_CACHE_TTL_MS,
} from "./constants";
import { configSchematics } from "./config";
import type { PersistedSettings, EffectiveConfig } from "./types";
import type { PluginController } from "./pluginTypes";

const DEFAULTS: PersistedSettings = {
  knowledgeBaseDir: DEFAULT_KNOWLEDGE_BASE_DIR,
  embeddingModel: DEFAULT_EMBEDDING_MODEL,
  chunkChars: DEFAULT_CHUNK_CHARS,
  chunkOverlapChars: DEFAULT_CHUNK_OVERLAP_CHARS,
  maxFilesPerCorpus: 500,
};

let cachedConfig: EffectiveConfig | null = null;
let cacheTime = 0;

function loadSettings(): PersistedSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return { ...DEFAULTS };
    const parsed = JSON.parse(
      fs.readFileSync(SETTINGS_FILE, "utf-8"),
    ) as Partial<PersistedSettings>;
    return {
      knowledgeBaseDir:
        typeof parsed.knowledgeBaseDir === "string" && parsed.knowledgeBaseDir
          ? parsed.knowledgeBaseDir
          : DEFAULTS.knowledgeBaseDir,
      embeddingModel:
        typeof parsed.embeddingModel === "string" && parsed.embeddingModel
          ? parsed.embeddingModel
          : DEFAULTS.embeddingModel,
      chunkChars:
        typeof parsed.chunkChars === "number" && parsed.chunkChars >= 200
          ? parsed.chunkChars
          : DEFAULTS.chunkChars,
      chunkOverlapChars:
        typeof parsed.chunkOverlapChars === "number" &&
        parsed.chunkOverlapChars >= 0
          ? parsed.chunkOverlapChars
          : DEFAULTS.chunkOverlapChars,
      maxFilesPerCorpus:
        typeof parsed.maxFilesPerCorpus === "number" &&
        parsed.maxFilesPerCorpus >= 1
          ? parsed.maxFilesPerCorpus
          : DEFAULTS.maxFilesPerCorpus,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings: PersistedSettings): void {
  try {
    fs.mkdirSync(PLUGIN_DATA_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    cachedConfig = null;
  } catch {}
}

export function resolveEffectiveConfig(ctl: PluginController): EffectiveConfig {
  const now = Date.now();
  if (cachedConfig && now - cacheTime < CONFIG_CACHE_TTL_MS)
    return cachedConfig;

  const c = ctl.getPluginConfig(configSchematics);
  const rawPath = ((c.get("knowledgeBasePath") as string | undefined) ?? "").trim();
  const chunkChars = (c.get("chunkChars") as number) ?? DEFAULTS.chunkChars;
  const chunkOverlapChars =
    (c.get("chunkOverlapChars") as number) ?? DEFAULTS.chunkOverlapChars;

  const saved = loadSettings();

  if (rawPath === RESET_TO_DEFAULT_SENTINEL) {
    const next: PersistedSettings = {
      ...saved,
      knowledgeBaseDir: DEFAULTS.knowledgeBaseDir,
      chunkChars,
      chunkOverlapChars,
    };
    saveSettings(next);
    cachedConfig = next;
    cacheTime = now;
    return next;
  }

  const knowledgeBaseDir =
    rawPath && rawPath !== saved.knowledgeBaseDir
      ? rawPath
      : saved.knowledgeBaseDir;

  if (
    knowledgeBaseDir !== saved.knowledgeBaseDir ||
    chunkChars !== saved.chunkChars ||
    chunkOverlapChars !== saved.chunkOverlapChars
  ) {
    saveSettings({
      ...saved,
      knowledgeBaseDir,
      chunkChars,
      chunkOverlapChars,
    });
  }

  const result: EffectiveConfig = {
    knowledgeBaseDir,
    embeddingModel:
      ((c.get("embeddingModel") as string | undefined) ?? "").trim() ||
      saved.embeddingModel,
    chunkChars,
    chunkOverlapChars,
    maxFilesPerCorpus: saved.maxFilesPerCorpus,
  };
  cachedConfig = result;
  cacheTime = now;
  return result;
}

export function getEmbeddingModel(ctl: PluginController): string {
  return resolveEffectiveConfig(ctl).embeddingModel;
}

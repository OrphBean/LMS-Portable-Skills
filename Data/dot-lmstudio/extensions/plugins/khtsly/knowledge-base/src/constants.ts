import * as os from "os";
import * as path from "path";

// The knowledge base root is a sibling of the skills directory, inside the
// portable .lmstudio tree (physically under Data\dot-lmstudio via the junction).
export const DEFAULT_KNOWLEDGE_BASE_DIR = path.join(
  os.homedir(),
  ".lmstudio",
  "knowledge-base",
);

// Plugin data/state lives beside the KB data so it is per-machine but separate
// from the user-editable reference documents.
export const PLUGIN_DATA_DIR = path.join(
  os.homedir(),
  ".lmstudio",
  "plugin-data",
  "lms-knowledge-base",
);
export const SETTINGS_FILE = path.join(PLUGIN_DATA_DIR, "settings.json");
export const INDEX_FILE = path.join(PLUGIN_DATA_DIR, "index.json");

export const DEFAULT_EMBEDDING_MODEL = "nomic-ai/nomic-embed-text-v1.5-GGUF";

// Supported language/parse source files. Binary/text-incompatible content is
// skipped at scan time.
export const SUPPORTED_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".text",
  ".rst",
  ".json",
  ".jsonl",
  ".yaml",
  ".yml",
  ".csv",
  ".tsv",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".sh",
  ".ps1",
  ".bat",
  ".cmd",
  ".sql",
  ".xml",
  ".log",
]);

// Files that describe a corpus (index of a folder, not content) are never
// treated as content.
export const CORPUS_DESCRIPTOR_FILE = "_corpus.md";
export const CORPUS_METADATA_FILE = "_corpus.json";

// A corpus may carry a one-line description in its descriptor. When missing we
// fall back to the folder name.
export const MAX_FILE_SIZE_BYTES = 200_000;
export const MAX_DIRECTORY_DEPTH = 4;
export const MAX_DIRECTORY_ENTRIES = 500;

export const DEFAULT_CHUNK_CHARS = 900;
export const DEFAULT_CHUNK_OVERLAP_CHARS = 120;
export const MIN_PROMPT_LENGTH = 8;

export const LIST_CORPORA_DEFAULT_LIMIT = 100;
export const DEFAULT_RETRIEVAL_LIMIT = 4;
export const DEFAULT_AFFINITY_THRESHOLD = 0.35;

export const CONFIG_CACHE_TTL_MS = 5_000;
export const REINJECT_INTERVAL_MS = 30_000;

// Max vectors we load into memory for a single cosine scan. Keeps a big index
// from ballooning a single prediction; search still reads the whole file but
// tops up at this cap.
export const MAX_RETRIEVAL_SCAN = 10_000;

export const RESET_TO_DEFAULT_SENTINEL = "default";
export const KB_PATHS_SEPARATOR = ";";

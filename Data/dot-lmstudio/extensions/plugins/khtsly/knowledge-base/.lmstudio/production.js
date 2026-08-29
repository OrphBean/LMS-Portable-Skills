"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/constants.ts
var os, path, DEFAULT_KNOWLEDGE_BASE_DIR, PLUGIN_DATA_DIR, SETTINGS_FILE, INDEX_FILE, DEFAULT_EMBEDDING_MODEL, SUPPORTED_EXTENSIONS, CORPUS_DESCRIPTOR_FILE, CORPUS_METADATA_FILE, MAX_FILE_SIZE_BYTES, MAX_DIRECTORY_DEPTH, DEFAULT_CHUNK_CHARS, DEFAULT_CHUNK_OVERLAP_CHARS, MIN_PROMPT_LENGTH, LIST_CORPORA_DEFAULT_LIMIT, DEFAULT_RETRIEVAL_LIMIT, DEFAULT_AFFINITY_THRESHOLD, CONFIG_CACHE_TTL_MS, RESET_TO_DEFAULT_SENTINEL;
var init_constants = __esm({
  "src/constants.ts"() {
    "use strict";
    os = __toESM(require("os"));
    path = __toESM(require("path"));
    DEFAULT_KNOWLEDGE_BASE_DIR = path.join(
      os.homedir(),
      ".lmstudio",
      "knowledge-base"
    );
    PLUGIN_DATA_DIR = path.join(
      os.homedir(),
      ".lmstudio",
      "plugin-data",
      "lms-knowledge-base"
    );
    SETTINGS_FILE = path.join(PLUGIN_DATA_DIR, "settings.json");
    INDEX_FILE = path.join(PLUGIN_DATA_DIR, "index.json");
    DEFAULT_EMBEDDING_MODEL = "nomic-ai/nomic-embed-text-v1.5-GGUF";
    SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set([
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
      ".log"
    ]);
    CORPUS_DESCRIPTOR_FILE = "_corpus.md";
    CORPUS_METADATA_FILE = "_corpus.json";
    MAX_FILE_SIZE_BYTES = 2e5;
    MAX_DIRECTORY_DEPTH = 4;
    DEFAULT_CHUNK_CHARS = 900;
    DEFAULT_CHUNK_OVERLAP_CHARS = 120;
    MIN_PROMPT_LENGTH = 8;
    LIST_CORPORA_DEFAULT_LIMIT = 100;
    DEFAULT_RETRIEVAL_LIMIT = 4;
    DEFAULT_AFFINITY_THRESHOLD = 0.35;
    CONFIG_CACHE_TTL_MS = 5e3;
    RESET_TO_DEFAULT_SENTINEL = "default";
  }
});

// src/config.ts
var import_sdk, configSchematics;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    import_sdk = require("@lmstudio/sdk");
    init_constants();
    configSchematics = (0, import_sdk.createConfigSchematics)().field(
      "knowledgeBasePath",
      "string",
      {
        displayName: "Knowledge Base Folder",
        subtitle: "Root folder containing one subfolder per corpus. Defaults to ~/.lmstudio/knowledge-base. Leave empty to use last saved value."
      },
      DEFAULT_KNOWLEDGE_BASE_DIR
    ).field(
      "assignedCorpora",
      "stringArray",
      {
        displayName: "Assigned Corpora",
        subtitle: "Per-chat corpora to auto-retrieve from. Named folders under the knowledge base root, e.g. film-noir, prompt-examples. Leave empty to disable auto-RAG for this chat.",
        maxNumItems: 20,
        allowEmptyStrings: false
      },
      []
    ).field(
      "autoRetrieve",
      "boolean",
      {
        displayName: "Auto-Retrieve in Chat",
        subtitle: "When on, the plugin embeds the user query and injects matching chunks from the assigned corpora into each prompt."
      },
      true
    ).field(
      "retrievalLimit",
      "numeric",
      {
        int: true,
        min: 1,
        displayName: "Retrieval Limit",
        subtitle: "Maximum number of chunks to inject per prompt.",
        slider: { min: 1, max: 10, step: 1 }
      },
      DEFAULT_RETRIEVAL_LIMIT
    ).field(
      "retrievalAffinityThreshold",
      "numeric",
      {
        min: 0,
        max: 1,
        displayName: "Retrieval Affinity Threshold",
        subtitle: "Minimum cosine similarity for a chunk to be considered relevant.",
        slider: { min: 0, max: 1, step: 0.01 }
      },
      DEFAULT_AFFINITY_THRESHOLD
    ).field(
      "embeddingModel",
      "string",
      {
        displayName: "Embedding Model",
        subtitle: "Identifier of the local embedding model used to generate vectors."
      },
      DEFAULT_EMBEDDING_MODEL
    ).field(
      "chunkChars",
      "numeric",
      {
        int: true,
        min: 200,
        max: 4e3,
        displayName: "Chunk Size (chars)",
        subtitle: "Approximate characters per chunk when indexing documents.",
        slider: { min: 200, max: 4e3, step: 50 }
      },
      DEFAULT_CHUNK_CHARS
    ).field(
      "chunkOverlapChars",
      "numeric",
      {
        int: true,
        min: 0,
        max: 1e3,
        displayName: "Chunk Overlap (chars)",
        subtitle: "Overlap between consecutive chunks.",
        slider: { min: 0, max: 1e3, step: 25 }
      },
      DEFAULT_CHUNK_OVERLAP_CHARS
    ).build();
  }
});

// src/settings.ts
function loadSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return { ...DEFAULTS };
    const parsed = JSON.parse(
      fs.readFileSync(SETTINGS_FILE, "utf-8")
    );
    return {
      knowledgeBaseDir: typeof parsed.knowledgeBaseDir === "string" && parsed.knowledgeBaseDir ? parsed.knowledgeBaseDir : DEFAULTS.knowledgeBaseDir,
      embeddingModel: typeof parsed.embeddingModel === "string" && parsed.embeddingModel ? parsed.embeddingModel : DEFAULTS.embeddingModel,
      chunkChars: typeof parsed.chunkChars === "number" && parsed.chunkChars >= 200 ? parsed.chunkChars : DEFAULTS.chunkChars,
      chunkOverlapChars: typeof parsed.chunkOverlapChars === "number" && parsed.chunkOverlapChars >= 0 ? parsed.chunkOverlapChars : DEFAULTS.chunkOverlapChars,
      maxFilesPerCorpus: typeof parsed.maxFilesPerCorpus === "number" && parsed.maxFilesPerCorpus >= 1 ? parsed.maxFilesPerCorpus : DEFAULTS.maxFilesPerCorpus
    };
  } catch {
    return { ...DEFAULTS };
  }
}
function saveSettings(settings) {
  try {
    fs.mkdirSync(PLUGIN_DATA_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    cachedConfig = null;
  } catch {
  }
}
function resolveEffectiveConfig(ctl) {
  const now = Date.now();
  if (cachedConfig && now - cacheTime < CONFIG_CACHE_TTL_MS)
    return cachedConfig;
  const c = ctl.getPluginConfig(configSchematics);
  const rawPath = (c.get("knowledgeBasePath") ?? "").trim();
  const chunkChars = c.get("chunkChars") ?? DEFAULTS.chunkChars;
  const chunkOverlapChars = c.get("chunkOverlapChars") ?? DEFAULTS.chunkOverlapChars;
  const saved = loadSettings();
  if (rawPath === RESET_TO_DEFAULT_SENTINEL) {
    const next = {
      ...saved,
      knowledgeBaseDir: DEFAULTS.knowledgeBaseDir,
      chunkChars,
      chunkOverlapChars
    };
    saveSettings(next);
    cachedConfig = next;
    cacheTime = now;
    return next;
  }
  const knowledgeBaseDir = rawPath && rawPath !== saved.knowledgeBaseDir ? rawPath : saved.knowledgeBaseDir;
  if (knowledgeBaseDir !== saved.knowledgeBaseDir || chunkChars !== saved.chunkChars || chunkOverlapChars !== saved.chunkOverlapChars) {
    saveSettings({
      ...saved,
      knowledgeBaseDir,
      chunkChars,
      chunkOverlapChars
    });
  }
  const result = {
    knowledgeBaseDir,
    embeddingModel: (c.get("embeddingModel") ?? "").trim() || saved.embeddingModel,
    chunkChars,
    chunkOverlapChars,
    maxFilesPerCorpus: saved.maxFilesPerCorpus
  };
  cachedConfig = result;
  cacheTime = now;
  return result;
}
var fs, DEFAULTS, cachedConfig, cacheTime;
var init_settings = __esm({
  "src/settings.ts"() {
    "use strict";
    fs = __toESM(require("fs"));
    init_constants();
    init_config();
    DEFAULTS = {
      knowledgeBaseDir: DEFAULT_KNOWLEDGE_BASE_DIR,
      embeddingModel: DEFAULT_EMBEDDING_MODEL,
      chunkChars: DEFAULT_CHUNK_CHARS,
      chunkOverlapChars: DEFAULT_CHUNK_OVERLAP_CHARS,
      maxFilesPerCorpus: 500
    };
    cachedConfig = null;
    cacheTime = 0;
  }
});

// src/chunker.ts
function splitParagraphs(text) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n[ \t]*\n+/);
  const paragraphs = [];
  for (const block of blocks) {
    const t = block.trim();
    if (t) paragraphs.push({ text: t });
  }
  return paragraphs;
}
function packParagraphs(paragraphs, chunkChars, overlapChars) {
  const chunks = [];
  let current = "";
  let tail = "";
  for (const p of paragraphs) {
    const candidate = current ? `${current}

${p.text}` : p.text;
    if (candidate.length <= chunkChars) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      tail = current.slice(-overlapChars);
    }
    if (p.text.length > chunkChars) {
      let remainder = p.text;
      while (remainder.length > chunkChars) {
        const cut = breakAt(remainder, chunkChars);
        const piece = remainder.slice(0, cut);
        const nextTail = piece.slice(-overlapChars);
        if (tail) {
          chunks.push(`${tail}

${piece}`.slice(0, chunkChars + overlapChars));
        } else {
          chunks.push(piece);
        }
        tail = nextTail;
        remainder = remainder.slice(cut);
      }
      current = tail ? `${tail}

${remainder}` : remainder;
      tail = "";
      continue;
    }
    current = tail ? `${tail}

${p.text}` : p.text;
    tail = "";
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 0);
}
function breakAt(text, target) {
  for (let i = Math.min(target, text.length - 1); i > target - 80; i--) {
    if (/\s/.test(text[i])) return i + 1;
  }
  return Math.max(1, target);
}
function chunkText(text, chunkChars, overlapChars) {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return [];
  return packParagraphs(paragraphs, Math.max(64, chunkChars), overlapChars);
}
var init_chunker = __esm({
  "src/chunker.ts"() {
    "use strict";
  }
});

// src/scanner.ts
function readTextSafe(filePath, maxBytes = MAX_FILE_SIZE_BYTES) {
  try {
    const stat = fs2.statSync(filePath);
    if (!stat.isFile()) return null;
    if (stat.size > maxBytes * 8) {
      const fd = fs2.openSync(filePath, "r");
      const headBytes = Math.floor(maxBytes * 0.8);
      const tailBytes = maxBytes - headBytes;
      const headBuf = Buffer.alloc(headBytes);
      const tailBuf = Buffer.alloc(tailBytes);
      fs2.readSync(fd, headBuf, 0, headBytes, 0);
      fs2.readSync(fd, tailBuf, 0, tailBytes, stat.size - tailBytes);
      fs2.closeSync(fd);
      const head = headBuf.toString("utf-8").replace(/\uFFFD.*$/, "");
      const tail = tailBuf.toString("utf-8").replace(/^.*?\uFFFD/, "");
      return `${head}

[... middle omitted ...]

${tail}`;
    }
    return fs2.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}
function isContentFile(fileName) {
  if (!SUPPORTED_EXTENSIONS.has(path2.extname(fileName).toLowerCase())) return false;
  if (fileName === CORPUS_DESCRIPTOR_FILE || fileName === CORPUS_METADATA_FILE) return false;
  return true;
}
function readCorpusDescription(corpusDir, name) {
  const descriptor = path2.join(corpusDir, CORPUS_DESCRIPTOR_FILE);
  try {
    if (fs2.existsSync(descriptor)) {
      const text = fs2.readFileSync(descriptor, "utf-8");
      const paragraph = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).join(" ").trim();
      if (paragraph) return paragraph.slice(0, 500);
    }
    const metadata = path2.join(corpusDir, CORPUS_METADATA_FILE);
    if (fs2.existsSync(metadata)) {
      const parsed = JSON.parse(fs2.readFileSync(metadata, "utf-8"));
      if (typeof parsed.description === "string" && parsed.description) {
        return parsed.description.slice(0, 500);
      }
    }
  } catch {
  }
  return name;
}
function walkFiles(dir, corpus, baseDir, depth, maxFiles, out) {
  if (depth > MAX_DIRECTORY_DEPTH) return;
  let children;
  try {
    children = fs2.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  let count = 0;
  for (const child of children) {
    if (count >= maxFiles) break;
    const childAbs = path2.join(dir, child.name);
    try {
      if (child.isDirectory()) {
        walkFiles(childAbs, corpus, baseDir, depth + 1, maxFiles - count, out);
      } else if (child.isFile() && isContentFile(child.name)) {
        const stat = fs2.statSync(childAbs);
        const content = readTextSafe(childAbs);
        if (content === null) continue;
        out.push({
          corpus,
          name: child.name,
          path: childAbs,
          content,
          lastModified: stat.mtimeMs,
          sizeBytes: stat.size
        });
        count++;
      }
    } catch {
      continue;
    }
  }
}
function scanCorpora(knowledgeBaseDir, maxFilesPerCorpus) {
  if (!fs2.existsSync(knowledgeBaseDir)) return [];
  const corpora = [];
  let entries;
  try {
    entries = fs2.readdirSync(knowledgeBaseDir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    let dir;
    try {
      dir = path2.join(knowledgeBaseDir, entry.name);
      if (!fs2.statSync(dir).isDirectory()) continue;
    } catch {
      continue;
    }
    const files = [];
    walkFiles(dir, entry.name, knowledgeBaseDir, 0, maxFilesPerCorpus, files);
    if (files.length === 0) continue;
    corpora.push({
      name: entry.name,
      dir,
      description: readCorpusDescription(dir, entry.name),
      files
    });
  }
  return corpora;
}
var fs2, path2;
var init_scanner = __esm({
  "src/scanner.ts"() {
    "use strict";
    fs2 = __toESM(require("fs"));
    path2 = __toESM(require("path"));
    init_constants();
  }
});

// src/indexer.ts
function contentHash(content) {
  return crypto.createHash("sha1").update(content).digest("hex").slice(0, 16);
}
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
function loadIndex() {
  try {
    if (!fs3.existsSync(INDEX_FILE)) return null;
    return JSON.parse(fs3.readFileSync(INDEX_FILE, "utf-8"));
  } catch {
    return null;
  }
}
function saveIndex(index) {
  fs3.mkdirSync(path3.dirname(INDEX_FILE), { recursive: true });
  fs3.writeFileSync(INDEX_FILE, JSON.stringify(index), "utf-8");
}
async function embedTexts(model, texts) {
  const results = [];
  const BATCH = 32;
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const out = await model.embed(slice);
    for (const r of out) results.push(r.embedding);
  }
  return results;
}
async function indexFile(model, file, chunkChars, chunkOverlapChars) {
  const chunks = chunkText(file.content, chunkChars, chunkOverlapChars);
  const embeddings = await embedTexts(model, chunks);
  const kbChunks = chunks.map((text, i) => ({
    text,
    sourcePath: file.path,
    embedding: embeddings[i] ?? []
  }));
  return {
    corpus: file.corpus,
    name: file.name,
    path: file.path,
    contentHash: contentHash(file.content),
    lastModified: file.lastModified,
    sizeBytes: file.sizeBytes,
    chunks: kbChunks
  };
}
async function buildIndex(ctl, knowledgeBaseDir, embeddingModel, chunkChars, chunkOverlapChars, maxFilesPerCorpus) {
  const existing = loadIndex() ?? { version: 1, embeddingModel, corpora: [] };
  const model = await ctl.client.embedding.model(embeddingModel, {
    signal: ctl.abortSignal
  });
  const scanned = scanCorpora(knowledgeBaseDir, maxFilesPerCorpus);
  const newCorpora = [];
  for (const corpus of scanned) {
    const prevCorpus = existing.corpora.find((c) => c.name === corpus.name);
    const docs = [];
    for (const file of corpus.files) {
      const prevDoc = prevCorpus?.documents.find((d) => d.path === file.path);
      const unchanged = prevDoc && prevDoc.contentHash === contentHash(file.content) && prevDoc.lastModified === file.lastModified;
      if (unchanged && prevDoc) {
        docs.push(prevDoc);
        continue;
      }
      docs.push(
        await indexFile(model, file, chunkChars, chunkOverlapChars)
      );
    }
    docs.sort((a, b) => a.name.localeCompare(b.name));
    newCorpora.push({
      name: corpus.name,
      description: corpus.description,
      documents: docs,
      indexedAt: Date.now()
    });
  }
  newCorpora.sort((a, b) => a.name.localeCompare(b.name));
  const index = { version: 1, embeddingModel, corpora: newCorpora };
  saveIndex(index);
  return index;
}
function collectChunksForCorpora(index, corpora) {
  const selected = index.corpora;
  const out = [];
  for (const corpus of selected) {
    if (corpora && corpora.length > 0 && !corpora.includes(corpus.name)) continue;
    for (const doc of corpus.documents) {
      for (const chunk of doc.chunks) {
        out.push({
          corpus: corpus.name,
          document: doc.name,
          sourcePath: chunk.sourcePath,
          text: chunk.text,
          embedding: chunk.embedding
        });
      }
    }
  }
  return out;
}
async function searchIndex(ctl, index, query, embeddingModel, corpora, limit, affinityThreshold) {
  const model = await ctl.client.embedding.model(embeddingModel, {
    signal: ctl.abortSignal
  });
  const [{ embedding: queryVector }] = await model.embed([query]);
  const hits = [];
  for (const chunk of collectChunksForCorpora(index, corpora)) {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    if (score >= affinityThreshold) {
      hits.push({
        corpus: chunk.corpus,
        document: chunk.document,
        sourcePath: chunk.sourcePath,
        text: chunk.text,
        score
      });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
function getCorpora(index) {
  return index.corpora.map((c) => ({
    name: c.name,
    description: c.description,
    documentCount: c.documents.length,
    chunkCount: c.documents.reduce((n, d) => n + d.chunks.length, 0),
    lastModified: c.indexedAt
  }));
}
var crypto, fs3, path3;
var init_indexer = __esm({
  "src/indexer.ts"() {
    "use strict";
    crypto = __toESM(require("crypto"));
    fs3 = __toESM(require("fs"));
    path3 = __toESM(require("path"));
    init_constants();
    init_chunker();
    init_scanner();
  }
});

// src/toolsProvider.ts
async function toolsProvider(ctl) {
  const listCorpora = (0, import_sdk2.tool)({
    name: "list_kb_corpora",
    description: "List the knowledge base corpora available in LM Studio. Each corpus is a named folder of reference documents. Call this to see what knowledge exists, then use search_kb to retrieve relevant chunks.",
    parameters: {
      query: import_zod.z.string().optional().describe("Optional substring to filter corpus names and descriptions."),
      limit: import_zod.z.number().int().min(1).max(500).optional().describe(`Maximum corpora to return. Defaults to ${LIST_CORPORA_DEFAULT_LIMIT}.`)
    },
    implementation: async ({ query, limit }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const index = loadIndex();
      const cap = limit ?? LIST_CORPORA_DEFAULT_LIMIT;
      if (!index) {
        status("No knowledge base index yet. Building now..");
        return {
          corpora: [],
          knowledgeBaseDir: cfg.knowledgeBaseDir,
          note: "No index built yet. Run reindex_kb to index your documents, or add files to the knowledge base folder and reindex."
        };
      }
      let corpora = getCorpora(index);
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        corpora = corpora.filter(
          (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
      }
      return {
        knowledgeBaseDir: cfg.knowledgeBaseDir,
        total: corpora.length,
        corpora: corpora.slice(0, cap)
      };
    }
  });
  const listCorpusDocuments = (0, import_sdk2.tool)({
    name: "list_kb_documents",
    description: "List the documents inside a specific corpus folder. Use this to see the raw reference files stored under a corpus before reading one.",
    parameters: {
      corpus: import_zod.z.string().min(1).describe("Name of the corpus folder to inspect."),
      limit: import_zod.z.number().int().min(1).max(500).optional()
    },
    implementation: async ({ corpus, limit }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const index = loadIndex();
      const cap = limit ?? LIST_CORPORA_DEFAULT_LIMIT;
      if (!index) return { success: false, error: "No index built. Run reindex_kb first." };
      const found = index.corpora.find((c) => c.name === corpus);
      if (!found) {
        return {
          success: false,
          error: `Corpus "${corpus}" not found. Call list_kb_corpora to see available corpora.`
        };
      }
      status(`Listing documents in ${corpus}..`);
      return {
        success: true,
        corpus,
        total: found.documents.length,
        documents: found.documents.slice(0, cap).map((d) => ({
          name: d.name,
          path: d.path,
          sizeBytes: d.sizeBytes,
          chunkCount: d.chunks.length
        }))
      };
    }
  });
  const searchKnowledge = (0, import_sdk2.tool)({
    name: "search_kb",
    description: "Search the knowledge base for chunks relevant to a query using semantic similarity. Optionally restrict to a single corpus (folder) or a set of corpora. Returns labeled citations with scores; use the corpus, document, and score fields to attribute results. Prefer this over reading whole documents when you need a targeted answer.",
    parameters: {
      query: import_zod.z.string().min(1).describe("The query to search for."),
      corpora: import_zod.z.array(import_zod.z.string()).max(20).optional().describe("Optional corpus names to search within. If omitted, searches all corpora."),
      limit: import_zod.z.number().int().min(1).max(30).optional().describe(`Maximum results to return. Defaults to ${DEFAULT_RETRIEVAL_LIMIT}.`),
      affinity_threshold: import_zod.z.number().min(0).max(1).optional().describe(`Minimum similarity score. Defaults to ${DEFAULT_AFFINITY_THRESHOLD}.`)
    },
    implementation: async ({ query, corpora, limit, affinity_threshold }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const index = loadIndex();
      if (!index) {
        return {
          success: false,
          error: "No index built. Run reindex_kb to index the knowledge base folder."
        };
      }
      status(`Searching knowledge base for "${query}"..`);
      const hits = await searchIndex(
        ctl,
        index,
        query,
        cfg.embeddingModel,
        corpora,
        limit ?? DEFAULT_RETRIEVAL_LIMIT,
        affinity_threshold ?? DEFAULT_AFFINITY_THRESHOLD
      );
      return {
        success: true,
        query,
        count: hits.length,
        corporaSearch: corpora ?? "all",
        citations: hits.map((h, i) => ({
          citation: i + 1,
          corpus: h.corpus,
          document: h.document,
          sourcePath: h.sourcePath,
          score: Math.round(h.score * 1e3) / 1e3,
          text: h.text
        }))
      };
    }
  });
  const readDocument = (0, import_sdk2.tool)({
    name: "read_kb_document",
    description: "Read a full document from the knowledge base by corpus + document name. For targeted answers prefer search_kb, which returns only the most relevant chunks.",
    parameters: {
      corpus: import_zod.z.string().min(1).describe("Corpus (folder) that contains the document."),
      document: import_zod.z.string().min(1).describe("Document filename within the corpus.")
    },
    implementation: async ({ corpus, document }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const index = loadIndex();
      if (!index) {
        return { success: false, error: "No index built. Run reindex_kb first." };
      }
      const foundCorpus = index.corpora.find((c) => c.name === corpus);
      if (!foundCorpus) {
        return { success: false, error: `Corpus "${corpus}" not found.` };
      }
      const foundDoc = foundCorpus.documents.find((d) => d.name === document);
      if (!foundDoc) {
        return {
          success: false,
          error: `Document "${document}" not found in corpus "${corpus}". Call list_kb_documents to see files.`
        };
      }
      status(`Reading ${document}..`);
      const fullText = foundDoc.chunks.map((ch) => ch.text).join("\n\n");
      return {
        success: true,
        corpus,
        document,
        sourcePath: foundDoc.path,
        content: fullText
      };
    }
  });
  const addDocument = (0, import_sdk2.tool)({
    name: "add_kb_document",
    description: "Add a new reference document to a knowledge base corpus. Creates the corpus folder if it does not exist, writes the file, and triggers a re-index so it is immediately available. Use this to store reference material for later retrieval.",
    parameters: {
      corpus: import_zod.z.string().min(1).describe("Corpus folder to add the document to."),
      document: import_zod.z.string().min(1).describe("Filename to write (e.g. film-noir.md)."),
      content: import_zod.z.string().describe("The full content of the document.")
    },
    implementation: async ({ corpus, document, content }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const kbRoot = path4.resolve(cfg.knowledgeBaseDir);
      const corpusDir = path4.join(kbRoot, corpus);
      const dest = path4.resolve(corpusDir, document);
      if (!dest.startsWith(kbRoot + path4.sep)) {
        return { success: false, error: "Destination is outside the knowledge base root." };
      }
      status(`Adding ${document} to corpus ${corpus}..`);
      fs4.mkdirSync(corpusDir, { recursive: true });
      fs4.writeFileSync(dest, content, "utf-8");
      status("Re-indexing knowledge base..");
      await buildIndex(
        ctl,
        cfg.knowledgeBaseDir,
        cfg.embeddingModel,
        cfg.chunkChars,
        cfg.chunkOverlapChars,
        cfg.maxFilesPerCorpus
      );
      return { success: true, corpus, document, path: dest, bytes: Buffer.byteLength(content, "utf8") };
    }
  });
  const reindex = (0, import_sdk2.tool)({
    name: "reindex_kb",
    description: "Rebuild the knowledge base vector index from the documents on disk. Call this after adding, editing, or removing documents so searches reflect the current files.",
    parameters: {},
    implementation: async (_params, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      status("Re-indexing knowledge base..");
      const index = await buildIndex(
        ctl,
        cfg.knowledgeBaseDir,
        cfg.embeddingModel,
        cfg.chunkChars,
        cfg.chunkOverlapChars,
        cfg.maxFilesPerCorpus
      );
      saveIndex(index);
      const totalDocs = index.corpora.reduce((n, c) => n + c.documents.length, 0);
      const totalChunks = index.corpora.reduce(
        (n, c) => n + c.documents.reduce((m, d) => m + d.chunks.length, 0),
        0
      );
      return {
        success: true,
        knowledgeBaseDir: cfg.knowledgeBaseDir,
        corpusCount: index.corpora.length,
        documentCount: totalDocs,
        chunkCount: totalChunks,
        embeddingModel: index.embeddingModel
      };
    }
  });
  return [listCorpora, listCorpusDocuments, searchKnowledge, readDocument, addDocument, reindex];
}
var fs4, path4, import_sdk2, import_zod;
var init_toolsProvider = __esm({
  "src/toolsProvider.ts"() {
    "use strict";
    fs4 = __toESM(require("fs"));
    path4 = __toESM(require("path"));
    import_sdk2 = require("@lmstudio/sdk");
    import_zod = require("zod");
    init_settings();
    init_constants();
    init_indexer();
  }
});

// src/promptPreprocessor.ts
function debugLog(...args) {
  if (DEBUG) console.debug("[knowledge-base]", ...args);
}
function buildCorpusPreamble(assigned) {
  const corpusBlock = assigned.map((c) => `- ${c}`).join("\n");
  return `The following corpora from the knowledge base have been assigned to this chat. When relevant, ground your answer in the retrieved citations below.

Assigned corpora:
${corpusBlock}`;
}
function extractUserQuery(text) {
  let clean = text;
  const ragRetrieval = clean.split(/\n\nUser Query:\s*\n+/i);
  if (ragRetrieval.length > 1) clean = ragRetrieval.pop() ?? clean;
  const ragFull = clean.split(/[Uu]ser query:\s*/);
  if (ragFull.length > 1) clean = ragFull.pop() ?? clean;
  const skillsSplit = clean.split(/\n-{3,}\n/);
  if (skillsSplit.length > 1) clean = skillsSplit.pop() ?? clean;
  clean = clean.replace(/<available_skills>[\s\S]*?<\/available_skills>/g, "").replace(/<skill_context>[\s\S]*?<\/skill_context>/g, "").trim();
  return clean || text;
}
async function promptPreprocessor(ctl, userMessage) {
  try {
    const text = userMessage.getText();
    if (text.trim().length < MIN_PROMPT_LENGTH) {
      return userMessage;
    }
    const cfg = resolveEffectiveConfig(ctl);
    const c = ctl.getPluginConfig(configSchematics);
    const assigned = c.get("assignedCorpora") ?? [];
    const autoRetrieve = c.get("autoRetrieve") ?? true;
    if (!autoRetrieve || assigned.length === 0) {
      debugLog("auto-retrieve skipped (disabled or no assigned corpora)");
      return userMessage;
    }
    const query = extractUserQuery(text);
    let index = loadIndex();
    if (!index) {
      const status = ctl.createStatus({ status: "loading", text: "Building knowledge base index..." });
      index = await buildIndex(
        ctl,
        cfg.knowledgeBaseDir,
        cfg.embeddingModel,
        cfg.chunkChars,
        cfg.chunkOverlapChars,
        cfg.maxFilesPerCorpus
      );
      status.setState({ status: "done", text: "Index built" });
    }
    const knownCorpora = index.corpora.map((x) => x.name);
    const validAssigned = assigned.filter((a) => knownCorpora.includes(a));
    if (validAssigned.length === 0) {
      debugLog("no valid assigned corpora; skipping");
      return userMessage;
    }
    const limit = c.get("retrievalLimit") ?? DEFAULT_RETRIEVAL_LIMIT;
    const affinity = c.get("retrievalAffinityThreshold") ?? DEFAULT_AFFINITY_THRESHOLD;
    const fingerprint = `${validAssigned.join(",")}|${limit}|${affinity}`;
    const now = Date.now();
    const state = stateMap.get(ctl) ?? { injectedAt: 0, lastFingerprint: "" };
    stateMap.set(ctl, { injectedAt: now, lastFingerprint: fingerprint });
    const retrievingStatus = ctl.createStatus({
      status: "loading",
      text: `Searching knowledge base (${validAssigned.join(", ")})...`
    });
    const hits = await searchIndex(
      ctl,
      index,
      query,
      cfg.embeddingModel,
      validAssigned,
      limit,
      affinity
    );
    retrievingStatus.setState({
      status: hits.length > 0 ? "done" : "canceled",
      text: hits.length > 0 ? `Retrieved ${hits.length} relevant citations` : "No relevant citations found"
    });
    if (hits.length === 0) {
      return userMessage;
    }
    const parts = [];
    parts.push(buildCorpusPreamble(validAssigned));
    parts.push("");
    parts.push(
      hits.map(
        (h, i) => `Citation ${i + 1} [${h.corpus} / ${h.document}] (score ${h.score.toFixed(3)}):
${h.text}`
      ).join("\n\n")
    );
    parts.push("");
    parts.push(
      `Use the citations above to respond to the user query, only if they are relevant. Otherwise respond to the best of your ability.

User Query:

${query}`
    );
    userMessage.replaceText(parts.join("\n"));
    return userMessage;
  } catch (err) {
    console.warn("knowledge-base preprocessor error:", err);
    return userMessage;
  }
}
var DEBUG, stateMap;
var init_promptPreprocessor = __esm({
  "src/promptPreprocessor.ts"() {
    "use strict";
    init_config();
    init_settings();
    init_constants();
    init_indexer();
    DEBUG = process.env.LMS_KNOWLEDGE_DEBUG === "1";
    stateMap = /* @__PURE__ */ new Map();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  main: () => main
});
async function main(context) {
  context.withConfigSchematics(configSchematics);
  context.withToolsProvider(toolsProvider);
  context.withPromptPreprocessor(promptPreprocessor);
}
var init_src = __esm({
  "src/index.ts"() {
    "use strict";
    init_config();
    init_toolsProvider();
    init_promptPreprocessor();
  }
});

// .lmstudio/entry.ts
var import_sdk3 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk3.LMStudioClient({
  clientIdentifier,
  clientPasskey,
  baseUrl
});
globalThis.__LMS_PLUGIN_CONTEXT = true;
var predictionLoopHandlerSet = false;
var promptPreprocessorSet = false;
var configSchematicsSet = false;
var globalConfigSchematicsSet = false;
var toolsProviderSet = false;
var generatorSet = false;
var selfRegistrationHost = client.plugins.getSelfRegistrationHost();
var pluginContext = {
  withPredictionLoopHandler: (generate) => {
    if (predictionLoopHandlerSet) {
      throw new Error("PredictionLoopHandler already registered");
    }
    if (toolsProviderSet) {
      throw new Error("PredictionLoopHandler cannot be used with a tools provider");
    }
    predictionLoopHandlerSet = true;
    selfRegistrationHost.setPredictionLoopHandler(generate);
    return pluginContext;
  },
  withPromptPreprocessor: (preprocess) => {
    if (promptPreprocessorSet) {
      throw new Error("PromptPreprocessor already registered");
    }
    promptPreprocessorSet = true;
    selfRegistrationHost.setPromptPreprocessor(preprocess);
    return pluginContext;
  },
  withConfigSchematics: (configSchematics2) => {
    if (configSchematicsSet) {
      throw new Error("Config schematics already registered");
    }
    configSchematicsSet = true;
    selfRegistrationHost.setConfigSchematics(configSchematics2);
    return pluginContext;
  },
  withGlobalConfigSchematics: (globalConfigSchematics) => {
    if (globalConfigSchematicsSet) {
      throw new Error("Global config schematics already registered");
    }
    globalConfigSchematicsSet = true;
    selfRegistrationHost.setGlobalConfigSchematics(globalConfigSchematics);
    return pluginContext;
  },
  withToolsProvider: (toolsProvider2) => {
    if (toolsProviderSet) {
      throw new Error("Tools provider already registered");
    }
    if (predictionLoopHandlerSet) {
      throw new Error("Tools provider cannot be used with a predictionLoopHandler");
    }
    toolsProviderSet = true;
    selfRegistrationHost.setToolsProvider(toolsProvider2);
    return pluginContext;
  },
  withGenerator: (generator) => {
    if (generatorSet) {
      throw new Error("Generator already registered");
    }
    generatorSet = true;
    selfRegistrationHost.setGenerator(generator);
    return pluginContext;
  }
};
Promise.resolve().then(() => (init_src(), src_exports)).then(async (module2) => {
  return await module2.main(pluginContext);
}).then(() => {
  selfRegistrationHost.initCompleted();
}).catch((error) => {
  console.error("Failed to execute the main function of the plugin.");
  console.error(error);
});

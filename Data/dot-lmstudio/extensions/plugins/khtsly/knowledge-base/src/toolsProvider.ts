import * as fs from "fs";
import * as path from "path";
import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import { resolveEffectiveConfig } from "./settings";
import {
  LIST_CORPORA_DEFAULT_LIMIT,
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_AFFINITY_THRESHOLD,
} from "./constants";
import {
  loadIndex,
  saveIndex,
  buildIndex,
  searchIndex,
  getCorpora,
} from "./indexer";
import type { PluginController } from "./pluginTypes";

export async function toolsProvider(ctl: PluginController) {
  const listCorpora = tool({
    name: "list_kb_corpora",
    description:
      "List the knowledge base corpora available in LM Studio. " +
      "Each corpus is a named folder of reference documents. " +
      "Call this to see what knowledge exists, then use search_kb to retrieve relevant chunks.",
    parameters: {
      query: z
        .string()
        .optional()
        .describe("Optional substring to filter corpus names and descriptions."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .describe(`Maximum corpora to return. Defaults to ${LIST_CORPORA_DEFAULT_LIMIT}.`),
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
          note: "No index built yet. Run reindex_kb to index your documents, or add files to the knowledge base folder and reindex.",
        };
      }
      let corpora = getCorpora(index);
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        corpora = corpora.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q),
        );
      }
      return {
        knowledgeBaseDir: cfg.knowledgeBaseDir,
        total: corpora.length,
        corpora: corpora.slice(0, cap),
      };
    },
  });

  const listCorpusDocuments = tool({
    name: "list_kb_documents",
    description:
      "List the documents inside a specific corpus folder. " +
      "Use this to see the raw reference files stored under a corpus before reading one.",
    parameters: {
      corpus: z.string().min(1).describe("Name of the corpus folder to inspect."),
      limit: z.number().int().min(1).max(500).optional(),
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
          error: `Corpus "${corpus}" not found. Call list_kb_corpora to see available corpora.`,
        };
      }
      status(`Listing documents in ${corpus}..`);
      return {
        success: true,
        corpus,
        total: found.documents.length,
        documents: found.documents
          .slice(0, cap)
          .map((d) => ({
            name: d.name,
            path: d.path,
            sizeBytes: d.sizeBytes,
            chunkCount: d.chunks.length,
          })),
      };
    },
  });

  const searchKnowledge = tool({
    name: "search_kb",
    description:
      "Search the knowledge base for chunks relevant to a query using semantic similarity. " +
      "Optionally restrict to a single corpus (folder) or a set of corpora. " +
      "Returns labeled citations with scores; use the corpus, document, and score fields to attribute results. " +
      "Prefer this over reading whole documents when you need a targeted answer.",
    parameters: {
      query: z.string().min(1).describe("The query to search for."),
      corpora: z
        .array(z.string())
        .max(20)
        .optional()
        .describe("Optional corpus names to search within. If omitted, searches all corpora."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(30)
        .optional()
        .describe(`Maximum results to return. Defaults to ${DEFAULT_RETRIEVAL_LIMIT}.`),
      affinity_threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe(`Minimum similarity score. Defaults to ${DEFAULT_AFFINITY_THRESHOLD}.`),
    },
    implementation: async ({ query, corpora, limit, affinity_threshold }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const index = loadIndex();
      if (!index) {
        return {
          success: false,
          error: "No index built. Run reindex_kb to index the knowledge base folder.",
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
        affinity_threshold ?? DEFAULT_AFFINITY_THRESHOLD,
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
          score: Math.round(h.score * 1000) / 1000,
          text: h.text,
        })),
      };
    },
  });

  const readDocument = tool({
    name: "read_kb_document",
    description:
      "Read a full document from the knowledge base by corpus + document name. " +
      "For targeted answers prefer search_kb, which returns only the most relevant chunks.",
    parameters: {
      corpus: z.string().min(1).describe("Corpus (folder) that contains the document."),
      document: z.string().min(1).describe("Document filename within the corpus."),
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
          error: `Document "${document}" not found in corpus "${corpus}". Call list_kb_documents to see files.`,
        };
      }
      status(`Reading ${document}..`);
      const fullText = foundDoc.chunks.map((ch) => ch.text).join("\n\n");
      return {
        success: true,
        corpus,
        document,
        sourcePath: foundDoc.path,
        content: fullText,
      };
    },
  });

  const addDocument = tool({
    name: "add_kb_document",
    description:
      "Add a new reference document to a knowledge base corpus. " +
      "Creates the corpus folder if it does not exist, writes the file, and triggers a re-index so it is immediately available. " +
      "Use this to store reference material for later retrieval.",
    parameters: {
      corpus: z.string().min(1).describe("Corpus folder to add the document to."),
      document: z.string().min(1).describe("Filename to write (e.g. film-noir.md)."),
      content: z.string().describe("The full content of the document."),
    },
    implementation: async ({ corpus, document, content }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      // Guard against path traversal outside the KB root.
      const kbRoot = path.resolve(cfg.knowledgeBaseDir);
      const corpusDir = path.join(kbRoot, corpus);
      const dest = path.resolve(corpusDir, document);
      if (!dest.startsWith(kbRoot + path.sep)) {
        return { success: false, error: "Destination is outside the knowledge base root." };
      }
      status(`Adding ${document} to corpus ${corpus}..`);
      fs.mkdirSync(corpusDir, { recursive: true });
      fs.writeFileSync(dest, content, "utf-8");

      status("Re-indexing knowledge base..");
      await buildIndex(
        ctl,
        cfg.knowledgeBaseDir,
        cfg.embeddingModel,
        cfg.chunkChars,
        cfg.chunkOverlapChars,
        cfg.maxFilesPerCorpus,
      );
      return { success: true, corpus, document, path: dest, bytes: Buffer.byteLength(content, "utf8") };
    },
  });

  const reindex = tool({
    name: "reindex_kb",
    description:
      "Rebuild the knowledge base vector index from the documents on disk. " +
      "Call this after adding, editing, or removing documents so searches reflect the current files.",
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
        cfg.maxFilesPerCorpus,
      );
      saveIndex(index);
      const totalDocs = index.corpora.reduce((n, c) => n + c.documents.length, 0);
      const totalChunks = index.corpora.reduce(
        (n, c) => n + c.documents.reduce((m, d) => m + d.chunks.length, 0),
        0,
      );
      return {
        success: true,
        knowledgeBaseDir: cfg.knowledgeBaseDir,
        corpusCount: index.corpora.length,
        documentCount: totalDocs,
        chunkCount: totalChunks,
        embeddingModel: index.embeddingModel,
      };
    },
  });

  return [listCorpora, listCorpusDocuments, searchKnowledge, readDocument, addDocument, reindex];
}

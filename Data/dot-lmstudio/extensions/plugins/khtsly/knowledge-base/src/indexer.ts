import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { EmbeddingDynamicHandle } from "@lmstudio/sdk";
import { INDEX_FILE } from "./constants";
import { chunkText } from "./chunker";
import { scanCorpora, ScannedFile } from "./scanner";
import type {
  KbIndex,
  KbCorpus,
  KbDocument,
  KbChunk,
  SearchHit,
} from "./types";
import type { PluginController } from "./pluginTypes";

function contentHash(content: string): string {
  return crypto.createHash("sha1").update(content).digest("hex").slice(0, 16);
}

function cosineSimilarity(a: number[], b: number[]): number {
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

export function loadIndex(): KbIndex | null {
  try {
    if (!fs.existsSync(INDEX_FILE)) return null;
    return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")) as KbIndex;
  } catch {
    return null;
  }
}

export function saveIndex(index: KbIndex): void {
  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index), "utf-8");
}

type EmbedFn = (strings: string[]) => Promise<Array<{ embedding: number[] }>>;

async function embedTexts(model: EmbeddingDynamicHandle, texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  // The SDK's embed accepts a batch. Chunk the batch to avoid huge single calls.
  const BATCH = 32;
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const out = await model.embed(slice);
    for (const r of out) results.push(r.embedding);
  }
  return results;
}

async function indexFile(
  model: EmbeddingDynamicHandle,
  file: ScannedFile,
  chunkChars: number,
  chunkOverlapChars: number,
): Promise<KbDocument> {
  const chunks = chunkText(file.content, chunkChars, chunkOverlapChars);
  const embeddings = await embedTexts(model, chunks);
  const kbChunks: KbChunk[] = chunks.map((text, i) => ({
    text,
    sourcePath: file.path,
    embedding: embeddings[i] ?? [],
  }));
  return {
    corpus: file.corpus,
    name: file.name,
    path: file.path,
    contentHash: contentHash(file.content),
    lastModified: file.lastModified,
    sizeBytes: file.sizeBytes,
    chunks: kbChunks,
  };
}

// Rebuild (or refresh) the index for the whole KB. Documents are re-indexed
// only when their content hash or mtime changed, making repeat runs cheap.
export async function buildIndex(
  ctl: PluginController,
  knowledgeBaseDir: string,
  embeddingModel: string,
  chunkChars: number,
  chunkOverlapChars: number,
  maxFilesPerCorpus: number,
): Promise<KbIndex> {
  const existing = loadIndex() ?? { version: 1, embeddingModel, corpora: [] };
  const model = await ctl.client.embedding.model(embeddingModel, {
    signal: ctl.abortSignal,
  });

  const scanned = scanCorpora(knowledgeBaseDir, maxFilesPerCorpus);
  const newCorpora: KbCorpus[] = [];

  for (const corpus of scanned) {
    const prevCorpus = existing.corpora.find((c) => c.name === corpus.name);
    const docs: KbDocument[] = [];
    for (const file of corpus.files) {
      const prevDoc = prevCorpus?.documents.find((d) => d.path === file.path);
      const unchanged =
        prevDoc &&
        prevDoc.contentHash === contentHash(file.content) &&
        prevDoc.lastModified === file.lastModified;
      if (unchanged && prevDoc) {
        docs.push(prevDoc);
        continue;
      }
      docs.push(
        await indexFile(model, file, chunkChars, chunkOverlapChars),
      );
    }
    docs.sort((a, b) => a.name.localeCompare(b.name));
    newCorpora.push({
      name: corpus.name,
      description: corpus.description,
      documents: docs,
      indexedAt: Date.now(),
    });
  }

  newCorpora.sort((a, b) => a.name.localeCompare(b.name));
  const index: KbIndex = { version: 1, embeddingModel, corpora: newCorpora };
  saveIndex(index);
  return index;
}

function collectChunksForCorpora(
  index: KbIndex,
  corpora: string[] | undefined,
): Array<{ corpus: string; document: string; sourcePath: string; text: string; embedding: number[] }> {
  const selected = index.corpora;
  const out: Array<{ corpus: string; document: string; sourcePath: string; text: string; embedding: number[] }> = [];
  for (const corpus of selected) {
    if (corpora && corpora.length > 0 && !corpora.includes(corpus.name)) continue;
    for (const doc of corpus.documents) {
      for (const chunk of doc.chunks) {
        out.push({
          corpus: corpus.name,
          document: doc.name,
          sourcePath: chunk.sourcePath,
          text: chunk.text,
          embedding: chunk.embedding,
        });
      }
    }
  }
  return out;
}

export async function searchIndex(
  ctl: PluginController,
  index: KbIndex,
  query: string,
  embeddingModel: string,
  corpora: string[] | undefined,
  limit: number,
  affinityThreshold: number,
): Promise<SearchHit[]> {
  const model = await ctl.client.embedding.model(embeddingModel, {
    signal: ctl.abortSignal,
  });
  const [{ embedding: queryVector }] = await model.embed([query]);

  const hits: SearchHit[] = [];
  for (const chunk of collectChunksForCorpora(index, corpora)) {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    if (score >= affinityThreshold) {
      hits.push({
        corpus: chunk.corpus,
        document: chunk.document,
        sourcePath: chunk.sourcePath,
        text: chunk.text,
        score,
      });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

export function getCorpora(index: KbIndex): Array<{ name: string; description: string; documentCount: number; chunkCount: number; lastModified: number }> {
  return index.corpora.map((c) => ({
    name: c.name,
    description: c.description,
    documentCount: c.documents.length,
    chunkCount: c.documents.reduce((n, d) => n + d.chunks.length, 0),
    lastModified: c.indexedAt,
  }));
}

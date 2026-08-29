export interface CorpusInfo {
  name: string;
  description: string;
  documentCount: number;
  chunkCount: number;
  lastModified: number;
}

export interface KbDocument {
  corpus: string;
  name: string;
  path: string;
  contentHash: string;
  lastModified: number;
  sizeBytes: number;
  chunks: KbChunk[];
}

export interface KbChunk {
  text: string;
  sourcePath: string;
  embedding: number[];
}

export interface KbCorpus {
  name: string;
  description: string;
  documents: KbDocument[];
  indexedAt: number;
}

// The on-disk index.json schema (regenerable, never hand-edited).
export interface KbIndex {
  version: 1;
  embeddingModel: string;
  corpora: KbCorpus[];
}

export interface SearchHit {
  corpus: string;
  document: string;
  sourcePath: string;
  text: string;
  score: number;
}

export interface PersistedSettings {
  knowledgeBaseDir: string;
  embeddingModel: string;
  chunkChars: number;
  chunkOverlapChars: number;
  maxFilesPerCorpus: number;
}

export interface EffectiveConfig {
  knowledgeBaseDir: string;
  embeddingModel: string;
  chunkChars: number;
  chunkOverlapChars: number;
  maxFilesPerCorpus: number;
}

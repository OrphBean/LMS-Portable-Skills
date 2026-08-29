import { createConfigSchematics } from "@lmstudio/sdk";
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_AFFINITY_THRESHOLD,
  DEFAULT_CHUNK_CHARS,
  DEFAULT_CHUNK_OVERLAP_CHARS,
  DEFAULT_KNOWLEDGE_BASE_DIR,
} from "./constants";

export const configSchematics = createConfigSchematics()
  .field(
    "knowledgeBasePath",
    "string",
    {
      displayName: "Knowledge Base Folder",
      subtitle:
        "Root folder containing one subfolder per corpus. Defaults to ~/.lmstudio/knowledge-base. Leave empty to use last saved value.",
    },
    DEFAULT_KNOWLEDGE_BASE_DIR,
  )
  .field(
    "assignedCorpora",
    "stringArray",
    {
      displayName: "Assigned Corpora",
      subtitle:
        "Per-chat corpora to auto-retrieve from. Named folders under the knowledge base root, e.g. film-noir, prompt-examples. Leave empty to disable auto-RAG for this chat.",
      maxNumItems: 20,
      allowEmptyStrings: false,
    },
    [],
  )
  .field(
    "autoRetrieve",
    "boolean",
    {
      displayName: "Auto-Retrieve in Chat",
      subtitle:
        "When on, the plugin embeds the user query and injects matching chunks from the assigned corpora into each prompt.",
    },
    true,
  )
  .field(
    "retrievalLimit",
    "numeric",
    {
      int: true,
      min: 1,
      displayName: "Retrieval Limit",
      subtitle: "Maximum number of chunks to inject per prompt.",
      slider: { min: 1, max: 10, step: 1 },
    },
    DEFAULT_RETRIEVAL_LIMIT,
  )
  .field(
    "retrievalAffinityThreshold",
    "numeric",
    {
      min: 0.0,
      max: 1.0,
      displayName: "Retrieval Affinity Threshold",
      subtitle:
        "Minimum cosine similarity for a chunk to be considered relevant.",
      slider: { min: 0.0, max: 1.0, step: 0.01 },
    },
    DEFAULT_AFFINITY_THRESHOLD,
  )
  .field(
    "embeddingModel",
    "string",
    {
      displayName: "Embedding Model",
      subtitle:
        "Identifier of the local embedding model used to generate vectors.",
    },
    DEFAULT_EMBEDDING_MODEL,
  )
  .field(
    "chunkChars",
    "numeric",
    {
      int: true,
      min: 200,
      max: 4000,
      displayName: "Chunk Size (chars)",
      subtitle: "Approximate characters per chunk when indexing documents.",
      slider: { min: 200, max: 4000, step: 50 },
    },
    DEFAULT_CHUNK_CHARS,
  )
  .field(
    "chunkOverlapChars",
    "numeric",
    {
      int: true,
      min: 0,
      max: 1000,
      displayName: "Chunk Overlap (chars)",
      subtitle: "Overlap between consecutive chunks.",
      slider: { min: 0, max: 1000, step: 25 },
    },
    DEFAULT_CHUNK_OVERLAP_CHARS,
  )
  .build();

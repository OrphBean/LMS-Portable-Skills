import type { ChatMessage, PromptPreprocessorController } from "@lmstudio/sdk";
import { configSchematics } from "./config";
import { resolveEffectiveConfig } from "./settings";
import {
  MIN_PROMPT_LENGTH,
  REINJECT_INTERVAL_MS,
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_AFFINITY_THRESHOLD,
} from "./constants";
import { loadIndex, searchIndex, buildIndex } from "./indexer";

const DEBUG = process.env.LMS_KNOWLEDGE_DEBUG === "1";
function debugLog(...args: unknown[]): void {
  if (DEBUG) console.debug("[knowledge-base]", ...args);
}

const stateMap = new Map<
  PromptPreprocessorController,
  { injectedAt: number; lastFingerprint: string }
>();

function buildCorpusPreamble(assigned: string[]): string {
  const corpusBlock = assigned.map((c) => `- ${c}`).join("\n");
  return (
    "The following corpora from the knowledge base have been assigned to this chat. " +
    "When relevant, ground your answer in the retrieved citations below.\n\n" +
    `Assigned corpora:\n${corpusBlock}`
  );
}

// Prompt preprocessors are chained: by the time this runs, earlier plugins
// (skills, rag-v1) may have wrapped the raw user text with their own context
// blocks. Extract the actual user query so the semantic search isn't polluted.
function extractUserQuery(text: string): string {
  let clean = text;

  // rag-v1 retrieval-style suffix: "...\n\nUser Query:\n\n<query>"
  const ragRetrieval = clean.split(/\n\nUser Query:\s*\n+/i);
  if (ragRetrieval.length > 1) clean = ragRetrieval.pop() ?? clean;

  // rag-v1 full-content suffix: "...user query.\n\nUser query: <query>"
  const ragFull = clean.split(/[Uu]ser query:\s*/);
  if (ragFull.length > 1) clean = ragFull.pop() ?? clean;

  // skills auto-inject / explicit block: "<available_skills>...</available_skills>\n\n---\n\n<query>"
  const skillsSplit = clean.split(/\n-{3,}\n/);
  if (skillsSplit.length > 1) clean = skillsSplit.pop() ?? clean;

  // Fallback: strip any trailing <skill_context> / <available_skills> blocks.
  clean = clean
    .replace(/<available_skills>[\s\S]*?<\/available_skills>/g, "")
    .replace(/<skill_context>[\s\S]*?<\/skill_context>/g, "")
    .trim();

  return clean || text;
}

export async function promptPreprocessor(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage,
): Promise<ChatMessage> {
  try {
    const text = userMessage.getText();
    if (text.trim().length < MIN_PROMPT_LENGTH) {
      return userMessage;
    }

    const cfg = resolveEffectiveConfig(ctl);
    const c = ctl.getPluginConfig(configSchematics);
    const assigned = (c.get("assignedCorpora") as string[] | undefined) ?? [];
    const autoRetrieve = (c.get("autoRetrieve") as boolean | undefined) ?? true;

    if (!autoRetrieve || assigned.length === 0) {
      debugLog("auto-retrieve skipped (disabled or no assigned corpora)");
      return userMessage;
    }

    // Earlier chained preprocessors may have wrapped the raw query in their own
    // context blocks (skills, rag-v1). Search using the user's actual question.
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
        cfg.maxFilesPerCorpus,
      );
      status.setState({ status: "done", text: "Index built" });
    }

    const knownCorpora = index.corpora.map((x) => x.name);
    const validAssigned = assigned.filter((a) => knownCorpora.includes(a));
    if (validAssigned.length === 0) {
      debugLog("no valid assigned corpora; skipping");
      return userMessage;
    }

    const limit =
      (c.get("retrievalLimit") as number | undefined) ?? DEFAULT_RETRIEVAL_LIMIT;
    const affinity =
      (c.get("retrievalAffinityThreshold") as number | undefined) ??
      DEFAULT_AFFINITY_THRESHOLD;
    const fingerprint = `${validAssigned.join(",")}|${limit}|${affinity}`;
    const now = Date.now();
    const state = stateMap.get(ctl) ?? { injectedAt: 0, lastFingerprint: "" };
    stateMap.set(ctl, { injectedAt: now, lastFingerprint: fingerprint });

    const retrievingStatus = ctl.createStatus({
      status: "loading",
      text: `Searching knowledge base (${validAssigned.join(", ")})...`,
    });

    const hits = await searchIndex(
      ctl,
      index,
      query,
      cfg.embeddingModel,
      validAssigned,
      limit,
      affinity,
    );

    retrievingStatus.setState({
      status: hits.length > 0 ? "done" : "canceled",
      text:
        hits.length > 0
          ? `Retrieved ${hits.length} relevant citations`
          : "No relevant citations found",
    });

    if (hits.length === 0) {
      return userMessage;
    }

    const parts: string[] = [];
    parts.push(buildCorpusPreamble(validAssigned));
    parts.push("");
    parts.push(
      hits
        .map(
          (h, i) =>
            `Citation ${i + 1} [${h.corpus} / ${h.document}] (score ${h.score.toFixed(3)}):\n${h.text}`,
        )
        .join("\n\n"),
    );
    parts.push("");
    parts.push(
      "Use the citations above to respond to the user query, only if they are relevant. " +
        `Otherwise respond to the best of your ability.\n\nUser Query:\n\n${query}`,
    );

    userMessage.replaceText(parts.join("\n"));
    return userMessage;
  } catch (err) {
    console.warn("knowledge-base preprocessor error:", err);
    return userMessage;
  }
}

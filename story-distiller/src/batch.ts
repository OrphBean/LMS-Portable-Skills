import * as fs from "fs";
import * as path from "path";
import { extractText, SUPPORTED_EXTENSIONS } from "./extract";
import { analyzeStory } from "./distill";
import { writeCorpus } from "./output";
import { assignCorporaToKb } from "./kbPlugin";
import type { StoryDistillerLlm } from "./llm";
import type { FocusConfig, StoryInput } from "./types";

export interface BatchOptions {
  kbRoot: string;
  focus: FocusConfig | null;
  sliceChars: number;
  slateChars: number;
  maxCalls: number;
  acts: boolean;
  write: boolean;
  assign: boolean;
  onProgress?: (story: string, message: string) => void;
}

export interface BatchItemResult {
  source: string;
  corpusName: string;
  title: string;
  ok: boolean;
  scenes: number;
  textChars: number;
  failures: number;
  error?: string;
  corpusDir: string;
}

export interface BatchSummary {
  total: number;
  succeeded: number;
  results: BatchItemResult[];
  assigned: string[];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "story";
}

// Recursively collect supported story files from a directory (top level plus
// one nested level), plus any explicit file paths.
export function collectStories(inputs: string[]): string[] {
  const out = new Set<string>();
  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      if (fs.existsSync(path.join(process.cwd(), input))) {
        out.add(path.join(process.cwd(), input));
      }
      continue;
    }
    if (fs.statSync(input).isDirectory()) {
      const walk = (dir: string, depth: number) => {
        if (depth > 2) return;
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walk(full, depth + 1);
          else if (SUPPORTED_EXTENSIONS.has(path.extname(e.name).toLowerCase())) out.add(path.resolve(full));
        }
      };
      walk(input, 0);
    } else {
      out.add(path.resolve(input));
    }
  }
  return [...out].sort();
}

// Runs distillation over a set of story inputs and writes one corpus per story.
export function runBatch(
  inputs: StoryInput[],
  llm: StoryDistillerLlm,
  opts: BatchOptions,
  onEvent?: (e: { story: string; status: string; message?: string }) => void,
): Promise<BatchSummary> {
  const results: BatchItemResult[] = [];
  const emit = (story: string, status: string, message?: string) =>
    onEvent?.({ story, status, message });

  return (async () => {
    for (const input of inputs) {
      const corpusName = slug(path.parse(input.name).name);
      emit(input.name, "processing");
      const item: BatchItemResult = {        source: input.source,
        corpusName,
        title: input.name,
        ok: false,
        scenes: 0,
        textChars: input.text.length,
        failures: 0,
        corpusDir: path.join(opts.kbRoot, corpusName),
      };
      try {
        const analysis = await analyzeStory(llm, opts.focus, input.name, input.text, {
          sliceChars: opts.sliceChars,
          slateChars: opts.slateChars,
          maxCalls: opts.maxCalls,
          acts: opts.acts,
        }, undefined, (m) => opts.onProgress?.(input.name, m));
        item.textChars = analysis.textChars;
        item.failures = analysis.failures;
        item.title = analysis.title;
        if (analysis.cards.length === 0) {
          item.error = "no scenes produced";
          emit(input.name, "failed", item.error);
          results.push(item);
          continue;
        }
        item.scenes = analysis.cards.length;
        if (opts.write) {
          const written = writeCorpus(opts.kbRoot, corpusName, {
            title: analysis.title,
            cards: analysis.cards,
            slates: analysis.slates,
            actSummaries: analysis.actSummaries,
            aspects: opts.focus?.aspects ?? [],
          });
          item.corpusDir = written.corpusDir;
        }
        item.ok = true;
        emit(input.name, "done", `${analysis.cards.length} scenes`);
      } catch (err) {
        item.error = (err as Error).message;
        emit(input.name, "failed", item.error);
      }
      results.push(item);
    }
    const okCorpora = results.filter((r) => r.ok).map((r) => r.corpusName);
    const assigned = opts.write && opts.assign ? assignCorporaToKb(okCorpora) : [];
    return {
      total: results.length,
      succeeded: results.filter((r) => r.ok).length,
      results,
      assigned,
    };
  })();
}

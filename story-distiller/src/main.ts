import * as fs from "fs";
import * as path from "path";
import { segmentText, estimateTokens } from "./segment";
import { formatSlicePlan } from "./prompts";
import { StoryDistillerLlm, DistillError } from "./llm";
import { loadFocusConfig } from "./config";
import { extractText } from "./extract";
import { collectStories, runBatch } from "./batch";
import { analyzeStory } from "./distill";
import { assignCorporaToKb } from "./kbPlugin";
import { resolveBaseUrl } from "./lms";
import { startServer } from "./ui/server";
import type { DistillConfig, FocusConfig, StoryInput } from "./types";

interface Args {
  storyPath: string;
  config: DistillConfig;
  inputs: string[];
  configPath: string | null;
  serve: boolean;
  port: number;
  assign: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const config: DistillConfig = {
    storyPath: "",
    corpusName: "",
    kbRoot: "",
    model: null,
    baseUrl: null,
    sliceChars: DEFAULT_SLICE_CHARS,
    overlapChars: DEFAULT_OVERLAP_CHARS,
    slateChars: DEFAULT_SLATE_CHARS,
    temperature: 0.3,
    maxTokens: 16000,
    maxCalls: 200,
    dryRun: false,
    write: true,
    scenesPerAct: 8,
    acts: false,
    focus: null,
  };
  let help = false;
  let serve = false;
  let port = 4180;
  let assign = true;
  let configPath: string | null = null;
  const positional: string[] = [];
  const inputs: string[] = [];

  const num = (v: string): number => {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`expected a number, got "${v}"`);
    return n;
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "-h":
      case "--help":
        help = true;
        break;
      case "--serve":
        serve = true;
        break;
      case "--port":
        port = num(next());
        break;
      case "--model":
        config.model = next();
        break;
      case "--base-url":
      case "--baseUrl":
        config.baseUrl = next();
        break;
      case "--config":
        configPath = next();
        break;
      case "--corpus":
        config.corpusName = next();
        break;
      case "--input":
      case "--stories":
        inputs.push(...next().split(/[,;]/).map((s) => s.trim()).filter(Boolean));
        break;
      case "--kb-root":
      case "--kbRoot":
        config.kbRoot = next();
        break;
      case "--slice-chars":
        config.sliceChars = num(next());
        break;
      case "--overlap-chars":
        config.overlapChars = num(next());
        break;
      case "--slate-chars":
        config.slateChars = num(next());
        break;
      case "--temperature":
        config.temperature = num(next());
        break;
      case "--max-tokens":
        config.maxTokens = num(next());
        break;
      case "--max-calls":
        config.maxCalls = num(next());
        break;
      case "--scenes-per-act":
        config.scenesPerAct = num(next());
        config.acts = true;
        break;
      case "--acts":
        config.acts = true;
        break;
      case "-d":
      case "--dry-run":
        config.dryRun = true;
        break;
      case "--no-write":
        config.write = false;
        break;
      case "--no-assign":
        assign = false;
        break;
      case "--assign":
        assign = true;
        break;
      default:
        if (a.startsWith("-")) throw new Error(`unknown flag: ${a}`);
        positional.push(a);
    }
  }

  config.storyPath = positional[0] ?? "";
  return { storyPath: config.storyPath, config, inputs, configPath, serve, port, help, assign };
}

const DEFAULT_SLICE_CHARS = 16000;
const DEFAULT_OVERLAP_CHARS = 1200;
const DEFAULT_SLATE_CHARS = 8000;

function helpText(): string {
  return [
    "story-distiller — distill long stories into cinematic scene cards for RAG.",
    "",
    "Usage:",
    "  node dist/main.js <story-path|-|--input paths...> [options]",
    "  node dist/main.js --serve                  # launch the HTML UI",
    "",
    "Options:",
    "  --model <id>            LM Studio model (default: currently loaded model)",
    "  --base-url <ws://...>   LM Studio server (default: ws://127.0.0.1:1234)",
    "  --input <path>[,path]   Story file(s) or folder(s) to process (batch)",
    "  --config <json>         Focus config: instructions + aspects (mise en scène, etc.)",
    "  --corpus <name>         KB corpus folder (single-story; default derived from title)",
    "  --kb-root <dir>         knowledge-base root (default: <repo>/Data/dot-lmstudio/knowledge-base)",
    "  --slice-chars <n>       source chars per slice (default 16000)",
    "  --overlap-chars <n>     overlap carried between slices (default 1200)",
    "  --slate-chars <n>       max carried slate chars (default 8000)",
    "  --temperature <n>       sampling temperature (default 0.3)",
    "  --max-tokens <n>        max output tokens per call (default 8000)",
    "  --max-calls <n>         safety cap on model calls per story (default 200)",
    "  --acts                  build act/sequence summaries (default off)",
    "  --no-write              run analysis but skip writing the corpus",
    "  --assign / --no-assign  auto-add written corpora to the KB plugin (default on)",
    "  --serve [--port n]      start the local HTML UI (default port 4180)",
    "  -d, --dry-run           segment + print plan only (no LM Studio, no output)",
    "  -h, --help              show this help",
    "",
    "Example:",
    "  node dist/main.js sample.md --model my-llm --acts --config focus.json",
    "  node dist/main.js --input stories/ --model my-llm --acts",
    "  node dist/main.js --serve",
  ].join("\n");
}

function readText(storyPath: string): { title: string; text: string } {
  const text =
    storyPath === "-"
      ? fs.readFileSync(0, "utf-8")
      : fs.readFileSync(storyPath, "utf-8");
  const m = text.match(/^\s*#\s+(.+)$/m);
  const title = m ? m[1].trim() : path.parse(storyPath).name;
  return { title, text };
}

function readTitleFromText(name: string, text: string): string {
  const m = text.match(/^\s*#\s+(.+)$/m);
  return m ? m[1].trim() : name;
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultKbRoot(): string {
  return path.resolve(__dirname, "..", "..", "Data", "dot-lmstudio", "knowledge-base");
}

function dryRunPlan(inputs: StoryInput[], focus: FocusConfig | null): void {
  for (const input of inputs) {
    process.stdout.write(`\n== ${input.name} == (${input.text.length} chars ~${estimateTokens(input.text.length)} tok)\n`);
    const slices = segmentText(input.text, {
      sliceChars: DEFAULT_SLICE_CHARS,
      overlapChars: DEFAULT_OVERLAP_CHARS,
    });
    process.stdout.write(`  segmented into ${slices.length} slice(s)\n`);
    for (const s of slices.slice(0, 6)) {
      process.stdout.write(`    ${formatSlicePlan(s, DEFAULT_SLATE_CHARS).replace(/\n/g, "\n    ")}\n`);
    }
    if (slices.length > 6) process.stdout.write(`    … ${slices.length - 6} more\n`);
    if (focus?.aspects.length) {
      process.stdout.write(`  focus aspects: ${focus.aspects.map((a) => a.key).join(", ")}\n`);
    }
  }
  process.stdout.write("\nDRY-RUN: no LM Studio call, nothing written.\n");
}

async function main(): Promise<void> {
  const { storyPath, config, inputs, configPath, serve, port, help, assign } = parseArgs(process.argv);

  if (help) {
    process.stdout.write(helpText() + "\n");
    process.exit(0);
  }

  config.kbRoot = path.resolve(config.kbRoot || defaultKbRoot());
  const focus = loadFocusConfig(configPath);
  config.focus = focus;
  const baseUrl = resolveBaseUrl(config.baseUrl);
  config.baseUrl = baseUrl;

  if (serve) {
    await startServer({
      kbRoot: config.kbRoot,
      model: config.model,
      baseUrl,
      sliceChars: config.sliceChars,
      slateChars: config.slateChars,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      acts: config.acts,
      assign,
      defaultFocus: focus,
    }, port);
    return;
  }

  if (!storyPath && inputs.length === 0) {
    process.stderr.write(helpText() + "\n\nProvide a story path, --input path(s), or --serve.\n");
    process.exit(1);
  }

  // Resolve story files.
  let files: string[] = [];
  if (inputs.length > 0) {
    files = collectStories(inputs);
  } else {
    files = collectStories([storyPath]);
  }
  if (files.length === 0) {
    process.stderr.write("No readable story files found.\n");
    process.exit(1);
  }

  // Build story inputs (extract text).
  const storyInputs: StoryInput[] = [];
  for (const f of files) {
    const base = path.basename(f);
    let text: string;
    try {
      text = await extractText(f);
    } catch (err) {
      process.stderr.write(`skip ${base}: ${(err as Error).message}\n`);
      continue;
    }
    storyInputs.push({ name: base, text, source: f, ext: path.extname(f).toLowerCase() });
  }
  if (storyInputs.length === 0) {
    process.stderr.write("No stories extracted.\n");
    process.exit(1);
  }

  process.stdout.write(`Stories: ${storyInputs.length}\n`);
  for (const s of storyInputs) process.stdout.write(`  - ${s.name} (${s.text.length} chars)\n`);
  if (focus) {
    process.stdout.write(`Focus: ${focus.instructions || "(none)"} | aspects: ${focus.aspects.map((a) => a.key).join(", ") || "(none)"}\n`);
  }
  process.stdout.write(`KB root: ${config.kbRoot}\n\n`);

  const single = storyInputs.length === 1 && inputs.length === 0;
  config.corpusName = slug(single ? config.corpusName || readTitleFromText(storyInputs[0].name, storyInputs[0].text) : storyInputs[0].name);

  if (config.dryRun) {
    dryRunPlan(storyInputs, focus);
    return;
  }

  const llm = new StoryDistillerLlm({
    baseUrl: config.baseUrl ?? undefined,
    model: config.model ?? undefined,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });
  await llm.connect();
  const ctx = await llm.contextLength();
  if (ctx) process.stdout.write(`Context window: ${ctx} tokens\n`);

  if (single) {
    const input = storyInputs[0];
    const analysis = await analyzeStory(llm, focus, input.name, input.text, {
      sliceChars: config.sliceChars,
      slateChars: config.slateChars,
      maxCalls: config.maxCalls,
      acts: config.acts,
    });
    process.stdout.write(`\nDone: ${analysis.cards.length} scenes, ${analysis.failures} failed slices.\n`);
    if (analysis.cards.length > 0 && config.write) {
      const { writeCorpus } = await import("./output");
      const written = writeCorpus(config.kbRoot, config.corpusName, {
        title: analysis.title,
        cards: analysis.cards,
        slates: analysis.slates,
        actSummaries: analysis.actSummaries,
        aspects: focus?.aspects ?? [],
      });
      process.stdout.write(`Corpus written:\n`);
      for (const f of written.files) process.stdout.write(`  ${f}\n`);
      if (assign) {
        const assigned = assignCorporaToKb([config.corpusName]);
        process.stdout.write(`Auto-assigned KB corpus: ${assigned.join(", ")}\n`);
      }
      process.stdout.write(`\nAssign corpus "${config.corpusName}" in the knowledge-base plugin config with Auto-Retrieve on.\n`);
    } else if (analysis.cards.length === 0) {
      process.stderr.write("No scenes produced; nothing written. Inspect .failures/ and re-run.\n");
    }
    return;
  }

  // Batch over many stories.
  const summary = await runBatch(
    storyInputs,
    llm,
    {
      kbRoot: config.kbRoot,
      focus,
      sliceChars: config.sliceChars,
      slateChars: config.slateChars,
      maxCalls: config.maxCalls,
      acts: config.acts,
      write: config.write,
      assign,
      onProgress: (story: string, message: string) =>
        process.stdout.write(`      ${story}: ${message}\n`),
    },
    (e) => process.stdout.write(`  [${e.status}] ${e.story}${e.message ? ` — ${e.message}` : ""}\n`),
  );

  process.stdout.write(`\nBatch: ${summary.succeeded}/${summary.total} stories distilled.\n`);
  for (const r of summary.results) {
    const flag = r.ok ? "ok" : `FAILED (${r.error})`;
    process.stdout.write(`  ${flag.padEnd(24)} ${r.source} -> ${r.corpusName} (${r.scenes} scenes)\n`);
  }
  if (summary.assigned.length) {
    process.stdout.write(`Auto-assigned KB corpora: ${summary.assigned.join(", ")}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`\nERROR: ${err instanceof DistillError ? err.message : (err as Error).message}\n`);
  process.exit(1);
});

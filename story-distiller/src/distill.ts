import { segmentText, estimateTokens } from "./segment";
import { makeEmptySlate } from "./prompts";
import type { StoryDistillerLlm } from "./llm";
import { DistillError } from "./llm";
import type {
  FocusConfig,
  SceneCard,
  ScenePass,
  Slate,
} from "./types";

export interface StoryAnalysis {
  title: string;
  textChars: number;
  cards: SceneCard[];
  slates: Slate[];
  actSummaries: Array<{ actNumber: number; summary: string }>;
  failures: number;
}

export interface AnalyzeParams {
  sliceChars: number;
  slateChars: number;
  maxCalls: number;
  acts: boolean;
}

function conform(pass: ScenePass, index: number, actNumber: number, focus: FocusConfig | null): SceneCard {
  const aspects: Record<string, string> = {};
  for (const a of focus?.aspects ?? []) {
    const v = (pass.scene as Record<string, unknown>)[a.key];
    aspects[a.key] = typeof v === "string" ? v : "";
  }
  return {
    index,
    actNumber,
    sourceSlice: index,
    title: pass.scene.title,
    logline: pass.scene.logline,
    timeAndPlace: pass.scene.timeAndPlace,
    characters: pass.scene.characters,
    conflict: pass.scene.conflict,
    beats: pass.scene.beats,
    actions: pass.scene.actions,
    language: pass.scene.language,
    visualLanguage: pass.scene.visualLanguage,
    mood: pass.scene.mood,
    foreshadow: (pass.scene as { foreshadow?: string[] }).foreshadow ?? [],
    summary: pass.scene.summary,
    aspects,
  };
}

// Runs the carry-forward slate loop for a single story and returns the distilled
// scene cards (no corpus write; use the caller for output). Safe for long
// stories: only one slice + slate + prompt is ever in the window at a time.
export async function analyzeStory(
  llm: StoryDistillerLlm,
  focus: FocusConfig | null,
  title: string,
  text: string,
  params: AnalyzeParams,
  onLog?: (line: string) => void,
  onProgress?: (message: string) => void,
): Promise<StoryAnalysis> {
  const log = onLog ?? ((s: string) => process.stdout.write(s));
  const progress = onProgress ?? (() => {});
  const slices = segmentText(text, {
    sliceChars: params.sliceChars,
    overlapChars: Math.round(params.sliceChars * 0.08),
  });
  log(`  sliced into ${slices.length} chunk(s)\n`);
  progress(`Sliced into ${slices.length} chunk(s)`);

  const cards: SceneCard[] = [];
  const slates: Slate[] = [];
  let slate: Slate = makeEmptySlate();
  let actNumber = 1;
  let calls = 0;
  let failures = 0;
  const total = slices.length;

  for (const slice of slices) {
    if (calls >= params.maxCalls) {
      log(`  stopped at maxCalls=${params.maxCalls}\n`);
      progress(`Stopped at maxCalls=${params.maxCalls}`);
      break;
    }
    log(`  slice ${slice.index} (~${estimateTokens(slice.text.length)} tok): analyzing…\n`);
    progress(`Slice ${slice.index + 1}/${total} analyzing (~${estimateTokens(slice.text.length)} tok)…`);
    try {
      const pass = await llm.analyzeSlice(slice, slate, params.slateChars, focus);
      calls++;
      actNumber = Math.max(actNumber, pass.slate.actNumber);
      cards.push(conform(pass, slice.index, actNumber, focus));
      slate = pass.slate;
      slates.push(slate);
      log(`    -> ${pass.scene.title}\n`);
      progress(`Slice ${slice.index + 1}/${total} done — ${pass.scene.title}`);

      const serialized = JSON.stringify(slate).length;
      if (serialized > params.slateChars) {
        try {
          slate = await llm.compactSlate(slate, params.slateChars);
          calls++;
          log(`    -> slate compacted (${serialized} -> ${JSON.stringify(slate).length} chars)\n`);
        } catch (err) {
          log(`    -> slate compaction failed (kept uncapped slate): ${(err as Error).message}\n`);
        }
      }
    } catch (err) {
      failures++;
      const raw = (err as DistillError).raw;
      log(`    -> slice ${slice.index} FAILED: ${(err as Error).message}${raw ? " (raw saved to .failures)" : ""}\n`);
      progress(`Slice ${slice.index + 1}/${total} FAILED — ${(err as Error).message}`);
      if (raw) {
        const failDir = process.env.DISTILL_FAILURES_DIR || ".failures";
        require("fs").mkdirSync(failDir, { recursive: true });
        require("fs").writeFileSync(`${failDir}/${slugSafe(title)}-slice-${slice.index}.json`, raw, "utf-8");
      }
    }
  }

  const actSummaries: Array<{ actNumber: number; summary: string }> = [];
  if (params.acts && cards.length > 0) {
    const grouped = new Map<number, SceneCard[]>();
    for (const c of cards) {
      const list = grouped.get(c.actNumber) ?? [];
      list.push(c);
      grouped.set(c.actNumber, list);
    }
    for (const [n, group] of [...grouped.entries()].sort((a, b) => a[0] - b[0])) {
      try {
        const summary = await llm.reduceAct(
          title,
          n,
          group.map((c) => ({ index: c.index, title: c.title, logline: c.logline })),
        );
        calls++;
        actSummaries.push({ actNumber: n, summary });
        log(`    act ${n}: ${summary.slice(0, 70)}…\n`);
      } catch (err) {
        log(`    act ${n} summary failed: ${(err as Error).message}\n`);
      }
    }
  }

  return { title, textChars: text.length, cards, slates, actSummaries, failures };
}

export function slugSafe(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

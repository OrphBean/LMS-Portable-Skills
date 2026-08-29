import { LMStudioClient } from "@lmstudio/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  buildScenePassSchema,
  slateSchema,
  type FocusConfig,
  type ScenePass,
  type Slate,
  type Slice,
} from "./types";
import { buildSlicePrompt, buildSlateCompactionPrompt } from "./prompts";

export interface LlmOptions {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  structured?: boolean;
}

export class DistillError extends Error {
  readonly raw?: string;
  constructor(message: string, raw?: string) {
    super(message);
    this.name = "DistillError";
    this.raw = raw;
  }
}

// Strip ANSI color escapes and box-drawing noise the SDK prints for errors.
function cleanLmsError(msg: string): string {
  const cleaned = msg
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/[│┌┐└┘─╮╭╯╰]/g, "")
    .replace(/\s+\n\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
  return cleaned.length > 220 ? cleaned.slice(0, 220) + "…" : cleaned;
}

// ----- Robust JSON extraction -------------------------------------------------
// Local models frequently wrap JSON in fences, add a reasoning preamble, and
// sometimes truncate the object when the token budget runs out. These helpers
// strip fences/preamble, repair common defects (smart quotes, trailing commas,
// unclosed braces) and try a series of increasingly tolerant parses.

function stripFences(text: string): string {
  const fence = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fence ? fence[1] : text).trim();
}

function repairJson(t: string): string {
  let s = t.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/,\s*([}\]])/g, "$1");
  const open: string[] = [];
  for (const ch of s) {
    if (ch === "{" || ch === "[") open.push(ch);
    else if (ch === "}" || ch === "]") {
      const o = open.pop();
      if (!o || (ch === "}" && o !== "{") || (ch === "]" && o !== "[")) {
        return s;
      }
    }
  }
  while (open.length) s += open.pop() === "{" ? "}" : "]";
  return s;
}

export function extractJsonBlock(text: string): string {
  let t = stripFences(text).replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  const first = t.indexOf("{");
  if (first === -1) return t;
  return t.slice(first); // from the first '{' to the end (may be truncated)
}

// LM Studio wraps a model's chain-of-thought in a synthetic reasoning block and
// separates it from the answer with an internal marker. The reasoning text often
// itself contains a draft JSON, so we must discard everything up to the marker.
function stripReasoning(t: string): string {
  const marker = "__LM_STUDIO_INTERNAL_LSEP_SYNTHETIC_REASONING_END__";
  const idx = t.lastIndexOf(marker);
  if (idx !== -1) return t.slice(idx + marker.length);
  return t;
}

export function tryParseJson(raw: string): unknown {
  let t = stripFences(raw);
  t = stripReasoning(t);
  const first = t.indexOf("{");
  if (first === -1) throw new Error("no JSON object found in output");
  const candidates: string[] = [];
  const last = t.lastIndexOf("}");
  if (last >= first) candidates.push(t.slice(first, last + 1));
  candidates.push(repairJson(t.slice(first)));
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* try next candidate */
    }
  }
  throw new Error("could not parse a JSON object from the model output");
}

export class StoryDistillerLlm {
  private client: LMStudioClient;
  private handle: any;
  private opts: LlmOptions;

  constructor(opts: LlmOptions) {
    this.opts = opts;
    this.client = new LMStudioClient(opts.baseUrl ? { baseUrl: opts.baseUrl } : {});
  }

  async connect(): Promise<void> {
    try {
      if (this.opts.model) {
        // Prefer a model key/path; if it is not already loaded, ask LM Studio
        // to load it (reading the file from wherever it lives).
        try {
          this.handle = await this.client.llm.model(this.opts.model);
        } catch {
          try {
            await this.client.llm.load(this.opts.model);
          } catch {
            /* fall through to model() which will surface a clear error */
          }
          this.handle = await this.client.llm.model(this.opts.model);
        }
      } else {
        this.handle = await this.client.llm.model();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Surface the most useful hint instead of the raw SDK box.
      if (/No loaded model|don't have any models loaded/i.test(msg)) {
        throw new DistillError(
          "No model is loaded in LM Studio. Load your chat model in the LM Studio UI, " +
            "or type its model key (e.g. \"qwen3.8-27b-unleashed-ud\") in the Model field and retry.",
        );
      }
      throw new DistillError(
        `Could not connect to LM Studio / load a model: ${cleanLmsError(msg)}`,
      );
    }
  }

  async contextLength(): Promise<number | null> {
    try {
      return await this.handle.getContextLength();
    } catch {
      return null;
    }
  }

  private async complete(system: string, user: string): Promise<string> {
    if (!this.handle) {
      throw new DistillError("LM Studio not connected; call connect() first.");
    }
    const res = await this.handle.respond(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: this.opts.temperature ?? 0.3,
        maxTokens: this.opts.maxTokens ?? 4000,
      },
    );
    // Thinking models prepend a reasoning block (the SDK splits it into
    // reasoningContent). The actual answer lives in nonReasoningContent.
    return ((res.nonReasoningContent as string) || (res.content as string)) ?? "";
  }

  // Structured output constrains generation to a JSON schema, which guarantees
  // the JSON completes (free-form the model sometimes truncates mid-object).
  // Reading the whole response and running it through tryParseJson still strips
  // any reasoning preamble the model emits (thinking on/off).
  private async respondJson<T>(
    schema: { parse: (input: any) => T },
    jsonSchema: unknown,
    system: string,
    user: string,
  ): Promise<T | null> {
    if (!this.handle || this.opts.structured === false) return null;
    try {
      const res = await this.handle.respond(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        {
          temperature: this.opts.temperature ?? 0.3,
          maxTokens: this.opts.maxTokens ?? 16000,
          structured: { type: "json", jsonSchema } as any,
        },
      );
      const raw = ((res.nonReasoningContent as string) || (res.content as string)) ?? "";
      return schema.parse(tryParseJson(raw));
    } catch {
      return null;
    }
  }

  async analyzeSlice(
    slice: Slice,
    slate: Slate | null,
    slateChars: number,
    focus: FocusConfig | null,
  ): Promise<ScenePass> {
    const { system, user } = buildSlicePrompt(slice, slate, slateChars, focus);
    const schema = buildScenePassSchema(focus?.aspects ?? []);

    const structured = await this.respondJson<ScenePass>(
      schema as any,
      zodToJsonSchema(schema as any) as unknown,
      system,
      user,
    );
    if (structured) return structured;

    const raw = await this.complete(system, user);
    try {
      return schema.parse(tryParseJson(raw));
    } catch (err) {
      throw new DistillError(
        `slice ${slice.index}: model output failed to match schema — ${(err as Error).message}`,
        raw,
      );
    }
  }

  async compactSlate(slate: Slate, slateChars: number): Promise<Slate> {
    const system = "You produce strict JSON only.";
    const user = buildSlateCompactionPrompt(slate, slateChars);
    const structured = await this.respondJson<Slate>(
      slateSchema as any,
      zodToJsonSchema(slateSchema as any) as unknown,
      system,
      user,
    );
    if (structured) return structured;

    const raw = await this.complete(system, user);
    try {
      return slateSchema.parse(tryParseJson(raw));
    } catch (err) {
      throw new DistillError(
        `slate compaction failed to parse — ${(err as Error).message}`,
        raw,
      );
    }
  }

  async reduceAct(title: string, actNumber: number, cards: { index: number; title: string; logline: string }[]): Promise<string> {
    const system = [
      "You are a film story editor. Given the loglines of a contiguous run of scenes, write a",
      "compact, cinematic act summary: 2-4 sentences capturing the arc, the turn, the stakes,",
      "and where the next act picks up. Plain prose only.",
    ].join("\n");
    const user = [
      `Story: ${title}`,
      `Act ${actNumber} comprises ${cards.length} scenes.`,
      "",
      "<scenes>",
      cards.map((c) => `scene ${c.index}. ${c.title} — ${c.logline}`).join("\n"),
      "</scenes>",
    ].join("\n");
    return (await this.complete(system, user)).trim();
  }
}

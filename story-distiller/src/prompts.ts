import type { Aspect, FocusConfig, SceneCard, Slate, Slice } from "./types";
import { estimateTokens } from "./segment";

function sceneContract(aspects: Aspect[]): string {
  const aspectFields = aspects
    .map((a) => `    "${a.key}": string,`)
    .join("\n");
  return `{
  "scene": {
    "title": string,
    "logline": string,
    "timeAndPlace": string,
    "characters": [{ "name": string, "roleInScene": string, "state": string }],
    "conflict": string,
    "beats": [{ "label": string, "action": string }],
    "actions": [string],
    "language": string,
    "visualLanguage": [string],
    "mood": [string],
    "foreshadow": [string],
    "summary": string
${aspectFields}
  },
  "slate": {
    "actNumber": number,
    "loglineSoFar": string,
    "characters": [{ "name": string, "state": string, "goal": string }],
    "timelinePosition": string,
    "planted": [string],
    "openThreads": [string],
    "lastSceneSummary": string
  }
}`;
}

function aspectGuidance(aspects: Aspect[]): string[] {
  if (aspects.length === 0) return [];
  return [
    "",
    "Additionally, for EACH scene extract the requested focus aspects into the matching",
    `top-level "scene" fields (${aspects.map((a) => `"${a.key}"`).join(", ")}):`,
    ...aspects.map((a) => `- "${a.key}" (${a.label}): ${a.prompt}`),
    "- Keep each focus value a concise, concrete observational string (under ~160 chars).",
  ];
}

function systemPrompt(focus: FocusConfig | null): string {
  const aspects = focus?.aspects ?? [];
  const instruction = focus?.instructions ? [`- Focus directive: ${focus.instructions}`] : [];
  return [
    "You are a film analyst and story editor. Your job is to turn a slice of a long story into a",
    "scene-for-scene distillation that can be used to seed cinematic prompts for video generation.",
    "",
    "Principles:",
    "- Be concrete and visual. Prefer specific image/lens/lighting words over abstract praise.",
    "- Extract usable film LANGUAGE: crisp dialogue you could lift, and photographic language",
    "  (environment, palette, light, texture, framing) that maps to a MiniMax/veo prompt.",
    "- Preserve continuity exactly. The carried slate is the source of truth for what already",
    "  happened. Never contradict it; add only what this slice reveals.",
    "- Distill, do not rewrite. Do NOT reproduce the prose. Compress to the dramatic bones.",
    "- If a scene/conflict is long or ambiguous, pick the strongest thread; note leftovers in",
    "  the slate's openThreads.",
    "- Keep arrays compact so the JSON always completes: characters <= 3,",
    "  visualLanguage <= 5, actions <= 4, beats <= 5, mood <= 4; each string under ~80 chars;",
    "  scene.summary under ~50 words.",
    ...instruction,
    ...aspectGuidance(aspects),
    "",
    "Do NOT include any reasoning, thinking, explanation or markdown. Output ONLY the single JSON",
    "object with this exact shape:",
    "",
    sceneContract(aspects),
  ].join("\n");
}

export function buildSlicePrompt(
  slice: Slice,
  slate: Slate | null,
  slateChars: number,
  focus: FocusConfig | null,
): { system: string; user: string } {
  const user = [
    "<carried_state>",
    slate ? JSON.stringify(slate, null, 2) : "null (this is the first slice; establish setting, characters and the inciting turn)",
    "</carried_state>",
    "",
    `<story_slice index="${slice.index}">`,
    slice.text,
    "</story_slice>",
    "",
    "Analyze this slice and return the JSON object. In 'scene.summary' keep it short and",
    "self-contained (it is what gets embedded for retrieval). In 'slate' carry forward",
    "characters, their state and goal, planted items, and unresolved threads. Keep the slate",
    `below ~${slateChars} characters.`,
  ].join("\n");

  return { system: systemPrompt(focus), user };
}

export function buildSlateCompactionPrompt(slate: Slate, slateChars: number): string {
  return [
    "Condense this story slate while preserving every essential continuity detail",
    "(characters, their states and goals, timeline position, planted items, open threads).",
    `Return ONLY a JSON object matching: {"actNumber":number,"loglineSoFar":string,"characters":[{"name":string,"state":string,"goal":string}],"timelinePosition":string,"planted":[string],"openThreads":[string],"lastSceneSummary":string}`,
    "",
    `Keep it under ~${slateChars} characters. Output only the JSON.`,
    "",
    "<slate>",
    JSON.stringify(slate, null, 2),
    "</slate>",
  ].join("\n");
}

export function buildActReductionPrompt(
  title: string,
  actNumber: number,
  cards: SceneCard[],
): string {
  const loglines = cards.map((c) => `scene ${c.index}. ${c.title} — ${c.logline}`).join("\n");
  return [
    `Story: ${title}`,
    `Act ${actNumber} comprises ${cards.length} scenes.`,
    "",
    "Write 2-4 sentences for the film's act summary: the arc, the turn, what is at stake by",
    "the end, and where the next act picks up. Plain prose, no JSON.",
    "",
    "<scenes>",
    loglines,
    "</scenes>",
  ].join("\n");
}

export function formatSlicePlan(slice: Slice, slateChars: number): string {
  const est = estimateTokens(slice.text.length);
  return [
    `slice ${slice.index}: ${slice.text.length} chars (~${est} tok)  [${slice.startChar}..${slice.endChar}]`,
    `  head: ${slice.text.slice(0, 120).replace(/\n/g, " ")}…`,
    `  slate budget: ~${slateChars} chars`,
  ].join("\n");
}

export function makeEmptySlate(): Slate {
  return {
    actNumber: 1,
    loglineSoFar: "",
    characters: [],
    timelinePosition: "unknown",
    planted: [],
    openThreads: [],
    lastSceneSummary: "",
  };
}

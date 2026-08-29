import * as fs from "fs";
import * as path from "path";
import type { Aspect, SceneCard, Slate } from "./types";

export interface WrittenCorpus {
  corpusDir: string;
  files: string[];
  sceneCount: number;
  charCount: number;
}

function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "story";
}

function sceneMarkdown(card: SceneCard, aspects: Aspect[]): string {
  const chars = card.characters
    .map((c) => `- **${c.name}** (${c.roleInScene}) — ${c.state}`)
    .join("\n");
  const beats = card.beats
    .map((b) => `- **${b.label}** — ${b.action}`)
    .join("\n");
  const list = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
  const aspectBlock = aspects
    .map((a) => `- **${a.label}:** ${card.aspects?.[a.key] || "_none_"}`)
    .join("\n");
  const md = [
    `# Scene ${card.index} — ${card.title}`,
    "",
    `**Logline:** ${card.logline}`,
    "",
    `**Time & Place:** ${card.timeAndPlace}`,
    "",
    `**Conflict:** ${card.conflict}`,
    "",
    "**Characters:**",
    chars || "_none_",
    "",
    "**Beats:**",
    beats || "_none_",
    "",
    "**Actions:**",
    list(card.actions) || "_none_",
    "",
    "**Language / dialogue worth lifting:**",
    card.language || "_none_",
    "",
    "**Visual / cinematic language (for MiniMax prompt):**",
    list(card.visualLanguage) || "_none_",
    "",
    "**Mood / tone:**",
    card.mood.map((m) => `\`${m}\``).join(" ") || "_none_",
    "",
    "**Planted / foreshadowed:**",
    card.foreshadow.map((f) => `- ${f}`).join("\n") || "_none_",
    "",
    "**Summary (retrieval unit):**",
    card.summary,
    "",
  ];
  if (aspectBlock) {
    md.splice(md.length - 1, 0, "**Focus aspects:**", aspectBlock, "");
  }
  return md.join("\n");
}

function characterSheet(cards: SceneCard[]): string {
  const map = new Map<string, { first: number; states: string[]; lastScene: number }>();
  for (const card of cards) {
    for (const c of card.characters) {
      const entry = map.get(c.name) ?? { first: card.index, states: [], lastScene: card.index };
      entry.states.push(Array.isArray(c.state) ? String(c.state) : c.state);
      entry.lastScene = card.index;
      map.set(c.name, entry);
    }
  }
  const lines = ["# Characters", ""];
  for (const [name, e] of [...map.entries()].sort((a, b) => a[1].first - b[1].first)) {
    const uniqueStates = [...new Set(e.states)].join(" → ");
    lines.push(`## ${name}`);
    lines.push(`- First seen: scene ${e.first}`);
    lines.push(`- Last seen: scene ${e.lastScene}`);
    lines.push(`- Arc: ${uniqueStates}`);
    lines.push("");
  }
  return lines.join("\n");
}

function languageSheet(cards: SceneCard[]): string {
  const visual = new Set<string>();
  const mood = new Set<string>();
  for (const card of cards) {
    for (const v of card.visualLanguage) visual.add(v);
    for (const m of card.mood) mood.add(m);
  }
  const lines = [
    "# Language & Visual Bank",
    "",
    "Gathered, highly-distilled film language for prompt dev (MiniMax / image gen).",
    "",
    "## Visual / photographic language",
    ...(visual.size ? [...visual].map((v) => `- ${v}`) : ["_none_"]),
    "",
    "## Mood / tone keywords",
    (mood.size ? [...mood].map((m) => `\`${m}\``).join(" ") : "_none_"),
    "",
  ];
  return lines.join("\n");
}

function loglineSheet(title: string, cards: SceneCard[]): string {
  const acts = cards.map((c) => c.actNumber);
  const distinctActs = [...new Set(acts)];
  const lines = [
    `# ${title}`,
    "",
    `**Scenes:** ${cards.length}`,
    distinctActs.length > 1 ? `**Acts:** ${distinctActs.length}` : "",
    "",
    "## Act-by-act logline",
    "",
  ].filter(Boolean);
  for (const act of distinctActs) {
    const actCards = cards.filter((c) => c.actNumber === act).sort((a, b) => a.index - b.index);
    lines.push(`### Act ${act} (scenes ${actCards[0].index}–${actCards[actCards.length - 1].index})`);
    for (const c of actCards) lines.push(`- Scene ${c.index}: ${c.logline}`);
    lines.push("");
  }
  return lines.join("\n");
}

export interface CorpusInput {
  title: string;
  cards: SceneCard[];
  slates: Slate[];
  actSummaries: Array<{ actNumber: number; summary: string }>;
  aspects: Aspect[];
}

export function writeCorpus(kbRoot: string, corpusName: string, input: CorpusInput): WrittenCorpus {
  const corpusDir = path.join(kbRoot, corpusName);
  fs.mkdirSync(corpusDir, { recursive: true });

  const files: string[] = [];
  const push = (name: string, content: string) => {
    const full = path.join(corpusDir, name);
    fs.writeFileSync(full, content, "utf-8");
    files.push(full);
  };

  const description =
    input.cards[0]?.logline ?? "Distilled scene breakdown generated for cinematic prompt use.";
  push(
    "_corpus.md",
    [
      description,
      "",
      `Auto-distilled from a long story. Assign this corpus (${corpusName}) in the knowledge-base`,
      "plugin config and leave Auto-Retrieve on to inject grounded scene material into prompts.",
      "",
    ].join("\n"),
  );

  push(
    "story.md",
    loglineSheet(input.title, input.cards),
  );
  push(
    "characters.md",
    characterSheet(input.cards),
  );
  push(
    "language.md",
    languageSheet(input.cards),
  );

  for (const card of input.cards) {
    push(`scene-${String(card.index).padStart(4, "0")}.md`, sceneMarkdown(card, input.aspects));
  }

  const actNames = input.actSummaries.map((a) => a.actNumber);
  if (input.actSummaries.length > 0) {
    for (const a of input.actSummaries) {
      push(`act-${String(a.actNumber).padStart(2, "0")}.md`, `# Act ${a.actNumber}\n\n${a.summary}\n`);
    }
  }

  // Derived raw pass data. Never hand-edit; it is regenerable and only for
  // re-processing/inspection, like the KB plugin's index.json.
  const raw = {
    title: input.title,
    corpus: corpusName,
    generatedAt: new Date().toISOString(),
    actSummaries: input.actSummaries,
    scenes: input.cards,
    slates: input.slates,
  };
  push("_distill.json", JSON.stringify(raw, null, 2));

  const sceneCount = input.cards.length;
  const charCount = cardsCharCount(input.cards);
  return { corpusDir, files, sceneCount, charCount };
}

function cardsCharCount(cards: SceneCard[]): number {
  let n = 0;
  for (const c of cards) {
    n += c.summary.length;
    n += c.language.length;
    n += c.visualLanguage.join("").length;
  }
  return n;
}

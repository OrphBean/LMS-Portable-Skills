import { z } from "zod";

// ---- Narrow-band focus configuration -----------------------------------------
// The base scene schema is stable. A FocusConfig layers optional, named aspect
// fields (e.g. mise en scène, costumes, behaviour) and a free-form instruction,
// so you can steer what the distiller digs out of each scene without redesigning
// the pipeline.

export interface Aspect {
  key: string;
  label: string;
  prompt: string; // guidance injected into the analysis prompt
}

export interface FocusConfig {
  instructions?: string; // free-form directive, e.g. "treat this as period cinema"
  aspects: Aspect[];
}

export const aspectKeySchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "key must be a simple identifier");

export const focusConfigSchema = z.object({
  instructions: z.string().optional(),
  aspects: z
    .array(
      z.object({
        key: aspectKeySchema,
        label: z.string().min(1).max(60),
        prompt: z.string().min(1).max(2000),
      }),
    )
    .max(12),
});

// ---- Base scene analysis (stable) -------------------------------------------

export const characterRefSchema = z.object({
  name: z.string().min(1),
  roleInScene: z.string(),
  state: z.string(),
});
export type CharacterRef = z.infer<typeof characterRefSchema>;

export const beatSchema = z.object({
  label: z.string(),
  action: z.string(),
});
export type Beat = z.infer<typeof beatSchema>;

function baseSceneSchema() {
  return z.object({
    title: z.string(),
    logline: z.string(),
    timeAndPlace: z.string(),
    characters: z.array(characterRefSchema),
    conflict: z.string(),
    beats: z.array(beatSchema),
    actions: z.array(z.string()),
    language: z.string(),
    visualLanguage: z.array(z.string()),
    mood: z.array(z.string()),
    foreshadow: z.array(z.string()).optional().default([]),
    summary: z.string(),
  });
}

export const sceneAnalysisSchema = baseSceneSchema();
export type SceneAnalysis = z.infer<typeof sceneAnalysisSchema>;

// Dynamic scene schema: base + one optional string field per requested aspect.
export function buildSceneAnalysisSchema(aspects: Aspect[]) {
  const fields: Record<string, z.ZodTypeAny> = {};
  for (const a of aspects) fields[a.key] = z.string().optional().default("");
  return baseSceneSchema().extend(fields);
}

// ---- The carry-forward slate ------------------------------------------------

export const slateSchema = z.object({
  actNumber: z.number().int().nonnegative().default(1),
  loglineSoFar: z.string(),
  characters: z.array(
    z.object({
      name: z.string().min(1),
      state: z.string(),
      goal: z.string(),
    }),
  ),
  timelinePosition: z.string(),
  planted: z.array(z.string()).optional().default([]),
  openThreads: z.array(z.string()).optional().default([]),
  lastSceneSummary: z.string(),
});
export type Slate = z.infer<typeof slateSchema>;

export function buildScenePassSchema(aspects: Aspect[]) {
  return z.object({
    scene: buildSceneAnalysisSchema(aspects),
    slate: slateSchema,
  });
}

export type ScenePass = z.infer<ReturnType<typeof buildScenePassSchema>>;

// ---- Fully-resolved output units -------------------------------------------

export interface SceneCard {
  index: number;
  actNumber: number;
  sourceSlice: number;
  title: string;
  logline: string;
  timeAndPlace: string;
  characters: CharacterRef[];
  conflict: string;
  beats: Beat[];
  actions: string[];
  language: string;
  visualLanguage: string[];
  mood: string[];
  foreshadow: string[];
  summary: string;
  aspects: Record<string, string>;
}

export interface Slice {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
}

export interface DistillConfig {
  storyPath: string;
  corpusName: string;
  kbRoot: string;
  model: string | null;
  baseUrl: string | null;
  sliceChars: number;
  overlapChars: number;
  slateChars: number;
  temperature: number;
  maxTokens: number;
  maxCalls: number;
  dryRun: boolean;
  write: boolean;
  scenesPerAct: number;
  acts: boolean;
  focus: FocusConfig | null;
}

// ---- Batch story ingest -----------------------------------------------------

export interface StoryInput {
  name: string; // file name (no extension used for corpus slug)
  text: string; // extracted plain text
  source: string; // original file path or "upload"
  ext: string;
}

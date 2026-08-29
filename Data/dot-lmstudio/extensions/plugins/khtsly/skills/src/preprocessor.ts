import type {
  ChatMessage,
  PromptPreprocessorController,
} from "@lmstudio/sdk";
import { resolveEffectiveConfig } from "./settings";
import { scanSkills, resolveSkillByName, readSkillFile } from "./scanner";
import {
  MIN_PROMPT_LENGTH,
  REINJECT_INTERVAL_MS,
  EXPLICIT_SKILL_REGEX,
  EXPLICIT_SKILL_CONTEXT_TAG,
} from "./constants";
import type { SkillInfo } from "./types";

// Diagnostics. Logs are concise and never include raw user content or full
// skill bodies. Enable with the LMS_SKILLS_DEBUG=1 environment variable.
const DEBUG = process.env.LMS_SKILLS_DEBUG === "1";

function debugLog(...args: unknown[]): void {
  if (DEBUG) console.debug("[skills]", ...args);
}

const stateMap = new Map<
  PromptPreprocessorController,
  { fingerprint: string; injectedAt: number }
>();

function buildAvailableSkillsBlock(skills: SkillInfo[], limit: number): string {
  const skillTags = skills
    .slice(0, limit)
    .map((s) =>
      [
        `<skill>`,
        `<n>`,
        s.name,
        `</n>`,
        `<description>`,
        s.description,
        `</description>`,
        `<location>`,
        s.skillMdPath,
        `</location>`,
        `</skill>`,
      ].join("\n"),
    )
    .join("\n\n");

  return `<available_skills>\n${skillTags}\n</available_skills>`;
}

function buildAutoInjectInstruction(): string {
  return "You have access to a set of skills listed in <available_skills>. Each skill is a directory containing a SKILL.md file with instructions and best practices built from real trial and error. Before starting any task that matches a skill, call `read_skill_file` with the skill name or its location path to load its instructions - always do this before writing any code, creating files, or producing output the skill covers. Multiple skills may be relevant to a single task; read all of them before proceeding, do not limit yourself to one. After reading SKILL.md, if it references additional files, call `list_skill_files` to discover them, then read whichever ones apply. Use `list_skills` with a query to search for relevant skills by name and description when the task does not match anything in the list above - not all installed skills may be shown here.";
}

function buildAutoInjectBlock(skills: SkillInfo[], limit: number): string {
  return [
    buildAutoInjectInstruction(),
    "",
    buildAvailableSkillsBlock(skills, limit),
  ].join("\n");
}

function computeFingerprint(skills: SkillInfo[]): string {
  return skills
    .map((s) => `${s.skillMdPath}:${s.description}`)
    .sort()
    .join("|");
}

/**
 * Parse all /skill-name tokens from the message text.
 * Returns unique names in order of first appearance.
 */
function parseExplicitSkillRefs(text: string): string[] {
  const refs: string[] = [];
  const seen = new Set<string>();
  // reset lastIndex so the module-level regex is safe for reuse
  const re = new RegExp(EXPLICIT_SKILL_REGEX.source, EXPLICIT_SKILL_REGEX.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      refs.push(name);
    }
  }
  return refs;
}

/**
 * Build the instruction preamble for explicitly activated skills.
 * The SKILL.md bodies are already expanded in <skill_context> below, so
 * the model must treat them as the highest-priority context for this request.
 */
function buildExplicitActivationInstruction(
  resolved: string[],
  unresolved: string[],
): string {
  const lines: string[] = [];

  lines.push(
    "One or more skills have been explicitly activated for this request via /skill-name notation.",
  );
  lines.push(
    `Their SKILL.md contents have been expanded into <${EXPLICIT_SKILL_CONTEXT_TAG}> below and must be treated as the highest-priority skill context.`,
  );
  lines.push("");
  lines.push("Rules for explicitly activated skills:");
  lines.push(
    "- The named skill is intentional; apply its instructions before anything else.",
  );
  lines.push(
    `- The SKILL.md body is already available inside <${EXPLICIT_SKILL_CONTEXT_TAG}>; do NOT call \`read_skill_file\` for it again.`,
  );
  lines.push(
    "- All other user text is secondary task payload to be interpreted through the skill's lens.",
  );
  lines.push(
    "- Quoted strings, code snippets, globs, and command-looking text must NOT be interpreted before applying the expanded skill.",
  );
  lines.push("- Do NOT use \`run_command\` for exploration.");

  if (resolved.length > 0) {
    lines.push("");
    lines.push(`Activated skill(s): ${resolved.map((n) => `/${n}`).join(", ")}`);
  }

  if (unresolved.length > 0) {
    lines.push("");
    lines.push(
      `Unresolved skill reference(s): ${unresolved.map((n) => `/${n}`).join(", ")}`,
    );
    lines.push(
      "Call `list_skills` with the unresolved name(s) as a query to locate them before proceeding.",
    );
  }

  return lines.join("\n");
}

/**
 * Build the full <skill_context> block with one <skill> child per resolved ref.
 */
function buildSkillContextBlock(
  entries: Array<{ name: string; content: string }>,
): string {
  const inner = entries
    .map(({ name, content }) =>
      [`<skill name="${name}">`, content.trim(), `</skill>`].join("\n"),
    )
    .join("\n\n");
  return `<${EXPLICIT_SKILL_CONTEXT_TAG}>\n${inner}\n</${EXPLICIT_SKILL_CONTEXT_TAG}>`;
}

/**
 * Attempt to handle explicit /skill-name activations.
 * If any refs were found, the message is modified in place via
 * userMessage.replaceText() and true is returned. Otherwise the message is
 * left untouched and false is returned.
 */
function applyExplicitActivation(
  userMessage: ChatMessage,
  text: string,
  skillsDirs: string[],
): boolean {
  const refs = parseExplicitSkillRefs(text);
  if (refs.length === 0) return false;

  debugLog(`explicit skill refs detected: ${refs.join(", ")}`);

  const resolved: Array<{ name: string; content: string }> = [];
  const unresolvedNames: string[] = [];

  for (const ref of refs) {
    const skill: SkillInfo | null = resolveSkillByName(skillsDirs, ref);
    if (!skill) {
      debugLog(`skill not found for /${ref}`);
      unresolvedNames.push(ref);
      continue;
    }
    const result = readSkillFile(skill);
    if ("error" in result) {
      debugLog(`failed to load SKILL.md for /${ref}: ${result.error}`);
      unresolvedNames.push(ref);
      continue;
    }
    resolved.push({ name: skill.name, content: result.content });
    debugLog(`skill resolved and loaded: ${skill.name}`);
  }

  // if every ref is unresolved we still inject so the model knows to search
  const instruction = buildExplicitActivationInstruction(
    resolved.map((r) => r.name),
    unresolvedNames,
  );

  const parts: string[] = [instruction];

  if (resolved.length > 0) {
    parts.push("");
    parts.push(buildSkillContextBlock(resolved));
  }

  userMessage.replaceText(`${parts.join("\n")}\n\n---\n\n${text}`);
  return true;
}

export async function promptPreprocessor(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage,
): Promise<ChatMessage> {
  try {
    debugLog("prompt preprocessor invoked");

    const text = userMessage.getText();
    debugLog(`user text extracted (${text.length} chars)`);

    if (text.trim().length < MIN_PROMPT_LENGTH) {
      debugLog(
        `preprocessing skipped: prompt shorter than MIN_PROMPT_LENGTH=${MIN_PROMPT_LENGTH}`,
      );
      return userMessage;
    }

    const cfg = resolveEffectiveConfig(ctl);
    const skills = scanSkills(cfg.skillsPaths);

    if (applyExplicitActivation(userMessage, text, cfg.skillsPaths)) {
      debugLog("explicit skill activation applied");
      return userMessage;
    }

    if (!cfg.autoInject) {
      debugLog("auto-inject disabled by config");
      return userMessage;
    }
    if (skills.length === 0) {
      debugLog("no skills found; auto-inject skipped");
      return userMessage;
    }

    const fingerprint = computeFingerprint(skills);
    const now = Date.now();
    const state = stateMap.get(ctl) ?? { fingerprint: "", injectedAt: 0 };
    const skillsChanged = fingerprint !== state.fingerprint;
    const intervalElapsed = now - state.injectedAt > REINJECT_INTERVAL_MS;

    if (!skillsChanged && !intervalElapsed) {
      debugLog("auto-inject skipped (skills unchanged within reinject interval)");
      return userMessage;
    }

    stateMap.set(ctl, { fingerprint, injectedAt: now });

    userMessage.replaceText(
      `${buildAutoInjectBlock(skills, cfg.maxSkillsInContext)}\n\n---\n\n${text}`,
    );
    debugLog(`auto-injected <available_skills> (${skills.length} skills)`);
    return userMessage;
  } catch (err) {
    console.warn("skills preprocessor error:", err);
    return userMessage;
  }
}

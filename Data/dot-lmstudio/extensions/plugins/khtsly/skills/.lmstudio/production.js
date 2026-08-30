"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/constants.ts
var os, path, DEFAULT_SKILLS_DIR, PLUGIN_DATA_DIR, SETTINGS_FILE, SKILL_ENTRY_POINT, SKILL_MANIFEST_FILE, RESET_TO_DEFAULT_SENTINEL, MAX_FILE_SIZE_BYTES, MAX_DESCRIPTION_CHARS, BODY_EXCERPT_CHARS, MAX_DIRECTORY_DEPTH, MAX_DIRECTORY_ENTRIES, MIN_PROMPT_LENGTH, DEFAULT_MAX_SKILLS_IN_CONTEXT, MIN_MAX_SKILLS_IN_CONTEXT, MAX_MAX_SKILLS_IN_CONTEXT, LIST_SKILLS_DEFAULT_LIMIT, EXEC_DEFAULT_TIMEOUT_MS, EXEC_MAX_TIMEOUT_MS, EXEC_MAX_OUTPUT_BYTES, EXEC_MAX_COMMAND_LENGTH, SKILLS_PATH_SEPARATOR, CONFIG_CACHE_TTL_MS, REINJECT_INTERVAL_MS, EXPLICIT_SKILL_REGEX, EXPLICIT_SKILL_CONTEXT_TAG, BM25_K1, BM25_B, FIELD_WEIGHTS;
var init_constants = __esm({
  "src/constants.ts"() {
    "use strict";
    os = __toESM(require("os"));
    path = __toESM(require("path"));
    DEFAULT_SKILLS_DIR = path.join(
      os.homedir(),
      ".lmstudio",
      "skills"
    );
    PLUGIN_DATA_DIR = path.join(
      os.homedir(),
      ".lmstudio",
      "plugin-data",
      "lms-skills"
    );
    SETTINGS_FILE = path.join(PLUGIN_DATA_DIR, "settings.json");
    SKILL_ENTRY_POINT = "SKILL.md";
    SKILL_MANIFEST_FILE = "skill.json";
    RESET_TO_DEFAULT_SENTINEL = "default";
    MAX_FILE_SIZE_BYTES = 102400;
    MAX_DESCRIPTION_CHARS = 500;
    BODY_EXCERPT_CHARS = 2e3;
    MAX_DIRECTORY_DEPTH = 3;
    MAX_DIRECTORY_ENTRIES = 200;
    MIN_PROMPT_LENGTH = 10;
    DEFAULT_MAX_SKILLS_IN_CONTEXT = 15;
    MIN_MAX_SKILLS_IN_CONTEXT = 1;
    MAX_MAX_SKILLS_IN_CONTEXT = 30;
    LIST_SKILLS_DEFAULT_LIMIT = 50;
    EXEC_DEFAULT_TIMEOUT_MS = 3e4;
    EXEC_MAX_TIMEOUT_MS = 3e5;
    EXEC_MAX_OUTPUT_BYTES = 1e5;
    EXEC_MAX_COMMAND_LENGTH = 8e3;
    SKILLS_PATH_SEPARATOR = ";";
    CONFIG_CACHE_TTL_MS = 5e3;
    REINJECT_INTERVAL_MS = 15 * 60 * 1e3;
    EXPLICIT_SKILL_REGEX = /(?<![a-zA-Z0-9:/<])\/([a-z][a-z0-9._-]*)/g;
    EXPLICIT_SKILL_CONTEXT_TAG = "skill_context";
    BM25_K1 = 1.2;
    BM25_B = 0.75;
    FIELD_WEIGHTS = {
      name: 3,
      tags: 2.5,
      description: 1.5,
      bodyExcerpt: 0.8
    };
  }
});

// src/config.ts
var import_sdk, configSchematics;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    import_sdk = require("@lmstudio/sdk");
    init_constants();
    configSchematics = (0, import_sdk.createConfigSchematics)().field(
      "autoInject",
      "select",
      {
        displayName: "Auto-Inject Skills List",
        subtitle: "Automatically inject the list of available skills into every prompt so the model knows when to use them",
        options: [
          {
            value: "on",
            displayName: "On - inject skill list into every prompt (recommended)"
          },
          {
            value: "off",
            displayName: "Off - only use skills when tools are called explicitly"
          }
        ]
      },
      "on"
    ).field(
      "maxSkillsInContext",
      "numeric",
      {
        displayName: "Max Skills in Context",
        subtitle: `Maximum number of skills to list in the injected prompt (${MIN_MAX_SKILLS_IN_CONTEXT}-${MAX_MAX_SKILLS_IN_CONTEXT})`,
        min: MIN_MAX_SKILLS_IN_CONTEXT,
        max: MAX_MAX_SKILLS_IN_CONTEXT,
        int: true,
        slider: {
          step: 1,
          min: MIN_MAX_SKILLS_IN_CONTEXT,
          max: MAX_MAX_SKILLS_IN_CONTEXT
        }
      },
      DEFAULT_MAX_SKILLS_IN_CONTEXT
    ).field(
      "skillsPath",
      "string",
      {
        displayName: "Skills Paths",
        subtitle: 'Semicolon-separated list of skill directories, loaded in order. Leave empty to use last saved paths. Enter "default" to reset to ~/.lmstudio/plugin-data/skills'
      },
      ""
    ).field(
      "shellPath",
      "string",
      {
        displayName: "Shell Path (optional)",
        subtitle: "Override the shell used by run_command. Leave empty to auto-detect (bash on Unix, pwsh/powershell/cmd on Windows)."
      },
      ""
    ).field(
      "windowsShell",
      "select",
      {
        displayName: "Windows Shell",
        subtitle: "Which shell run_command uses on Windows. Select PowerShell to prefer pwsh -> powershell.exe.",
        options: [
          { value: "cmd", displayName: "Command Prompt (cmd.exe)" },
          { value: "powershell", displayName: "PowerShell (powershell.exe)" }
        ]
      },
      "cmd"
    ).build();
  }
});

// src/settings.ts
function parseSkillsPaths(raw) {
  return raw.split(SKILLS_PATH_SEPARATOR).map((p) => p.trim()).filter(Boolean);
}
function loadSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return { ...DEFAULTS };
    const parsed = JSON.parse(
      fs.readFileSync(SETTINGS_FILE, "utf-8")
    );
    let skillsPaths;
    if (Array.isArray(parsed.skillsPaths) && parsed.skillsPaths.length > 0) {
      skillsPaths = parsed.skillsPaths;
    } else {
      skillsPaths = DEFAULTS.skillsPaths;
    }
    return {
      skillsPaths,
      autoInject: typeof parsed.autoInject === "boolean" ? parsed.autoInject : DEFAULTS.autoInject,
      maxSkillsInContext: typeof parsed.maxSkillsInContext === "number" && parsed.maxSkillsInContext >= 1 ? parsed.maxSkillsInContext : DEFAULTS.maxSkillsInContext,
      shellPath: typeof parsed.shellPath === "string" ? parsed.shellPath : "",
      windowsShell: parsed.windowsShell === "powershell" || parsed.windowsShell === "cmd" ? parsed.windowsShell : DEFAULTS.windowsShell
    };
  } catch {
    return { ...DEFAULTS };
  }
}
function saveSettings(settings) {
  try {
    fs.mkdirSync(PLUGIN_DATA_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    cachedConfig = null;
  } catch {
  }
}
function resolveEffectiveConfig(ctl) {
  const now = Date.now();
  if (cachedConfig && now - cacheTime < CONFIG_CACHE_TTL_MS)
    return cachedConfig;
  const c = ctl.getPluginConfig(configSchematics);
  const autoInject = c.get("autoInject") === "on";
  const maxSkillsInContext = c.get("maxSkillsInContext") ?? DEFAULTS.maxSkillsInContext;
  const rawPaths = (c.get("skillsPath") ?? "").trim();
  const shellPath = (c.get("shellPath") ?? "").trim();
  const windowsShell = c.get("windowsShell") ?? "cmd";
  const saved = loadSettings();
  if (rawPaths === RESET_TO_DEFAULT_SENTINEL) {
    const next = {
      autoInject,
      maxSkillsInContext,
      skillsPaths: DEFAULTS.skillsPaths,
      shellPath,
      windowsShell
    };
    saveSettings(next);
    cachedConfig = next;
    cacheTime = now;
    return next;
  }
  const incomingPaths = parseSkillsPaths(rawPaths);
  const skillsPaths = incomingPaths.length > 0 && incomingPaths.join(";") !== saved.skillsPaths.join(";") ? incomingPaths : saved.skillsPaths.length > 0 ? saved.skillsPaths : DEFAULTS.skillsPaths;
  if (autoInject !== saved.autoInject || maxSkillsInContext !== saved.maxSkillsInContext || skillsPaths.join(";") !== saved.skillsPaths.join(";") || shellPath !== saved.shellPath || windowsShell !== saved.windowsShell) {
    saveSettings({ skillsPaths, autoInject, maxSkillsInContext, shellPath, windowsShell });
  }
  const result = {
    skillsPaths,
    autoInject,
    maxSkillsInContext,
    shellPath,
    windowsShell
  };
  cachedConfig = result;
  cacheTime = now;
  return result;
}
var fs, DEFAULTS, cachedConfig, cacheTime;
var init_settings = __esm({
  "src/settings.ts"() {
    "use strict";
    fs = __toESM(require("fs"));
    init_constants();
    init_config();
    DEFAULTS = {
      skillsPaths: [DEFAULT_SKILLS_DIR],
      autoInject: true,
      maxSkillsInContext: DEFAULT_MAX_SKILLS_IN_CONTEXT,
      shellPath: "",
      windowsShell: "cmd"
    };
    cachedConfig = null;
    cacheTime = 0;
  }
});

// src/executor.ts
function detectPlatform() {
  if (process.platform === "win32") return "windows";
  if (process.platform === "darwin") return "macos";
  return "linux";
}
function resolveShell(override, windowsShell) {
  const platform2 = detectPlatform();
  if (override && override.trim()) {
    const p = override.trim();
    const lower = p.toLowerCase();
    const isPowerShell = lower.endsWith("powershell.exe") || lower.endsWith("pwsh.exe") || lower.endsWith("pwsh");
    return {
      path: p,
      args: isPowerShell ? ["-NoProfile", "-NonInteractive", "-Command"] : ["-c"],
      platform: platform2
    };
  }
  if (platform2 === "windows") {
    const pref = windowsShell ?? "cmd";
    if (pref === "cmd") {
      return { path: "cmd.exe", args: ["/c"], platform: platform2 };
    }
    const pwshCandidates = [
      "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
    ];
    for (const p of pwshCandidates) {
      if (fs2.existsSync(p)) {
        return { path: p, args: ["-NoProfile", "-NonInteractive", "-Command"], platform: platform2 };
      }
    }
    return { path: "cmd.exe", args: ["/c"], platform: platform2 };
  }
  if (process.env.SHELL) {
    try {
      if (fs2.existsSync(process.env.SHELL)) {
        return { path: process.env.SHELL, args: ["-c"], platform: platform2 };
      }
    } catch {
    }
  }
  for (const sh of ["/bin/bash", "/usr/bin/bash", "/bin/sh", "/usr/bin/sh", "/usr/local/bin/bash", "/usr/local/bin/zsh", "/bin/zsh"]) {
    try {
      if (fs2.existsSync(sh)) return { path: sh, args: ["-c"], platform: platform2 };
    } catch {
    }
  }
  return { path: "/bin/sh", args: ["-c"], platform: platform2 };
}
function resolveCwd(cwd) {
  if (!cwd) return os2.homedir();
  const expanded = cwd.replace(/^~(?=[/\\]|$)/, os2.homedir());
  try {
    if (fs2.existsSync(expanded) && fs2.statSync(expanded).isDirectory())
      return expanded;
  } catch {
  }
  return os2.homedir();
}
function truncate(text, maxBytes) {
  const buf = Buffer.from(text, "utf-8");
  if (buf.length <= maxBytes) return text;
  return buf.slice(0, maxBytes).toString("utf-8") + `
[truncated - output exceeded ${maxBytes} bytes]`;
}
function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function expandWindowsPath(current) {
  const query = (hive) => {
    try {
      const out = child_process.execSync(
        `reg query "${hive}" /v PATH`,
        { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 3e3 }
      );
      const m = out.match(/PATH\s+REG(?:_EXPAND)?_SZ\s+(.+)/i);
      return m ? m[1].trim() : "";
    } catch {
      return "";
    }
  };
  const machine = query("HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment");
  const user = query("HKCU\\Environment");
  const parts = [machine, user, current].filter(Boolean);
  return [...new Set(parts.join(";").split(";").map((p) => p.trim()).filter(Boolean))].join(";");
}
function execCommand(command, options = {}) {
  return new Promise((resolve4) => {
    const shellInfo = resolveShell(options.shellPath, options.windowsShell);
    const cwd = resolveCwd(options.cwd);
    const timeoutMs = Math.min(
      options.timeoutMs ?? EXEC_DEFAULT_TIMEOUT_MS,
      EXEC_MAX_TIMEOUT_MS
    );
    const baseEnv = { ...process.env };
    if (shellInfo.platform === "windows" && baseEnv.PATH) {
      baseEnv.PATH = expandWindowsPath(baseEnv.PATH);
    }
    const env = {
      ...baseEnv,
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8",
      ...options.env ?? {}
    };
    const isPowerShell = shellInfo.path.toLowerCase().endsWith("powershell.exe") || shellInfo.path.toLowerCase().endsWith("pwsh.exe");
    let finalCommand;
    if (isPowerShell) {
      finalCommand = `[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; ${command}`;
    } else {
      finalCommand = command;
    }
    let proc;
    try {
      proc = child_process.spawn(
        shellInfo.path,
        [...shellInfo.args, finalCommand],
        { cwd, env, windowsHide: true }
      );
    } catch (spawnErr) {
      resolve4({
        stdout: "",
        stderr: spawnErr instanceof Error ? spawnErr.message : String(spawnErr),
        exitCode: 1,
        timedOut: false,
        shell: shellInfo.path,
        platform: shellInfo.platform
      });
      return;
    }
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    proc.stdout?.on("data", (chunk) => {
      stdout += chunk.toString("utf-8");
    });
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString("utf-8");
    });
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill("SIGKILL");
      } catch {
      }
    }, timeoutMs);
    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve4({
        stdout: truncate(normalizeLineEndings(stdout), EXEC_MAX_OUTPUT_BYTES),
        stderr: truncate(normalizeLineEndings(stderr), EXEC_MAX_OUTPUT_BYTES),
        exitCode: code ?? 1,
        timedOut,
        shell: shellInfo.path,
        platform: shellInfo.platform
      });
    });
    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve4({
        stdout: "",
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
        shell: shellInfo.path,
        platform: shellInfo.platform
      });
    });
  });
}
var child_process, fs2, os2;
var init_executor = __esm({
  "src/executor.ts"() {
    "use strict";
    child_process = __toESM(require("child_process"));
    fs2 = __toESM(require("fs"));
    os2 = __toESM(require("os"));
    init_constants();
  }
});

// src/scanner.ts
function readFileSafe(filePath) {
  try {
    const stat = fs3.statSync(filePath);
    if (stat.size <= MAX_FILE_SIZE_BYTES) {
      return fs3.readFileSync(filePath, "utf-8");
    }
    const headBytes = Math.floor(MAX_FILE_SIZE_BYTES * 0.8);
    const tailBytes = MAX_FILE_SIZE_BYTES - headBytes;
    const fd = fs3.openSync(filePath, "r");
    const headBuf = Buffer.alloc(headBytes);
    const tailBuf = Buffer.alloc(tailBytes);
    fs3.readSync(fd, headBuf, 0, headBytes, 0);
    fs3.readSync(fd, tailBuf, 0, tailBytes, stat.size - tailBytes);
    fs3.closeSync(fd);
    const head = headBuf.toString("utf-8").replace(/\uFFFD.*$/, "");
    const tail = tailBuf.toString("utf-8").replace(/^.*?\uFFFD/, "");
    const omitted = Math.round((stat.size - MAX_FILE_SIZE_BYTES) / 1024);
    return `${head}

[... ${omitted}KB omitted - middle of file truncated ...]

${tail}`;
  } catch {
    return null;
  }
}
function extractDescription(content) {
  const lines = content.split("\n");
  const collected = [];
  let passedH1 = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (collected.length > 0) break;
      continue;
    }
    if (trimmed.startsWith("# ") && !passedH1) {
      passedH1 = true;
      continue;
    }
    if (trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("<!--")) {
      if (collected.length > 0) break;
      continue;
    }
    collected.push(trimmed);
    if (collected.join(" ").length >= MAX_DESCRIPTION_CHARS) break;
  }
  return collected.join(" ").trim().slice(0, MAX_DESCRIPTION_CHARS) || "No description available.";
}
function extractBodyExcerpt(content) {
  const lines = content.split("\n");
  const collected = [];
  let passedH1 = false;
  let passedDescription = false;
  let inCodeFence = false;
  let descriptionDone = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (!passedH1) {
      if (trimmed.startsWith("# ")) passedH1 = true;
      continue;
    }
    if (!descriptionDone) {
      if (!passedDescription) {
        if (trimmed && !trimmed.startsWith("#")) {
          passedDescription = true;
          continue;
        }
        continue;
      }
      if (!trimmed) {
        descriptionDone = true;
        continue;
      }
      continue;
    }
    if (!trimmed) continue;
    const stripped = trimmed.replace(/^#{1,6}\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+\.\s+/, "").replace(/\[(.+?)\]\(.+?\)/g, "$1");
    if (!stripped) continue;
    collected.push(stripped);
    if (collected.join(" ").length >= BODY_EXCERPT_CHARS) break;
  }
  return collected.join(" ").trim().slice(0, BODY_EXCERPT_CHARS);
}
function loadManifest(skillDir) {
  const manifestPath = path2.join(skillDir, SKILL_MANIFEST_FILE);
  try {
    if (!fs3.existsSync(manifestPath)) return null;
    return JSON.parse(
      fs3.readFileSync(manifestPath, "utf-8")
    );
  } catch {
    return null;
  }
}
function entryIsDirectory(parentDir, entry) {
  try {
    return fs3.statSync(path2.join(parentDir, entry.name)).isDirectory();
  } catch {
    return false;
  }
}
function hasExtraFiles(skillDir) {
  try {
    return fs3.readdirSync(skillDir).some((e) => e !== SKILL_ENTRY_POINT && e !== SKILL_MANIFEST_FILE);
  } catch {
    return false;
  }
}
function scanSkillsDir(skillsDir) {
  try {
    if (!fs3.existsSync(skillsDir)) return [];
    const skills = [];
    for (const entry of fs3.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entryIsDirectory(skillsDir, entry)) continue;
      const skillDir = path2.join(skillsDir, entry.name);
      const skillMdPath = path2.join(skillDir, SKILL_ENTRY_POINT);
      if (!fs3.existsSync(skillMdPath)) continue;
      const manifest = loadManifest(skillDir);
      const skillMdContent = readFileSafe(skillMdPath);
      const description = manifest?.description ?? (skillMdContent ? extractDescription(skillMdContent) : "No description available.");
      const bodyExcerpt = skillMdContent ? extractBodyExcerpt(skillMdContent) : "";
      const tags = Array.isArray(manifest?.tags) ? manifest.tags.filter((t) => typeof t === "string") : [];
      skills.push({
        name: manifest?.name ?? entry.name,
        description,
        bodyExcerpt,
        tags,
        skillMdPath,
        directoryPath: skillDir,
        hasExtraFiles: hasExtraFiles(skillDir)
      });
    }
    return skills;
  } catch {
    return [];
  }
}
function setupWatchers(skillsDirs) {
  const currentPaths = skillsDirs.join(";");
  if (isWatchingPaths === currentPaths) return;
  watchers.forEach((w) => {
    try {
      w.close();
    } catch {
    }
  });
  watchers = [];
  isWatchingPaths = currentPaths;
  for (const dir of skillsDirs) {
    if (!fs3.existsSync(dir)) continue;
    try {
      const w = fs3.watch(dir, { recursive: true }, () => {
        cachedSkills = null;
        searchIndex = null;
      });
      w.on("error", () => {
      });
      watchers.push(w);
    } catch {
      try {
        const w = fs3.watch(dir, () => {
          cachedSkills = null;
          searchIndex = null;
        });
        w.on("error", () => {
        });
        watchers.push(w);
      } catch {
      }
    }
  }
}
function scanSkills(skillsDirs) {
  setupWatchers(skillsDirs);
  if (cachedSkills) return cachedSkills;
  const seen = /* @__PURE__ */ new Set();
  const merged = [];
  for (const dir of skillsDirs) {
    for (const skill of scanSkillsDir(dir)) {
      if (!seen.has(skill.directoryPath)) {
        seen.add(skill.directoryPath);
        merged.push(skill);
      }
    }
  }
  cachedSkills = merged.sort((a, b) => a.name.localeCompare(b.name));
  return cachedSkills;
}
function tokenize(text) {
  return text.toLowerCase().split(/[\s\-_/\\.,;:()\[\]{}|]+/).filter((t) => t.length > 0);
}
function buildSearchIndex(skills) {
  const idf = /* @__PURE__ */ new Map();
  const docFreq = /* @__PURE__ */ new Map();
  const lengths = { name: 0, tags: 0, description: 0, bodyExcerpt: 0 };
  const docTokens = /* @__PURE__ */ new Map();
  const N = skills.length;
  for (const skill of skills) {
    const tokens = {
      name: tokenize(skill.name),
      tags: skill.tags.flatMap((t) => tokenize(t)),
      description: tokenize(skill.description),
      bodyExcerpt: tokenize(skill.bodyExcerpt)
    };
    docTokens.set(skill.directoryPath, tokens);
    lengths.name += tokens.name.length;
    lengths.tags += tokens.tags.length;
    lengths.description += tokens.description.length;
    lengths.bodyExcerpt += tokens.bodyExcerpt.length;
    const uniqueTokens = /* @__PURE__ */ new Set([
      ...tokens.name,
      ...tokens.tags,
      ...tokens.description,
      ...tokens.bodyExcerpt
    ]);
    for (const t of uniqueTokens) {
      docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
    }
  }
  const avgLengths = {
    name: lengths.name / (N || 1),
    tags: lengths.tags / (N || 1),
    description: lengths.description / (N || 1),
    bodyExcerpt: lengths.bodyExcerpt / (N || 1)
  };
  for (const [token, df] of docFreq) {
    const idfValue = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    idf.set(token, idfValue);
  }
  searchIndex = { idf, avgLengths, docTokens };
}
function searchSkills(skillsDirs, query) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const queryLower = query.toLowerCase().trim();
  const allSkills = scanSkills(skillsDirs);
  if (!searchIndex) buildSearchIndex(allSkills);
  const { idf, avgLengths, docTokens } = searchIndex;
  const results = [];
  for (const skill of allSkills) {
    const nameLower = skill.name.toLowerCase();
    if (nameLower === queryLower) {
      results.push({ skill, score: 100 });
      continue;
    }
    const tokens = docTokens.get(skill.directoryPath);
    let totalScore = 0;
    for (const qToken of queryTokens) {
      let matchedIdf = idf.get(qToken) ?? 0;
      let isPrefix = false;
      if (matchedIdf === 0) {
        for (const [k, v] of idf.entries()) {
          if (k.startsWith(qToken) && qToken.length >= 3) {
            matchedIdf = Math.max(matchedIdf, v * 0.5);
            isPrefix = true;
          }
        }
      }
      if (matchedIdf === 0) continue;
      for (const [fieldStr, weight] of Object.entries(FIELD_WEIGHTS)) {
        const field = fieldStr;
        const fieldTokens = tokens[field];
        if (fieldTokens.length === 0) continue;
        let tf = 0;
        for (const ft of fieldTokens) {
          if (ft === qToken) tf += 1;
          else if (isPrefix && ft.startsWith(qToken)) tf += 0.5;
          else if (qToken.length >= 4 && ft.includes(qToken)) tf += 0.3;
        }
        if (tf > 0) {
          const avgdl = avgLengths[field] || 1;
          const fieldScore = matchedIdf * (tf * (BM25_K1 + 1) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * (fieldTokens.length / avgdl))));
          totalScore += fieldScore * weight;
        }
      }
    }
    if (nameLower.includes(queryLower)) totalScore += 5;
    if (skill.description.toLowerCase().includes(queryLower)) totalScore += 2;
    if (skill.tags.some((t) => t.toLowerCase() === queryLower)) totalScore += 4;
    if (totalScore > 0.5) {
      results.push({ skill, score: totalScore });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
function resolveSkillByName(skillsDirs, skillName) {
  const lower = skillName.toLowerCase().trim();
  return scanSkills(skillsDirs).find(
    (s) => s.name.toLowerCase() === lower || path2.basename(s.directoryPath).toLowerCase() === lower
  ) ?? null;
}
function readSkillFile(skill, relativeFilePath) {
  const targetRel = relativeFilePath?.trim() || SKILL_ENTRY_POINT;
  const resolved = path2.resolve(skill.directoryPath, targetRel);
  if (!resolved.startsWith(path2.resolve(skill.directoryPath))) {
    return { error: "Path traversal outside skill directory is not allowed." };
  }
  if (!fs3.existsSync(resolved)) {
    return {
      error: `File not found: ${targetRel}. Use \`list_skill_files\` to see available files.`
    };
  }
  if (fs3.statSync(resolved).isDirectory()) {
    return {
      error: `"${targetRel}" is a directory. Use \`list_skill_files\` to explore it.`
    };
  }
  const content = readFileSafe(resolved);
  if (content === null) return { error: `Unable to read file: ${targetRel}` };
  return { content, resolvedPath: resolved };
}
function readAbsolutePath(absolutePath) {
  const resolved = path2.resolve(absolutePath);
  if (!fs3.existsSync(resolved)) {
    return { error: `File not found: ${resolved}` };
  }
  if (fs3.statSync(resolved).isDirectory()) {
    return {
      error: `"${resolved}" is a directory. Use \`list_skill_files\` to explore it.`
    };
  }
  const content = readFileSafe(resolved);
  if (content === null) return { error: `Unable to read file: ${resolved}` };
  return { content, resolvedPath: resolved };
}
function listSkillDirectory(skill, relativeSubPath) {
  const base = relativeSubPath ? path2.resolve(skill.directoryPath, relativeSubPath.trim()) : skill.directoryPath;
  if (!base.startsWith(path2.resolve(skill.directoryPath))) return [];
  return walkDirectory(base, skill.directoryPath, 0);
}
function listAbsoluteDirectory(absolutePath) {
  const resolved = path2.resolve(absolutePath);
  if (!fs3.existsSync(resolved) || !fs3.statSync(resolved).isDirectory())
    return [];
  return walkDirectory(resolved, resolved, 0);
}
function walkDirectory(dir, rootDir, depth) {
  if (depth > MAX_DIRECTORY_DEPTH) return [];
  let dirEntries;
  try {
    dirEntries = fs3.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const entries = [];
  for (const entry of dirEntries) {
    if (entries.length >= MAX_DIRECTORY_ENTRIES) break;
    const fullPath = path2.join(dir, entry.name);
    const relativePath = path2.relative(rootDir, fullPath);
    if (entryIsDirectory(dir, entry)) {
      entries.push({ name: entry.name, relativePath, type: "directory" });
      if (depth < MAX_DIRECTORY_DEPTH) {
        entries.push(...walkDirectory(fullPath, rootDir, depth + 1));
      }
    } else if (entry.isFile()) {
      let sizeBytes;
      try {
        sizeBytes = fs3.statSync(fullPath).size;
      } catch {
      }
      entries.push({ name: entry.name, relativePath, type: "file", sizeBytes });
    }
  }
  return entries;
}
var fs3, path2, cachedSkills, searchIndex, watchers, isWatchingPaths;
var init_scanner = __esm({
  "src/scanner.ts"() {
    "use strict";
    fs3 = __toESM(require("fs"));
    path2 = __toESM(require("path"));
    init_constants();
    cachedSkills = null;
    searchIndex = null;
    watchers = [];
    isWatchingPaths = "";
  }
});

// src/toolsProvider.ts
function formatDirEntries(entries, rootName) {
  if (entries.length === 0) return "Directory is empty.";
  const lines = [`${rootName}/`];
  for (const entry of entries) {
    const depth = entry.relativePath.split(/[/\\]/).length - 1;
    const indent = "  ".repeat(depth);
    if (entry.type === "directory") {
      lines.push(`${indent}${entry.name}/`);
    } else {
      const size = entry.sizeBytes !== void 0 ? entry.sizeBytes >= 1024 ? `${Math.round(entry.sizeBytes / 1024)}K` : `${entry.sizeBytes}B` : "";
      lines.push(`${indent}${entry.name}${size ? `  (${size})` : ""}`);
    }
  }
  return lines.join("\n");
}
async function toolsProvider(ctl) {
  const listSkillsTool = (0, import_sdk2.tool)({
    name: "list_skills",
    description: "List or search available skills. Without a query, returns all skills up to the limit. With a query, scores and ranks skills by relevance across name, tags, description, and SKILL.md body content - use this to find skills relevant to a task without needing all skills in context. Always call read_skill_file on any skill that looks relevant before starting work.",
    parameters: {
      query: import_zod.z.string().optional().describe(
        "Optional search query to filter and rank skills by relevance. Matches against skill names, tags, descriptions, and SKILL.md body using IDF-weighted token scoring, phrase proximity, and partial prefix matching. Omit to list all skills."
      ),
      limit: import_zod.z.number().int().min(1).max(200).optional().describe(
        `Maximum number of skills to return. Defaults to ${LIST_SKILLS_DEFAULT_LIMIT}. Omit the query and set a high limit to page through all installed skills.`
      )
    },
    implementation: async ({ query, limit }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const cap = limit ?? LIST_SKILLS_DEFAULT_LIMIT;
      if (query && query.trim()) {
        status(`Searching skills for "${query.trim()}"..`);
        const results = searchSkills(cfg.skillsPaths, query.trim());
        if (results.length === 0) {
          return {
            query: query.trim(),
            found: 0,
            skills: [],
            note: "No skills matched. Try a broader query or omit the query to list all skills."
          };
        }
        const page2 = results.slice(0, cap);
        status(
          `Found ${results.length} match${results.length !== 1 ? "es" : ""}`
        );
        return {
          query: query.trim(),
          total: results.length,
          found: page2.length,
          ...results.length > cap ? {
            note: `Showing top ${cap} of ${results.length} matches. Refine your query or increase the limit to see more.`
          } : {},
          skills: page2.map(({ skill, score }) => ({
            name: skill.name,
            description: skill.description,
            tags: skill.tags.length > 0 ? skill.tags : void 0,
            skillMdPath: skill.skillMdPath,
            hasExtraFiles: skill.hasExtraFiles,
            score: Math.round(score * 100) / 100
          }))
        };
      }
      status("Scanning skills directory..");
      const skills = scanSkills(cfg.skillsPaths);
      if (skills.length === 0) {
        return {
          total: 0,
          found: 0,
          skillsPaths: cfg.skillsPaths,
          skills: [],
          note: "No skills found. Create skill directories with a SKILL.md file inside the configured skills paths."
        };
      }
      const page = skills.slice(0, cap);
      status(`Found ${skills.length} skill${skills.length !== 1 ? "s" : ""}`);
      return {
        total: skills.length,
        found: page.length,
        skillsPaths: cfg.skillsPaths,
        ...skills.length > cap ? {
          note: `Showing ${cap} of ${skills.length} skills. Increase the limit or use a query to find specific skills.`
        } : {},
        skills: page.map((s) => ({
          name: s.name,
          description: s.description,
          tags: s.tags.length > 0 ? s.tags : void 0,
          skillMdPath: s.skillMdPath,
          hasExtraFiles: s.hasExtraFiles
        }))
      };
    }
  });
  const readSkillFileTool = (0, import_sdk2.tool)({
    name: "read_skill_file",
    description: "Read a file from within a skill directory. Accepts either a skill name (e.g. 'docx') or an absolute path to any file within a skill directory. Defaults to reading the SKILL.md entry point when no file_path is given. ALWAYS call this before starting any task the skill covers - the SKILL.md contains critical instructions built from trial and error. Multiple skills may be relevant to a task; read all of them before proceeding.",
    parameters: {
      skill_name: import_zod.z.string().min(1).describe(
        "Skill directory name (e.g. 'docx') or an absolute path to a file within a skill directory."
      ),
      file_path: import_zod.z.string().optional().describe(
        "Relative path to a file within the skill directory. Omit to read SKILL.md. Ignored when skill_name is an absolute path."
      )
    },
    implementation: async ({ skill_name, file_path }, { status }) => {
      status(`Reading ${skill_name}${file_path ? ` / ${file_path}` : ""}..`);
      if (path3.isAbsolute(skill_name)) {
        const cfg2 = resolveEffectiveConfig(ctl);
        const resolvedTarget = path3.resolve(skill_name);
        const isAllowed = cfg2.skillsPaths.some(
          (p) => resolvedTarget.startsWith(path3.resolve(p) + path3.sep)
        );
        if (!isAllowed) {
          return {
            success: false,
            error: "Path is outside the configured skills directories."
          };
        }
        const result2 = readAbsolutePath(skill_name);
        if ("error" in result2) return { success: false, error: result2.error };
        status(`Read ${Math.round(result2.content.length / 1024)}KB`);
        return {
          success: true,
          filePath: result2.resolvedPath,
          content: result2.content
        };
      }
      const cfg = resolveEffectiveConfig(ctl);
      const skill = resolveSkillByName(cfg.skillsPaths, skill_name);
      if (!skill) {
        return {
          success: false,
          error: `Skill "${skill_name}" not found. Call list_skills to see available skills.`
        };
      }
      const result = readSkillFile(skill, file_path);
      if ("error" in result)
        return { success: false, skill: skill_name, error: result.error };
      status(
        `Read ${Math.round(result.content.length / 1024)}KB from ${skill_name}`
      );
      return {
        success: true,
        skill: skill.name,
        filePath: file_path || "SKILL.md",
        resolvedPath: result.resolvedPath,
        content: result.content,
        hasExtraFiles: skill.hasExtraFiles,
        ...skill.hasExtraFiles ? {
          hint: "This skill has additional files. Call list_skill_files to explore them."
        } : {}
      };
    }
  });
  const listSkillFilesTool = (0, import_sdk2.tool)({
    name: "list_skill_files",
    description: "List all files inside a skill directory. Accepts either a skill name (e.g. 'docx') or an absolute path to a skill directory. Use this after reading SKILL.md when you need to discover additional supporting files such as helper scripts, templates, or supplementary documentation the SKILL.md references.",
    parameters: {
      skill_name: import_zod.z.string().min(1).describe(
        "Skill directory name (e.g. 'docx') or an absolute path to a skill directory."
      ),
      sub_path: import_zod.z.string().optional().describe(
        "Optional relative sub-path within the skill directory to list. Omit to list the entire skill directory."
      )
    },
    implementation: async ({ skill_name, sub_path }, { status }) => {
      status(`Listing files in ${skill_name}..`);
      if (path3.isAbsolute(skill_name)) {
        const cfg2 = resolveEffectiveConfig(ctl);
        const resolvedTarget = path3.resolve(skill_name);
        const isAllowed = cfg2.skillsPaths.some(
          (p) => resolvedTarget.startsWith(path3.resolve(p) + path3.sep)
        );
        if (!isAllowed) {
          return {
            success: false,
            error: "Path is outside the configured skills directories."
          };
        }
        const entries2 = listAbsoluteDirectory(skill_name);
        const formatted2 = formatDirEntries(entries2, path3.basename(skill_name));
        status(`Found ${entries2.length} entries`);
        return {
          success: true,
          directoryPath: skill_name,
          entryCount: entries2.length,
          tree: formatted2,
          entries: entries2.map((e) => ({
            name: e.name,
            path: e.relativePath,
            type: e.type,
            ...e.sizeBytes !== void 0 ? { sizeBytes: e.sizeBytes } : {}
          }))
        };
      }
      const cfg = resolveEffectiveConfig(ctl);
      const skill = resolveSkillByName(cfg.skillsPaths, skill_name);
      if (!skill) {
        return {
          success: false,
          error: `Skill "${skill_name}" not found. Call list_skills to see available skills.`
        };
      }
      const entries = listSkillDirectory(skill, sub_path);
      const formatted = formatDirEntries(entries, skill.name);
      status(`Found ${entries.length} entries in ${skill_name}`);
      return {
        success: true,
        skill: skill.name,
        directoryPath: skill.directoryPath,
        entryCount: entries.length,
        tree: formatted,
        entries: entries.map((e) => ({
          name: e.name,
          path: e.relativePath,
          type: e.type,
          ...e.sizeBytes !== void 0 ? { sizeBytes: e.sizeBytes } : {}
        }))
      };
    }
  });
  const readFileTool = (0, import_sdk2.tool)({
    name: "read_file",
    description: "Read the contents of any file in the user's workspace. Use this to inspect code, data, or configuration files outside of the skills directory.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path to the file to read.")
    },
    implementation: async ({ file_path }, { status }) => {
      status(`Reading ${path3.basename(file_path)}..`);
      const result = readAbsolutePath(file_path);
      if ("error" in result) return { success: false, error: result.error };
      status(`Read ${Math.round(result.content.length / 1024)}KB`);
      return {
        success: true,
        filePath: result.resolvedPath,
        content: result.content
      };
    }
  });
  const writeFileTool = (0, import_sdk2.tool)({
    name: "write_file",
    description: "Create or overwrite a file completely with new content. Prefer this over run_command for writing code or text, as it avoids shell escaping issues.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path to the file to write."),
      content: import_zod.z.string().describe("The full content to write to the file.")
    },
    implementation: async ({ file_path, content }, { status }) => {
      status(`Writing ${path3.basename(file_path)}..`);
      try {
        const resolved = path3.resolve(file_path);
        fs4.mkdirSync(path3.dirname(resolved), { recursive: true });
        fs4.writeFileSync(resolved, content, "utf-8");
        status(`Wrote ${Math.round(content.length / 1024)}KB`);
        return {
          success: true,
          filePath: resolved,
          bytesWritten: Buffer.byteLength(content, "utf8")
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const patchFileTool = (0, import_sdk2.tool)({
    name: "patch_file",
    description: "Modify an existing file by replacing a specific search string with a new string. Prefer this over write_file when making small changes to large files.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path to the file to modify."),
      search_string: import_zod.z.string().min(1).describe("The exact string to find in the file. Must match exactly, including whitespace and indentation."),
      replace_string: import_zod.z.string().describe("The string to replace the search_string with.")
    },
    implementation: async ({ file_path, search_string, replace_string }, { status }) => {
      status(`Patching ${path3.basename(file_path)}..`);
      try {
        const resolved = path3.resolve(file_path);
        if (!fs4.existsSync(resolved)) {
          return { success: false, error: `File not found: ${resolved}` };
        }
        const content = fs4.readFileSync(resolved, "utf-8");
        if (!content.includes(search_string)) {
          return {
            success: false,
            error: "Search string not found in file. Ensure exact whitespace/indentation."
          };
        }
        const patched = content.replace(search_string, replace_string);
        fs4.writeFileSync(resolved, patched, "utf-8");
        status(`Patched file`);
        return {
          success: true,
          filePath: resolved,
          note: "Replaced first occurrence of search_string."
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const runCommandTool = (0, import_sdk2.tool)({
    name: "run_command",
    description: "Execute a shell command on the user's machine. On Windows this runs in PowerShell Core (pwsh.exe), PowerShell (powershell.exe), or cmd.exe - whichever is available, in that order. On macOS and Linux this runs in bash or sh. The platform and shell fields in the response tell you exactly which shell was used so you can adapt syntax accordingly. Use this to run scripts, install packages, or perform system tasks. IMPORTANT: Do NOT use this to write or edit files via `echo` or `cat`. Use the `write_file` or `patch_file` tools instead. Python scripts referenced by skills can be executed directly - copy the script path from list_skill_files and run it with python3 (or python on Windows).",
    parameters: {
      command: import_zod.z.string().min(1).max(EXEC_MAX_COMMAND_LENGTH).describe("The shell command to execute."),
      cwd: import_zod.z.string().optional().describe(
        "Working directory for the command. Supports ~ for home directory. Defaults to the user's home directory if omitted or invalid."
      ),
      timeout_ms: import_zod.z.number().int().min(1e3).max(EXEC_MAX_TIMEOUT_MS).optional().describe(
        `Timeout in milliseconds. Defaults to ${EXEC_DEFAULT_TIMEOUT_MS}ms. Maximum ${EXEC_MAX_TIMEOUT_MS}ms. Increase for long-running scripts.`
      ),
      env: import_zod.z.record(import_zod.z.string()).optional().describe(
        "Optional environment variables to set for this command, merged on top of the existing environment. Use for API keys, virtualenv paths, or any per-command configuration you do not want baked into the command string."
      )
    },
    implementation: async ({ command, cwd, timeout_ms, env }, { status }) => {
      const cfg = resolveEffectiveConfig(ctl);
      const timeoutMs = timeout_ms ?? EXEC_DEFAULT_TIMEOUT_MS;
      status(
        `${command.slice(0, 72)}${command.length > 72 ? "\u2026" : ""}`
      );
      const result = await execCommand(command, {
        cwd,
        timeoutMs,
        shellPath: cfg.shellPath || void 0,
        windowsShell: cfg.windowsShell,
        env
      });
      status(result.timedOut ? "Timed out" : `Exit ${result.exitCode}`);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        platform: result.platform,
        shell: result.shell,
        ...result.timedOut ? {
          hint: `Command exceeded the ${timeoutMs}ms timeout. Try increasing timeout_ms or splitting the work into smaller steps.`
        } : {},
        ...result.exitCode !== 0 && !result.timedOut && result.stderr ? {
          hint: result.platform === "windows" && /\b(?:python|py)\b/i.test(result.stderr) && /not recognized|CommandNotFoundException/i.test(result.stderr) ? "Python was not found on PATH. Pass the full path to python.exe in the command (for example C:\\Users\\<you>\\AppData\\Local\\Programs\\Python\\Python312\\python.exe), or restart LM Studio after installing Python." : "Command exited with a non-zero code. Check stderr for details."
        } : {}
      };
    }
  });
  const createDirectoryTool = (0, import_sdk2.tool)({
    name: "create_directory",
    description: "Create a directory (and any missing parent directories) at the given path. Idempotent: succeeds silently if the directory already exists, so it is safe to call without checking first. Equivalent to `mkdir -p` / `New-Item -Force -ItemType Directory`.",
    parameters: {
      dir_path: import_zod.z.string().min(1).describe("Absolute path of the directory to create. Supports ~ for the home directory.")
    },
    implementation: async ({ dir_path }, { status }) => {
      status(`Creating directory ${path3.basename(dir_path)}..`);
      try {
        const resolved = path3.resolve(dir_path.replace(/^~/, os3.homedir()));
        const alreadyExisted = fs4.existsSync(resolved);
        fs4.mkdirSync(resolved, { recursive: true });
        status(alreadyExisted ? "Already exists" : "Created");
        return {
          success: true,
          dirPath: resolved,
          alreadyExisted
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const getCurrentDirectoryTool = (0, import_sdk2.tool)({
    name: "get_current_directory",
    description: "Return path information about the user's environment: home directory, current working directory, platform, and path separator. Call this at the start of any task that involves absolute paths so you know the correct base path without guessing the username or drive letter (e.g. C:\\Users\\user on Windows, /Users/user on macOS, /home/user on Linux).",
    parameters: {},
    implementation: async (_params, { status }) => {
      status("Resolving paths..");
      const homeDir = os3.homedir();
      const cwd = process.cwd();
      const platform2 = os3.platform();
      const sep2 = path3.sep;
      status("Done");
      return {
        success: true,
        homeDir,
        cwd,
        platform: platform2,
        pathSeparator: sep2,
        note: platform2 === "win32" ? "Windows: use backslashes or forward slashes in paths." : "Unix-like: use forward slashes in paths."
      };
    }
  });
  const listDirectoryTool = (0, import_sdk2.tool)({
    name: "list_directory",
    description: "List the contents of any directory on the user's machine, returning a tree of files and subdirectories. Use this to understand a project's structure before reading or editing files. Prefer this over running `ls` or `dir` via `run_command` - it works the same on every platform.",
    parameters: {
      dir_path: import_zod.z.string().min(1).describe("Absolute path of the directory to list. Supports ~ for the home directory."),
      recursive: import_zod.z.boolean().optional().describe(
        "When true, lists all files and subdirectories recursively. Defaults to false (one level only). Avoid on very large trees."
      )
    },
    implementation: async ({ dir_path, recursive = false }, { status }) => {
      status(`Listing ${path3.basename(dir_path)}..`);
      try {
        let walk2 = function(dir, relBase, depth) {
          if (depth > MAX_DEPTH) return;
          const children = fs4.readdirSync(dir, { withFileTypes: true });
          for (const child of children) {
            const rel = relBase ? `${relBase}/${child.name}` : child.name;
            const abs = path3.join(dir, child.name);
            if (child.isDirectory()) {
              entries.push({ name: child.name, relativePath: rel, type: "directory" });
              walk2(abs, rel, depth + 1);
            } else {
              const size = fs4.statSync(abs).size;
              entries.push({ name: child.name, relativePath: rel, type: "file", sizeBytes: size });
            }
          }
        };
        var walk = walk2;
        const resolved = path3.resolve(dir_path.replace(/^~/, os3.homedir()));
        if (!fs4.existsSync(resolved)) {
          return { success: false, error: `Directory not found: ${resolved}` };
        }
        const stat = fs4.statSync(resolved);
        if (!stat.isDirectory()) {
          return { success: false, error: `Path is not a directory: ${resolved}` };
        }
        const MAX_DEPTH = recursive ? 10 : 1;
        const entries = [];
        walk2(resolved, "", 0);
        const formatted = formatDirEntries(entries, path3.basename(resolved));
        status(`Found ${entries.length} entries`);
        return {
          success: true,
          dirPath: resolved,
          entryCount: entries.length,
          tree: formatted,
          entries: entries.map((e) => ({
            name: e.name,
            path: e.relativePath,
            type: e.type,
            ...e.sizeBytes !== void 0 ? { sizeBytes: e.sizeBytes } : {}
          }))
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const deleteFileTool = (0, import_sdk2.tool)({
    name: "delete_file",
    description: "Permanently delete a file or an empty directory. To delete a directory and all its contents recursively, set recursive to true - use with caution as this cannot be undone. Prefer this over shell commands like `rm` or `Remove-Item` for cross-platform reliability.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path to the file or directory to delete. Supports ~ for the home directory."),
      recursive: import_zod.z.boolean().optional().describe(
        "When true, deletes a directory and all its contents recursively. Defaults to false. Has no effect on plain files."
      )
    },
    implementation: async ({ file_path, recursive = false }, { status }) => {
      status(`Deleting ${path3.basename(file_path)}..`);
      try {
        const resolved = path3.resolve(file_path.replace(/^~/, os3.homedir()));
        if (!fs4.existsSync(resolved)) {
          return { success: false, error: `Path not found: ${resolved}` };
        }
        const stat = fs4.statSync(resolved);
        if (stat.isDirectory()) {
          fs4.rmSync(resolved, { recursive, force: false });
        } else {
          fs4.unlinkSync(resolved);
        }
        status("Deleted");
        return { success: true, deletedPath: resolved };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const moveFileTool = (0, import_sdk2.tool)({
    name: "move_file",
    description: "Move a file or directory from one location to another. Works across the same filesystem volume. If you need to move across volumes, use run_command as a fallback. Fails if the destination already exists to prevent accidental overwrites.",
    parameters: {
      source_path: import_zod.z.string().min(1).describe("Absolute path of the file or directory to move. Supports ~."),
      destination_path: import_zod.z.string().min(1).describe(
        "Absolute path of the destination. If the destination is an existing directory, the source is moved inside it. Otherwise the source is moved to this exact path (effectively a move + rename)."
      )
    },
    implementation: async ({ source_path, destination_path }, { status }) => {
      status(`Moving ${path3.basename(source_path)}..`);
      try {
        const src = path3.resolve(source_path.replace(/^~/, os3.homedir()));
        let dst = path3.resolve(destination_path.replace(/^~/, os3.homedir()));
        if (!fs4.existsSync(src)) {
          return { success: false, error: `Source not found: ${src}` };
        }
        if (fs4.existsSync(dst) && fs4.statSync(dst).isDirectory()) {
          dst = path3.join(dst, path3.basename(src));
        }
        if (fs4.existsSync(dst)) {
          return {
            success: false,
            error: `Destination already exists: ${dst}. Delete or rename it first.`
          };
        }
        fs4.mkdirSync(path3.dirname(dst), { recursive: true });
        fs4.renameSync(src, dst);
        status("Moved");
        return { success: true, sourcePath: src, destinationPath: dst };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const renameFileTool = (0, import_sdk2.tool)({
    name: "rename_file",
    description: "Rename a file or directory in place (same parent directory). For moving to a different location use move_file instead. Fails if a file with the new name already exists.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path of the file or directory to rename. Supports ~."),
      new_name: import_zod.z.string().min(1).describe("New name only (not a full path) - e.g. 'index.ts' not '/home/user/project/index.ts'.")
    },
    implementation: async ({ file_path, new_name }, { status }) => {
      status(`Renaming ${path3.basename(file_path)} \u2192 ${new_name}..`);
      try {
        const resolved = path3.resolve(file_path.replace(/^~/, os3.homedir()));
        if (!fs4.existsSync(resolved)) {
          return { success: false, error: `Path not found: ${resolved}` };
        }
        if (path3.basename(new_name) !== new_name) {
          return {
            success: false,
            error: "new_name must be a plain name without directory separators. Use `move_file` to relocate."
          };
        }
        const destination = path3.join(path3.dirname(resolved), new_name);
        if (fs4.existsSync(destination)) {
          return {
            success: false,
            error: `A file named "${new_name}" already exists in that directory.`
          };
        }
        fs4.renameSync(resolved, destination);
        status("Renamed");
        return { success: true, oldPath: resolved, newPath: destination };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  const appendToFileTool = (0, import_sdk2.tool)({
    name: "append_to_file",
    description: "Append text to the end of an existing file without reading or rewriting the whole thing. Ideal for adding lines to logs, .env files, config lists, or any growing file. Creates the file (and any missing parent directories) if it does not exist yet.",
    parameters: {
      file_path: import_zod.z.string().min(1).describe("Absolute path to the file to append to. Supports ~."),
      content: import_zod.z.string().describe("Text to append. Include a leading newline if you want a blank line before the new content.")
    },
    implementation: async ({ file_path, content }, { status }) => {
      status(`Appending to ${path3.basename(file_path)}..`);
      try {
        const resolved = path3.resolve(file_path.replace(/^~/, os3.homedir()));
        fs4.mkdirSync(path3.dirname(resolved), { recursive: true });
        fs4.appendFileSync(resolved, content, "utf-8");
        status(`Appended ${Buffer.byteLength(content, "utf8")} bytes`);
        return {
          success: true,
          filePath: resolved,
          bytesAppended: Buffer.byteLength(content, "utf8")
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
  });
  return [
    listSkillsTool,
    readSkillFileTool,
    listSkillFilesTool,
    readFileTool,
    writeFileTool,
    patchFileTool,
    appendToFileTool,
    createDirectoryTool,
    listDirectoryTool,
    deleteFileTool,
    moveFileTool,
    renameFileTool,
    getCurrentDirectoryTool,
    runCommandTool
  ];
}
var fs4, os3, path3, import_sdk2, import_zod;
var init_toolsProvider = __esm({
  "src/toolsProvider.ts"() {
    "use strict";
    fs4 = __toESM(require("fs"));
    os3 = __toESM(require("os"));
    path3 = __toESM(require("path"));
    import_sdk2 = require("@lmstudio/sdk");
    import_zod = require("zod");
    init_settings();
    init_executor();
    init_constants();
    init_scanner();
  }
});

// src/preprocessor.ts
function debugLog(...args) {
  if (DEBUG) console.debug("[skills]", ...args);
}
function buildAvailableSkillsBlock(skills, limit) {
  const skillTags = skills.slice(0, limit).map(
    (s) => [
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
      `</skill>`
    ].join("\n")
  ).join("\n\n");
  return `<available_skills>
${skillTags}
</available_skills>`;
}
function buildAutoInjectInstruction() {
  return "You have access to a set of skills listed in <available_skills>. Each skill is a directory containing a SKILL.md file with instructions and best practices built from real trial and error. Before starting any task that matches a skill, call `read_skill_file` with the skill name or its location path to load its instructions - always do this before writing any code, creating files, or producing output the skill covers. Multiple skills may be relevant to a single task; read all of them before proceeding, do not limit yourself to one. After reading SKILL.md, if it references additional files, call `list_skill_files` to discover them, then read whichever ones apply. Use `list_skills` with a query to search for relevant skills by name and description when the task does not match anything in the list above - not all installed skills may be shown here.";
}
function buildAutoInjectBlock(skills, limit) {
  return [
    buildAutoInjectInstruction(),
    "",
    buildAvailableSkillsBlock(skills, limit)
  ].join("\n");
}
function computeFingerprint(skills) {
  return skills.map((s) => `${s.skillMdPath}:${s.description}`).sort().join("|");
}
function parseExplicitSkillRefs(text) {
  const refs = [];
  const seen = /* @__PURE__ */ new Set();
  const re = new RegExp(EXPLICIT_SKILL_REGEX.source, EXPLICIT_SKILL_REGEX.flags);
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      refs.push(name);
    }
  }
  return refs;
}
function buildExplicitActivationInstruction(resolved, unresolved) {
  const lines = [];
  lines.push(
    "One or more skills have been explicitly activated for this request via /skill-name notation."
  );
  lines.push(
    `Their SKILL.md contents have been expanded into <${EXPLICIT_SKILL_CONTEXT_TAG}> below and must be treated as the highest-priority skill context.`
  );
  lines.push("");
  lines.push("Rules for explicitly activated skills:");
  lines.push(
    "- The named skill is intentional; apply its instructions before anything else."
  );
  lines.push(
    `- The SKILL.md body is already available inside <${EXPLICIT_SKILL_CONTEXT_TAG}>; do NOT call \`read_skill_file\` for it again.`
  );
  lines.push(
    "- All other user text is secondary task payload to be interpreted through the skill's lens."
  );
  lines.push(
    "- Quoted strings, code snippets, globs, and command-looking text must NOT be interpreted before applying the expanded skill."
  );
  lines.push("- Do NOT use `run_command` for exploration.");
  if (resolved.length > 0) {
    lines.push("");
    lines.push(`Activated skill(s): ${resolved.map((n) => `/${n}`).join(", ")}`);
  }
  if (unresolved.length > 0) {
    lines.push("");
    lines.push(
      `Unresolved skill reference(s): ${unresolved.map((n) => `/${n}`).join(", ")}`
    );
    lines.push(
      "Call `list_skills` with the unresolved name(s) as a query to locate them before proceeding."
    );
  }
  return lines.join("\n");
}
function buildSkillContextBlock(entries) {
  const inner = entries.map(
    ({ name, content }) => [`<skill name="${name}">`, content.trim(), `</skill>`].join("\n")
  ).join("\n\n");
  return `<${EXPLICIT_SKILL_CONTEXT_TAG}>
${inner}
</${EXPLICIT_SKILL_CONTEXT_TAG}>`;
}
function applyExplicitActivation(userMessage, text, skillsDirs) {
  const refs = parseExplicitSkillRefs(text);
  if (refs.length === 0) return false;
  debugLog(`explicit skill refs detected: ${refs.join(", ")}`);
  const resolved = [];
  const unresolvedNames = [];
  for (const ref of refs) {
    const skill = resolveSkillByName(skillsDirs, ref);
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
  const instruction = buildExplicitActivationInstruction(
    resolved.map((r) => r.name),
    unresolvedNames
  );
  const parts = [instruction];
  if (resolved.length > 0) {
    parts.push("");
    parts.push(buildSkillContextBlock(resolved));
  }
  userMessage.replaceText(`${parts.join("\n")}

---

${text}`);
  return true;
}
async function promptPreprocessor(ctl, userMessage) {
  try {
    debugLog("prompt preprocessor invoked");
    const text = userMessage.getText();
    debugLog(`user text extracted (${text.length} chars)`);
    if (text.trim().length < MIN_PROMPT_LENGTH) {
      debugLog(
        `preprocessing skipped: prompt shorter than MIN_PROMPT_LENGTH=${MIN_PROMPT_LENGTH}`
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
      `${buildAutoInjectBlock(skills, cfg.maxSkillsInContext)}

---

${text}`
    );
    debugLog(`auto-injected <available_skills> (${skills.length} skills)`);
    return userMessage;
  } catch (err) {
    console.warn("skills preprocessor error:", err);
    return userMessage;
  }
}
var DEBUG, stateMap;
var init_preprocessor = __esm({
  "src/preprocessor.ts"() {
    "use strict";
    init_settings();
    init_scanner();
    init_constants();
    DEBUG = process.env.LMS_SKILLS_DEBUG === "1";
    stateMap = /* @__PURE__ */ new Map();
  }
});

// src/setup.ts
function copyDir(src, dest) {
  fs5.mkdirSync(dest, { recursive: true });
  for (const entry of fs5.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path4.join(src, entry.name);
    const destPath = path4.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs5.copyFileSync(srcPath, destPath);
    }
  }
}
function bootstrapSkillsDir(skillsPath) {
  if (fs5.existsSync(skillsPath)) return;
  fs5.mkdirSync(skillsPath, { recursive: true });
  const samplesDir = path4.resolve(__dirname, "..", "samples");
  if (!fs5.existsSync(samplesDir)) return;
  copyDir(samplesDir, skillsPath);
}
var fs5, path4;
var init_setup = __esm({
  "src/setup.ts"() {
    "use strict";
    fs5 = __toESM(require("fs"));
    path4 = __toESM(require("path"));
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  main: () => main
});
async function main(context) {
  bootstrapSkillsDir(DEFAULT_SKILLS_DIR);
  context.withConfigSchematics(configSchematics);
  context.withToolsProvider(toolsProvider);
  context.withPromptPreprocessor(promptPreprocessor);
}
var init_src = __esm({
  "src/index.ts"() {
    "use strict";
    init_config();
    init_toolsProvider();
    init_preprocessor();
    init_setup();
    init_constants();
  }
});

// .lmstudio/entry.ts
var import_sdk3 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk3.LMStudioClient({
  clientIdentifier,
  clientPasskey,
  baseUrl
});
globalThis.__LMS_PLUGIN_CONTEXT = true;
var predictionLoopHandlerSet = false;
var promptPreprocessorSet = false;
var configSchematicsSet = false;
var globalConfigSchematicsSet = false;
var toolsProviderSet = false;
var generatorSet = false;
var selfRegistrationHost = client.plugins.getSelfRegistrationHost();
var pluginContext = {
  withPredictionLoopHandler: (generate) => {
    if (predictionLoopHandlerSet) {
      throw new Error("PredictionLoopHandler already registered");
    }
    if (toolsProviderSet) {
      throw new Error("PredictionLoopHandler cannot be used with a tools provider");
    }
    predictionLoopHandlerSet = true;
    selfRegistrationHost.setPredictionLoopHandler(generate);
    return pluginContext;
  },
  withPromptPreprocessor: (preprocess) => {
    if (promptPreprocessorSet) {
      throw new Error("PromptPreprocessor already registered");
    }
    promptPreprocessorSet = true;
    selfRegistrationHost.setPromptPreprocessor(preprocess);
    return pluginContext;
  },
  withConfigSchematics: (configSchematics2) => {
    if (configSchematicsSet) {
      throw new Error("Config schematics already registered");
    }
    configSchematicsSet = true;
    selfRegistrationHost.setConfigSchematics(configSchematics2);
    return pluginContext;
  },
  withGlobalConfigSchematics: (globalConfigSchematics) => {
    if (globalConfigSchematicsSet) {
      throw new Error("Global config schematics already registered");
    }
    globalConfigSchematicsSet = true;
    selfRegistrationHost.setGlobalConfigSchematics(globalConfigSchematics);
    return pluginContext;
  },
  withToolsProvider: (toolsProvider2) => {
    if (toolsProviderSet) {
      throw new Error("Tools provider already registered");
    }
    if (predictionLoopHandlerSet) {
      throw new Error("Tools provider cannot be used with a predictionLoopHandler");
    }
    toolsProviderSet = true;
    selfRegistrationHost.setToolsProvider(toolsProvider2);
    return pluginContext;
  },
  withGenerator: (generator) => {
    if (generatorSet) {
      throw new Error("Generator already registered");
    }
    generatorSet = true;
    selfRegistrationHost.setGenerator(generator);
    return pluginContext;
  }
};
Promise.resolve().then(() => (init_src(), src_exports)).then(async (module2) => {
  return await module2.main(pluginContext);
}).then(() => {
  selfRegistrationHost.initCompleted();
}).catch((error) => {
  console.error("Failed to execute the main function of the plugin.");
  console.error(error);
});

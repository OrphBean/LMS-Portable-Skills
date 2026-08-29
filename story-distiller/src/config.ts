import * as fs from "fs";
import { focusConfigSchema, type FocusConfig } from "./types";

export function loadFocusConfig(path: string | null): FocusConfig | null {
  if (!path) return null;
  const raw = fs.readFileSync(path, "utf-8");
  const parsed = focusConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(
      `focus config invalid (${parsed.error.issues.length} issue(s)): ` +
        parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; "),
    );
  }
  return parsed.data;
}

export function emptyFocus(): FocusConfig {
  return { instructions: "", aspects: [] };
}

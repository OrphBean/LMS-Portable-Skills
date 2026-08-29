import type { Slice } from "./types";

export interface SegmentOptions {
  sliceChars: number;
  overlapChars: number;
}

interface Para {
  text: string;
  start: number;
}

// Normalize line endings then split into blocks on blank lines, keeping the
// absolute start offset of each block so later passes can reference provenance.
function splitParagraphs(text: string): Para[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const out: Para[] = [];
  let cursor = 0;
  const blocks = normalized.split(/\n[ \t]*\n+/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed) {
      out.push({ text: trimmed, start: cursor });
    }
    cursor += block.length + 2;
  }
  return out;
}

function breakAt(text: string, target: number): number {
  for (let i = Math.min(target, text.length - 1); i > target - 120; i--) {
    if (/\s/.test(text[i])) return i + 1;
  }
  return Math.max(1, target);
}

// Pack paragraphs into contiguous slices up to sliceChars, carrying an overlap
// tail so a scene spanning a boundary stays readable in both slices. Long
// paragraphs are hard-split mid-way.
export function segmentText(
  text: string,
  opts: SegmentOptions,
): Slice[] {
  const paras = splitParagraphs(text);
  if (paras.length === 0) return [];
  const sliceChars = Math.max(512, opts.sliceChars);
  const overlapChars = Math.max(0, opts.overlapChars);

  const slices: Slice[] = [];
  let current = "";
  let tail = "";
  let currentStart = 0;

  const flush = () => {
    if (!current.trim()) return;
    slices.push({
      index: slices.length,
      text: current,
      startChar: currentStart,
      endChar: currentStart + current.length,
    });
  };

  const appendPad = (content: string) => {
    const pad = current ? "\n\n" : "";
    return `${current}${pad}${content}`;
  };

  const resetStart = (content: string) => {
    const offset = current.indexOf(content);
    currentStart = offset >= 0 ? currentStart + offset : currentStart + current.length;
  };

  for (const para of paras) {
    const candidate = appendPad(para.text);
    if (candidate.length <= sliceChars) {
      current = candidate;
      continue;
    }

    flush();
    tail = current.slice(-overlapChars);
    const trimmedTail = tail.trimStart();
    const tailStart = current.length - trimmedTail.length;
    currentStart += tailStart;

    if (para.text.length > sliceChars) {
      let remainder = para.text;
      while (remainder.length > sliceChars) {
        const cut = breakAt(remainder, sliceChars);
        const piece = remainder.slice(0, cut);
        const nextTail = piece.slice(-overlapChars);
        const composed = tail ? `${tail}\n\n${piece}` : piece;
        current = composed;
        flush();
        currentStart += composed.length - overlapChars;
        tail = nextTail;
        remainder = remainder.slice(cut);
      }
      current = tail ? `${tail}\n\n${remainder}` : remainder;
      tail = "";
      resetStart(current);
      continue;
    }

    current = tail ? `${tail}\n\n${para.text}` : para.text;
    tail = "";
    resetStart(current);
  }
  flush();

  return slices.map((s, i) => ({ ...s, index: i }));
}

// Rough token estimate for budget logging only. The LM Studio SDK provides
// exact token counts; this only sizes source slices before a model call.
export function estimateTokens(chars: number): number {
  return Math.ceil(chars / 3.5);
}

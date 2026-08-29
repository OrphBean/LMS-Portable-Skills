// Deterministic, dependency-free text chunking. Splits on paragraph boundaries
// first, then packs chunks up to chunkChars with overlap, keeping hard breaks
// between chunks where possible.

interface Paragraph {
  text: string;
}

function splitParagraphs(text: string): Paragraph[] {
  // Normalize newlines then split into blocks on blank lines.
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n[ \t]*\n+/);
  const paragraphs: Paragraph[] = [];
  for (const block of blocks) {
    const t = block.trim();
    if (t) paragraphs.push({ text: t });
  }
  return paragraphs;
}

function packParagraphs(
  paragraphs: Paragraph[],
  chunkChars: number,
  overlapChars: number,
): string[] {
  const chunks: string[] = [];
  let current = "";
  let tail = "";

  for (const p of paragraphs) {
    const candidate = current ? `${current}\n\n${p.text}` : p.text;
    if (candidate.length <= chunkChars) {
      current = candidate;
      continue;
    }

    // Flush the current chunk, carrying an overlap tail.
    if (current) {
      chunks.push(current);
      tail = current.slice(-overlapChars);
    }

    // A single paragraph may exceed chunkChars; hard-split it.
    if (p.text.length > chunkChars) {
      let remainder = p.text;
      while (remainder.length > chunkChars) {
        const cut = breakAt(remainder, chunkChars);
        const piece = remainder.slice(0, cut);
        const nextTail = piece.slice(-overlapChars);
        if (tail) {
          chunks.push(`${tail}\n\n${piece}`.slice(0, chunkChars + overlapChars));
        } else {
          chunks.push(piece);
        }
        tail = nextTail;
        remainder = remainder.slice(cut);
      }
      current = tail ? `${tail}\n\n${remainder}` : remainder;
      tail = "";
      continue;
    }

    current = tail ? `${tail}\n\n${p.text}` : p.text;
    tail = "";
  }

  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 0);
}

function breakAt(text: string, target: number): number {
  // Prefer the last whitespace before target; fall back to a hard cut.
  for (let i = Math.min(target, text.length - 1); i > target - 80; i--) {
    if (/\s/.test(text[i])) return i + 1;
  }
  return Math.max(1, target);
}

export function chunkText(
  text: string,
  chunkChars: number,
  overlapChars: number,
): string[] {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return [];
  return packParagraphs(paragraphs, Math.max(64, chunkChars), overlapChars);
}

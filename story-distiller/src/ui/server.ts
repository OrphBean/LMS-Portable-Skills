import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { StoryDistillerLlm, DistillError } from "../llm";
import { extractTextFromBuffer } from "../extract";
import { runBatch } from "../batch";
import { resolveBaseUrl } from "../lms";
import { focusConfigSchema, type FocusConfig, type StoryInput } from "../types";

export interface ServerConfig {
  kbRoot: string;
  model: string | null;
  baseUrl: string | null;
  sliceChars: number;
  slateChars: number;
  maxTokens: number;
  temperature: number;
  acts: boolean;
  assign: boolean;
  defaultFocus: FocusConfig | null;
}

interface UploadedFile {
  name: string;
  ext: string;
  text?: string;
  data?: string; // base64 of original bytes for binary formats
}

function uiDir(): string {
  // dist/ui/server.js -> ../../../ui/index.html relative to repo
  return path.resolve(__dirname, "..", "..", "ui");
}

function readJsonBody(req: http.IncomingMessage, limitBytes: number): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {});
      } catch (err) {
        reject(new Error("invalid JSON body: " + (err as Error).message));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, obj: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

function sseWrite(res: http.ServerResponse, obj: unknown): void {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function startServer(cfg: ServerConfig, port: number): Promise<void> {
  const indexHtml = path.join(uiDir(), "index.html");

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const route = url.pathname;

    if (req.method === "GET" && (route === "/" || route === "/index.html")) {
      if (!fs.existsSync(indexHtml)) {
        sendJson(res, 500, { error: `ui/index.html not found at ${indexHtml}` });
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(indexHtml));
      return;
    }
    if (req.method === "GET" && route === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === "GET" && route === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "GET" && route === "/config") {
      sendJson(res, 200, { kbRoot: cfg.kbRoot, port });
      return;
    }

    if (req.method === "POST" && route === "/distill") {
      let body: any;
      try {
        body = await readJsonBody(req, 512 * 1024 * 1024);
      } catch (err) {
        sendJson(res, 400, { error: (err as Error).message });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      sseWrite(res, { type: "start", kbRoot: cfg.kbRoot });

      try {
        const focusRaw = body.focus ?? cfg.defaultFocus ?? { aspects: [] };
        const focusParsed = focusConfigSchema.safeParse(focusRaw);
        if (!focusParsed.success) {
          throw new Error(
            "invalid focus config: " +
              focusParsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; "),
          );
        }
        const focus = focusParsed.data;

        const files: UploadedFile[] = Array.isArray(body.files) ? body.files : [];
        if (files.length === 0) {
          throw new Error("no files provided");
        }

        const inputs: StoryInput[] = [];
        for (const f of files) {
          if (f.data && (f.ext === ".docx" || f.ext === ".pdf")) {
            const buf = Buffer.from(f.data, "base64");
            const text = await extractTextFromBuffer(f.name, buf);
            inputs.push({ name: f.name, text, source: "upload", ext: f.ext });
          } else {
            inputs.push({ name: f.name, text: f.text || "", source: "upload", ext: f.ext });
          }
        }

        const llm = new StoryDistillerLlm({
          baseUrl: resolveBaseUrl(
            (body.baseUrl as string) || cfg.baseUrl || undefined,
          ),
          model: (body.model as string) ?? cfg.model ?? undefined,
          temperature: Number(body.temperature) || cfg.temperature,
          maxTokens: Number(body.maxTokens) || cfg.maxTokens,
        });
        await llm.connect();
        sseWrite(res, { type: "connected" });

        const summary = await runBatch(
          inputs,
          llm,
          {
            kbRoot: cfg.kbRoot,
            focus,
            sliceChars: Number(body.sliceChars) || cfg.sliceChars,
            slateChars: Number(body.slateChars) || cfg.slateChars,
            maxCalls: 300,
            acts: body.acts === undefined ? cfg.acts : Boolean(body.acts),
            write: true,
            assign: body.assign === undefined ? cfg.assign : Boolean(body.assign),
            onProgress: (story: string, message: string) =>
              sseWrite(res, { type: "progress", story, message, at: Date.now() }),
          },
          (e) => sseWrite(res, { type: "story", ...e }),
        );

        sseWrite(res, {
          type: "done",
          summary: {
            total: summary.total,
            succeeded: summary.succeeded,
            assigned: summary.assigned,
            results: summary.results,
          },
        });
      } catch (err) {
        sseWrite(res, { type: "error", error: err instanceof DistillError ? err.message : (err as Error).message });
      }
      res.end();
      return;
    }

    if (req.method === "GET" && route === "/corpora") {
      try {
        const list = fs
          .readdirSync(cfg.kbRoot, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
        sendJson(res, 200, { corpora: list });
      } catch {
        sendJson(res, 200, { corpora: [] });
      }
      return;
    }

    sendJson(res, 404, { error: "not found" });
  });

  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`\nStory Distiller UI running at http://127.0.0.1:${port}\n`);
    process.stdout.write(`KB root: ${cfg.kbRoot}\n`);
    process.stdout.write("Stop with Ctrl+C.\n\n");
  });

  // Keep the process alive until the server is closed (Ctrl+C).
  await new Promise<void>(() => {});
}

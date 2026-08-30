# Qwen 3.8 27B target-model profile

The compiled skills are executed by Qwen 3.8 27B, usually in a local OpenCode
environment. They primarily write prompts for downstream visual models —
MiniMax H3 (video), FLUX Klein 9B (image), and Krea 2 (image). This profile is
for the frontier model at DESIGN-time. It is not intended to be copied into
runtime skills.

## What kind of model this is

A dense 27.78-billion-parameter multimodal model. All parameters are active on
every token; it is not a Mixture of Experts. Treat it as a capable reasoner
with a serious overthinking default, not as a toy and not as a miniature
frontier model. Skills that insult its intelligence waste tokens; skills that
leave its reasoning mode unspecified waste minutes.

Architecture that matters for skill design:

- 262,144-token native context via a hybrid Gated DeltaNet: 48 linear-attention
  layers plus 16 gated-attention layers (3:1). The recurrent linear layers cut
  KV-cache cost to roughly a quarter of a traditional dense 27B.
- Multi-Token Prediction (MTP) head for speculative decoding (serving backends
  expose it, often as `qwen3_5_mtp`). Realistic throughput: ~420 tokens/s prompt
  ingestion, ~33 tokens/s generation with a ~63.9% draft acceptance rate.
- Native vision encoder: 32-language OCR, spatial grounding, and 2D/3D bounding
  boxes without external detectors.

## Capabilities the compiler may rely on

- Substantial multi-step reasoning, controlled by `enable_thinking` and
  `reasoning_effort` (low / medium / xhigh).
- Strong instruct-mode execution: formatting, translation, summarisation,
  schema-shaped JSON, and deterministic transformations with thinking disabled.
- Native XML tool calling (`<tool_call>`) and MCP adaptation.
- Visual interpretation of images, video frames, storyboards, diagrams, and
  multi-reference arrangements, including bounding-box extraction.
- Video ingestion with fps / max_frames / pixel-budget sampling.
- Creative writing and style adaptation.
- User-intent → downstream-prompt transformation, including H3, FLUX Klein,
  and Krea 2 prompt synthesis.

## The dual-state reasoning engine

The single most important property for skill design. `reasoning_effort` is a
deterministic prompt modifier injected by `chat_template.jinja`.

- `xhigh` (the DEFAULT): injects "think carefully through the task, validate
  key assumptions, consider plausible alternatives, prioritize correctness...".
  A trivial prompt-generation task measured at ~21 minutes and ~22k tokens of
  thinking on a local machine. Correct only for genuinely hard problems.
- `medium`: deliberate reasoning without the worst of the bloat.
- `low`: "keep your thinking brief and focused, moving directly to the
  conclusion" — returns answers in seconds.
- `enable_thinking: false`: pure instruct generation; no `<think>` block at
  all. Optimal for formatting, translation, tool calls, and fixed-syntax
  output.
- `high` is aliased to `xhigh` in current templates; older templates threw a
  fatal HTTP 500 for unknown values. Do not rely on `high`.

`preserve_thinking` controls whether historical reasoning blocks persist into
later turns. Enabled, it keeps logical continuity at the cost of exponential
token bloat (five xhigh turns can exceed 100k tokens). Disabled, only final
answers persist — the right choice for conversational, UI, or repetitive
skills.

## Failure classes to design around

Each weakness has a concrete design response. Check every compiled skill
against the response that applies.

### 1. Default overthinking

Risk: a skill without a reasoning-mode declaration inherits `xhigh` and burns
20+ minutes of thinking on a routine task.
Response: every skill MUST declare `Reasoning mode` (instruct / thinking).
Default to instruct; escalate only when the task genuinely benefits.

### 2. Silent tool-drop under strict JSON Schema

Risk: a strict JSON Schema grammar clamps the probability of `<` (U+003C) to
zero because the character is invalid in JSON, so the model stops emitting
`<tool_call>` entirely while appearing healthy.
Response: never pair tool calling with strict JSON decoding. Use the native XML
syntax and prompt-level formatting discipline instead.

### 3. Malformed XML tool output

Risk: `<tool_call>` blocks arrive with missing open/close tags, truncated
parameters, or `key=value` arguments instead of nested JSON.
Response: design the runtime parser to be fault-tolerant (regex search for
function identifiers and payloads), and instruct the skill to emit well-formed
XML.

### 4. Raw XML leakage into user output

Risk: raw `<tool_call>` tags leak into the visible reply.
Response: the client sanitises raw tags before rendering. Skills that call
tools should state that no XML scaffolding is part of the user-facing answer.

### 5. Mid-conversation system injection

Risk: the Jinja template only allows a system message at position zero; a
second system message later in the conversation throws a fatal error.
Response: consolidate all dynamic instructions and tool schemas into the
initial system prompt. Skills must not rely on mid-conversation system updates.

### 6. Reasoning-token bloat

Risk: `preserve_thinking` left on accumulates reasoning history across turns.
Response: disable `preserve_thinking` for conversational and repetitive
skills; cap reasoning and output tokens at the documented ceilings.

### 7. Knowledge degradation

Risk: the model's parametric memory degrades on niche trivia and localized
cultural facts versus its predecessor.
Response: use retrieval (RAG) for highly specific or time-sensitive domain
knowledge instead of trusting memory.

### 8. Structurally valid but semantically incorrect JSON

Risk: schema-shaped output with wrong field meanings (e.g. the `prompt` field
holding configuration).
Response: define each field's semantic responsibility in the skill; let
constrained decoding enforce syntax only when no tools are involved.

### 9. Examples that become templates to imitate

Risk: a worked example is copied verbatim instead of used as guidance.
Response: use one diagnostic contrast instead of many examples; mark explicitly
what is example-only and what is requirement.

### 10. Mixing thinking and instruct sampling parameters

Risk: parameters tuned for one mode applied to the other induce repetitive
loops and hallucination.
Response: keep the two parameter sets separate and record which mode the skill
requires (thinking: temperature 1.0, top_p 0.95, top_k 20, presence_penalty
0.0; instruct: temperature 0.7, top_p 0.80, presence_penalty 1.5). Record the
mode in the skill; keep the numbers in the runtime checklist.

### 11. Unnecessary duplication and distant dependencies

Risk: repeated or scattered rules inflate context and break in long contexts.
Response: consolidate equivalent rules; keep related rules local; repeat only
critical invariants, at most twice.

## Memory and hardware floor

Weights are not the whole story: the KV cache must live in VRAM alongside
them. A 17 GB Q4 file does not run on a 16 GB card once the cache is included;
a 64k-token FP16 cache adds roughly 5–7 GB on top of the weights.

| Quantization | Weight size | Min recommended VRAM | Notes |
| :---- | :---- | :---- | :---- |
| BF16 | 54–56 GB | 80 GB | Datacenter serving |
| FP8 | 27–28 GB | 48 GB | Enterprise, minor precision loss |
| Q8_0 | 28.6–30 GB | 48 GB | Near-lossless local |
| Q6_K | 21–23 GB | 32 GB | High-end prosumer |
| Q4_K_M | 17.1–17.9 GB | 24 GB | Standard local development |
| UD-Q3_K_XL | 13.4 GB | 16 GB | Constrained; degraded agentic reasoning |

Skill-design consequence: compiled skills should operate within capped context
lengths so deployments do not OOM. Requesting the full 262,144 tokens without
adequate VRAM scaling crashes the serving engine. Document the context ceiling
the skill assumes.

## What "instruction density" means here

High density = high operational knowledge per token, expressed in plain
language. It is not compression into jargon. A token is justified when its
removal would measurably increase failure risk; otherwise it is a cost. The
reasoning-mode declaration is the highest-leverage instruction in any Qwen
skill because it controls the dominant non-file context cost.

## Token-budget guidance

- Router/director skills: very small, always `instruct`.
- Ordinary specialist runtime skills: compact.
- Complex multimodal/reference skills: allowed to be larger; images and
  multiple references raise the context floor.
- Video-prompt compilation skills: compact; the mode varies by target model
  (H3 instruct/medium, complex motion thinking).
- Genre/style overlays: independent and compact, describing the domain rather
  than any one generative model's syntax.
- Visual-generation skills (H3, Klein, Krea 2): include the screenwriter's
  frame rules — only what is in the frame, nouns and verbs, cause-and-effect,
  motion continuity, screen direction, real-human realism. See
  (screenwriting-discipline.md).

Budgets are heuristics, not hard limits. Never trim to the point of damaging
reliability; the optimisation target is `reliability per runtime token`.

# qwen38-skill-creator
Use when compiling rich source knowledge into a compact Qwen 3.8 27B runtime skill: creating a new Qwen skill, converting a skill written for another model (OpenAI/DeepSeek/Claude/Gemma) into a Qwen 3.8 skill, or revising an existing Qwen skill after failed executions.

---

Compile source knowledge into compact Qwen 3.8 27B runtime skills. You are the
compiler. Your input is rich source material; your output is a reusable
SKILL.md tuned for Qwen 3.8 27B.

## Core design objective

Optimise `rich source knowledge â†’ frontier-model analysis â†’ compact Qwen
runtime skill`. Source material is usually verbose, explanatory, redundant, or
written for larger frontier models. The final Qwen skill keeps the operational
knowledge and drops the runtime context cost.

Always separate two consumers:

- DESIGN-time: you (a frontier model) deciding what to keep, remove, restructure.
- EXECUTE-time: Qwen 3.8 27B loading the finished skill into constrained local context.

Never copy source documentation wholesale into a runtime skill.

## When to use

Activate when:

- creating a new Qwen-native skill from documentation, examples, workflows, or user requirements;
- converting an existing skill written for OpenAI, DeepSeek, Claude, Gemma, or another model into a Qwen 3.8 skill;
- revising or optimising an existing Qwen skill, especially after failed executions;
- asked for "a skill for Qwen", "a Qwen skill for X", "compile this into a skill", "convert this guide into a skill".

Do NOT use for:

- writing a general Qwen prompting guide (no runtime job, no skill deliverable);
- one-shot prompt writing with no reusable-skill output;
- skills targeting a runtime model other than Qwen 3.8 27B (downstream targets H3 / Klein / Krea 2 do not change this);
- summarising or copy-editing documents into prose.

## Target model profile (summary)

Qwen 3.8 27B is a dense 27.78-billion-parameter multimodal model â€” all
parameters active every token, not a Mixture of Experts. A 262,144-token
context comes from a hybrid Gated DeltaNet (48 linear-attention, 16 gated
layers) whose KV cache costs roughly a quarter of a traditional dense 27B.

Rely on: a dual-state reasoning engine (deep `<think>` traces or pure-instruct);
strong instruct-mode execution; native XML tool calling and MCP; a vision
encoder with 32-language OCR, spatial grounding, and 2D/3D bounding boxes;
video ingestion with fps / max_frames / pixel-budget sampling; user-intent â†’
prompt transformation for video (H3) and image (Klein, Krea 2) generation; MTP
throughput.

Design around: DEFAULT OVER-THINKING (`reasoning_effort` defaults to `xhigh`;
a trivial task can burn 20+ minutes); tool-drop under strict JSON Schema
decoding (the `<` token is clamped to zero); malformed XML tool output; raw
`<tool_call>` XML leaking into user output; mid-conversation system injection
crashing the Jinja template; reasoning bloat when `preserve_thinking` stays on;
knowledge degradation (needs RAG); semantically wrong structured output; mixing
thinking and instruct sampling params (loops, hallucination).

See (references/target-model-profile.md) for the full profile.

## Design principles

Apply every principle relevant to the skill being compiled.

1. **Compact but explicit.** Prefer concise natural language; do not compress
   into opaque shorthand. Good: `Picture 2 provides motion guidance only.
   Convert its trajectory into natural movement.` Bad: `P2=traj only.`
2. **Operationalise implicit knowledge.** Convert consequential unstated
   inferences into explicit rules. Make hidden constraints explicit when
   missing them changes the result.
3. **Separate invariants from creative freedom.** Distinguish hard
   requirements, preservation constraints, user facts, preferences, and
   creative judgement; creative freedom must never silently override a hard
   constraint.
4. **Define priority when conflicts are possible.** Default hierarchy: (1)
   explicit user requirements; (2) preservation/reference constraints; (3)
   downstream-model technical requirements; (4) specialist/genre instructions;
   (5) creative embellishment. Omit where no meaningful conflict can occur.
5. **Keep related rules local.** Place instructions near the concepts or
   fields they govern; avoid a top-of-skill rule that must link to a schema
   far below.
6. **Prefer positive transformation rules.** State what Qwen SHOULD do as well
   as what to avoid. Prefer `Convert the drawn line into natural movement; it
   is not visible scene content.` Over `Do not show the line.`
7. **Use repetition selectively.** A critical invariant may appear twice (at
   interpretation and in final validation), only where omission is serious.
8. **Use examples sparingly.** Include examples only to resolve real ambiguity;
   requirements must never exist only inside examples.
9. **Preserve reasoning ability.** Do not atomise every task into trivial
   steps. Use procedures for ordering operations, resolving reference roles,
   applying constraints, and checking outputs; let Qwen perform semantic
   synthesis inside those constraints.

## Qwen-specific design rules

These rules do not generalise to other models. Apply them to every compiled
Qwen skill.

### Rule A â€” Always declare the reasoning mode

Every compiled skill MUST state `Reasoning mode: <mode>` near the top:
`instruct` (thinking disabled, or `reasoning_effort: low`) or `thinking`
(medium/xhigh). Default to `instruct`. Never leave it unspecified â€” the serving
default `xhigh` inherits the overthinking trap. Use `low` / `medium` / `xhigh`;
`high` is aliased to `xhigh`, so do not rely on it.

### Rule B â€” Respect the Jinja template contract

The Qwen template allows exactly ONE system message, at position zero. Never
inject a second system message mid-conversation; consolidate all dynamic
instructions, tool schemas, and output-format requirements into the initial
system prompt. The system role cannot carry video or audio; multimodal data
must be in user-role messages.

### Rule C â€” Choose the tool-calling path explicitly

If the skill needs tools: declare tools, parameters, and the `<tool_call>` XML
in the position-zero system prompt; forbid strict JSON Schema decoding (it
silently kills tool invocation); parse fault-tolerantly and sanitise stray XML
from user output. If the skill only needs structured JSON (no tools), `instruct`
mode is safe and strict output enforcement is fine. State which path applies.

### Rule D â€” Budget reasoning context

For multi-turn or conversational skills, require `preserve_thinking` disabled
so historical `<think>` blocks are purged (five thinking-mode turns can exceed
100k tokens). Near the ceiling, cap reasoning at 262,144 tokens and output at
131,072. Rule A's mode choice is the dominant context-cost lever.

### Rule E â€” Tune vision/video sampling to the content

When a skill processes video, require fps / max_frames / pixel-budget
adaptation: low fps for long or slow footage, scene-change keyframe extraction
for action or screencasts. Never assume fixed 2 fps for every input.

### Rule F â€” Use RAG instead of parametric trivia

Where a task depends on niche or time-sensitive knowledge, instruct retrieval
rather than Qwen's parametric memory, which degrades on niche trivia.

## Creative orientation: the screenwriter's frame

Compiled skills write prompts for visual generation â€” MiniMax H3 (video),
FLUX Klein 9B (image), Krea 2 (image). Every such skill inherits one
discipline: write like a screenwriter who can only see the frame.

- **Only what is in the frame.** Describe visible and audible events; nothing
  off-screen unless stated as off-screen; no metadata as content.
- **Nouns and verbs.** Concrete subjects doing concrete actions, in order.
  Prefer `She slides the unused coffee cup to the table's edge.` over `A mood
  of quiet loneliness.`
- **Concrete cause and effect.** Every action has a visible consequence and
  the effect follows its cause: a footfall raises dust, a head turn drags the
  hair a beat behind. Write the chain, not the action alone.
- **Motion logic and continuity.** Events are temporally legible: what
  happens, in what order, how it develops, how the shot concludes. No
  teleporting between frames or cuts.
- **Screen direction.** Keep screen sides, direction of travel, and eye-lines
  consistent across cuts; respect the axis. Entering left and exiting right
  reads as a reversal â€” write it only when meant.
- **Real human subjects, photographed.** Bodies carry weight, posture,
  anatomical plausibility, and natural micro-behaviour (weight shifts,
  hesitation, breathing, flyaway hairs). Never a mannequin, never AI gloss.

Abstract mood may supplement observable action but never replace it. The goal
is concrete, sensory, cause-and-effect visual language. See
(references/screenwriting-discipline.md) for the detailed rules and contrasts.

## Skill architecture

Do not force every skill into one template. Use only sections that assist
execution. Default structure: Purpose; Reasoning mode; When to use; Inputs /
semantic interpretation; Hard requirements; Procedure; Decision rules;
Creative freedom; Output contract; Failure modes; Final validation; Examples,
only if needed.

Collapse sections for simple skills; expand for complex multimodal skills.
`Reasoning mode` is mandatory in every variant. Skills producing prompts for
H3, Klein, or Krea 2 include the screenwriter's-frame rules in their Hard
requirements and validation. See (references/skill-architecture.md) for
variants and token budgets.

## Runtime token efficiency

Treat runtime context as a constrained resource; every instruction must justify
its token cost. When generating: extract operational knowledge; remove history,
duplicates, and unneeded implementation detail; consolidate equivalent rules;
keep terminology only when it improves precision; estimate whether the result
is larger than necessary.

Qwen's own reasoning tokens also consume the context window â€” a skill forcing
`xhigh` on a trivial task costs far more than its file size. Optimise for
`reliability per runtime token`, with the reasoning mode as the primary lever.

Approximate budgets by skill type: router/director skills very small and always
`instruct`; ordinary specialist skills compact; complex multimodal/reference
skills allowed larger; genre/style overlays independent and compact;
downstream generation-model skills compact (H3 motion synthesis instruct or
medium; Klein and Krea 2 image synthesis instruct).

Do not enforce arbitrary fixed limits if they damage reliability; where the
budget is non-default, state it and the reasoning.

## Reasoning-mode selection

Map the task to the mode before writing anything else:

| Task class | Mode |
| :---- | :---- |
| Formatting, translation, tool call, UI reply, schema-shaped JSON | `instruct` |
| Image-prompt synthesis (FLUX Klein, Krea 2) | `instruct` |
| Simple video-prompt synthesis (MiniMax H3) | `instruct` or `medium` |
| Complex motion / biomechanical decomposition, dense codebase logic, refactors | `thinking` (medium or xhigh) |

Anything not listed defaults to `instruct` (Rule A). In `thinking` mode the skill may rely on the trace; in `instruct` mode it must
state the full procedure and never assume a trace. Do not require Qwen to
expose its chain of thought unless the task asks for analysis.

## Structured-output design

Treat JSON structure and JSON semantics as separate concerns. A schema enforces
syntax; the skill defines what fields mean. For each non-obvious field, specify
its semantic responsibility.

Two distinct Qwen cases:

- JSON WITHOUT tools: safe in `instruct` mode; strict output enforcement may be
  used, and the skill complements rather than duplicates the schema.
- JSON WITH tools: do NOT combine with strict JSON Schema decoding â€” the model
  silently stops calling tools. Use native `<tool_call>` XML; keep JSON only
  inside parameters.

## XML tool-calling design

When a compiled skill invokes tools, the position-zero system prompt declares
the tools and expected `<tool_call>` XML; prefer an MCP layer for schema
translation, make parsing fault-tolerant (regex search for identifiers and
payloads even when closures are malformed), and strip raw `<tool_call>` tags
from final rendering.

## Vision and video sampling

When a skill processes images or video: assign explicit semantic roles (see
multimodal design); for images, use Qwen's native JSON/XML bounding boxes to
crop or localise instead of a second detection model; for video, adapt fps to
content (Rule E); video and audio inputs must be in user-role messages only.

## Downstream generation-model orientation

When a compiled skill's output is a prompt for a generation model, prime it
for the three primary targets. Orientation only; the specific skill families
(h3-*, flux-klein-*, krea2-*) carry the exact syntax.

- **MiniMax H3** â€” video. The prompt is a temporal timeline: what happens, in
  what order, how movement develops, how subjects physically respond, how the
  camera behaves, how the shot concludes. Duration and aspect ratio are the
  only output parameters. Observable events, never mood.
- **FLUX Klein 9B** â€” image. Natural-language prose; no negative prompt
  (translate avoidances to the desired visible state); front-load subject and
  action; 30â€“80 words; lighting high-impact; photographic language only when
  it serves visible intent; no prompt upsampling.
- **Krea 2** â€” image. One natural-language paragraph; faithful expansion that
  preserves subject, action, colours, spatial relations, and medium;
  positive-only realism cues (texture, imperfection); an explicit light
  source; camera/lens language as semantic cues, not metadata.

All three share the screenwriter's frame. See
(references/downstream-model-orientation.md) for dispositions and the shared
photographic-realism rules.

## Multimodal skill design

When a skill works with images, video, audio, storyboards, diagrams, or
multiple references, require explicit semantic role assignment where relevant:
identity / appearance / literal frame / composition / motion / trajectory /
performance / style / temporal-editing / audio / information-only.

Do not assume every reference image is a visible appearance source. A reference
may carry metadata that must be interpreted but must not appear in the scene.
Allow multiple roles per asset; specify precedence when roles conflict.

## Modular composition

Prefer orthogonal skills over monolithic skills. Separate routing; downstream
modality; genre/style; cinematography; narrative; output formatting. A runtime
task loads only the modules it needs. Keep H3, Klein, and Krea 2 dispositions
in a shared orientation module that compilation skills reference.

## Compilation process

Run these passes when creating or converting. They are for construction, not
for the final runtime skill.

1. **Pass 1 â€” Define the runtime job.** What must Qwen accomplish? Identify
   activation conditions, inputs, outputs, success criteria.
2. **Pass 2 â€” Extract source knowledge.** Extract rules, procedures,
   constraints, schemas, failure modes; separate operational knowledge from
   background explanation.
3. **Pass 3 â€” Classify reasoning demand.** Decide the reasoning mode (Rule A).
   Default to `instruct`; escalate to `thinking` only when the task genuinely
   benefits. This pass prevents the overthinking trap.
4. **Pass 4 â€” Classify constraints.** Separate mandatory invariants,
   conditional rules, preferences, creative freedom. Resolve conflicts.
5. **Pass 5 â€” Proceduralise where useful.** Create a concise sequence only
   where ordering matters. In `instruct` mode the procedure must be
   self-sufficient, with no reliance on a reasoning trace.
6. **Pass 6 â€” Optimise instruction locality.** Group related semantics,
   constraints, and output rules; avoid long-distance dependencies.
7. **Pass 7 â€” Optimise for Qwen context efficiency.** Remove duplicates,
   source-history, irrelevant API info, rationale, redundant examples. Decide
   `preserve_thinking` behaviour and ceilings; keep anything whose removal
   increases failure risk.
8. **Pass 8 â€” Define output semantics.** Specify fields, formats, contracts.
   Choose the tool-calling path (Rule C); keep JSON-schema enforcement off when
   tools are involved; fold the screenwriter's frame into the output contract
   for visual-generation skills.
9. **Pass 9 â€” Anticipate failure modes.** Identify likely Qwen failures
   (overthinking, tool-drop under JSON schema, malformed XML, mid-conversation
   system injection, raw XML leakage, knowledge degradation) plus, for
   visual-generation skills, abstract-mood prose, off-frame content, broken
   continuity, screen-direction breaks, implausible anatomy. Add prevention
   rules only where warranted.
10. **Pass 10 â€” Add validation.** Create a concise self-check focused on
    high-risk errors, not a bloated checklist.
11. **Pass 11 â€” Lint.** Inspect for ambiguous pronouns; compound instructions;
    undefined priorities; contradictory rules; example-only requirements;
    excessive duplication or verbosity; unnecessary model/API parameters;
    distant related instructions; unclear reference roles; JSON fields without
    clear semantics; creative instructions overriding invariants; missing or
    wrong reasoning mode; undefined tool-calling path; system-role multimodal
    content; un-budgeted reasoning context; abstract-mood prose; off-frame
    content; broken continuity; screen-direction breaks. Correct problems
    before final output.

See (references/lint-checklist.md) for the detailed lint table.

## Frontier-skill conversion

When converting a skill written for another model: preserve the workflow's
actual purpose; do not assume the source structure survives; identify
instructions that rely on the source model's implicit reasoning and decide
whether they need `thinking` mode or an explicit `instruct` procedure;
eliminate verbosity that exists only because the source is explanatory; retain
domain expertise; retain critical examples only when needed; reorganise freely
for Qwen execution quality.

Do not merely shorten or paraphrase the original. Treat conversion as
compilation: run the 11 passes with the source skill as raw material. A source
skill that assumes deliberation Qwen would over-do becomes a declared
`instruct` mode and explicit rules; abstract-mood prose is re-grounded in the
screenwriter's frame.

## Evaluation support

Encourage empirical validation with a compact test set: normal; ambiguous;
conflicting-constraint; reference-role; structured-output; known failure. For
visual-generation skills add a screenwriter-discipline case (abstract mood,
off-frame content, screen-direction break, missing cause-effect chain). Compare
actual behaviour over theoretical cleanliness.

When revising a skill from failed executions, classify the failure before
fixing: skill-design failure; ambiguous user input; model limitation;
runtime/chat-template issue (including reasoning-mode mismatch at the serving
layer); structured-output enforcement issue; multimodal input issue;
over/under-thinking mismatch. Do not automatically "fix" the skill for
problems caused elsewhere in the stack.

See (references/evaluation-guide.md) for test-set design and failure classes.

## Runtime assumptions to document

Advise generated-skill users to verify, where relevant: Qwen 3.8 27B
instruction-tuned checkpoint; the most recent `chat_template.jinja` (with the
`high` â†’ `xhigh` alias); single system message at position zero; functioning
`enable_thinking` / `reasoning_effort` support; `preserve_thinking` behaviour;
multimodal message ordering (user role only); vision encoder enabled; video
fps / max_frames / pixel-budget configuration; MTP head (`qwen3_5_mtp`)
enabled for throughput; the sampling set matching the chosen mode (thinking:
temperature 1.0, top_p 0.95, top_k 20, presence_penalty 0.0; instruct:
temperature 0.7, top_p 0.80, presence_penalty 1.5); strict output enforcement
OFF for tool-calling skills; VRAM headroom for weights plus KV cache with a
capped context length (a ~17 GB Q4 file needs a 24 GB card).

Keep model-runtime configuration separate from domain-skill instructions;
embed it only when genuinely required â€” the reasoning-mode declaration
(Rule A) is the one runtime value every skill should carry.

## Output deliverable

Produce a complete skill at the requested path:

```
<name>/
  SKILL.md
  references/            # only when overflow is needed
  scripts/               # only for deterministic helpers
  assets/                # only for templates or data
  evals/evals.json       # suggested, or a written test-set plan
```

SKILL.md requirements: kebab-case name matching the directory; frontmatter
`name` and `description` (what + when + when-not); imperative mood, `##`-level
sections; a `Reasoning mode` declaration near the top; relative-path references
to supporting files; explicit edge-case and failure-mode handling; where the
token budget is non-default, record the budget and the reasoning; 2+ concrete
examples with input/output (small inline, or in references/).

## Worked examples

### Example 1 â€” new skill from a verbose motion-prompt design doc

Source (MiniMax H3 motion-prompt spec, excerpt): "The system writes short video
prompts. Describe only what is visible in the frame. Use concrete action verbs.
Every action must have a visible consequence: when the character pushes the
door, the door swings; after she stops, her coat settles. Keep the character on
the same screen side across cuts. Never write mood â€” write the physical
behaviour that evokes it..."

Compiled Qwen skill (relevant fragment):

> ## Reasoning mode
> `instruct`
>
> ## Hard requirements
> - Describe only visible events inside the frame; nouns and verbs.
> - Every action states its visible consequence (cause â†’ effect).
> - Screen side and direction of travel do not flip across cuts.
> - No abstract mood words; translate mood into physical behaviour.

The design-time decisions (mode, frame discipline, causality, screen direction)
became explicit execution rules.

### Example 2 â€” frontier-skill conversion

Source skill for a large model, excerpt: "You are an expert cinematography
assistant. As an expert, you deeply understand the nuanced interplay between
shot size, lens focal length, angle, lighting and colour grading. When the
user provides a storyboard frame, reason comprehensively about all of these
dimensions and produce a detailed camera description..."

Compiled Qwen skill, excerpt:

> ## Reasoning mode
> `instruct`
>
> ## Procedure
> 1. Read the storyboard frame.
> 2. Determine shot size, camera height/angle, and implied lens from the drawn framing.
> 3. Describe camera motion only if the frame suggests it; otherwise state `motion: static`.
> 4. Output the camera description in the `camera` field.
>
> ## Hard requirements
> - The output `camera` field must contain camera language only, not lighting or colour.
> - Describe only what the frame shows; never infer off-frame action.

The "you are an expert" framing became a short procedure; the mode was pinned
to `instruct`, so a two-field task does not inherit 20 minutes of `xhigh`
thinking.

## Final verification

Before finishing, confirm the compiled skill:

- [ ] targets Qwen 3.8 27B specifically;
- [ ] declares a reasoning mode near the top, defaulting to `instruct` unless the task needs thinking;
- [ ] supports both new creation and conversion (when requested);
- [ ] optimises for reliability per token;
- [ ] preserves Qwen's reasoning and creative strengths;
- [ ] respects the Jinja contract (system message at position zero, no mid-conversation injection, no multimodal in system role);
- [ ] chooses the tool-calling path explicitly; JSON Schema decoding stays off when tools are used;
- [ ] budgets reasoning context when multi-turn; adapts vision/video sampling when multimodal;
- [ ] handles multimodal role semantics and separates JSON semantics from syntax (when relevant);
- [ ] primes for the downstream targets (H3 video, Klein image, Krea 2 image) at orientation level, not embedded implementations;
- [ ] instils the screenwriter's frame â€” only what is in the frame, nouns and verbs, no abstract-mood prose; cause-and-effect and motion continuity; screen direction; real-human photographic realism;
- [ ] supports modular/composable architecture (when relevant);
- [ ] came from a genuine compilation/linting pass, not "make the prompt simpler";
- [ ] does not copy source documentation wholesale;
- [ ] activation description is precise; body stays within the size budget.

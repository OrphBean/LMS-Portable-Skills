---
name: qwen38-chat-compaction
description: Compress a Qwen 3.8 27B prompt-generation chat into a compact plain-text continuation document for a fresh chat window, preserving reference-image descriptions, core actions and requests, established decisions, and cinematic conventions. Use when a long H3 / FLUX Klein / Krea 2 prompt-generation session must continue in a new window, or before context limits force a restart. Do NOT use for summarizing documents or unrelated conversations, for one-shot summaries that will not be continued, or when the chat is not about generating downstream-model prompts.
---

# Qwen 3.8 chat compaction

## Purpose

Turn a finished or in-progress prompt-generation chat into a compact,
self-contained handoff document. A fresh chat window reads only this document
and continues the same generation work without losing what the images, the
user's requests, and the established style conventions contributed.

## Reasoning mode

`instruct` — deterministic extraction and condensation from an explicit procedure. No reasoning trace needed.

## When to use

- Before moving a long prompt-generation session to a fresh chat window.
- When context is near capacity and the session must survive a restart.
- When the user asks for a handoff, "condense the chat", "summarize the session so I can continue", or "save my references and style".

Do NOT use for document summarization, for chats that are not prompt-generation sessions, or when the output will not drive further generation.

## Inputs

- The full chat: user turns, assistant prompt outputs, and any reference images the user attached.
- The target modality if stated (H3 video / FLUX Klein image / Krea 2 image).

## What to preserve

- **Reference images.** Every attached image the session relied on gets a dense
  verbal description that lets a fresh chat rebuild the prompt without seeing
  the image: subject identity, appearance, clothing, pose, environment,
  lighting, composition, palette, medium, and any role the user assigned
  (identity, appearance, literal frame, composition, camera, motion, style,
  audio, information-only). State roles and authority explicitly.
- **Core requests and actions.** Each user request condensed to its subject,
  action, facts, and explicit constraints. Quote visible text, dialogue, and
  exact colours verbatim.
- **Cinematic and style conventions.** Established style, medium, lighting,
  palette, camera language, named patterns (foreground occlusion transition,
  anchor-flow, count-ratio, hero-shot hold), screen-direction contract, and
  genre/cinematography decisions.
- **Established decisions and parameters.** The resolved mode (t2v / i2v /
  first-last / last-frame / reference; t2i / edit / multiref), duration,
  aspect ratio, speaker IDs, and any fixed creative choices.
- **Priority rules.** The user's hierarchy when constraints conflict (for
  example: user facts → reference preservation → format → style overlays →
  embellishment) and any per-session exceptions.
- **Continuation state.** What was completed, what was rejected, what the user
  was about to ask next, and open questions.

## What to drop

- The reasoning trace, repeated attempts, and redundant restatements.
- Tool/parameter chatter, API details, and sampling values.
- Prompt outputs already captured — record only their decisions and conventions,
  not their full text.
- Anything that did not change the direction of the session.

## Procedure

1. Read every turn. Identify the user's overall intent.
2. Inventory the reference images; write a dense description and role for each.
3. Condense each user request into subject + action + explicit constraints.
4. Extract the established style, camera, and motion conventions.
5. Record the resolved mode, parameters, and priority rules.
6. Note the continuation state and open questions.
7. Assemble the document in the output format below. Keep it as compact as
   correctness allows — the goal is the smallest document a fresh chat can
   continue from, not the shortest summary.

## Output contract

Plain text only, with labelled sections and blank lines between them. No JSON,
no markdown headings, no code fences. Example shape:

```
COMPACTION — <session label>

INTENT
<one or two sentences: what the session is producing>

REFERENCES
R1 <role: identity/appearance/literal-frame/...> — <dense verbal description>
R2 <role> — <dense verbal description>

CORE REQUESTS / ACTIONS
<each request condensed: subject, action, explicit constraints; verbatim text
and exact colours quoted>

CINEMATIC & STYLE CONVENTIONS
<established style, medium, lighting, palette, camera language, named
patterns, screen-direction contract>

DECISIONS & PARAMETERS
mode: <resolved mode>
duration: <seconds>
aspect_ratio: <ratio>
<other fixed creative choices>

PRIORITY RULES
<the constraint hierarchy and any per-session exceptions>

CONTINUATION STATE
<completed, rejected, next step, open questions>
```

- Dense image descriptions are mandatory; a fresh chat cannot re-see the
  images unless the user re-attaches them.
- Preserve exact user facts verbatim where short; quote visible text and
  dialogue exactly.
- State roles and authority for each reference; never leave an image
  description that could be mistaken for scene content rather than guidance.

## Failure modes

- Dropping a reference image or reducing it to a vague tag with no usable
  description.
- Recording conventions but losing the user's exact facts (text, colours,
  quantities, spatial relationships).
- Losing the resolved mode, duration, or aspect ratio.
- Absorbing the assistant's reasoning trace instead of condensing decisions.
- Producing a summary that reads like prose instead of a working handoff.

## Final validation

Before output, confirm: every reference image has a dense description and an
explicit role; every user request survives as subject + action + constraints;
exact text and colours are preserved verbatim; the resolved mode, duration,
aspect ratio, and priority rules are present; a fresh chat reading only this
document can continue the session without asking the user to re-state
anything.

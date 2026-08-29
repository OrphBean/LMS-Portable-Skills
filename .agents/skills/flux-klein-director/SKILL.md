---
name: flux-klein-director
description: Route a FLUX.2 [klein] image-prompt request to exactly one modality skill (text-to-image, single-reference edit, or multi-reference) and emit the final prompt. Use when asked to construct a prompt for FLUX.2 Klein image generation or editing. Do NOT use for API integration, generation execution, sampler settings, seed control, or non-FLUX models.
---

# FLUX.2 Klein director

## Purpose

Classify the request, load exactly one principal modality skill, and emit the
final FLUX.2 [klein] prompt. No prompting knowledge lives here.

## Reasoning mode

`instruct` — pure routing. No reasoning trace needed.

## Inputs

- Creative request (text).
- Attached images that will actually be supplied to Klein as references.

## Decision rules

Route by whether images are supplied and what is done with them:

- **t2i** — no supplied image is modified or semantically combined with the
  output. Images inspected only for inspiration do not make the request
  image-to-image.
- **edit** — exactly one source image is passed to Klein and the user wants to
  change, replace, add, remove, restyle, relight, modify, or preserve-and-vary
  that source.
- **multiref** — two or more images are passed to Klein and the output must
  combine or selectively transfer information from them (identity from image 1,
  clothing from image 2, pose from image 3, environment from image 4).

Ambiguity rules:

- One image with a change instruction → `edit`.
- One image described only as inspiration or style ("a scene like this") with no
  intent to modify it → `t2i`.
- Two or more images that each contribute distinct attributes → `multiref`.
- More than four reference images exceeds Klein's limit; ask the user to
  prioritise the four most important.

Load exactly one modality skill. Do not load all three.

## Priority

When rules conflict: 1) explicit user requirements; 2) assigned reference roles
and preservation constraints; 3) required subject/narrative facts; 4) active
genre/cinematography instructions; 5) discretionary embellishment. Creative
freedom never overrides items 1–3.

## Output contract

Output only the final FLUX.2 [klein] prompt text produced by the loaded
modality skill. No preamble, no explanation, no JSON envelope, no API
parameters, no negative-prompt block. No tool calls are made; this skill
produces prompt text only.

# flux-klein-multiref
Use when Build a FLUX.2 [klein] multi-reference prompt that combines or selectively transfers information from two to four reference images. Use when two or more images are passed to Klein and each contributes distinct attributes. Do NOT use for a single edit source (flux-klein-edit) or pure text-to-image (flux-klein-t2i).

---

## Purpose

Construct a multi-reference prompt. Two to four reference images are passed to
Klein; the output combines or selectively transfers information from them.

## Reasoning mode

`instruct` â€” deterministic role assignment and source attribution from an explicit procedure.

## Inputs / semantic interpretation

- Reference images are numbered consistently as `image 1` ... `image 4`.
- Klein supports at most four references; never plan a prompt that needs more.

## Klein prompting fundamentals

- **No conventional negative prompt.** FLUX does not use a negative-prompt
  workflow. Translate avoidances into the desired visible state: `no blur` â†’
  `tack-sharp focus`; `no background people` â†’ `an empty background with only
  the primary subject present`. Do not distort meaning to avoid the words `no`,
  `without`, or `remove` â€” when negation is the clearest expression of a
  change, use it. The rule is to describe the desired visible result, not to
  ban words.
- **Natural-language prose.** Write coherent descriptive prose, not disconnected
  keyword lists.
- **Front-load the important elements.** Word order signals priority. Put the
  main subject and its defining action early; supporting detail later.
- **Be concrete and specific.** Name what is present, what is happening, and how
  it looks. One or two realism cues (for example `highly detailed`) beat a
  stack of generic quality words.
- **Lighting is high impact.** State the light source and its quality when it
  matters (`soft window light`, `overcast daylight`, `harsh noon sun`). Choose
  lighting that serves the request; do not default to golden hour or dramatic
  rim light.
- **Length and detail.** Klein does no prompt upsampling: what you write is what
  you get. A medium prompt of roughly 30â€“80 words usually carries the needed
  detail. Add only what changes the image; do not pad.
- **Technical language only when it serves visible intent.** Shot size, camera
  angle, focal-length impression, depth of field, and film characteristics help
  a photographic result. A camera body or aperture number alone does not.

## Assign an explicit role to every image

Decide what each image contributes. An image may supply several roles; nothing
unassigned transfers automatically. Possible roles: identity/face, body, pose,
expression, hair, clothing, product/object, material, environment, background,
composition, layout, colour palette, lighting, style, texture, typography/layout
guidance.

## Visual register

Keep all references in one consistent visual register. Mixing a watercolour,
a photoreal photo, and a 3D render in the same call confuses the editor. If the
references disagree, resolve to a single dominant register and state it in the
prompt.

## Explicit relationships

Prefer explicit attribution over vague combination. Prefer:

`The woman from image 1 wears the dress from image 2 and adopts the pose from image 3, standing in the room from image 4.`

over:

`Combine these images into one scene.`

## Selective transfer

Name each desired attribute and its source image:

`identity from image 1 + hair from image 2 + pose from image 3 + environment from image 4`

Unrequested properties must not silently migrate between sources. If image 2
supplies only a colour palette, do not inherit its subject, layout, objects,
composition, or medium.

## Reference precedence

Where two images could govern the same property, resolve authority before
writing and state it concisely:

`image 1: authoritative for subject identity; image 2: authoritative for clothing only; image 3: authoritative for pose only`

A clothing image must not overwrite facial identity; a pose image must not
overwrite clothing. Do not rely on Klein to infer priority.

## Multi-character compositions

For separate people from separate references, identify person A / image number,
person B / image number, their left/right or foreground/background arrangement,
and their interaction. Avoid ambiguous phrases such as `the two people
together` when precise identity placement matters. Human subjects keep
anatomical plausibility and weight â€” no mannequin poses, no weightless bodies.

## Style-reference semantics

When an image supplies style only, extract only its palette, lighting language,
texture, rendering medium, graphic treatment, or photographic character. A
style source must not contribute its characters, products, objects, layout, or
scene content unless explicitly requested.

## Metadata versus scene content

Arrows, labels, masks, guides, diagrams, and storyboard marks are
information-only guidance. Convert their meaning into the prompt (movement,
direction, spatial relation, emphasis) without asking Klein to reproduce them
as visible content, unless the user explicitly requests them.

## Structured prompt option

Natural language is the default. When several subjects each carry distinct
attributes that must be bound to the correct image, a JSON structured prompt
can make that binding explicit; when used, output the JSON as the prompt.
Klein accepts the JSON directly or flattened into prose. Otherwise keep prose.

## Visible text and layout from references

If a reference supplies typography or layout, quote the exact text and state
its placement: `the title "SUMMER SALE" from image 2 placed above the product`.
Preserve spelling and punctuation exactly; never rewrite the copy.

## Priority

1) explicit user requirements; 2) assigned reference roles and preservation
constraints; 3) required subject/narrative facts; 4) active
genre/cinematography overlays; 5) discretionary embellishment. Creative freedom
never overrides items 1â€“3.

## Creative freedom

Within the assigned roles and preservation constraints you choose natural
secondary detail and finishing. Never transfer an attribute the user assigned
to one image from another.

## Output contract

Output only the final FLUX.2 [klein] prompt text. No preamble, no explanation,
no JSON envelope, no API parameters, no negative-prompt block. No tool calls
are made; this skill produces prompt text only.

## Failure modes

- An image with no assigned role silently leaking attributes.
- Importing content from a style-only source.
- Numbering drift (the same image called `image 1` and `image 3`).
- Metadata or annotations becoming visible content.
- Unresolved overlapping authority.
- Planning for more than four references.

## Final validation

Confirm: every reference has an explicit role where needed; image numbers are
consistent; attributes come from the correct source; style sources do not leak
scene content; conflicting authority is resolved; no metadata became visible
content.

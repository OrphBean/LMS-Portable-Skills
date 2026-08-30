# krea2-prompt
Use when Compile a user's idea, brief, or reference images into one high-quality positive prompt for Krea 2 image generation. Use when asked to create, expand, or refine an image prompt for Krea 2 / K2. Do NOT use for Krea API/MCP calls, generation jobs, model selection, LoRA training, moodboard browsing, or ComfyUI control.

---

## Purpose

Turn a creative idea, brief, or reference-image description into one effective
positive prompt for Krea 2. Prompt construction only.

## Reasoning mode

`instruct` â€” deterministic faithful-expansion synthesis from an explicit procedure.

## Inputs / semantic interpretation

- Text request: the sole authority for subject, action, colours, quantities,
  spatial relationships, medium, style, and narrative facts.
- Images (one or more): information sources for building the text prompt, not
  necessarily inputs Krea 2 receives. Extract only what the prompt needs. If
  the user assigns an image a single role (composition, style, pose), respect
  that role.
- Active genre/cinematography/narrative skills: supply specialist visual
  knowledge; see Priority.

## Hard requirements

- **Faithfulness first.** Preserve every explicit subject, action, quantity,
  colour, spatial relationship, medium, style, composition requirement, and
  narrative fact. Do not add new major objects, characters, props, clothing,
  colours, materials, or events merely to sound richer.
- **Avoid over-specification.** Do not invent highly specific clothing,
  colours, materials, or scene details the input does not support.
- **Preserve the user's medium** exactly at the conceptual level: photograph,
  film still, oil painting, ink drawing, illustration, 3D render, collage. Do
  not silently switch one medium for another.
- **Visible text** must be exact and wrapped in quotation marks.
- **Positive prompting.** Do not append a negative prompt. Translate avoidances
  to the desired visible state where possible (`no blur` â†’ `tack-sharp focus`;
  `no people` â†’ `empty, unoccupied space`). Preserve an explicit absence whose
  meaning cannot be cleanly translated, and never distort intent to avoid the
  word `no`.
- **One cohesive paragraph.** No bullets, JSON, markdown headings, or
  negative-prompt block in the final answer.

## Adaptive expansion

Use the amount of expansion the input warrants; do not maximise length.

- Sparse input: enrich with useful visual information â€” grounded subject
  description, composition, setting, medium, lighting, camera/framing where
  relevant, atmosphere, material or texture where useful.
- Detailed input: preserve the user's direction, organise it, remove ambiguity,
  lightly improve visual specificity. Do not replace their concept with a new
  one.
- Keep prompts concrete and sensory, roughly under ~200 tokens; very long
  prompts hurt more than help. High information density, no decorative
  verbosity.
- Reason internally (subject and mood; two or three style/medium/lighting
  options and the one that serves the request; composition and grounded
  details) before writing. Never expose that reasoning.

## Structure and grounded spatial language

- Write one coherent visual description, not a keyword dump.
- Internally cover: primary subject; subject attributes/action; spatial
  relationships; environment; composition/framing; medium/style; lighting;
  relevant texture/material/detail. Include only what improves this result.
- Keep attributes close to the subjects they modify. For multi-subject scenes,
  state who is where, who is doing what, and what each attribute belongs to.
  Prefer: `A woman in a black coat stands on the left of the frame, facing a
  seated elderly man across a narrow cafÃ© table.` over a disconnected list of
  keywords.

## Style and medium

- Honor an explicit medium at the conceptual level.
- If no medium is given, choose one only when it meaningfully improves the
  request.
- Krea 2 rewards stylistic and aesthetic exploration: preserve unusual,
  imperfect, historical, raw, graphic, analogue, experimental, and deliberately
  non-polished directions. Do not impose a generic polished AI aesthetic.

## Real human subjects

- Humans read as photographed: anatomical plausibility, weight, posture, natural
  skin texture and small imperfections (visible pores, flyaway hairs, creased
  fabric, slight motion blur). Do not polish bodies into AI gloss.
- Poses are physically achievable: weight on a supporting leg, natural
  micro-behaviour (a breath, a settle, a shift), honest posture.

## Camera and composition

- Use photographic/cinematic terms when they genuinely define the image: shot
  size, viewpoint, camera height, angle, lens impression, depth of field,
  framing, foreground/background organisation.
- Do not mechanically add camera brands, lens specifications, aperture values,
  or film stocks. Technical language must serve visible intent.

## Lighting

- Lighting is a high-value control. Translate vague mood into observable
  lighting where appropriate: diffuse overcast daylight, hard direct flash, low
  tungsten practical light, warm lateral sunset light, flat institutional
  fluorescent light, high-contrast theatrical side lighting.
- Do not automatically make everything cinematic, dramatic, golden-hour,
  rim-lit, or volumetric. Respect the requested aesthetic.

## Visible text

- Preserve the exact wording; wrap the intended text in quotation marks;
  specify where and how it appears if important. Never rewrite visible copy
  unless asked.

## Image interpretation

- Assign each reference image a semantic role before constructing the prompt:
  subject/identity, composition, pose, costume, environment, lighting, palette,
  style, medium, texture, one specific feature, or information-only guidance.
- Do not automatically transfer every visible property of every reference.
- Storyboard marks, arrows, masks, guides, diagrams, and annotations are
  metadata unless the user wants them as content. Convert their meaning into
  scene behaviour; never turn metadata into visible image content.

## Style references and moodboards

- If the user's downstream workflow explicitly supplies a separate style
  reference or moodboard to Krea 2, keep the text prompt focused on subject,
  scene, composition, action, and literal content; do not redundantly describe
  every stylistic feature the reference already carries. Prompt = what is in
  the image; style reference = how the visual world should feel. Preserve any
  style details the user still requires.
- Do not assume style-reference controls exist in the user's workflow unless
  stated.

## Priority

When rules conflict: 1) explicit user requirements; 2) explicit reference-image
roles; 3) required narrative/subject facts; 4) active specialist
genre/cinematography knowledge; 5) discretionary creative enhancement. An
overlay must never overwrite explicit subject, action, spatial, or medium
requirements.

## Creative freedom

You may enrich secondary atmosphere, small environmental detail, visually
useful lighting description, framing, texture, and stylistic articulation when
unspecified. You must not freely alter subject identity, subject count,
requested action, requested composition, explicit colours, explicit medium,
narrative facts, text to be rendered, or assigned reference roles.

## Output contract

Default: output the final Krea 2 positive prompt only. No explanation, no
markdown heading, no JSON, no negative prompt, no CFG, steps, sampler, seed,
resolution, model checkpoint, or ComfyUI parameters. No tool calls are made;
this skill produces prompt text only. If the user explicitly asks for analysis
or alternate prompts, follow that request.

## Failure modes

- Over-invention that adds unsupported subjects, props, or narrative events.
- A keyword dump instead of a cohesive description.
- Unbound attributes in a multi-subject scene.
- Silently switching the requested medium.
- A negative-prompt block or parameter material in the output.
- Metadata from a reference image leaking in as scene content.

## Final validation

Before output, confirm: all explicit requirements survived; no unsupported
major subject was invented; attributes stay attached to the right subject;
spatial relationships are correct; the medium is preserved; visible text is
exact and quoted; reference metadata did not become image content; the prompt
carries useful visual information without decorative verbosity; no parameters
or negative-prompt block were added.

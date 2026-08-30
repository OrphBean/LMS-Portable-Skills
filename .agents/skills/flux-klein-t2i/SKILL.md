# flux-klein-t2i
Use when Build a FLUX.2 [klein] text-to-image prompt from a textual request. Use when no supplied image is modified or semantically combined with the output. Do NOT use for single-reference editing (flux-klein-edit) or multi-reference composition (flux-klein-multiref).

---

## Purpose

Turn a textual creative request into a complete FLUX.2 [klein] image prompt.

## Reasoning mode

`instruct` â€” deterministic prose synthesis from an explicit procedure.

## Inputs / semantic interpretation

- Creative request: the sole authority for subject, action, attributes,
  environment, medium, and narrative facts.
- Inspiration-only references: informative, not modified. Their content is
  guidance; it is not passed to Klein as an edit source.
- Active genre/cinematography/narrative overlays: contribute visual language,
  palette, and lighting conventions.

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
- **Do not conflict adjectives.** Conflicting style adjectives cancel
  (`minimalist and ornate`). Pick one coherent visual register and stay inside it.

## Structure

Reason in these categories, but do not treat them as a mandatory template and
do not fill every slot:

`subject + attributes/action + environment + medium/style + composition + lighting + relevant technical language`

Compose one coherent prose prompt using only the categories that improve this
image.

## Spatial relationships and attribute binding

- For complicated compositions, state relationships explicitly: left/right,
  foreground/background, who interacts with whom, where each object sits.
- Attach every attribute to its subject. Do not rely on a remote adjective in
  an earlier clause: `the woman in the red dress on the left` rather than
  `a red dress, the woman on the left`.
- Front-load the subject so framing stays controlled: `a person with a
  determined expression, forest fire in the background, close-up shot` rather
  than a description that begins with the background.

## Real human subjects

- Humans read as photographed, not rendered: anatomical plausibility, weight,
  posture, natural skin texture, small imperfections (flyaway hairs, creased
  fabric). One or two realism cues ground the subject; do not polish everything
  into AI gloss.
- A pose must be physically achievable: weight on a supporting leg, a reach
  extending the whole arm, a grip matching the object.

## Lighting

Lighting has high impact. Select light that supports the request's actual
aesthetic (soft window light, overcast daylight, harsh noon, neon glow,
candlelight, studio softbox). Do not default to golden hour, rim light, or
cinematic volumetrics. Active genre/cinematography skills may supply more
specialised lighting knowledge.

## Camera and photographic language

Use shot size, camera angle, focal-length impression, depth of field, focus,
and film/photographic characteristics when they serve a photographic result.
Avoid cargo-cult technical metadata: a camera body or aperture should not appear
merely because the model can understand it. Visible intent outranks jargon.

## Visible text

- Wrap the exact text in quotation marks: `A sign reading "FRESH BREAD"`.
- Preserve spelling and punctuation exactly; never rewrite requested copy.
- State placement, font style (serif, sans-serif, script, display, monospace),
  and hierarchy (headline / subhead / body) when they matter.
- Front-load the text description.

## Precise colour

- For exact brand or product colour, write the colour name plus hex attached to
  the object it governs: `a dress in #87CEEB (sky blue)`.
- Keep the palette to about 3â€“5 colours and pair every hex with a name.
- Use hex only when exact colour matters; ordinary artistic prompts do not need
  arbitrary hex values.

## Structured prompt option

Natural language is the default. For a complex scene with several subjects that
each carry distinct attributes and positions, a JSON structured prompt can bind
attributes to the correct subject more reliably; when used, output the JSON as
the prompt. Otherwise keep prose.

## Faithfulness

Preserve: subject, subject count, action, explicit attributes, colour,
environment, spatial relationships, medium, composition requirements, text to
be rendered, and narrative facts. You may enrich unspecified secondary visual
detail when it strengthens the result without changing its meaning. Do not use
expansion as licence for unsupported invention.

## Priority

1) explicit user requirements; 2) required subject/narrative facts and any
reference-preservation constraints; 3) active genre/cinematography overlays; 4)
discretionary embellishment. Creative freedom never overrides items 1â€“2.

## Creative freedom

You choose secondary visual detail, natural movement, atmospheric detail, and
cinematic phrasing â€” within the user's facts, the requested subject, and the
composition requirements.

## Output contract

Output only the final FLUX.2 [klein] prompt text. No preamble, no explanation,
no JSON envelope, no API parameters, no negative-prompt block. No tool calls
are made; this skill produces prompt text only.

## Failure modes

- Keyword-tag output instead of prose.
- A conventional negative-prompt block (`no X, no Y`).
- Attributes left unbound to their subject in a complex scene.
- Unsupported invention that changes the request's meaning.
- Technical jargon with no visible intent.

## Final validation

Confirm: user facts are preserved; every attribute is bound to its subject;
spatial relations are clear; medium/style are respected; there is no
conventional negative-prompt block; the prompt is specific without pointless
verbosity.

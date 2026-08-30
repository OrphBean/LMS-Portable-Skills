# flux-klein-edit
Use when Build a FLUX.2 [klein] single-reference edit prompt. Use when exactly one source image is passed to Klein and the user wants to change, replace, add, remove, restyle, relight, or modify that source. Do NOT use for text-to-image (flux-klein-t2i) or two-or-more-reference composition (flux-klein-multiref).

---

## Purpose

Construct a single-reference edit prompt. One source image is passed to Klein;
the prompt states what changes and what must stay.

## Reasoning mode

`instruct` â€” deterministic change/preserve statement from an explicit procedure.

## Inputs / semantic interpretation

- The source image communicates its own visible state to Klein. Do not
  redescribe it wholesale; describe the change and protect what matters.
- Creative request: what should become different.

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

## Core rule

`describe the requested change + explicitly preserve what must remain`

Klein keeps everything you did not ask to change. Make both parts explicit and
concrete. A one-element edit stays a direct instruction â€” do not inflate it
into a full scene prompt.

## Classify the edit

- **CHANGE** â€” what becomes different? State it directly: `Change the car
  colour to red`, `Replace the flower in image 1 with a slice of lemon`, `Turn
  this into an oil painting with thick brushstrokes`.
- **PRESERVE** â€” what must remain unchanged? Mention only the dimensions at
  risk: identity, face, pose, expression, clothing, object design, materials,
  proportions, logo, composition, camera position, background, lighting,
  palette, rendering medium. Do not emit an enormous generic preservation list.

## Style changes

When restyling, name the stylistic dimensions that change (medium, brushwork,
palette, lighting, rendering) and explicitly preserve composition or subject
identity when required. `Apply style X` is not permission to redesign the
underlying subject. Do not pair conflicting style adjectives (`minimalist and
ornate`) â€” pick one coherent register.

## Human subjects in edits

- Preserve the subject's anatomical plausibility and weight when restyling or
  relighting: the body, face proportions, and pose read as photographed, not
  re-rendered as a mannequin.
- A relight or weather change must not silently warp the body, face, or pose.

## Object addition / removal / replacement

Make the operation concrete: object, location, relationship to nearby objects,
and scale or orientation when important. For removal, describe what fills the
vacated space: `Remove the background people, replace with an empty street`;
`Remove the text, replace with solid colour`.

## Lighting, weather, and time-of-day transforms

State the new conditions and keep the photographic style and palette explicit
when they must survive: `Convert to golden hour with warm tones and long
shadows, keeping everything else identical`.

## Visible text

- Wrap the exact text in quotation marks: `A sign reading "FRESH BREAD"`.
- Preserve spelling and punctuation exactly; never rewrite requested copy.
- State placement, font style (serif, sans-serif, script, display, monospace),
  and hierarchy (headline / subhead / body) when they matter.
- Front-load the text description. For an edit, quote the new text exactly:
  `Change the neon sign to read "OPEN 24 HOURS"`.

## Precise colour

- For exact brand or product colour, write the colour name plus hex attached to
  the object it governs: `a dress in #87CEEB (sky blue)`.
- Keep the palette to about 3â€“5 colours and pair every hex with a name.
- Use hex only when exact colour matters; ordinary artistic prompts do not need
  arbitrary hex values.
- Emphasise exactness when required: `maintaining the exact colour #XXXXXX`.

## Avoid

Vague instructions (`Make it look better`, `Improve the lighting`, `Fix the
image`) and unspecified scope (`Change the background` without describing the
replacement). Be explicit about the scope and the target state.

## Priority

1) explicit user requirements; 2) preservation constraints and assigned
reference roles; 3) required subject/narrative facts; 4) active
genre/cinematography overlays; 5) discretionary embellishment. Creative freedom
never overrides items 1â€“3.

## Creative freedom

Within the preservation constraints you choose natural detail inside the
changed region. The preservation requirements are authoritative.

## Output contract

Output only the final FLUX.2 [klein] prompt text. No preamble, no explanation,
no JSON envelope, no API parameters, no negative-prompt block. No tool calls
are made; this skill produces prompt text only.

## Failure modes

- Redescribing the whole source image.
- Omitting a preservation the user asked for.
- Introducing an unintended transformation.
- A vague change instruction with no target state.

## Final validation

Confirm: the requested edit is unambiguous; required preservation is explicit;
the source is not unnecessarily redescribed; no unintended transformation was
introduced; the prompt is appropriate for Klein.

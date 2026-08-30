---
name: character-turnaround
description: Author a Krea 2 prompt that produces a photorealistic character turnaround sheet - front, three-quarter, side and back views of one real-human-style subject in a neutral A-pose wearing skin-tone-matching underwear on a clean neutral background - spec'd so MiniMax and other image/video generators can ingest it as a subject-identity reference. Use when the user wants to create a base-body/character reference sheet for a realistic human, keep a face and body consistent across generations, or wants the best-practice Krea recipe for a MiniMax-ready turnaround.
license: Apache-2.0
compatibility: Windows + LM Studio portable junction layout + Krea 2 + MiniMax / image-video reference ingestion
metadata:
  author: khtsly
  version: 1.0.0
---

# character-turnaround

## What this does

Turns a **character description** into a Krea 2 **prompt** that generates a clean, photorealistic
**turnaround sheet** — the multi-angle reference a generator like MiniMax uses to keep one face and
body identical across many shots/renders. This is a *base-body / identity* turnaround: the pose is
neutral and the underdress is **skin-tone-matching underwear** so nothing (clothing, props, dramatic
lighting) obscures the body proportions, skin tone, or silhouette that MiniMax has to read.

It is the "what does the character look like" building block that pairs with `scene-breakdown` and
`story-distiller`:

```text
story -> scene cards (story-distiller) -> what refs I need (scene-breakdown)
     -> generate this character's turnaround (character-turnaround) -> feed to MiniMax
```

Does NOT make a *costume* sheet (that keeps the outfit) or an expression sheet. It makes the **body /
identity sheet** that MiniMax ingests to lock the subject.

## Why this spec (the MiniMax reference bar)

A turnaround becomes a subject reference. MiniMax (and similar reference-ingestion generators) read
the subject from the image, and the cleaner the signal the more stable the identity. So the bar is:

- **One subject, no props, no set.** Nothing to confuse identity.
- **Neutral pose (A-pose), symmetric, feet planted, arms clear of the body.** Every angle shows the
  same shape; limbs don't cross and hide anatomy.
- **Skin-tone underwear, tone-matched.** Reveals skin tone and body proportions while staying modest,
  so the model doesn't bake a costume into the identity. The tone must match the subject's skin — a
  contrast band (e.g. white/yellow) reads as clothing and breaks the base-body read.
- **Even, flat studio light, mid-neutral-gray background.** No hard shadows, no rim, no contact
  shadow between views, no gradient that could be read as a wall/floor trick.
- **Fixed scale + one shared height line.** All four views the same height, aligned to the same eye/
  shoulder/waist/knee markers, so proportions are comparable.
- **Neutral expression, eyes forward, hair off the face.** Confident, unposed, passport-neutral.
- **Photorealistic** — not illustration, not 3D-render.

## The identity descriptor (reuse verbatim)

Write ONE canonical **subject block** and reuse it unchanged across the turnaround, costume and
expression sheets, and across every re-roll. Drift in this block is the #1 cause of a drifting
character. Fill the slots:

```text
<age>, sex/gender presentation, <build>, <approx height>,
skin tone <descriptive + hex>, hair <colour, length, texture, style>,
face <bone structure, brows, eyes, nose, lips, jaw>,
marks <scars, moles, tattoos, blemishes>,
natural pose cues <if any, e.g. slight asymmetry, posture>
```

Example subject block:

```text
30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A),
long dark-brown straight hair worn back in a low ponytail,
high cheekbones, straight nose, full lips, soft round jaw,
small mole on the right cheekbone, faint scatter of freckles across the nose
```

Keep the exact same block in the turnaround prompt, the costume sheet, and every follow-on shot.

## The Krea 2 prompt recipe

One-shot 4-view sheet (16:9 wide). Paste the **subject block** into the slot, then append the sheet
instructions. Do NOT collapse the four views into "turnaround" alone — Krea 2 keeps views consistent
best when you name each view and the order.

```text
Professional photorealistic character turnaround sheet, a single adult human subject,
full body, one image with four views of the same person arranged left-to-right in a single
row, each figure the same scale and standing on the same horizontal height line.

Views, left to right: front view, three-quarter view (3/4), side profile view, back view.
The subject stands in a neutral relaxed A-pose - arms at the sides slightly away from the
body, hands open and relaxed, feet shoulder-width, weight even - and each successive view
rotates the body 90 degrees in place while the pose stays identical and the figure stays
centered. Head neutral, eyes forward, mouth closed, relaxed neutral expression, hair worn
back and clear of the face.

The subject is: <SUBJECT_BLOCK>.

Attire: seamless skin-tone underwear only - a tonal matte bralette and matching brief in a
nude tone that matches the subject's skin exactly - no logo, no seams reading, no jewelry,
no footwear.

Image: uniform flat even studio lighting on a medium-neutral-gray seamless background,
softbox soft light, minimal shadow, no contact shadow under the feet, no surface for the
figure to stand on, no props, no furniture, no text, no watermark, no other people,
photorealistic, true-to-life skin texture and pores, natural human anatomy and proportions,
normal realistic build (not anime, not illustration, not CGI render), sharp focus, full
figure from crown to soles, subject centered in frame.
```

Variant - **per-view with image-reference (recommended for pixel-consistency):**

If the layout drifts or you need tighter identity, generate the single FRONT view first, then use
that render as Krea's **image reference** for the ¾ / side / back views with the same subject block:

```text
Same photorealistic subject as the reference image, <SUBJECT_BLOCK>, shown in a <three-quarter|side|back> view,
same neutral A-pose, same seamless skin-tone underwear, same medium-neutral-gray background, same even studio lighting.
Keep the face, body proportions, skin tone and hair exactly as the reference. Full body, centered.
```

Aspect ratio: **16:9** for the lineup sheet. Use a portrait crop (3:4 / 4:5) only if you want a
single character portrait, not a turnaround.

## Workflow (production order)

1. **Silhouette check first** (optional but cheap): ask Krea 2 for the subject in flat silhouette on
   white. If the silhouette is ambiguous, rework before locking detail.
2. **Lock the subject block** and the palette (3-5 color words reused everywhere).
3. **Generate the front view alone** (or the full sheet) and pick the cleanest, most on-model render.
4. **Turnaround / ¾ / side / back** using that render as the image reference so identity holds.
5. **QA the sheet** against the checklist below. Re-roll the worst view rather than patching.
6. **Train a LoRA** (~20 min) once the design is locked, so you get the same subject on demand for
   every future generation instead of re-attaching the reference each time.
7. **Export** the clean 16:9 sheet, crop/use the front or ¾ figure as the MiniMax seed image.

## Best-practice checklist (the bar)

- [ ] Exactly one subject; no props, furniture, text, watermark, or second person in any view.
- [ ] Four distinct views present: front, ¾, side, back — not three, not duplicated.
- [ ] Same scale and a shared height line across all views; feet-plants aligned.
- [ ] Pose identical in every view; A-pose, arms clear of the torso, hands open.
- [ ] Skin-tone underwear tone-matches the skin (no contrasting band, no logo, low-contrast seams).
- [ ] Neutral expression, eyes forward, mouth closed, hair off the face.
- [ ] Even flat light, medium-neutral-gray seamless background, no hard/contact shadows.
- [ ] Photoreal: natural anatomy, real skin texture, no illustration/CGI look, no exaggerated proportions.
- [ ] Full figure from crown to soles, subject centered in each frame.
- [ ] Subject block identical to any prior/costume/expression sheet for this character.

## QA / reject if…

- A view wears something different or the underdress changes colour between angles.
- Any face reads as a different person (proportions/features don't line up). Use image-reference to fix.
- Limbs cross or occlude anatomy; silhouette is unclear.
- A rim-light/hard-shadow or a floor line makes the background read as a real room.
- Any angle shows hands as paws / 5-finger errors / melted hands (common landmark for photorealism).
- The subject is posed, smiling, or "flirty" — this is a neutral base-body reference, not a beauty shot.
- Lettering, logos, or a watermark appear — they will poison the identity read downstream.

## Optional: writing to the knowledge-base

For re-use in prompt dev, write the descriptor + sheet prompt as a corpus so the `knowledge-base`
plugin can inject it:

```text
<PortableRoot>\Data\dot-lmstudio\knowledge-base\<corpus>\
  _corpus.md          <- one-line description (KB uses the first paragraph)
  identity.md         <- the subject block (the re-usable truth)
  turnaround-notes.md <- the recipe + QA notes for this character
```

Then set the chat's `assignedCorpora` to `<corpus>` with `Auto-Retrieve` on. Keep `identity.md` in
sync with the sheet you actually approved.

## Notes & rules

- **Never** run this on a real, identifiable civilian as a way to fabricate a "real person" — this is
  for *original characters* and consented talent/performance reference, same as the scene-breakdown
  rules. The "skin-tone underwear" is a base-body reference (like a mannequin / VFX double scan), not a
  sexualized render; keep the framing and wording medically/professionally neutral.
- Keep `describe` concrete and specific. "Athletic-slim, 5'7\"" beats "fit". The reference engine can
  only lock what you said.
- Do not add outfit, makeup, jewelry or props to this sheet. That is a separate costume sheet; mixing
  them breaks the base-body read and the MiniMax identity.
- All testing happens on THIS mirror (`E:\lmstudio_mirror`). Never point the generator at the other
  install.

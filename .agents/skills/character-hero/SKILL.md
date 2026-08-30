---
name: character-hero
description: Author a Krea 2 prompt that produces a single photorealistic hero image of a character - one frame of the character as close to real human photography as possible (realistic skin, natural anatomy, believable lighting, photographic depth of field) - usable as the anchor/key-visual identity and as the seed frame for a Klein 9B LoRA that generates turnaround sheets. Use when the user wants one hero shot / key visual / editorial portrait of a realistic human character, wants a single frame to LoRA-train on, or wants the best-practice Krea 2 recipe for a photo-real single subject image. This replaces the four-view turnaround when a LoRA supplies the sheet.
license: Apache-2.0
compatibility: Windows + LM Studio portable junction layout + Krea 2 + MiniMax / Klein-9B-LoRA image pipelines
metadata:
  author: khtsly
  version: 1.0.0
---

# character-hero

## What this does

Turns a **character description** into a Krea 2 **prompt** for a **single hero image** — one
photorealistic frame of the character, engineered to read as a real human photograph rather than an
AI render. This is the anchor identity for a character: the key visual, and the frame you
**LoRA-train** (the Klein 9B LoRA) so that later turnaround sheets and shots keep the same person.

It slots after `scene-breakdown` / `story-distiller`:

```text
story -> scene cards (story-distiller) -> what refs I need (scene-breakdown)
     -> this character's hero image (character-hero) -> LoRA (Klein 9B) -> turnaround sheets
```

The four-view Krea turnaround (`character-turnaround`) is **not** needed as a base input anymore — the
LoRA supplies the sheet. Krea 2's job is now just to produce the single, highest-fidelity
photographic image to train from.

## Why this spec (the hero bar)

A hero image is the one image that has to be right, because everything else is derived from it.
Because the LoRA learns identity from it, it must be *clean, consistent, and photographic*:

- **One subject, zero confusers.** No props with strong identity, no second person, no text/logos.
  Anything the LoRA learns has to be the character, not the environment.
- **Photoreal, not illustration/CGI.** Real skin texture and pores, natural sub-surface scatter,
  believable eye reflections, real hair strands, anatomical correctness. The LoRA amplifies whatever
  it sees, so figurative imperfections get widened.
- **Full figure or ¾ body literacy.** The LoRA needs body proportions as well as the face, so a
  ¾ or full body shot beats an extreme close-up for training, even if the close-up is more striking.
- **Single dominant tone/lighting per image.** Conflicting colour casts confuse the learned identity.
- **A usable, real camera language.** Think lens + aperture + quality of light, not "beautiful woman".

## The identity descriptor (reuse verbatim)

Same principle as `character-turnaround` — write ONE canonical **subject block** and reuse it across
every re-roll and every later prompt. Fill the slots:

```text
<age>, sex/gender presentation, <build>, <approx height>,
skin tone <descriptive + hex>, hair <colour, length, texture, style>,
face <bone structure, brows, eyes, nose, lips, jaw>,
marks <scars, moles, tattoos, blemishes>,
expression/mood <for a hero image: calm, assured, neutral, wry…>,
environment note <if relevant: e.g. "mid-winter street, overcast">
```

Example subject block:

```text
30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A),
long dark-brown straight hair falling loosely over the shoulders,
high cheekbones, straight nose, full lips, soft round jaw,
small mole on the right cheekbone, faint scatter of freckles across the nose,
calm assured neutral expression
```

Keep the block identical across the hero re-rolls and any follow-on sheet.

## The Krea 2 hero prompt recipe

Paste the **subject block** into the slot, then set framing, lighting and medium. Lead with what you
actually want (a photograph), then the subject, then the photographic craft.

```text
Photorealistic editorial portrait photograph of a single adult human subject, shot on an
85mm lens at f/1.8 with creamy shallow depth of field, natural, honest light. True-to-life
skin, visible pores and fine hair, natural sub-surface light, realistic eye catchlights,
realistic hands with correct fingers, believable anatomy and natural proportions, subtle
photographic film grain, accurate colour.

The subject: <SUBJECT_BLOCK>.

Framing: <three-quarter length | waist-up | chest-up | full body>, centred, looking at the
camera, relaxed natural stance (not posed stiffly).

Lighting direction: <front softbox | side raking light | three-quarter window light | overcast
daylight | backlit rim>, soft and realistic, no hard studio flash look.

Background: <medium-neutral-gray seamless | shallow-focus interior | overcast street | simple
muted wall>, soft falloff, no clutter, no text, no watermark, no other people, no props.

Photorealism guard: not anime, not illustration, not CGI render, not airbrushed, no doll-like
over-large eyes, no glossy plastic skin, no over-perfect symmetrical face, no hyper-saturated
colour, no product-photo look. Keep it an ordinary, believable, high-quality photograph.
```

### Framing options

| Deliverable | Framing | Aspect |
| --- | --- | --- |
| **LoRA / anchor identity** | ¾ length or full body, front, simple background | 3:4 / 4:5 (portrait) |
| **Key visual / marketing** | waist-up or ¾, environment allowed, cinematic | 16:9 or 3:4 |
| **Face-identity close-up** | chest-up, focus on skin + eyes | 4:5 |

Aspect: default **3:4 / 4:5 portrait** (Krea's recommendation for a single key portrait). Use 16:9
only for a cinematic/editorial key visual; keep it consistent with where the image will sit.

### Lighting directions to name explicitly

- `front softbox` — clean, even, flatters identity (best for a LoRA anchor).
- `three-quarter window light` — shaped, natural, editorial (best for a hero/key visual).
- `overcast daylight` — soft, unlit, believable (good for realism without drama).
- `backlit rim` — mood, but keep the face readable (weak LoRA anchor — prefer for marketing).

## Workflow

1. **Silhouette check** (optional, cheap): flat silhouette on white — if the silhouette is ambiguous,
   rework before locking detail.
2. **Lock the subject block** and a 3-5 word ID palette to reuse everywhere.
3. **Generate the hero.** Pick the cleanest, most on-model render (judge skin, hands, eyes — not
   glamour).
4. **QA against the checklist.** Re-roll rather than patch; identity is learned best from a single
   strong frame, not a patched one.
5. **Train the Klein 9B LoRA** on the approved hero (and optionally 2-3 strong variants). The LoRA is
   what gives you the sheet — don't try to make Krea do a sheet too.
6. **Export** the approved hero as the anchor + LoRA seed; reuse its subject block verbatim in the
   LoRA tags and any down-stream shot.

## Photorealism QA checklist (the bar)

- [ ] Skin reads real: visible pores, natural texture, believable translucency — not plastic/smooth.
- [ ] Eyes: natural iris+limbal detail, wet catchlights, symmetric and *human*-proportioned.
- [ ] Hands: correct count, correct fingers, knuckles, nails — the #1 photoreal giveaway.
- [ ] Hair: individual strands, natural fall, no "helmet" texture.
- [ ] Anatomy: believable shoulders/hips/joints, natural weight-bearing posture, no elongation.
- [ ] Lighting: soft, physical, single dominant character; no clipped/black-box shadows.
- [ ] Depth of field: real bokeh/falloff, background soft and coherent — not a flat backdrop.
- [ ] Colour: believable skin colour shift between highlights/shadows; no oversaturation.
- [ ] "Just a good photo" feel — not "AI-seen-on-Instagram" gloss.

## QA / reject if…

- Skin is airbrushed/glossy/porcelain; no pores; too-perfect face symmetry (CGI signature).
- Eyes are oversized, doll-like, misaligned, or stare past the lens.
- Hands are melted, have 5/6 finger errors, or wrinkle wrong — regenerate; do not patch.
- It reads as illustration/CGI/3D render rather than a photo.
- Text, logo, watermark, or a second person is present (poisons the LoRA).
- The pose reads stiffly "posing for a stock shot" rather than a real, natural moment.
- Any strong colour cast or prop steals identity from the subject (a red door, a neon sign, a hat,
  sunglasses).

## Optional: writing to the knowledge-base

Store the descriptor + approved prompt so it is re-usable:

```text
<PortableRoot>\Data\dot-lmstudio\knowledge-base\<corpus>\
  _corpus.md      <- one-line description (KB uses the first paragraph)
  identity.md     <- the subject block (the re-usable truth)
  hero-notes.md   <- the recipe + QA notes for this character
```

Then set the chat's `assignedCorpora` to `<corpus>` with `Auto-Retrieve` on. Keep `identity.md` in
sync with the hero you actually approved.

## Notes & rules

- **Never** run this on a real, identifiable civilian to fabricate a "real person". This is for
  *original characters* and consented talent/performance reference — same grounding as
  `character-turnaround`. Keep wording professional and neutral.
- Pick ONE strong hero and mint the LoRA from it. A blurred or patchworked anchor yields a
  patchworked sheet.
- Do not include outfit/makeup/jewelry/props unless they are part of the sustained identity — a
  costume that changes later will fight the LoRA (put costume in the sheet, not the identity anchor).
- All testing happens on THIS mirror (`E:\lmstudio_mirror`). Never point the generator at the other
  install.

# character-hero — worked example

Fully authored Krea 2 prompt for one original character's hero image (the LoRA anchor).
Reuse the **subject block** verbatim across every re-roll and any follow-on sheet.

## Subject block (the re-usable truth)

```
30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A),
long dark-brown straight hair falling loosely over the shoulders,
high cheekbones, straight nose, full lips, soft round jaw,
small mole on the right cheekbone, faint scatter of freckles across the nose,
calm assured neutral expression
```

## Hero prompt — LoRA anchor (¾ length, 3:4 portrait)

```
Photorealistic editorial portrait photograph of a single adult human subject, shot on an
85mm lens at f/1.8 with creamy shallow depth of field, natural, honest light. True-to-life
skin, visible pores and fine hair, natural sub-surface light, realistic eye catchlights,
realistic hands with correct fingers, believable anatomy and natural proportions, subtle
photographic film grain, accurate colour.

The subject: 30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A), long
dark-brown straight hair falling loosely over the shoulders, high cheekbones, straight nose,
full lips, soft round jaw, small mole on the right cheekbone, faint scatter of freckles
across the nose, calm assured neutral expression.

Framing: three-quarter length, centred, looking at the camera, relaxed natural stance (not
posed stiffly).

Lighting direction: three-quarter window light, soft and realistic, no hard studio flash look.

Background: simple muted warm-grey wall, soft falloff, no clutter, no text, no watermark, no
other people, no props.

Photorealism guard: not anime, not illustration, not CGI render, not airbrushed, no doll-like
over-large eyes, no glossy plastic skin, no over-perfect symmetrical face, no hyper-saturated
colour, no product-photo look. Keep it an ordinary, believable, high-quality photograph.
```

## Hero prompt — cinematic key visual (¾, 16:9)

```
Photorealistic cinematic editorial photograph of a single adult human subject. Shot on an
50mm lens at f/1.6, shallow depth of field, gentle natural film grain, accurate neutral
colour. True-to-life skin, visible pores, realistic eye catchlights, natural hands, believable
anatomy.

The subject: (same subject block as above).

Framing: three-quarter length, looking slightly off-camera, natural mid-stride posture,
in a low-key overcast doorway. 

Lighting direction: overcast daylight with a soft backlit rim, face readable.

Background: shallow-focus blurred overcast street, muted stone and rain-washed tones, no
clutter, no text, no watermark, no other people.

Photorealism guard: not anime, not illustration, not CGI render, not airbrushed, no gloss
skin, no over-perfect face, no hyper-saturation, no product-photo look. A believable
high-quality photograph.
```

## QA notes for this character

- Mole + freckles + warm `#D9A98A` skin are the identity anchors; they must survive into any LoRA.
- Hair loosely over the shoulders — keep off the face enough for the eyes to carry identity.
- For the LoRA anchor, prefer the **¾ length, 3:4, clean wall** version — no props, single tone,
  full body literacy.
- Do NOT LoRA-train a closer face-only crop; you lose body proportions and the LoRA over-fits the
  face. Use the clean ¾ hero as the seed.

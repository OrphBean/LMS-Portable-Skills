# character-turnaround — worked example

Fully authored Krea 2 prompt for one original character, produced by this skill's recipe.
Reuse the **subject block** verbatim across the turnaround, costume and expression sheets.

## Subject block (the re-usable truth)

```
30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A),
long dark-brown straight hair worn back in a low ponytail,
high cheekbones, straight nose, full lips, soft round jaw,
small mole on the right cheekbone, faint scatter of freckles across the nose
```

## One-shot 4-view sheet prompt (16:9)

```
Professional photorealistic character turnaround sheet, a single adult human subject,
full body, one image with four views of the same person arranged left-to-right in a single
row, each figure the same scale and standing on the same horizontal height line.

Views, left to right: front view, three-quarter view (3/4), side profile view, back view.
The subject stands in a neutral relaxed A-pose - arms at the sides slightly away from the
body, hands open and relaxed, feet shoulder-width, weight even - and each successive view
rotates the body 90 degrees in place while the pose stays identical and the figure stays
centered. Head neutral, eyes forward, mouth closed, relaxed neutral expression, hair worn
back and clear of the face.

The subject is: 30, cis-female, athletic-slim, 5'7", warm medium skin (#D9A98A), long
dark-brown straight hair worn back in a low ponytail, high cheekbones, straight nose, full
lips, soft round jaw, small mole on the right cheekbone, faint scatter of freckles across
the nose.

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

## Per-view with image-reference (pixel-consistent variant)

Generate the FRONT view, approve it, use it as Krea image reference for the rest:

```
Same photorealistic subject as the reference image, 30, cis-female, athletic-slim, 5'7",
warm medium skin, long dark-brown straight hair in a low ponytail, high cheekbones, straight
nose, full lips, soft round jaw, small mole on the right cheekbone, shown in a side profile
view, same neutral A-pose, same seamless skin-tone underwear, same medium-neutral-gray
background, same even studio lighting. Keep the face, body proportions, skin tone and hair
exactly as the reference. Full body, centered.
```

## QA notes for this character

- Freckles + mole are the identity anchors; they must persist into costume/expression sheets.
- Hair in a low ponytail, off the face — keep it that way in every view or the face read shifts.
- Skin tone `#D9A98A` is the target; the underdress must match it (no contrasting band).
- Target file: 16:9, full figure, medium-neutral-gray, no props, no text/watermark.

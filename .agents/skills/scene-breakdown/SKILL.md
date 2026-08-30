---
name: scene-breakdown
description: Build a production-style scene breakdown for reference-image generation - the per-scene and cross-scene catalog of environment, character, prop and close-up/insert requirements needed to generate consistent reference images in a chosen model (Qwen via LM Studio). Use when the user wants to figure out exactly which reference images to generate so a face, costume, location or prop stays consistent across many shots, or to turn a scene description / beat list / story summary into a reference-image manifest. Same essential process as breaking down a film script down to cast/props/set/wardrobe, but the deliverable is a list of images to make, not a call sheet.
license: Apache-2.0
compatibility: Windows + LM Studio portable junction layout + Qwen (or any) chat/vision model
metadata:
  author: khtsly
  version: 1.0.0
---

# scene-breakdown

## What this does

Takes a **scene description** (a beat list, a scene summary, a section of a story, or a concept you
already know play-by-play - NOT a screenplay, though the process is the same) and produces a
**scene breakdown**: the catalog of everything that has to be *seen* so it can be drawn consistently
across many generated frames.

This is the reference-image arm of image-gen continuity. It answers one question per visual:

> "To keep this re-usable across shots, do I need a dedicated reference image for it?"

Output is two things:

1. **Per-scene breakdown sheet** - env reqs, character reqs, prop reqs, and close-up/insert reqs.
2. **Reference-image manifest** - the de-duplicated, actionable list of images to actually generate
   (the whole point). Each entry carries a canonical **consistency descriptor** so the same subject
   can be re-prompted identically later.

It mirrors the film **script breakdown** (cast / extras / [[stunts]] / props / set dressing /
wardrobe / make-up+hair / vehicles-animals / special effects / equipment / production notes), but the
"departments" are not building sets - they are generating reference images in the chosen model.

## When to use

- Before generating a run of images / a video from the same universe, to lock the visual continuity.
- After `story-distiller` writes scene cards, so you go from *story* -> *scene cards* -> *what refs to
  make*.
- Any time the user says "what reference images do I need" / "list the shots I need refs for" /
  "keep this prop/face/location consistent".

Does NOT replace `story-distiller` (that distills a *story* into cards). This turns cards/descriptions
into a *visual production breakdown*. They compose: distill first, then break down.

## Workflow

### 1. Gather the input

Accept one of:
- a list of scenes / beat list (preferred), each with a slugline and a short description,
- a `story-distiller` corpus (read `scene-*.md` from the KB corpus),
- a free-form scene description the user pastes.

If it is long prose, first run it through `story-distiller` to get discrete scene cards, or ask the
user to split it into scenes. Never guess scene boundaries from wandering prose.

### 2. For each scene, fill the breakdown sheet

Drive the model with the JSON schema below. The breakdown is *per scene*, and every field maps to a
thing a reference image would need to capture. Be concrete and visual - this feeds an image model, so
prefer words like "worn brass turn-key phone, cream bakelite earpiece" over "old phone". The strict
shape lives in `breakdown.schema.json` (JSON Schema); a fully-rendered worked example is in
`breakdown.example.json`.

### 3. Collect the reference-image manifest

Flatten every `refsNeeded` across scenes and **de-duplicate by continuity subject + variant**. A
character's face is one ref even if they appear in 8 scenes; each distinct costume variant is a ref;
each hero prop and each insert is a ref. This de-dup is the deliverable - it is what stops you
re-generating the same face ten times.

### 4. Assign priorities and ranges

- **P0** - face/identity of every recurring character; every hero prop; every insert that is plot
  legible (a ring, a scar, a sign, a weapon detail). These MUST be locked first.
- **P1** - primary env establishing refs, costume variants, set-dressing that reads prominently.
- **P2** - clothing continuity variants, minor set dressing, secondary angles of already-refed subjects.

### 5. (Optional) Write to the knowledge-base

Write the breakdown as a corpus so the `knowledge-base` plugin can inject it into prompt dev:

```text
<PortableRoot>\Data\dot-lmstudio\knowledge-base\<corpus>\
  _corpus.md        <- one-line description (KB uses the first paragraph)
  breakdown.md      <- the human sheet (all scenes)
  reference-images.md <- the manifest (the actionable list)
  breakdown.json    <- machine form (optional; derived, never hand-edited by users)
```

Then set the chat's `assignedCorpora` to `<corpus>` with `Auto-Retrieve` on. For a multi-scene piece,
keep character/prop continuity in the manifest so the same subject is described identically no matter
which scene card is retrieved.

## The scene breakdown template (schema)

```json
{
  "breakdownTitle": "string",
  "chosenModel": "qwen-<...>                // the model that generates the refs / drives the render",
  "styleGuide": {
    "look": "string",                       // e.g. film-noir, VFX-clean, painted - give the render target",
    "palette": ["string"],                  // dominant + accent colours",
    "lighting": "string",
    "texture": "string",
    "artDirection": "string",
    "aspectRatio": "string"                  // optional, e.g. 16:9 / 4:5"
  },
  "scenes": [
    {
      "sceneId": "01",
      "slugline": "INT. CAT GRAVEYARD APARTMENT - NIGHT",
      "description": "string",
      "envReqs": {
        "locationName": "string",           // the ref target, e.g. "Nora's parlour, 1962"
        "era": "string",
        "timeOfDay": "string",               // day / night / dusk / golden hour",
        "weather": "string",
        "architecture": "string",
        "atmosphere": "string",              // mood, air, energy",
        "lightingLook": "string",            // practicals only / cool moonlight / neon spill",
        "palette": ["string"],
        "setDressing": ["string"],           // visible furnishings that define the place",
        "establishingRefs": ["string"]       // <envRefId> for the wide + key angles"
      },
      "characterReqs": [
        {
          "characterId": "nora",
          "name": "Nora",
          "roleInScene": "string",
          "identity": "string",              // face, age, build, hair - the consistency core",
          "wardrobe": "string",              // exact outfit for THIS scene",
          "wardrobeVariantId": "string",     // e.g. nora-costume-2 (a new ref if it differs)",
          "makeupHair": "string",
          "distinctiveMarks": ["string"],    // scars, tattoos, jewellery worn on body",
          "bodyLanguage": "string",
          "faceRefId": "string",             // the one P0 ref for this face"
        }
      ],
      "propReqs": [
        {
          "propId": "locket",
          "name": "brass locket",
          "type": "hero | hand | set",
          "usage": "string",
          "continuity": "string"             // note any wear/dirt/damage across scenes",
          "refId": "string"
        }
      ],
      "closeUps": [
        {
          "insertId": "locket-ecus",
          "subject": "engraved 'C' on the locket lid",
          "why": "plot-legible detail that must not drift",
          "framing": "macro | insert | extreme close-up",
          "refId": "string"
        }
      ]
    }
  ],
  "refIds": ["string"],                       // stable subject ids, reused across scenes",
  "referenceImageManifest": [
    {
      "refId": "nora-face-front",
      "category": "character",
      "subject": "Nora - face & identity",
      "subjectSummary": "string",             // one canonical, re-usable visual description",
      "framing": "face 3/4 | bust | full | hands | macro",
      "view": "front | 3/4 | side | multiple",
      "consistencyDescriptor": "string",      // THE string to paste into every later prompt",
      "variants": ["string"],
      "usedInScenes": ["01", "04", "07"],
      "priority": "P0 | P1 | P2"
    }
  ]
}
```

## The reference-image manifest rules

- **One face = one P0 ref** (unless a scene has a genuinely different look - e.g. period vs present -
  then it is a variant ref, still one identity).
- **One hero prop = one ref**, + one **macro/insert ref** if a legible detail must not drift.
- **One env = a small set of refs**: an establishing wide + the key angle(s) the scene actually shows.
- **Costume variants are separate refs**; the wardrobe continuity note tells the model what changed.
- Every manifest entry carries a `consistencyDescriptor`: a long, specific, copy-pasteable
  description (age, build, hair, clothing, marks; or material-scale-finish-colour for props). This is
  what gets reused verbatim, so later prompts land on the same subject.
- Reuse refs, don't re-generate. The schema's `refIds` are stable identifiers; if a ref already exists
  in an earlier breakdown, reference it rather than spawning a duplicate.

## Grounding on standard film breakdown

The categories below are the classic color-coded script-breakdown elements (cast / extras / stunts /
props / set dressing / wardrobe / make-up+hair / vehicles+animals / special effects / equipment /
notes) mapped to reference-image needs. Use them as a checklist so nothing gets missed, even though
the output is image requirements, not departments:

| Film element | In an image reference-build | When it earns its own ref |
| --- | --- | --- |
| Cast (speaking) | **characterReqs** -> face/identity | Always (P0 face ref) |
| Extras / background | env atmosphere + set dressing note | Only if they recur and read |
| Stunts / action | bodyLanguage + costume continuity | Ref only if the pose/rig matters |
| Props | **propReqs** (hero / hand / set) | Hero & hand props: always; set props if recurring |
| Set dressing | **envReqs.setDressing** | If it defines the place or recurs |
| Wardrobe | **characterReqs.wardrobe** | Each distinct costume variant |
| Make-up / hair | **characterReqs.makeupHair** | When it changes markedly between scenes |
| Vehicles / animals | a prop-like entry | If recurring / plot-legible |
| Special effects | styleGuide + closeUps note | Only for FX continuity |
| Special equipment | styleGuide.aspectRatio / framing | Rarely a standalone ref |
| Production notes | descriptive text + closeUps | Any confusion about how it should read |

Cross-check every scene against the table. If a box on the left is answered by something on the mid
column, you are covered; the right column tells you whether it needs its own image.

## Requirements & location

- A scene/beat input (or a `story-distiller` corpus). Not a screenplay workflow.
- The chosen model (e.g. Qwen via LM Studio) available to this install for the reference generation /
  prompt dev. All testing happens on THIS mirror (`E:\lmstudio_mirror`), never the other install.
- Optional: `knowledge-base` plugin corpus write for RAG injection into later prompt dev.

## Notes

- Be concrete, not abstract. "Tension" is not a reference image; "single tungsten practical,
  shadow across a worn mahogany desk" is. The schema wants the latter.
- Keep `consistencyDescriptor` specific and stable. It is the string you will paste verbatim into a
  dozen later prompts, so make it the canonical truth for that subject.
- This skill does not generate images or rewrite the story. It catalogs what to generate so the
  visual world stays coherent.

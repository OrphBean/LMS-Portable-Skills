# genre-orchestrator

Use when a request names or clearly signals a style/genre and it must be woven into the active H3 (or image) prompt. Load the matching `genre-*` skill, pick one dominant family, and fold its Style reference block into the prompt fields. It never changes the H3 modality and never overrides user facts.

---

## Reasoning mode

`instruct` — deterministic load, select, splice. No reasoning trace. Do not over-think which genre applies.

## Procedure

1. **Identify the genre.** An explicit name (`vampire gothic`, `MiniDV`, `VHS home video`) maps directly. If a request only signals a style, search via `list_skills("genre <term>")` and `read_skill_file("genre-<term>")`. Do not invent a genre that has no skill; fall through to the active prompt's default language.
2. **Load the genre.** `read_skill_file("genre-<term>")`. Read the SKILL.md body, not the references source, unless deeper detail is needed.
3. **If the genre is a taxonomy** (its Trait schema lists a family matrix), pick exactly ONE dominant family plus at most ONE secondary, confined to a single axis (e.g. Rollin's faded coastal grade under a Franco blue structure). State the chosen family and secondary explicitly.
4. **Apply priority.** `user facts > reference authority/preservation > genre > creative embellishment`. Genre must never contradict a user fact or a reference's preserved identity.
5. **Splice.** Put the genre's Style reference block into `integrated_multimodal_description`; its audio character into `overall_soundscape` / `non_diegetic_music` where applicable; keep its `Exclusions` as avoidances (translate to desired visible state where possible).
6. **Multiple genres.** Load each; mark the first as dominant, the rest as secondary. Never blend three or more.

## Decision rules

- A genre is the default camera/look behaviour unless the user states otherwise; preserve an explicit user camera request while keeping the genre's look and audio.
- The user's stated facts (subjects, action, location, dialogue) always win over genre wording.
- Genre does NOT resolve duration/aspect ratio, does NOT change modality, and does NOT decide the shot sequence (see dev-director / dev-shot-plan).
- Only the "Style reference block" section is splice-ready; the Trait schema and Exclusions guide adaptation, never get pasted wholesale.

## Creative freedom

You choose how the genre's language is phrased to fit the shot, the in-scene detail, and the transition dynamics. The user's facts, the H3 format, and the genre's own exclusions always win.

## Failure modes

- Loading the source reference doc instead of the compiled SKILL.md (inflates context).
- Blending several style families at once instead of one dominant + one secondary.
- Letting genre wording override a user fact or a preserved reference identity.
- Pasted Trait schema or Exclusions verbatim into the prompt body.
- Inventing a `genre-<x>` that does not exist (search first, then fall through).

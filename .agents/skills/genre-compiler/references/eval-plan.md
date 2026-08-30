# Genre / dev pipeline evaluation plan

Test the genre + pre-prompt + prompt pipeline against a compact case set. These
are run manually in LM Studio (skills are agent instructions; there is no
automated harness). Class every case as `normal`, `ambiguous`,
`conflicting-constraint`, `reference-role`, `known-failure`, or a
`screenwriter-discipline` case.

## Cases

- **normal-genre** — "a 1970s vampiric gothic scene, woman at a window" → pick
  vampire-erotic-gothic, one family, splice block into the prompt; no mode leak.
- **normal-capture** — "a family Christmas morning on VHS" → vhs-domestic,
  everyday/christmas event type, first-generation tape, no film language.
- **ambiguous-genre** — "vintage camcorder look" → must disambiguate MiniDV vs
  VHS (both are capture genres) by asking one question, not guessing.
- **conflicting-constraint** — user gives a genre AND an explicit user camera
  fact (e.g. "slow dolly") → genre must not override the stated camera work.
- **reference-role** — a reference image named as the opening frame AND a genre
  style → must route i2v (boundary frame) and fold the genre, never demote the
  image to style-only.
- **known-failure / over-question** — a rich 3-sentence brief must produce a
  shot plan with ~0 extra questions (restate interpretation, proceed), not a
  long interrogative.
- **known-failure / over-reasoning** — a trivial 1-shot request must not spend
  heavy thinking; it stays `instruct`.
- **screenwriter-framing** — prompt must have cause→effect, no abstract mood
  replacing action, screen direction preserved across cuts, real-human
  physicality (no mannequin).
- **off-frame leak** — nothing off-screen is described unless explicitly stated;
  no metadata (duration/ratio) rendered as visual content.
- **shot-count** — an 8s request fits its beats; a single causal take is not
  force-split into multiple shots.

## Interpret expectations

Compare against the criteria, not a fixed output: the rationale mode is always
`instruct` (never inherited `xhigh`); the priority order holds (user facts >
reference > genre > convention > creative); the genre stays one dominant family
(+≤1 secondary); the plan is semantic, not H3 syntax.

## Failure classification (when a case fails, classify before fixing)

skill-design failure · ambiguous user input · model limitation ·
runtime/chat-template issue (incl. reasoning-mode mismatch) ·
structured-output enforcement · multimodal input issue · over/under-thinking.

Do not "fix" a skill for a failure caused elsewhere in the stack.

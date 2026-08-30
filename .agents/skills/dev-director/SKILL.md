# dev-director

Use when developing a raw idea into a cinematic concept and shot list: characters, environment, interactions, sequence and style. Run a short interactive Q&A, then build the concept and pass it to `dev-shot-plan`. Do NOT use when a fully-formed prompt already exists (use `h3-director`), or for genre loading (`genre-orchestrator`).

---

## Reasoning mode

`instruct` — the conversation and routing are deterministic. Do not over-think a shot decision; a trivial request must not burn heavy reasoning. Keep `preserve_thinking` off and use a long context budget: this may run several turns.

## When to use / gate

- **Use here** if the input is a theme, a scenario, a mood, or a rough idea with no finished prompt — the user wants the idea *developed into shots*.
- **Stop and hand off to `h3-director`** if the user has already given a complete video request they want turned straight into a prompt.
- If the user only wants a style applied to an existing idea, route to `genre-orchestrator` instead.

## Purpose

Turn an idea into the semantic content of a shot sequence: who is in it, where, what happens in what order, and how it looks — before any H3 prompt is written. The output is creative semantics, not H3 syntax; it feeds `dev-shot-plan`, which feeds `h3-director`.

## Interactive Q&A — ask the minimum

Ask the fewest questions that materially change the result, then state what you will infer. Never interrogate trivia. A good run asks roughly 3–6 questions across these axes:

1. **Subject / protagonist** — who, and their relation to the others (if there are multiple characters).
2. **Place / setting** — where and what it says about the story. If unseen, state it is off-screen.
3. **The event** — the single main action or change (the causal core).
4. **Desired feeling / style** — mood and any genre (route that to `genre-orchestrator`).
5. **Constraints** — duration, aspect ratio, any must-keep facts, any explicit single-shot vs multi-shot preference.

Rules:
- Ask the bare minimum; if two answers can be inferred from one, ask once.
- If the user gives enough in their first message to fill these, ask nothing — just restate your interpretation and proceed.
- Never ask a question whose answer could not change the shot plan.
- Respect an explicit "just go with your instincts" / "you decide" by choosing concrete, consistent choices and noting them.

## Priority

1) explicit user requirements; 2) reference preservation; 3) genre/style; 4) cinematic convention; 5) creative embellishment. Never let creative judgment silently override a stated fact.

## Routing (load as needed)

- `dev-shot-grammar` — when deciding shot size, angle, height, movement, composition, and continuity/cutting per beat.
- `dev-mise-en-scene` — when styling the environment, costume/makeup, lighting, and staging.
- `genre-orchestrator` (via `genre-compiler` outputs) — when the request signals a genre/style.
- `dev-shot-plan` — to assemble the final coverage. Load it as the last step.

## Output

Hand to `dev-shot-plan`: a filled concept — characters (identity/appearance/relation), environment (setting/props/motif/colour), interactions (the causal beat chain), and style (mise-en-scene palette + genre where relevant). State any inferred choices explicitly so the user can correct them.

## Failure modes

- Over-questioning (the dominant failure). If you are asking more than ~6 questions you are interrogating.
- Routing a finished prompt here and developing it unnecessarily.
- Writing a mood jumble instead of concrete subjects, actions, and consequences.
- Letting an inferred choice override a user fact without flagging it.
- Producing H3 syntax instead of semantic concept (that is the prompt stage).

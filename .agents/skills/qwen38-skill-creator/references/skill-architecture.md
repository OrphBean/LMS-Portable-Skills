# Skill architecture: variants and token budgets

Do not force every compiled skill into one template. The compilation decides
which sections exist, how big they are, and how they are ordered. This file
gives the compiler reference variants. They are suggestions, not mandates.

`Reasoning mode` is a mandatory section in every variant. It is the Qwen
specific section the other target models do not need.

## Default structure

For an ordinary specialist runtime skill:

- Purpose
- Reasoning mode
- When to use
- Inputs / semantic interpretation
- Hard requirements
- Procedure
- Decision rules
- Creative freedom
- Output contract
- Failure modes
- Final validation
- Examples, only if needed

## Collapsed variants

### Router / director skill (very small, always `instruct`)

Typical sections:

- Purpose
- Reasoning mode: `instruct`
- When to use (including "route to module X when…")
- Decision rules (the routing table)
- Output contract

No procedure, no examples, no creative-freedom section. Keep it near the top of
the runtime context so routing happens before context fills.

### Simple transformation skill (compact, `instruct`)

- Purpose
- Reasoning mode: `instruct`
- Inputs
- Hard requirements
- Procedure (2–4 steps only if ordering matters)
- Output contract
- Final validation

Collapse "When to use", "Decision rules", and "Failure modes" into one or two
lines each, or drop them when the activation description already handles
routing.

### JSON-output skill (compact, semantic-first, `instruct`)

- Purpose
- Reasoning mode: `instruct`
- Inputs / semantic interpretation
- Output contract — field-by-field semantics (what each field means), separate
  from any schema that the runtime enforces syntactically
- Hard requirements (semantic constraints: e.g. "the `prompt` field must not
  contain API configuration")
- Failure modes (most common semantic mistakes)
- Final validation (a short semantic self-check)

Strict JSON Schema enforcement is safe here because no tool calling is involved.

### Tool-calling skill (compact, `instruct`, XML syntax)

- Purpose
- Reasoning mode: `instruct`
- Inputs / semantic interpretation
- Tool contract — the `<tool_call>` XML shape, parameters, and the declared
  tools (position-zero system prompt)
- Procedure (call sequence and decision rules)
- Failure modes — malformed XML, silent tool-drop, raw tag leakage
- Final validation

Strict JSON decoding is OFF in this variant; prompt-level formatting discipline
stands in for schema enforcement.

### Complex multimodal / reference skill (larger allowed)

- Purpose
- Reasoning mode — `thinking` (medium/xhigh) or `instruct`, chosen by task
- When to use
- Inputs / semantic interpretation — role assignment table for every reference
  asset (see multimodal design), with precedence
- Hard requirements — preservation constraints and precedence rules
- Procedure — step order matters for interpreting references before generating
- Decision rules — conditional branches (what to do when a reference is
  missing, low quality, or conflicts)
- Creative freedom
- Output contract
- Failure modes
- Final validation — focused on the highest-risk items (roles, precedence,
  preservation)

For video inputs, add a Sampling section that fixes fps / max_frames /
scene-change policy for the expected footage. Video and motion skills should
include the screenwriter's-frame rules (cause-and-effect, continuity, screen
direction) in Hard requirements and validation.

### Downstream generation-model skill (compact)

Compiled for producing a prompt for H3 (video), FLUX Klein (image), or Krea 2
(image). The section set matches the target disposition:

- Purpose
- Reasoning mode — H3: `instruct`/`medium` (or `thinking` for complex motion);
  Klein and Krea 2: `instruct`
- Inputs / semantic interpretation — keyframe/reference role if any
- Hard requirements — the target model's disposition plus the screenwriter's
  frame (only in-frame, nouns and verbs, cause-and-effect, motion continuity,
  screen direction, real-human realism)
- Procedure — analysis steps before synthesis
- Output contract — the prompt string and nothing else (H3 may add duration /
  aspect ratio)
- Final validation — syntax and screenwriter's-frame self-check

See (downstream-model-orientation.md) and (screenwriting-discipline.md) for
the target dispositions and the discipline rules.

### Genre / style overlay (independent, compact, `instruct`)

- Purpose
- Reasoning mode: `instruct`
- The domain itself: conventions, vocabulary, tropes, what belongs and what
  does not
- Decision rules: when this overlay applies and how it layers with base skills
- Creative freedom within the genre

Genre overlays should not repeat downstream-model syntax. Keep the downstream
model's vocabulary in one shared module; overlays reference it.

## Token-budget accounting

For each compiled skill, estimate:

1. structural tokens (headers, labels);
2. invariant tokens (hard requirements, preservation rules);
3. procedure tokens;
4. example tokens;
5. validation tokens;
6. reasoning tokens the declared mode will add at runtime (thinking-mode skills
   cost far more than their file size).

If the total substantially exceeds the type budget in the target-model profile,
re-run Pass 7 and Pass 11 rather than silently shipping a long skill. If
trimming would remove a load-bearing rule, keep it and accept the size. If the
reasoning-mode choice is the dominant cost, reconsider Pass 3 before trimming
prose.

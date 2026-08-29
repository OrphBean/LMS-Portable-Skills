# Lint checklist (Pass 11)

Inspect the compiled draft for each defect. For each, the "how to spot" line
helps find it; the "fix" line tells you what to do. Fix everything before
writing final output. The Qwen-specific defects (13–22) are the highest-risk
items; check them even for short skills.

## 1. Ambiguous pronouns

Spot: a pronoun whose antecedent is unclear across sentences, especially with
multiple references ("it", "this", "them").
Fix: name the referent explicitly, or restructure the sentence.

## 2. Compound instructions

Spot: one sentence packing two or more independent constraints or steps.
Fix: split into separate instructions, each with its own object.

## 3. Undefined priorities

Spot: two rules that can conflict, with no stated precedence.
Fix: add a priority section or a per-conflict precedence statement. Omit the
priority section entirely when no meaningful conflict exists.

## 4. Contradictory rules

Spot: two statements that cannot both be satisfied.
Fix: resolve the conflict; keep one rule, or state which wins and when.

## 5. Requirements buried only in examples

Spot: a behaviour shown in an example but never stated as a rule.
Fix: promote it to a stated requirement. Requirements must never exist only
inside examples.

## 6. Excessive duplication

Spot: the same rule stated three or more times, or long restatements.
Fix: consolidate equivalent rules. Keep at most two occurrences of a critical
invariant (interpretation point + final validation).

## 7. Excessive verbosity

Spot: rationale, history, caveats, or generic advice that no execution step
needs.
Fix: delete. Keep only operational knowledge that changes the output.

## 8. Unnecessary model/API parameters

Spot: sampling values, chat-template flags, checkpoint names, or provider
settings embedded in the skill body.
Fix: remove them. The reasoning-mode declaration is the one runtime value a
Qwen skill should carry; numeric sampling parameters stay in the runtime-config
checklist, referenced once if at all.

## 9. Distant related instructions

Spot: a constraint defined far from the field or step it governs.
Fix: move the rule next to the concept or output field it applies to.

## 10. Unclear reference roles

Spot: a multimodal reference whose function (identity / appearance / style /
metadata / motion, etc.) is not stated, or whose non-visibility is not stated.
Fix: assign explicit semantic roles and precedence.

## 11. JSON fields without clear semantics

Spot: an output field whose meaning, or whose boundary relative to other
fields, is undefined.
Fix: add a one-line semantic responsibility per non-obvious field.

## 12. Creative instructions capable of overriding invariants

Spot: "be creative", "improvise", "reinterpret" placed without boundary next to
a hard preservation rule.
Fix: state that creative freedom applies only within the invariants, and make
the invariant the higher priority.

## 13. Missing or wrong reasoning mode

Spot: no `Reasoning mode` section, or a mode that contradicts the task (e.g.
`xhigh` on a formatting task, or `instruct` on a task that needs decomposition).
Fix: add the declaration; set `instruct` unless the task genuinely needs
thinking. This is the single most common Qwen skill defect because the serving
default is `xhigh`.

## 14. Jinja template violations

Spot: instructions to inject a second system message mid-conversation, tool
schemas added after position zero, or video/audio content placed in the system
role.
Fix: consolidate into the initial system prompt; move multimodal data to
user-role messages.

## 15. Undefined tool-calling path

Spot: a skill that calls tools but never states the XML syntax, never declares
tools in the system prompt, or pairs tool calls with strict JSON Schema
decoding.
Fix: declare the path explicitly (Rule C): native `<tool_call>` XML, tools in
the position-zero system prompt, JSON-schema enforcement off.

## 16. Unbudgeted reasoning context

Spot: a multi-turn or conversational skill that never addresses
`preserve_thinking` or token ceilings, or a thinking-mode skill with no ceiling
estimate.
Fix: disable `preserve_thinking` for conversational/repetitive skills; record
the ceiling the skill assumes.

## 17. Fixed video sampling

Spot: a video skill that assumes one fps for every input (e.g. always 2 fps)
with no adaptation to content.
Fix: require fps / frame-count adaptation or scene-change keyframe extraction
for the expected footage.

## 18. Downstream-model orientation drift

Spot: a compiled prompt skill whose output drifts from the target model's
disposition (H3 video timeline with observable events in order and duration fit;
Klein prose with no negative-prompt block and front-loaded subject; Krea 2 a
faithful-expansion paragraph with positive-only realism cues).
Fix: align the output contract and validation with the target model's
disposition in (downstream-model-orientation.md).

## 19. Abstract mood replacing observable action

Spot: prompt prose that names mood, feeling, or atmosphere ("a mood of", "feels
tense", "conveys longing") with no concrete subject-action that produces it.
Fix: translate mood into observable physical behaviour — nouns and verbs,
cause and effect. Mood may supplement action, never replace it.

## 20. Off-frame content

Spot: describing what is not in the frame, narrating events the camera cannot
see, or writing stage directions to the viewer/model.
Fix: describe only visible and audible events; state explicitly when something
is off-screen narration.

## 21. Broken motion continuity or screen direction

Spot: teleporting between frames or cuts; characters flipping screen side;
direction of travel or eye-lines reversing; an action that starts one way in
one shot and differently in the next.
Fix: keep positions, poses, camera, and screen sides consistent; write
cause-before-effect; preserve matching action across cuts.

## 22. Anatomically implausible or mannequin subjects

Spot: weightless bodies, frozen poses, generic skin, missing micro-behaviour,
actions with no physical result (a hand reaches without the arm and weight
transfer).
Fix: ground bodies in weight, posture, anatomical plausibility, natural
imperfection, and visible consequence.

## Post-lint read

Read the finished skill once more as Qwen would: top to bottom, in a loaded
context, with a task in hand and the declared reasoning mode active. Mark any
spot where you as the executor would hesitate, and fix it. Ask last: would the
declared mode make this task fast, or does it inherit the overthinking trap?

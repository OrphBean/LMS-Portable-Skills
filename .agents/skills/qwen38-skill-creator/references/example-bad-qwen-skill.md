# Example bad Qwen skill

The same domain as `example-good-qwen-skill.md`, compiled poorly. Annotated
for the compiler: each defect is a violation of the design principles, the
Qwen-specific design rules, the screenwriter's frame, and the Pass 11 lint
checklist.

---

# h3-short-motion-prompt

You are a world-class cinematic prompt engineer for MiniMax H3. Think carefully
through the task, validate key assumptions, consider plausible alternatives,
and prioritize correctness, consistency, and clarity in the final answer. Your
prompts must be evocative and emotionally rich.

## Procedure

1. Carefully analyse the request.
2. Think deeply about the mood and the emotional arc of the scene.
3. Write a vivid, detailed prompt in the official H3 style.
4. Provide your answer.

## Things to remember

- Be very atmospheric. H3 loves atmosphere.
- Capture the feeling of the moment.
- Use cinematic terms liberally.
- Sometimes the emotional weight matters more than physical detail.

## Example

User asks for: "a woman crosses the kitchen to switch off the radio."

Assistant output:

```
An atmosphere of quiet domestic solitude settles over the kitchen. The woman,
her mind heavy with the day, moves through the room as loneliness gathers
around her. She reaches the radio (which she had left playing all morning,
though this is off-screen) and turns it off. The silence that follows is
profound and almost unbearable. Camera slowly zooms in on her face, capturing
the weight of unspoken emotion.
```

## Output format

Produce a prompt that looks like the example above.

---

## Annotations (for the compiler — not part of the skill)

- **No reasoning-mode declaration**: the skill never sets a mode, so it
  silently inherits `xhigh` and burns ~20 minutes of thinking on a routine
  action prompt. The opening sentence even copies the `xhigh` directive text
  (Rule A, lint 13).
- **Abstract mood replacing action**: "an atmosphere of quiet domestic
  solitude", "loneliness gathers", "profound and almost unbearable" — no
  observable action carries them (lint 19). The user asked for a person
  crossing a kitchen; the output gives a feeling instead of a sequence.
- **Off-frame content**: "which she had left playing all morning, though this
  is off-screen" narrates what the camera cannot see (lint 20).
- **No cause-and-effect**: "turns it off. The silence that follows..." — the
  radio's state change is asserted without the physical act (finger on dial,
  click, sound dropping). The consequence is mood, not physics (principle 6,
  lint 19).
- **Mannequin subject**: "she moves through the room" — no weight, no stride,
  no micro-behaviour, no screen direction (lint 21, 22).
- **Unmotivated camera**: "Camera slowly zooms in on her face" with no reason
  tied to the action (screenwriter's frame, camera-consistency).
- **Verbose opener**: the "world-class expert" framing is flattery, not
  operational knowledge (Pass 7).
- **Over-proceduralised**: the 4-step procedure orders trivial actions (Pass 5,
  principle 9).
- **Buried requirements**: the real rules (only in-frame, cause-and-effect,
  screen direction, grounded body) exist nowhere as stated rules; the example
  violates every one of them (lint 5).
- **Example as template**: "look like the example above" invites imitation of a
  bad output (principle 8).
- **Creative override risk**: "be very atmospheric" and "capture the feeling"
  override any physical constraint (lint 12).
- **Undefined output contract**: no statement that the output is one plain
  paragraph with no preamble (lint 11).

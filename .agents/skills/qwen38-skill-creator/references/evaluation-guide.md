# Evaluation guide

The compiler should encourage empirical validation rather than assuming a
theoretically cleaner prompt is better. This file covers test-set design and
failure classification.

## Minimal test set

Produce or suggest a compact test set. One runnable example per case is enough;
the point is to compare actual Qwen behaviour across cases.

1. Normal case — a typical task the skill must handle well.
2. Ambiguous case — an input that needs interpretation or disambiguation.
3. Conflicting-constraint case — requirements that pull in opposite directions;
   verifies the stated priority works.
4. Reference-role case — a multimodal input where a reference must be
   interpreted, not reproduced; verifies role semantics and precedence.
5. Structured-output case — a task whose JSON/XML output must be both valid and
   semantically correct.
6. Known failure case — the input class that previously failed, or that the
   weakness profile predicts will fail (e.g. an overthinking-prone trivial
   task, or a tool call under strict JSON decoding); verifies the mitigation.
7. Screenwriter-discipline case (visual-generation skills) — an input that
   tempts abstract mood, off-frame narration, a screen-direction break, a
   missing cause-effect chain, or a weightless body; verifies the frame rules.

## Suggested evaluation flow

1. Run the test set against the compiled skill in the real runtime (Qwen 3.8
   27B in OpenCode), not a different model.
2. Record failures with the actual output.
3. Verify the runtime configuration matches the skill's declared mode
   (reasoning_effort / enable_thinking, preserve_thinking, sampling set,
   system message at position zero, JSON-schema enforcement off for tool
   skills) before classifying anything.
4. Classify each failure (below) before changing anything.
5. Change only what the classification indicates.
6. Re-run the full set to confirm no regression.

## Failure classification

Distinguish seven failure classes. Do not automatically "fix" the skill for
problems caused elsewhere in the stack.

### A. Skill-design failure
The skill is missing a rule, misorders steps, misstates semantics, or declares
the wrong reasoning mode for its task.
Fix: revise the skill.

### B. Ambiguous user input
The task itself is under-specified or self-contradictory.
Fix: do not rewrite the skill. Either ask the user, or add a decision rule for
the ambiguous case if the ambiguity is a recurring class.

### C. Model limitation
The model cannot perform the requested reasoning or transformation regardless
of phrasing (including knowledge-degradation cases that need RAG).
Fix: restructure the task into what the model can do, add retrieval, or flag
the limitation.

### D. Runtime / chat-template issue
The wrong checkpoint, missing `enable_thinking` / `reasoning_effort` support,
the wrong or outdated `chat_template.jinja`, a mid-conversation system message,
faulty reasoning-history handling, `preserve_thinking` misconfigured, or the
reasoning mode set at the serving layer contradicting the skill's declaration.
Fix: correct the runtime configuration, not the skill.

### E. Structured-output enforcement issue
Constrained decoding or schema validation is misconfigured, or is active on a
tool-calling skill and silently suppressing `<tool_call>`.
Fix: fix the enforcement layer (turn strict JSON decoding off when tools are
involved). The skill should not duplicate the schema.

### F. Multimodal input issue
Message ordering (multimodal data in the system role), image token/resolution
limits, reference attachment, or video fps/max_frames/pixel-budget is wrong.
Fix: fix the input pipeline, or document the constraint in the skill only if
the skill must adapt its behaviour to it.

### G. Over/under-thinking mismatch
The behaviour is correct but the wall-clock latency is unacceptable because the
mode is too heavy for the task (overthinking), or answers are shallow because
the mode is too light for a task that needed decomposition (underthinking).
Fix: change the declared reasoning mode (Pass 3), and verify at the serving
layer that the runtime honours it.

## Revision protocol

When the classification says "skill-design failure" or "mode mismatch":

1. Re-open the failed output.
2. Locate the first instruction the output violates.
3. Ask whether the instruction was missing, ambiguous, mis-ordered, or
   over-ridden by a competing rule, or whether the mode was wrong for the task.
4. Apply the smallest change that addresses it (add, split, reorder, add
   priority, or change the reasoning-mode declaration).
5. Re-run the whole test set.

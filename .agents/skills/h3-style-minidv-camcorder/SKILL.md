---
name: h3-style-minidv-camcorder
description: Early-2000s consumer MiniDV camcorder style overlay for H3 video prompts. Use when the user wants the look, optics, handheld motion, rocker-zoom behaviour, and audio of a compact handheld MiniDV camcorder (found-footage, home-movie, candid amateur camcorder aesthetic). Provides the authoritative style reference block to weave into the active H3 modality prompt. Do NOT use for cinematic/DSLR/film looks, VHS or film emulation, gimbal-smooth or tripod-stable camera work, drone shots, or when the user wants mechanical/perfect tracking.
---

# H3 style overlay — early-2000s MiniDV camcorder

## Purpose

Provide an authoritative, self-contained style reference for the early-2000s
consumer MiniDV camcorder look and handheld behaviour. Load this skill when the
user requests the MiniDV / camcorder / home-video aesthetic. It never changes
the modality (t2v / i2v / first-last / last-frame / reference) and never
overrides user facts.

## Reasoning mode

`instruct` — deterministic style-language folding into the active H3 modality
skill. No reasoning trace needed.

## How it layers

- Run the normal H3 workflow and choose the modality as usual.
- This overlay governs: look, optics, handheld motion, zoom behaviour, framing
  behaviour, and audio character.
- Fold the reference block below into the prompt: its opening statement into
  `integrated_multimodal_description`, its audio into `overall_soundscape` /
  `non_diegetic_music`.
- User-specified scene facts (subjects, actions, location, dialogue) win over
  any stylistic wording.

## Style reference

integrated_multimodal_description: [Shot 1] Early-2000s consumer MiniDV camcorder footage. Small-sensor digital-video appearance with slightly washed-out colour, restrained saturation, pale highlights, modest dynamic range, mild electronic edge sharpening, fine video noise, occasional clipped bright areas, and broad depth of field. The image feels like genuine consumer digital video rather than modern cinema, film emulation, or VHS.

The camera behaves like a compact handheld MiniDV camcorder operated by a person moving through the scene. The built-in lens stays moderately wide most of the time, roughly equivalent to a 35–45 mm full-frame field of view. The operator remains physically close to the subject, so camera position, perspective, and background parallax change visibly as both people move.

Handheld motion follows human body mechanics. Walking produces gentle vertical rise and fall, small lateral shoulder sway, slight rotational roll, and irregular impact from individual footsteps. Faster movement produces larger but still coherent bumps. The camera has inertia: movement accelerates, overshoots slightly, and settles rather than changing direction instantly. Framing is reactive and imperfect. The subject may drift toward the edge of frame, lose ideal headroom, or move briefly off-centre before the operator corrects.

When the subject changes direction unexpectedly, the camera reacts slightly late. The operator makes a quick physical pan, briefly overshoots the subject, then corrects back into usable framing. These corrections are short, imperfect, and visibly connected to the operator trying to keep up. Avoid random high-frequency vibration, floating gimbal motion, mechanically perfect tracking, or constant uniform shake.

The built-in optical zoom is used occasionally and deliberately, as an early-2000s camcorder operator would use a rocker zoom. During an optical zoom, the camera itself does not move toward the subject. Instead, the field of view progressively narrows or widens from the existing camera position. A zoom-in visibly enlarges the subject while compressing the apparent spacing between foreground and background, reducing the amount of environment visible around them. Background objects appear larger relative to the subject, and the shot feels flatter and more telephoto. A zoom-out progressively reveals more surrounding space and restores a wider, deeper-looking perspective.

Optical zooms have visible duration and mechanical continuity. They do not snap instantly between focal lengths. Use short uneven rocker-zoom behaviour: the zoom begins, gathers speed, may ease or hesitate slightly as the operator adjusts pressure, then stops. The operator may make a small framing correction immediately after the zoom because the tighter field of view makes handheld errors more noticeable. At longer focal lengths, the same physical hand movement creates visibly larger image displacement, so handheld shake becomes slightly more pronounced on screen.

Use optical zoom only when the operator appears to be trying to inspect, isolate, or reacquire something in the scene. A typical behaviour is: the operator follows the subject at a moderate wide angle, notices an important action, performs a short optical zoom-in to tighten the framing, struggles slightly to keep the subject centred because the zoom magnifies shake, then either holds the tighter frame or zooms back out when the subject begins moving unpredictably.

The zoom must read as a focal-length change, not as a dolly or push-in. During a zoom, perspective relationships remain substantially fixed because the camera position does not change. During physical handheld movement, perspective and parallax change because the camera itself is translating through space.

Preserve the spontaneous observational feeling of candid early-2000s MiniDV footage: reactive operator decisions, imperfect composition, occasional late reframing, visible body-driven camera movement, short rocker zooms, inconsistent but believable framing, and close physical proximity to the subject.

overall_soundscape: Natural location sound captured through a small consumer camcorder microphone. Slightly thin digital-video audio character, close footsteps, clothing movement, local voices, environmental ambience, and occasional handling bumps synchronized with stronger camera impacts. Very subtle mechanical camera handling noise may accompany a pronounced optical zoom.

non_diegetic_music: N/A.

## Decision rules

- The style is the default camera behaviour unless the user's scene facts
  require otherwise. When the user names specific camera work (for example "slow
  dolly"), preserve the user's request but keep the MiniDV look and audio
  character.
- Optical zoom applies only when the operator would plausibly inspect, isolate,
  or reacquire something. Do not zoom just to vary the framing.
- Imperfection is the style, not a bug: reactive framing, late corrections,
  visible inertia, and short rocker zooms belong in every prompt using this
  overlay.

## Creative freedom

You choose secondary detail, subject action, and scene content. The user's
facts and the H3 format always win; the overlay supplies the look, movement,
zoom, and sound language only.

## Failure modes

- Drifting from MiniDV into modern cinema, film emulation, or VHS language.
- Constant uniform shake or floating gimbal motion instead of body-driven
  handheld inertia with late, imperfect corrections.
- Writing a zoom that reads as a dolly or push-in (perspective must stay fixed;
  only the field of view narrows or widens).
- Zooming without an in-scene reason (inspect, isolate, reacquire).
- Adding camera movement or framing the user explicitly requested differently
  (for example "slow dolly") without preserving that request.
- Describing the footage as "perfect" or "stable" anywhere.

## Final validation

Before output, confirm: the opening style statement names early-2000s consumer
MiniDV footage; handheld motion is body-driven with inertia and imperfect,
late framing corrections; any zoom is an optical rocker zoom with visible
duration and a plausible operator motive; the audio character and optional
handling noise are present; the user's own camera-work requests are preserved.

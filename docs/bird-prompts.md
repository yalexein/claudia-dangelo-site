# Photorealistic Bird Prompts

These prompts are for the four white wagtail frames expected by `src/components/WindowBird.astro`.

For a generation workflow with reference-frame consistency, use `docs/bird-prompts-production.md`.

## Style lock

Use this invariant block for every generation so the frames remain swappable:

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Subject: white wagtail / ballerina bianca, full body, side profile, elegant proportions
Style/medium: photorealistic editorial wildlife photography
Lighting/mood: soft natural window light from upper left, gentle realistic shadowing, crisp feather detail, no harsh flash
Color palette: pearl white plumage, cool light greys, charcoal-black cap and bib, subtle warm shadow tones
Composition/framing: bird centered, same camera angle and scale across all frames, enough empty space around tail and beak, transparent background
Materials/textures: realistic feather layering, visible fine feather edges, natural beak and legs, no painterly strokes, no illustration look
Constraints: keep the exact same species, camera angle, lighting direction, scale, and crop for every frame; transparent background; no floor shadow baked into the image; no text; no watermark
Avoid: extra birds, branches, props, environment, heavy blur, cartoon look, exaggerated colors, broken anatomy, clipped tail, clipped feet
```

## `bird-idle.webp`

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: a photorealistic white wagtail / ballerina bianca standing still in a calm idle pose
Subject: full-body white wagtail, side profile, beak closed, both feet visible, relaxed but alert posture
Style/medium: photorealistic editorial wildlife photography
Lighting/mood: soft daylight from upper left, refined feather detail, natural realistic shadow transitions
Color palette: pearl white, soft cool greys, charcoal black markings
Composition/framing: centered subject, same angle and scale as the other frames, transparent background
Constraints: keep the bird elegant and slender; transparent background; no text; no watermark
Avoid: open beak, flying pose, blurred wings, branch, grass, extra objects
```

## `bird-look.webp`

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: the same photorealistic white wagtail in a subtle looking pose for a quiet alert moment
Subject: same full-body white wagtail, side profile, very slight head turn and neck lift, beak closed, feet aligned exactly like the idle frame
Style/medium: photorealistic editorial wildlife photography
Lighting/mood: same soft daylight from upper left, same contrast and feather fidelity as the idle frame
Color palette: pearl white, cool greys, charcoal black markings
Composition/framing: same crop, scale, lens feel, and transparent background as the idle frame
Constraints: preserve exact pose family of the idle frame with only a small head-and-chest variation; no text; no watermark
Avoid: dramatic body change, open wings, open beak, different camera angle, different scale
```

## `bird-flight.webp`

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: the same photorealistic white wagtail in a lateral in-flight pose suitable for side-to-side motion in a website scene
Subject: full-body white wagtail, side profile, body stretched slightly forward, wings partially open, tail extended, feet tucked naturally
Style/medium: photorealistic editorial wildlife photography
Lighting/mood: same upper-left daylight, realistic feather shadows, crisp edges
Color palette: pearl white, cool greys, charcoal black markings
Composition/framing: centered transparent-background cutout, same scale family and angle as the perched frames
Constraints: keep the bird readable at small size; transparent background; no text; no watermark
Avoid: front-facing pose, dramatic wing spread, motion blur, background, branch, over-stylization
```

## `bird-chirp.webp`

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: the same photorealistic white wagtail in a short chirping pose
Subject: full-body white wagtail, side profile, beak open slightly, chest lifted a little, feet aligned with the idle frame
Style/medium: photorealistic editorial wildlife photography
Lighting/mood: same soft daylight from upper left, same feather detail and realism as the idle frame
Color palette: pearl white, cool greys, charcoal black markings
Composition/framing: same crop, same scale, transparent background
Constraints: change only the pose needed for chirping; keep anatomy realistic; no text; no watermark
Avoid: fully screaming beak, exaggerated cartoon expression, wing spread, different lens angle, different crop
```

## Final check before keeping a frame

- Tail and feet are not clipped
- Lighting direction matches all other frames
- Scale is consistent across all four files
- The bird reads clearly even at small website size
- Transparent background is clean and fringe-free

# Production-Ready Bird Prompt Pack

This version is meant for actual generation runs, with a workflow that reduces drift between frames.

For the first master frame, use `docs/bird-idle-final.md`.

## Recommended workflow

1. Generate `bird-idle.webp` first until the species, light, and crop feel right.
2. Use the approved idle frame as a reference image for the other three frames.
3. Generate `bird-look.webp` with only a tiny head/chest variation. Use `docs/bird-look-final.md`.
4. Generate `bird-chirp.webp` with only a slight beak-open change. Use `docs/bird-chirp-final.md`.
5. Generate the flight cycle last, keeping the same side profile, lens feel, and scale family. See `docs/bird-flight-cycle.md`.

## Master base prompt

Use this as the base for every run:

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: a photorealistic white wagtail / ballerina bianca prepared as a clean transparent-background sprite for a refined literary website
Subject: full-body white wagtail, elegant and slender, side profile, realistic proportions, delicate legs, natural beak, tail fully visible
Style/medium: photorealistic editorial wildlife photography, natural-history magazine quality
Scene/backdrop: transparent background, no branch, no environment, no prop
Composition/framing: centered subject, full body entirely visible, consistent crop, same camera angle and same apparent lens across all frames, a little breathing room around tail and beak
Lighting/mood: soft natural daylight from upper left, gentle dimensional shadowing on feathers, subtle realistic contrast, no hard studio flash
Color palette: pearl white, off-white, soft cool greys, charcoal-black cap and bib, restrained natural tones
Materials/textures: crisp feather separation, realistic feather layering, clean feather edges, natural leg texture, subtle beak sheen
Constraints: transparent background, no baked floor shadow, no text, no watermark, no extra birds, no props, no branch, no clipping on tail or feet, realistic anatomy only
Avoid: cartoon look, illustration, painterly texture, surreal color, over-sharpening, excessive blur, dramatic action pose, front-facing bird, broken feet, clipped silhouette
```

## Prompt 1 — `bird-idle.webp`

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Primary request: create the master idle frame for a photorealistic white wagtail / ballerina bianca
Subject: full-body white wagtail in side profile, perched and still, beak closed, relaxed but attentive posture, both feet clearly visible, tail fully visible
Style/medium: photorealistic editorial wildlife photography
Scene/backdrop: transparent background only
Composition/framing: centered, clean silhouette, same scale to be reused for matching frames later
Lighting/mood: soft daylight from upper left, elegant and natural, crisp feather detail
Color palette: pearl white plumage, cool light grey back, charcoal-black cap and bib
Constraints: this is the reference frame for all later variations; transparent background; no text; no watermark
Avoid: open beak, wing spread, motion blur, branch, dramatic movement, clutter
```

## Prompt 2 — `bird-look.webp`

Use the approved `bird-idle.webp` as a reference image.

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Input images: Image 1: reference image for pose, scale, crop, lighting, and species consistency
Primary request: create a second frame of the same white wagtail with only a subtle attentive look
Subject: same bird, same side profile, same body scale, very slight head turn and gentle chest lift, beak closed, feet aligned to the idle frame
Style/medium: photorealistic editorial wildlife photography
Scene/backdrop: transparent background only
Composition/framing: match the reference frame as closely as possible; same crop, same size, same angle
Lighting/mood: identical upper-left daylight and shadow softness as the reference image
Constraints: change only the small pose detail needed for a quiet alert look; preserve species markings, crop, lighting, feather realism, and silhouette continuity; no text; no watermark
Avoid: different camera angle, different scale, open wings, open beak, strong pose change, extra environment
```

## Prompt 3 — `bird-chirp.webp`

Use the approved `bird-idle.webp` as a reference image.

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Input images: Image 1: reference image for pose, scale, crop, lighting, and species consistency
Primary request: create a chirping variation of the same white wagtail
Subject: same full-body white wagtail, same side profile, slight beak opening, tiny chest lift, perched pose, feet aligned with the idle frame
Style/medium: photorealistic editorial wildlife photography
Scene/backdrop: transparent background only
Composition/framing: match the reference image very closely; same crop, same scale, same angle
Lighting/mood: identical soft daylight from upper left, same contrast and same realistic feather rendering
Constraints: change only the pose needed for a short natural chirp; keep the bird elegant and anatomically realistic; no text; no watermark
Avoid: exaggerated open beak, dramatic expression, wing movement, camera change, scale drift, added objects
```

## Prompt 4 — `bird-flight.webp`

Use the approved `bird-idle.webp` as a reference image.

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Input images: Image 1: reference image for species, crop family, lighting, and realism
Primary request: create an in-flight lateral frame of the same white wagtail for side-to-side movement on a website
Subject: same white wagtail, same side profile, body stretched slightly forward, wings partially open in a controlled mid-flight pose, tail extended, feet tucked naturally
Style/medium: photorealistic editorial wildlife photography
Scene/backdrop: transparent background only
Composition/framing: centered transparent cutout, same overall scale family and same lens feel as the perched frame
Lighting/mood: same upper-left daylight, same feather realism, same restrained color palette
Constraints: keep the silhouette readable at small size; preserve species markings and realism; transparent background; no text; no watermark
Avoid: extreme wing spread, motion blur, front angle, different lighting, different crop logic, dramatic background
```

## Quick reject rules

Reject a frame if any of these happens:

- the feet shift too much between perched frames
- the tail gets clipped or shortened
- the bird becomes too fluffy, too dark, or too stylized
- the cap/bib markings change shape too much
- the background edge shows halos or dirty transparency
- the camera angle changes enough that swapping frames causes a jump

## Suggested filenames after approval

- `public/images/landing/bird/bird-idle.webp`
- `public/images/landing/bird/bird-look.webp`
- `public/images/landing/bird/bird-chirp.webp`
- `public/images/landing/bird/bird-flight.webp`

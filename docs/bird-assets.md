# Bird Asset Spec

Use these filenames for the photorealistic white wagtail frames used by `src/components/WindowBird.astro`.

Detailed generation prompts live in `docs/bird-prompts.md`.

- `public/images/landing/bird/bird-idle.webp`
- `public/images/landing/bird/bird-look.webp`
- `public/images/landing/bird/bird-flight-1.webp`
- `public/images/landing/bird/bird-flight-2.webp`
- `public/images/landing/bird/bird-flight-3.webp`
- `public/images/landing/bird/bird-flight.webp`
- `public/images/landing/bird/bird-chirp.webp`

## Direction

- Species: white wagtail / ballerina bianca
- View: side profile, full body, transparent background
- Lighting: soft natural window light from upper left
- Rendering: photorealistic, editorial nature photography
- Palette: white and pearl grey plumage, charcoal-black bib and cap, subtle warm shadowing
- Camera feel: 85mm wildlife portrait look, shallow but not blurry detail, crisp feather edges

## Per-frame notes

- `bird-idle.webp`: perched, beak closed, neutral pose
- `bird-look.webp`: perched, slight head turn / alert posture
- `bird-flight-1.webp`: takeoff / first wing position
- `bird-flight-2.webp`: mid flap / strongest wing change
- `bird-flight-3.webp`: recovery wing position before loop
- `bird-flight.webp`: optional single fallback in-flight frame
- `bird-chirp.webp`: perched, beak open for a short chirp pose

## Important constraints

- Keep the same scale, angle, lens feel, and light direction across all frames
- Keep feet aligned so swapping frames does not jump visually
- Export with transparent background and no baked floor shadow
- Keep the bird centered with a little negative space around tail and beak

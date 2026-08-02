# Design QA — landing collage

## Comparison target

- Source visual truth: Browser Comment 1 screenshot, `browser:Canvas immagini`, captured from `canvas-immagini-pubblica.html`.
- Source viewport: 1089 × 863 CSS px.
- Source screenshot: 1280 × 1015 px as supplied in the browser comment (browser marker overlay ignored).
- Primary implementation screenshot: `output/home-qa/05-implementation-1089x863.png`.
- Implementation viewport and pixels: 1089 × 863 CSS px, 1089 × 863 px, device density 1.
- State: day theme, initial landing state, no hover or focus active.

## Full-view comparison evidence

The eight original raster assets, their overlap order, rotations, crops, and visible collage silhouette match the supplied reference. The requested product changes are intentional: the paper pattern is removed, the page background is pure white, the collage is centered on its visible bounds, and the complete composition fits inside the viewport instead of remaining right-aligned and vertically cropped.

Responsive evidence:

- Desktop: `output/home-qa/01-desktop-1440x900.png`.
- Tablet: `output/home-qa/02-tablet-768x1024.png`.
- Mobile: `output/home-qa/03-mobile-390x844.png`.
- Night theme: `output/home-qa/04-night-desktop-1440x900.png`.

No focused crop was required: the page contains one centered visual object with no visible typography, iconography, controls, or separate detail regions; all eight image edges and overlaps are legible in the full-view captures.

## Required fidelity surfaces

- Fonts and typography: no visible typography is part of the landing composition. The hidden navigation help does not affect visual fidelity.
- Spacing and layout rhythm: visible collage bounds are centered within 6 px or less across tested viewports. No layer is clipped at 1440 × 900, 1089 × 863, 768 × 1024, or 390 × 844.
- Colors and visual tokens: day background is `rgb(255, 255, 255)`; forced night verification is `rgb(0, 0, 0)`. The collage colors and source-image opacity are preserved.
- Image quality and asset fidelity: all eight supplied PNG assets are reused directly. All load with non-zero natural dimensions; no placeholders, generated substitutes, CSS drawings, or SVG approximations are present.
- Copy and content: page title, description, and accessible navigation labels are coherent and do not add visible copy to the artwork.
- Icons: none are present in the selected visual target.
- States and interactions: the Contatti layer exposes the original `glow` hover and `pulse` click effect; keyboard activation of the Bio layer navigates successfully to `/bio/`.
- Accessibility: all eight navigational layers are keyboard reachable, have accessible labels, show a focus ring, and respect `prefers-reduced-motion`.

## Findings

No actionable P0, P1, or P2 differences remain. The background and positioning differences from the source are the explicit requested redesign.

## Comparison history

- Initial implementation pass: all eight assets rendered at the correct relative positions and z-order. Desktop, tablet, mobile, night theme, hover, keyboard navigation, image loading, and console errors were checked. No P0/P1/P2 visual rework was required.

## Primary interactions tested

- Pointer hover over the Contatti image activates `is-shape-hover` with `glow`.
- Keyboard Enter on the Bio image navigates to `http://localhost:4321/bio/`.
- Browser console errors on the final landing capture: none.

## Final result

final result: passed

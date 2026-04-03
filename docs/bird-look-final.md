# Final Look Prompt

Use this only after `bird-idle.webp` has been approved.

## Paste-ready prompt

Use the approved `bird-idle.webp` as a reference image.

```text
Use case: photorealistic-natural
Asset type: interactive website sprite frame with transparent background
Input images: Image 1: approved bird-idle.webp reference for species, crop, scale, lighting, and silhouette consistency
Primary request: create a second frame of the same photorealistic white wagtail / ballerina bianca with only a subtle attentive look
Subject: the same full-body white wagtail, same side profile, beak closed, both feet visible, tail fully visible, only a slight head turn and tiny chest lift, elegant alert posture
Style/medium: photorealistic editorial wildlife photography, refined and natural
Scene/backdrop: transparent background only, no branch, no ground, no environment, no prop
Composition/framing: match the reference image as closely as possible, same crop, same scale, same lens feel, same silhouette family, same centered placement
Lighting/mood: identical soft daylight from upper left, same contrast level, same realistic feather shadows, no dramatic relighting
Color palette: same pearl white plumage, cool grey back and wings, charcoal-black cap and bib
Materials/textures: same feather realism, same clean cutout edges, same delicate legs and natural beak texture
Constraints: change only the small pose detail needed to suggest a quiet attentive glance; preserve species markings, anatomy, scale, crop, light direction, and transparency; no text; no watermark
Avoid: open beak, wing spread, different camera angle, different scale, strong body rotation, front-facing head, exaggerated expression, dirty transparency, added objects
```

## Tightened variant

Use this if the model changes too much:

```text
Keep the bird almost identical to the reference idle frame. Change only the head and upper chest slightly to create a subtle attentive look. Keep beak closed, feet aligned, tail aligned, crop identical, scale identical, lighting identical, transparent background, no stylization.
```

## Recovery prompts

### If the head turns too much

```text
Reduce the head turn so it feels like only a tiny attentive glance, not a new pose. Keep the body almost identical to the reference frame.
```

### If the feet or tail jump

```text
Match the foot placement and tail position much more closely to the reference idle frame so the sprite swap feels stable.
```

### If the light changes

```text
Restore the exact same soft upper-left daylight and the same feather shadow pattern as the reference image.
```

## Approval checklist

- reads as the same exact bird as `bird-idle.webp`
- only a tiny pose change is visible
- beak stays closed
- feet alignment is stable
- tail alignment is stable
- crop and scale match the idle frame
- transparent cutout stays clean

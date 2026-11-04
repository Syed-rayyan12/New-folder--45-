# Mockup assets

- Supplied original, unchanged: `public/images/tank.png`.
- Generated additional asset: `public/mockups/studio-tank-front.png`.
- Generation method: built-in ImageGen, with true transparency. The supplied tank was used as a silhouette/style reference.
- Main studio and enlarged view now both rotate the original supplied image with CSS perspective, mouse hover tilt, drag rotation, wheel zoom and double-click reveal replay. No generated mesh replaces the photograph. A single front photograph remains a plane during rotation; its reverse is the same image viewed from behind, not a captured garment back.
- The user-supplied tank, hoodie, long-sleeve images and coat are in the palette. The previously generated studio tank remains on disk but is excluded from the selector.

## Final generation prompt

Use case: product-mockup. Asset type: transparent garment PNG for a real-time apparel customizer. Input image 1 is a silhouette/style reference, not an edit target. Generate ONE photorealistic premium heavyweight cotton sleeveless tank, straight-on front view, isolated with genuine transparent background. Preserve the reference's broad dropped shoulders, crew neck, straight body and sleeveless cut. Neutral light gray fabric so the app can recolor it in real time. Real cotton weave, subtle seams and ribbed collar, natural sculptural folds, softly inflated ghost-mannequin volume, believable studio highlights and gentle fabric shadow. Entire garment visible, centered, nearly filling a portrait frame with modest transparent margin. No person, mannequin, hanger, props, floor, background, text, logo, emblem, watermark, or extra garments. Keep the chest clear for the application's separately rendered sacred geometric emblem. A single front-facing garment only, polished high-resolution product photography.

Current selection: exactly three original images (tank, hoodie, transparent long sleeve). Mouse rotation is limited to a 260-degree arc (-130 to +130), with image-based carousel selection and clip-path reveals.

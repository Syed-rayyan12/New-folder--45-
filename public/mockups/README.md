# Garment mockups

Add transparent front-facing PNG or WebP garment images here. The garment studio discovers them through `/api/mockups`; click **Refresh images** in its bottom palette after adding files. Subfolders up to two levels are supported. JPEG/AVIF also work, but their backgrounds remain visible.

The original supplied tank stays at `/images/tank.png`. `studio-tank-front.png` is a previously generated reference, retained on disk and excluded from the active palette. The palette uses the supplied originals, including hoodie.png and the long-sleeve images.

Transparency bounds are detected in the viewer so padded source PNGs fill the product stage. Garment colors and the unique emblem are rendered live, not baked into the source image.

The main and enlarged previews both animate the original image with mouse hover tilt, drag rotation, wheel zoom and double-click reveal replay. One front image rotates as a flat photograph; actual back/side views require additional photographs.

Current selection: exactly three original images (tank, hoodie, transparent long sleeve). Mouse rotation is limited to a 260-degree arc (-130 to +130), with image-based carousel selection and clip-path reveals.

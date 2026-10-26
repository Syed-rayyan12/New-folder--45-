# Reference globe and cinematic background

The active globe is a React Three Fiber port of [GhostCatcg/3d-earth](https://github.com/GhostCatcg/3d-earth).
Its Earth texture, Fresnel/scan shaders, glow/atmosphere, pulsing location effects,
flight trails and satellite rings have been adapted to the existing radius-2 scene.
The MIT license and original copyright are retained in
`public/vendor/ghostcat-earth/LICENSE`. A copy of the downloaded upstream source
is in `.reference/3d-earth` for comparison.

English canvas labels replace the original Chinese labels. They remain GPU sprites
with depth testing, rather than dozens of DOM overlays or html2canvas captures.
The geographic conversion matches the upstream `lon2xyz` convention. Existing
location selection, custom coordinates, route, random emblem and garment flow
continue to use the application's store and canvas.
The original 6000×3000 Earth map is retained for attribution and comparison, but
the renderer loads optimized 4096×2048 desktop or 2048×1024 mobile JPEG copies to
reduce network transfer and GPU texture memory. If an optimized image fails to
load, the loader automatically retries the original local JPEG.

The active background library uses 40 native HD astronomy images from ESO, ESA/Hubble and ESA/Webb. See galaxy-background-library.md and the per-image source credits in lib/galaxy-backgrounds.ts. A native DOM image layer keeps the sky independent of the 3D canvas resolution.

The earlier generated artwork is retained as a legacy asset. Its generation prompt follows for provenance.

## Final image generation prompt

Use case: stylized-concept. Asset type: ultra-wide website background texture behind an interactive 3D Earth. Create an original premium cinematic science-fiction deep-space vista, high-budget space-film visual effects quality. A physically rich sweeping Milky Way dust river arcs diagonally from lower left to upper right, with finely resolved star clouds, intricate dark dust filaments, wispy volumetric nebulae, dense tiny distant stars at varied depths, one small distant spiral galaxy near the upper-right region. Palette: near-black midnight navy and charcoal, predominantly silver-white starlight and luminous ice-blue cloud edges, very restrained pale teal and muted violet buried in the dust. Dramatic natural depth, high dynamic range, tasteful filmic contrast, real astronomical scale. Keep middle-left and center relatively dark and spacious so an opaque large blue Earth added by the website can read cleanly in front. Outer edges mostly near black. Not a flat gradient, not chunky procedural clouds, no giant starbursts, no planets, no Earth, no spaceship, no superheroes, no text, no logos, no UI, no border, no watermark. Landscape 16:9 or wider, detailed background asset.

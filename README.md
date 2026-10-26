# PRVLG — The Origin Project

Interactive globe experience with origin and destination selection and a personal celestial emblem.

Run `pnpm dev` or `pnpm build` and `pnpm start`.

PRVLG components are active again. The overwritten stylesheet was reconstructed. The replaced homepage, layout, styles, and README are saved in `.backups/natural-web-studio`.

After both coordinates are selected, Reveal my emblem draws the crest. Its actual completion triggers a short hold, a Three.js transfer onto the first garment, and the garment world. Collection includes three procedural 3D garment concepts. Heritage and Journey use the selected locations; Archive selects looks. Slider arrows, dots, arrow keys, and horizontal swipes change the look. Garments move on a continuous perspective carousel, including wraparound. Back to my globe preserves coordinates; Begin a new journey clears them.

Validation: `node .tools/check-garment-world.cjs`, `node .tools/check-globe.cjs`, and `pnpm build`. Desktop and mobile browser checks are scripted in `.tools/browser-garment-world.cjs`, but this sandbox blocks Chrome startup with a Windows access-denied error.

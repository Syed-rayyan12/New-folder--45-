# Night background library

40 locally hosted astronomy backgrounds cover ten themes. Official ESO, ESA/Hubble and ESA/Webb publication images replace the previous low-resolution sources. Each desktop crop is at least 1920x1080 and up to 3840x2160, without upscaling. The manifest records source dimensions, image credits and original URLs.

Desktop, portrait mobile and 640x360 preview JPEGs are stored in public/images/galaxy-backgrounds. The picker displays actual desktop dimensions and HD/QHD/4K badges. Full-size images load only when selected; thumbnails load lazily.

The background is a native-resolution DOM image behind the transparent 3D canvas. Its sharpness is independent of the globe canvas DPR. A decoded image replaces the previous sky only after loading succeeds. Failed requests retain the previous image.

Keep this background saves the selection; Escape or X cancels preview. Stable IDs preserve existing preferences.

Validation: .tools/check-hd-backgrounds.cjs checks all 120 JPEGs, native dimensions, no upscaling, distinct images and ten themes. .tools/check-galaxy-http.cjs checks HTTP availability.

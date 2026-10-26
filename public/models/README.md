# Intro human asset

The intro first tries `/models/intro-man.glb`, then races the official Three.js, GitHub raw, and jsDelivr mirrors of `Soldier.glb`. It validates the GLB header before rendering and shows Retry / Continue controls if loading fails.

The official Three.js skeletal animation example credits this textured human and its Walk/Idle clips to Mixamo: https://threejs.org/examples/webgl_animation_skinning_blending.html.

Outbound downloads are blocked in this workspace, so no human model binary is bundled. To remove runtime network dependency, place an appropriately licensed human GLB containing Walk and Idle clips at `public/models/intro-man.glb`. The local asset is used automatically.

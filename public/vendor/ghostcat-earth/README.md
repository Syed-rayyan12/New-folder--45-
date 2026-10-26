Globe rendering and assets adapted from https://github.com/GhostCatcg/3d-earth
Original author: GhostCat. Copyright 2022. MIT license included as LICENSE.

Ported to React Three Fiber and current Three.js: Earth texture and scanning/Fresnel
shaders, glow sprite, atmospheric rim, light pillars, pulse markers, orbit rings,
satellites, and moving flight trails. City labels are generated in English from
canvas text; no Chinese label rasterization or html2canvas dependency is used.
The site's existing coordinates, selected route and emblem/garment flow are retained.
The upstream uninitialized fragment color is initialized explicitly, and dot
positions use a uniform Fibonacci distribution. Assets are served locally.

# WISH WORLD V10.0 — Foundation (beta)

- Effects-first adaptive quality: three independent effect tiers, mobile balanced starts at light; low FPS reduces effects before resolution, sustained severe slowdown allows emergency pixel reduction. Recovery restores pixels before effects, bounded by GPU and pixel budgets. No guaranteed FPS or resolution.
- Instanced static riverbank and bridge meshes by 24-unit cells; original transforms, shared materials, collision and animated lanterns retained. Reduces potential draw submissions; actual impact requires measurement.
- Lightweight river material in light/minimal tiers, disable optional reflections in those tiers, reduce distant scenery/grass and ancillary birds, ripples, foam and rain; keep local avatar geometry and increase near-detail threshold for peers.
- Performance dialog and diagnostic copy, including actual canvas/CSS dimensions, FPS, p95, draw calls, triangles, effect tier and CPU-side render submission duration (not GPU timing).
- 15 inline scripts parsed and 5,764 pure-policy cases passed during development. Committed reproducible Node test; not a browser/GPU test. No backend behavior or database schema change, no physical device tests.
- NEXT-GENERATION-ROADMAP.md records all outstanding roadmap gates. Professional new skeletal assets, expanded map, shared 3D home, boats/passengers, WebSocket, durable database and commercial release are not delivered in this patch.

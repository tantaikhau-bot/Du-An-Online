# WISH WORLD V7.2 — Smooth World

- Cooperative pathfinding: player and NPC searches yield periodically and share a roughly 3 ms per animation frame budget; player requests are prioritized and canceled on manual movement, zone changes or obstacle changes. Direct unobstructed movement remains synchronous. A single generator slice can exceed the budget.
- Static market and city meshes are grouped into instanced draws by geometry/material/shadow flags. Distant regional props hidden by quality; fewer radial segments in character limbs; cape normals updated less often. Garden cleanup avoids disposing shared crown geometry and removes stale references.
- Explicit performance mode targets 30 FPS maximum on a typical 60 Hz display to reduce load, not a guaranteed minimum. Normal mode remains uncapped. Diagnostics record P95 frame interval, slow frames, queued routes and static draw calls saved.
- Includes V7.1 performance improvements. 15 inline JS scripts parsed. Four synthetic obstacle/river routes passed, with 225 cooperative yields and walkable segments. Real-device rendering, frame rate and multiplayer not tested.

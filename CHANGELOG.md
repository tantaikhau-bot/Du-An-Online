# WISH WORLD — Release history

## V10.3 — Anime Portrait
- Close-up face preview in atelier, expressive mouth width and secondary motion on hair strands.
- Fix CI runner compatibility with the pinned browser test.
- Preview deployment is isolated from production and uses disposable test data.

## V10.2 — Anime Fantasy
- Revised male/female procedural character proportions, toon materials, face geometry, eyes, hair and layered outfits.
- Added facial expressions, softer gait, jump preparation/landing, and atelier preview controls.
- Includes the V10.1 infrastructure changes. Visual quality and mobile performance still require device validation.

## V10.1 — Stability / Infrastructure Beta
- HTTP HEAD and favicon fixes, connection cleanup, mobile render policy and safe-area improvements.
- Database snapshot and migration rehearsal tooling, verified rewards, optional WebSocket bridge, local asset packaging and CI load tests.
- Production PostgreSQL migration and deployment remain pending.

## V10.0 — Foundation
- Effects-first adaptive graphics, shared world, and outdoor pinch zoom.

## Release convention
For each user-visible update, increment the release version (patch for fixes, minor for feature releases, major for major changes).
Synchronize the version and build ID in server.py (/api/version), index.html (BUILD62, title, HUD, menu, footer and photo watermark), landing.html and regression tests. Preserve old entries in this changelog. Never reuse a version for a different released build. Distinguish source/CI builds from the version actually deployed to Render. Do not claim deployment until Render confirms it.

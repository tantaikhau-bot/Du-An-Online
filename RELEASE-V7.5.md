# WISH WORLD V7.5 — Stability

- Fixes the fullscreen-height FPS overlay: all positioning is in CSS, mutually exclusive inset values, 22px mobile height, bounded width, accessible button; can hide/show in settings or mobile menu. Suppressed during editing, photos, building, interiors and drawer. Adds a locally persisted quest collapse option.
- Mobile balanced mode avoids MSAA overhead (HD retains MSAA if supported), adjusts resolution thresholds to mobile, does not downscale merely because FPS is 34, and slows recovery after a downshift. Low-end devices may still reduce resolution. Retains explicit HD and performance modes.
- Idle public presence polls at approximately 1.5 seconds instead of 750ms, retains faster polling while moving/near peers/active interactions. Handles expired login and non-JSON server errors with clearer feedback. No protocol or persistent-data migration.
- 15 inline scripts parsed, six synthetic quality decisions and three static HUD regression checks passed. No physical device or browser layout/runtime FPS test performed. Render free data remains ephemeral; export progress before deploying.

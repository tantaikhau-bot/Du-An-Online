# WISH WORLD V7.1 — Performance

- Mobile/low-memory devices default to low quality, no MSAA, no dynamic shadows. Dedicated /play?perf=1 enables low/basic graphics. Desktop defaults to medium; high is opt-in.
- Adaptive render-pixel budget and resolution, fewer terrain and character triangles, spatial forest batches with distance culling, lower grass density and peer LOD. Reflection and photo textures are opt-in.
- Shadow map updates throttled, smaller maps, heavy landscape work throttled, far wildlife skipped, stale forest canopy references released. Collision grid accelerates navigation while preserving geometry checks. Quality preference migrated to a new key.
- 15 inline JS scripts parsed; 19,952 synthetic indexed-vs-unindexed collision checks passed. No real-device FPS or browser profiling performed. Visual detail reduced in low mode; actual performance depends on GPU, drivers and device.
- Existing multiplayer features retained. No server protocol change except version metadata.

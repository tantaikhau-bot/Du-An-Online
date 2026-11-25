# WISH WORLD V7.4 — Crystal Clear

- Fixes low render-resolution ceiling in V7.3: standard mode starts at up to 1.25 CSS pixel ratio and raises resolution gradually after stable FPS, even at low effects quality. Normal low-effects budget 1.8M pixels, max ratio 2.25; actual size bounded by DPR, GPU limits and frame timing. HD mode /play?hd=1 starts at up to 2x, max 3M pixels, still adapts in auto graphics. Performance mode remains low-budget. Manual quality disables adaptation.
- Standard renderer enables MSAA where supported; alpha-to-coverage for foliage; improved radial subdivisions for character meshes; stronger road texture anisotropic filtering. No external photos required.
- Displays actual render dimensions and FPS, removes overlapping mobile status bar, preserves touch HUD and multiplayer.
- 15 inline JS scripts parsed; 3375 synthetic resolution/budget combinations passed. No on-device visual, frame-rate or GPU runtime verification.

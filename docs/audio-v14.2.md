# V14.2 audio acceptance

Local regression commands: python -m unittest test_stability test_asset_cache, node test_stability.cjs, node test_graphics100.cjs. These check the release identity, inline syntax, game policy, dynamics and mobile budgets.

Device acceptance requires listening on Android and iOS, suspending and restoring the browser, switching region, testing two nearby accounts and repeating the same route with sound enabled and muted. Record frame-time distribution, heap and device model alongside the baseline. Hardware performance remains unverified.

Chromium 133, emulated landscape 844 × 390, DPR 3, touch enabled: all eight mixer controls present, master volume 45% persisted across reload, mute suspended the context, repeated dungeon revision produced no extra voice, and 80 concurrent landing requests stayed within the ten-voice limit. No page exceptions in this test. Run test_audio142.cjs against a local server to reproduce.

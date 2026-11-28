# V35.2.1 — Startup Recovery Hotfix

Reported first-frame failure: WWDay.atmosphere3513 is not a function. The old daylight.js?v=2740 URL could reuse cached pre-3513 content. All classic scripts now use the release cache key, local JS must revalidate using ETag, and the two new lighting functions have bounded legacy fallbacks. Tests cover browser global exports and the stale-module path. Live device verification is required.

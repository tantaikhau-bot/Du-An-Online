# Infrastructure beta

- Legacy Sao/XP remain offline-compatible and must not be used for paid or competitive
  rewards. Save validation limits depth and size; anomalous deltas are recorded, not blocked
  (legitimate offline sessions can produce large increases). Existing Pha le wallet is
  already server-owned. New /api/verified/status and POST /api/verified/claim grant a separate
  10-point daily balance (UTC), idempotent per account/day. Never convert legacy Sao into
  this wallet. No real-money payment enabled.
- PostgreSQL: see migration/README.md. Runtime SQL conversion and live migration not complete.
- Optional presence gateway: install requirements-realtime.txt, set
  WISH_PUBLIC_ORIGIN=https://your-game-host, run python realtime_gateway.py.
  Open /play?ws=1. The gateway uses a private loopback HTTP backend and authenticates every
  presence request, rejects cross-origin handshakes and limits connections/messages.
  Only presence is tunneled; chat and other APIs remain HTTP. This is a bridge, not a
  server-push MMO architecture. Leave default start command unchanged until tested.
- Graphics policy and WebSocket client are extracted into assets/; other engine/UI
  functions remain in index.html. Use HTTP server rather than opening index.html directly.
- Local GLB and texture packaging: run python tools/fetch_assets.py on a build worker.
  Review SHA256 manifest, licenses and model compatibility; source links are in script
  and the in-game credits. Assets are optional and the game falls back to existing CDN
  URLs/procedural models. Three.js is still CDN-hosted. Do not assume assets are present
  on Render unless the build explicitly packages them.
- Isolated load benchmark: python load_test_local.py --players 16 --rounds 5.
  Seeds test accounts in a temporary SQLite DB and binds only loopback. Never points at
  production. Results are for the CI worker, not the capacity of Render Free.

Deployment gate: pass CI, verify live backup and database retention, then merge and
deploy. No production deployment or paid resources are part of this branch.

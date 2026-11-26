# WISH WORLD — Next Generation roadmap
Status: V10.0 Foundation beta. This file is a development specification, not a claim of completion.

| Workstream | Status at V10.0 | Acceptance gate |
|---|---|---|
| Mobile Clarity / engine | First effects-first policy, river batching, light water, diagnostics | Measure sustained FPS and resolution on low/mid/high Android and Dell G3; compare identical routes |
| Character Revolution | Existing procedural articulated avatars, optional sample GLB; near-model LOD extended | Licensed male/female rigged GLB, skinning, compatible idle/walk/run/jump/sit/wave clips, customization, mobile budgets |
| Animals and natural scenery | Existing procedural models and distance culling | Licensed assets or original models; animation, material and GPU budgets |
| Grand City | Existing town; no larger map | Chunk/sector loading, new districts, validated collision and navigation |
| Love & Home | Existing pair plan and ceremony invitations | Server-authorized shared 3D room, two-player presence, furniture revision and permission tests |
| Social Transport | Existing bicycle, motorbike, car; single rider | Water navigation, boats, explicit passenger consent, server-validated seat ownership |
| Realtime World | Existing HTTP polling and interpolation | Authenticated WebSocket, reconnect, spatial interest, rate limits, load tests, polling fallback |
| Persistent World | Existing SQLite and opt-in cloud sync | Durable storage with tested migration/rollback, backup and restore; no data loss on redeploy |
| Living Economy | Existing local Sao, jobs and NPC shops | Server-authoritative ledger and inventory, transaction idempotency, abuse tests |
| UI/UX and audio | Existing touch/desktop HUD, inventory and market | Consistent responsive flows, accessibility, sound and device testing |
| Admin and management | Existing prototype | Role permissions, audit logs, reporting and moderation tests |
| Monetization | Disabled real-money release | Durable storage, server-owned balances, payment verification, policy and legal review |
| Release | Beta only | Browser/device, multiplayer, security, load and recovery acceptance gates |

## Test matrix
- Same spawn, route, graphics mode, device and browser for before/after comparison; log FPS median/p95 frame time, canvas dimensions, draw calls, triangles and errors for at least 60 seconds.
- Test default mobile balanced, battery, and HD; portrait and landscape, browser and in-app browser. Do not promise 30/45/60 FPS until measured.
- Test all existing interaction flows, save/load/restore, two-account visibility, chat, vehicle and ceremony. Test network interruption and private-area visibility.
- Run node test_graphics100.cjs and python -m unittest discover on a checkout; run browser smoke tests before production deploy.
- Export local JSON before deploying free Render; free disk may be ephemeral. Keep payment disabled. No paid hosting/storage provisioned by this release.

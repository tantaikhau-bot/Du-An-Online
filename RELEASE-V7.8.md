# WISH WORLD V7.8 — Safe Sync

- Adds explicit opt-in, session-only automatic cloud saves after a successful manual save/load. Checks every 15 seconds, sends only changed snapshots, binds account and revision, pauses on cross-tab local storage changes, restore, logout, expired sessions or conflicts. Retries transient failures with backoff. No automatic cross-account merge or overwrite. Manual cloud save/load and JSON export remain available.
- Server returns owner ID for save GET/POST and rejects mismatched owner on writes. Owner remains optional for legacy clients. Existing optimistic revision guard retained; rejects bool/out-of-range revisions. No schema migration.
- Adds data/sync dialog, offline/online handling and round-trip request timing; leaving a shared public area receives priority on next poll. HTTP presence still used, no WebSocket.
- Includes V7.7 graphics presets. 15 inline scripts parsed and nine synthetic autosave decisions passed. No real browser, Python integration, cross-device or network/load test performed.
- Render free ephemeral SQLite storage remains a deployment risk. Export JSON before deployment; cloud sync is not durable off-site backup. Offline Sao/XP are still client-controlled; no real-money economy enabled.

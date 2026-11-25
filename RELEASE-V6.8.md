# WISH WORLD V6.8 — Shared World

- Public outdoor views now send a common area 0; visitors can see other public players without having the same menu selected. Private garden, house and build mode stop sharing presence. Explicit leave/logout removes presence; hidden or disconnected clients expire by timeout.
- 750 ms HTTP presence updates with retry backoff; heading, walking and jumping synchronized, nearest 24 rendered within 48 world units, blue/green map markers and name labels. No WebSocket or authoritative physics.
- Online roster, meeting plaza shortcut, walk to current peer location, existing friend invitation and private chat. Pair actions remain consensual. Private rooms remain separate.
- Unified release labels and API. Added backend presence tests; 15 scripts parsed. Browser multiplayer, latency and load not yet validated.

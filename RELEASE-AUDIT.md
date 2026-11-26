# Original V11.8–V13.0 roadmap audit (V13.4 candidate)
Scope: source and CI evidence, not certification on real devices. Keep original 20 VRM presets and five companion species.
| Area | Implemented / tested | Open |
|---|---|---|
| V11.8 | Five graphics presets; adaptive resolution/effects; instancing/culling; frame metrics; local load tests; V13.9 candidate mobile buffer/actor limits and 30 FPS default | Real device GPU/RAM/FPS; cache lifecycle and all-scene profiling |
| V11.9 | Speed-driven 20 motion profiles, stance IK, idle and jump, action crossfades; browser male/female smoke | Exact cloth/hand collision; full locomotion directions; sleep/lie; full roster visual review |
| V12.0 | Smooth day cycle/weather, river and bank effects, existing city lights | Full environment redesign, all collision checks, full storm effects |
| V12.1 | HTTP presence, optional gateway tested locally, peer fallback, server clock, interpolation, bounded prediction; 16/32/50 simulated local clients | Production WebSocket gateway, authoritative reconciliation, simultaneous visual clients and live load |
| V12.2 | Existing pets, taming/feeding/XP, follow/wait/recall/detour; V13.5 candidate wellbeing meters and corrected heading | Evolution, new licensed species, shared commands and full navigation |
| V12.3 | Daily route and weekly goal, existing social, craft and housing; V13.6 candidate two-player scenic route | Main/side/hidden quests, richer co-op tasks/minigames, fair ranking; V13.8 candidate five-stage solo turn-based dungeon (not 3D combat/100 stages) |
| V12.4 | Regional markers, atlas and culling; V13.7 candidate expands playable depth 144→176 and four frontier sites | Island/caves/full desert environment, asynchronous streaming, boat |
| UI/UX | Existing responsive HUD, joystick, camera controls, sound cues | Real touch-device and tablet QA, full screen visual redesign |
| V13.0 | Strict input guard, quotas, admin metrics, sandbox, verified snapshot tools | Durable storage, tested migration/restore, audit all licenses, authoritative anti-cheat, production health config |
Release gate: all CI checks, verified deployment commit and HTTP/health/logs; free filesystem is ephemeral. Do not provision paid services or activate real payments without approval.

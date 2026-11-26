# WISH WORLD — Release history

## V12.3 — Social Adventure (candidate)
- Five rotating daily scenic routes, three ordered checkpoints, per-account completion history and non-tradable badge count. Vietnamese local-day boundary; no premium currency or offline coin changes.
- Authenticated API checks current public-world presence, checkpoint distance, sequence, day and repeat attempts. Presence is still client-reported, not authoritative anti-cheat. No new player location history beyond existing presence.
- New Hành trình button in exploration HUD with progress, route guidance and check-in; accessible to existing registered players. Add test coverage for incorrect order, missing presence, duplicate, invalid reward field, account isolation and rollover.
- Existing group/social, crafting, housing and economy remain intact. Co-op quest scoring, new minigames and full server-authoritative movement are not included in this candidate.

## V12.2 — Living Pets (candidate)
- Preserve the existing five skinned GLBs and procedural fallback. Distinct follow spacing and acceleration per species, bounded movement step and short collision-checked detours. Local and remote companions use actual movement speed; no automatic snap on every blocked step. Safe reposition on initial spawn or long-distance recovery.
- Local session commands follow, wait, recall and pet reaction in animal handbook. No new reward economy, no new persistence fields; remote commands are not synchronized yet.
- Ignore async animal loads after a peer pet has been removed. Add five-species movement regressions, obstruction and safe spawn checks. Full navigation, additional authored clips and hardware visual testing pending.

## V12.1 — Real-time Multiplayer (candidate)
- Authenticated presence responses include a server clock and timestamped player snapshots. Public-world clock and weather use the server time estimate; manual weather remains available offline/private. Existing visibility and block filters remain in place.
- Eight-sample per-peer buffer, 850ms interpolation delay, shortest-angle heading, bounded 150ms extrapolation, stale stop and teleport reset. Preserve existing visible fallback and avatar/pet/vehicle state. Prediction is remote only; no authoritative movement validation.
- Retry jitter, online event reconnect and HTTP/socket diagnostics. WebSocket remains opt-in and requires separately configured gateway; current Render HTTP runtime is unchanged.
- Add pure interpolation/clock tests, presence timestamp test and isolated 16/32/50-client load tests. No production concurrency or device FPS claims.

## V12.0 — Living World (candidate)
- Six local-session weather profiles (clear, rain, fog, wind, snow, storm), automatic 100-second schedule and manual override. Smoothly blend fog, cloud, rain, snow, wind, ambient/direct light and sky tint without abrupt jumps. Storm is heavy rain/wind, not lightning simulation.
- Reuse existing rain/snow buffers with quality-dependent particle counts; fade terrain wetness and precipitation, apply wind to unbatched tree crowns and fallback hair. Existing VRM spring bones, map geometry and collisions remain untouched.
- City emissive and nearby lamp intensity follow continuous night factor; wildlife responds to weather. No new asset dependencies, no RTX/ray tracing claim. Local clock and weather are not server synchronized.
- Add pure policy tests and Chromium weather integration regression. Larger world redesign, broader wind simulation and hardware visual QA still pending.
- References: https://threejs.org/manual/pages/fog.html ; https://unity.com/blog/how-to-create-atmospheric-environments-on-a-budget ; https://dev.epicgames.com/documentation/unreal-engine/environmental-light-with-fog-clouds-sky-and-atmosphere-in-unreal-engine

## V11.9 — Natural Motion (candidate)
- Per-foot stance anchors for near, slow grounded walking, with a bounded sagittal-plane correction, finite-difference direction check, toe-off fade and rollback when ground clearance or joint limits would regress. No lateral lock, no full-body IK and no running lock. Keep existing mesh sole calibration and settled idle solver.
- Smooth airborne leg flex across takeoff/air velocity threshold; keep existing arm clearance and 20 VRM identities. No mocap or new model assets.
- Add deterministic stance and jump transition regression checks. Full visual QA and device profiling pending.
- Technical references: Unity humanoid foot IK and Unreal pose/stride warping; implementation is original and adapted to existing VRM rig.

## V11.8 — Performance Master (candidate)
- Five graphics profiles (Battery, Low, Balanced, High, Ultra/HD), retaining the three existing LOD bands and the legacy URL aliases. Automatic first-run low preset on reported low-memory or low-core mobile devices. Explicit profile caps, existing effects-first scaling and mobile pixel floor.
- Add JS CPU-frame timing, optional Chromium JS heap telemetry and heuristic pressure notices. No direct GPU time or VRAM measurement, no claimed hardware FPS uplift.
- Reuse camera vectors and avoid square roots / count writes for hidden grass batches. Keep existing avatar, pet, multiplayer, physics and world systems intact.
- Restore graphics policy regression test to import its actual module and run it in CI; add preset and warning assertions. Full device benchmarking, spatial animation budgets, further batching and resource profiling remain pending.

## V11.7 — Daylight & Motion
- Preserve the 420-second game day, with gradual dawn/day/afternoon/sunset/night keyframes, moving light direction and in-game clock. Local session clock, not server-synchronized. Smooth sky, fog, sunlight, environment intensity, stars, river and lantern glow.
- Keep VRM identities. Stabilize settled idle lower-body pose, anchor support midpoint in world X/Z and align actual sole samples to rendered ground. Release anchor for locomotion or flight; allow height correction during standing takeoff preparation and landing. Not independent full-body per-foot IK.
- Jump arms respond to upward/downward velocity, open further from torso and flex elbows with relaxed wrists. Existing animal and multiplayer code retained.

## V11.6.2 — Cat & Rabbit
- Replace close-up cat and rabbit with textured skinned GLB assets: British Shorthair and Wild Rabbit, vinish.dev, CC BY 4.0. Credits in game settings and landing footer. Scale and matte material adjustments; blend Idle/Walk/Run/Sit/Sniff/Meow where present. Cache source, share geometry and materials; use lightweight prior model for far-away animals or failed loads. Retain fox, deer, dragon and multiplayer logic. Source URLs: https://vinish.dev/free-3d-models/cats and https://vinish.dev/free-3d-models/rabbits-mice-and-squirrels .

## V11.6.1 — Creatures & Multiplayer
- Remote players retain their visible animated fallback until the correct VRM successfully loads and animates; retry failures, discard stale asynchronous results and avoid transparent impostors for peers. Add counts for visible peers, VRM and fallback. Keep privacy and presence filtering unchanged.
- Prefer rigged fox/deer assets from Quaternius Ultimate Animated Animal Pack (CC0) and optional Dragon from Quaternius Animated Monster Pack via cairnfall-public (CC0); use separate skeleton/mixer per instance and cache source loads. Smooth normals and matte surfaces. Refine original rabbit/cat and fallback geometry, eyes, muzzle, leg overlaps and decorations. No claim of newly sculpted GLB for all five. Assets: https://quaternius.com/packs/ultimateanimatedanimals.html ; https://quaternius.com/packs/animatedmonster.html ; https://github.com/euuuuuuan/cairnfall-public/blob/main/CREDITS.md .

## V11.6 — Fantasy Creatures
- Five reusable original runtime-generated creature mesh templates, distinct proportions and geometry, articulated ears/legs/tails, eye blinks, matte fur/scale detail, fantasy accessories. Shared mesh and material resources for local, wild and remote pets; existing culling retained. Old fox/deer GLB kept as fallback only. Species-specific idle/locomotion and feeding reaction. No external model requests for new creatures. Not separate hand-sculpted GLB files or motion capture; visual quality/performance on real devices pending.

## V11.5.4 — Bridge & Grounding
- Keep floating river lanterns out of bridge deck footprints; move fixed bridge lamps outward onto raised stone pedestals.
- Preserve VRM appearance, use 92% relative scale for female avatars, keep male scale. Match studio camera to adjusted height.
- Reduce idle pelvis roll and asymmetric knee flex, apply bounded sagittal leg balancing to reduce unequal sole clearance, settle exact root height and add two independent local contact shadows. Full horizontal foot lock is not included. Visual QA pending.

## V11.5.3 — Sole Contact
- Sample actual posed shoe geometry (bounded cached vertex set), instead of relying only on rest-pose ankle height; retain ankle fallback when sampling fails. Match rendered terrain triangles, raised roads and bridge deck for idle contact. Near NPCs and peers receive the same correction. Shadow follows support points. Fix cumulative wrist roll. No avatar replacement. Full horizontal foot locking is not included.

## V11.5.2 — Grounded Idle
- Retain all VRM characters and previous creature upgrades. Softer symmetrical baseline knee flex, asymmetric weight shift, quieter pelvis and compensated ankle pitch.
- Local player idle terrain alignment uses calibrated ankle heights after pose updates, bounded root offset, and release during jumps/other actions. Soft contact shadow helps show ground connection. This is vertical sole alignment, not full world-space XY foot locking. Visual QA pending.

## V11.5.1 — VRM Restore
- Restore V11.4 VRM anime roster as the only standard avatar selection; disable Original mode even on old links. Keep V11.5 locomotion, creature geometry/material changes, and saved avatar IDs. Original source retained for development history, not loaded by game.

## V11.5 — Creature & Motion
- Speed-matched walking/jogging, acceleration and turn response, relaxed male upper-body gait. Walking/sprinting speed reduced from 3.8/6.5 to 1.65/3.8 world units/s; vehicle speeds unchanged.
- Optional Original workshop (`/play?avatar=original`): 20 procedural original geometry profiles, weighted arm/leg/torso surfaces, custom face, hair and clothing shapes. Existing VRM default preserved; not twenty hand-sculpted production assets. No motion capture.
- Rabbit proportions and ears redesigned; species-specific procedural pet motion, matte fur color variation for rabbit/cat/fox/deer and retained fox/deer GLB clips. No strand-groom simulation. Full visual QA pending.
- Research: Unreal locomotion-based blending, Unity navigation/animation coupling, Three.js MeshStandardMaterial, Blender Principled BSDF. No third-party code copied.

## V11.4 — Living Characters
- Asymmetric idle weight shift, more pronounced breath and torso movement, velocity-shaped airborne pose and deeper landing. Longer anticipation and landing windows.
- Six VRM base choices, two new optional female models with safe existing-base fallback, bone-attached themed wearable meshes and secondary cape movement. No independently sculpted faces or fully skinned custom outfits.
- Matte fox/deer material with subtle fiber bump on UV meshes, idle breathing. Existing authored animal clips retained. Full visual validation pending.

## V11.3 — Animation Recovery
- Periodic monotone gait interpolation, clearer strides, arm swing, torso counter-rotation, breathing and neck motion. Existing VRM roster and asset dependencies retained.
- Unit motion regression across 20 presets and variable frame rates; no new external animation files. Visual browser validation required.

## V11.2.1 — Stability Recovery
- Restore V11.1 renderer, VRM roster, motion and asset allowlist after user reported V11.2 gameplay failure. Root cause not yet isolated. Keep V11.2 experimental features in Git history; do not enable them until browser verification succeeds.
- Retain saved avatar IDs and canonical Render service. No database migration.

## V11.2 — Character Identity
- Sample five CC0 KayKit authored walk/run clips into bounded thigh, knee, upper-arm and elbow channels and blend them with existing VRM motion. No imported root translation or mocap claim; safe procedural fallback if asset fails.
- Four extra female VRoid beta CC0 base models (Shibu, Vivi, Vita, Victoria Rubin), eight bases total. Existing male bases remain two. Twenty themed accessory designs (capes, scarves, emblems, sword sheaths, ornaments) attached to animated bones; no independently sculpted faces or full outfit skinning.
- Retain stable avatar IDs and preview/world identity. Bound local avatar cache and source buffers to avoid retaining every model.
- KayKit Character Animations (Kay Lousberg, CC0): https://kaylousberg.com/game-assets/character-animations; pinned GLB copy from NoLimitNexus/game-models. VRoid beta assets: https://vroid.pixiv.help/hc/en-us/articles/4402614652569-Do-VRoid-Studio-s-sample-models-come-with-conditions-of-use.

## V11.1 — Natural Arm Motion
- Replace fixed-axis elbow rotation with direction-based upper/lower-arm posing relative to the torso; keep arms outward and wrists on their own side. This is a clearance heuristic, not full mesh collision or cloth simulation.
- Preserve twenty movement profiles, seated and gesture poses; measure actual raw arm joint angles and clearance in browser regression.
- V11.0 live audit found running elbow flex only 0.104–0.119 rad across four models. User video showed straight arms brushing through clothing.

## V11.0 — Character Locomotion Personalities
- Replace unrestricted world-space foot locks with bounded vertical-only sagittal corrections. Disable IK on running, jump phases, fast turns and large frame steps; reset contact on preset changes.
- Twenty unique authored profiles with distinct stride, cadence, arm swing, elbow flex, sway, forward lean and bounce. Normalize forward signs from rig toe direction. Gait key poses and bounded knee/hip/ankle motion; softer four-phase jump and landing.
- Same character preview supports idle/walk/run. Fox and deer use gait hysteresis, smoother clip transitions and playback rates.
- Procedural authored motion, not motion capture; no guarantee of visual realism. Live SQLite remains ephemeral.

## V10.9 — World Life
- Analytic two-bone stance IK for the local humanoid, contact lock in world space, terrain height, release in jump/vehicle/emote. Not motion capture, requires live visual tuning.
- Remote presence sends validated avatar ID and gait, uses VRM and far sprite; cap concurrent displayed peers to 5/8/12 by quality.
- Exterior porches, warm windows, roof courses, villa railing, interior plank floors and curtains; varied trunk/canopy geometry.
- Authenticated private SQLite snapshot download with integrity verification. Existing live filesystem is ephemeral; do not merge or deploy until the owner has a recovery plan and existing data is secured. Test fixtures are not live backups.

## V10.8 — Smooth Motion
- Authored procedural locomotion curves and smoothed idle/walk/run transitions; hips, spine, shoulders, knees and ankles move together. No imported motion-capture clips or foot IK yet.
- Jump has anticipation, takeoff, airborne and landing poses tied to existing physics. Native VRM spring bones update at near detail; blink and breathing supported.
- NPCs keep a stable VRM preset. Near full animation, middle reduced update frequency, far same-avatar billboard (impostor). Before assets load, label remains without blocky body; if sprite generation fails, use same VRM at reduced update frequency.
- Fox and deer use actual movement speed for idle/walk/run and optional alternate idle, with clip crossfades. Existing remote multiplayer avatars are not migrated here.

## V10.7 — Living Characters
- Compute mirrored arm-lowering from normalized rest bone direction; verify actual hands below shoulders in idle.
- Twenty presets (10 male + 10 female) on the same four VRoid meshes; responsive picker with aligned tabs and independently scrollable list.
- Pool up to three nearby NPC VRMs (one on low detail), including quest guides and citizens. Distant NPCs and remote peers retain old visuals for performance.
- Replace fox with Quaternius animated CC0 model; smooth animal normals without changing rig or topology. Still stylized, not realistic fur.

## V10.6 — Avatar Roster
- Five male and five female named presets using four CC0 VRoid bases with color/height variants; not ten independently modeled meshes.
- The chooser and world use the same cached VRM object and preset ID; selection is saved in avatar106. Preview must load before selection can be confirmed. Indoor use and seated poses supported; car hides character.
- Existing inventory and save data retained. Other online players still use legacy remote visuals; no promise of VRM cosmetics in multiplayer.

## V10.5 — Asset Recovery
- Cache validated VRM samples on the server, show asset status and retry failed loads.
- Automatically use rigged Fox and Deer models when available, with original procedural fallback.
- Existing VRoid samples are anime, not photorealistic. NPCs, other species and full customization remain legacy.
- Fox: PixelMannen, tomkranis, AsoboStudio/scurest; CC-BY 4.0, https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox. Deer: Quaternius CC0, https://quaternius.com/packs/ultimateanimatedanimals.html (GLB conversion from trebeljahr/quaternius-showcase).

## V10.4 — Skinned Avatar Beta
- Replace outdoor player visual with a rigged VRM sample when loading succeeds; use legacy rig for unsupported actions, interiors and failure fallback.
- CC0 samples: Sakurada Fumiriya and Sendagaya Shino by pixiv Inc.; temporary evaluation assets, not original WISH WORLD art.
- Preserve original saves and cosmetics. Full VRM clothing/hair customization and NPC migration are not yet implemented.

## V10.3 — Anime Portrait
- Close-up face preview in atelier, expressive mouth width and secondary motion on hair strands.
- Fix CI runner compatibility with the pinned browser test.
- Preview deployment is isolated from production and uses disposable test data.

## V10.2 — Anime Fantasy
- Revised male/female procedural character proportions, toon materials, face geometry, eyes, hair and layered outfits.
- Added facial expressions, softer gait, jump preparation/landing, and atelier preview controls.
- Includes the V10.1 infrastructure changes. Visual quality and mobile performance still require device validation.

## V10.1 — Stability / Infrastructure Beta
- HTTP HEAD and favicon fixes, connection cleanup, mobile render policy and safe-area improvements.
- Database snapshot and migration rehearsal tooling, verified rewards, optional WebSocket bridge, local asset packaging and CI load tests.
- Production PostgreSQL migration and deployment remain pending.

## V10.0 — Foundation
- Effects-first adaptive graphics, shared world, and outdoor pinch zoom.

## Release convention
For each user-visible update, increment the release version (patch for fixes, minor for feature releases, major for major changes).
Synchronize the version and build ID in server.py (/api/version), index.html (BUILD62, title, HUD, menu, footer and photo watermark), landing.html and regression tests. Preserve old entries in this changelog. Never reuse a version for a different released build. Distinguish source/CI builds from the version actually deployed to Render. Do not claim deployment until Render confirms it.

## Single public game URL
The canonical player URL is https://wish-world.onrender.com/play. Publish tested releases to main and use the existing Render service; do not create additional public game services for routine updates. Internal branches and CI are for verification only. Keep the current player database safe before deploying; do not delete either service or database without verifying retention. The existing preview is not the canonical player URL.

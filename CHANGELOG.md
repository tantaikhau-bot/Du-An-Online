# WISH WORLD — Release history

## V15.3.2 — Dragon Visibility & HD Portraits
- Replace original 80px concept crops with 224px crops from the approved concept artwork, cache-bust CSS; use readable Vietnamese headings and cap detail portrait to native size.
- Enable rigged dragon by default when equipped (no special URL). In-menu loading/error status, recall/retry without page reload, initial animation before hiding the old model, raise hovering height and restore previous geometry if animation fails. Other companions unchanged.
- Syntax and asset package checked; actual live rendering and FPS remain unverified.


## V15.3.1 — Dragon Loader Fix
- The pilot GLB requires EXT_meshopt_compression. Register the Three.js r164-compatible Meshopt decoder before parsing; serve the MIT-licensed decoder locally to avoid a separate CDN dependency. Retry failed loads after 45 seconds and show the actual error. Existing companion fallback stays available.
- GLB header, required extensions and JS syntax checked. Actual browser decoding and visual appearance remain unverified.


## V15.3 — Dragon Pilot (preview)
- Optional local Dragon Evolved GLB by Quaternius (CC0, source https://poly.pizza/m/LlwD0QNUPj; packaged from crisleyhguimaraes/space-ship). 7,134 triangles, 46 joints, two flying clips; recolored teal, purple and gold. Not a sculpt from the concept or a textured final V16 asset.
- Enable through /play?dragonPreview=1, equip Dragon, or use its preview toggle in the collection. Other pets and save data unchanged. Existing model retained on failure.
- Allowlisted the preview JSON and existing portrait CSS. Syntax and asset structure checked; browser rendering and FPS unverified.


## V15.2 — Enchanted Companions (candidate)
- Dedicated responsive companion collection with five concept-art portrait crops, elemental badges, selected detail, owned/active state, existing purchase/equip and care/preview actions; no change to prices or rewards. Portrait atlas is a compact 400x80 WebP embedded in CSS; detail is illustration, not a 3D preview.
- Revised original procedural creature proportions, eyes, rabbit lop ears, cat plume, dragon neck/muzzle/wings, gold ornaments and forest garland to follow approved concepts. Kept prior particle and locomotion systems. No new externally rigged models or paid service.
- Classic JavaScript syntax checked; actual browser layout, GPU appearance, animation and FPS remain unverified.

## V15.1 — Soundscape & Rein Control (candidate)
- Contextual sample music: Sunset Walk (KiluaBoy), Iremos Forest Theme (beardalaxy), Whispers in the Fog (Ruhinre), Fairy Battles (MintoDog), waterflow (TyberiusGames), CC0 via OpenGameArt. SFXMint CC0 generated sample clips: grass/stone/wood footsteps, rain, birds, hoofbeats on grass/stone, sword clash, cat meow. Fixed allowlist, bounded server cache, lazy browser decoding and music/ambient crossfades; existing synth fallback retained.
- Reach-limited arm IK with lowered/closer grip, bent elbows and animated rein lines from wrists toward estimated bit sockets. Exact model grip and cloth collision remain unverified.
- JavaScript syntax checked; upstream sample availability, actual playback, browser rendering and device performance remain unverified.

## V15.0 — Spirit Companions (candidate)
- Continuous tapered torso profiles, species-specific fur ruffs, ear tufts, leaf antler accents, cheek fins and subtle jewel marks. Distinct secondary body motion for all five pets.
- Local active companion elemental particles: moon diamonds, fire embers, star crosses, leaves and lightning. Summon, feed, pet and preview bursts; one point batch, max 32 desktop / 16 reduced tier, disabled on low FX. Visual effects only, no combat or economic changes.
- JavaScript syntax and mocked particle budget/finite-position checks passed for all five species. GPU rendering, model aesthetics and real-device FPS remain unverified.

## V14.9 — Living Motion & Fur (candidate)
- Smoothed rider gait pose transitions, independent pelvis pitch/roll, lumbar and chest counter-motion, relaxed wrist and rein targets, subtle seated suspension. Horse gait crossfade preserves cycle phase and adjusts playback rate.
- Shared 128px procedural fur and scale color/bump maps, low-specular physical materials, vertex shading gradients, fur clump and dragon cheek silhouette refinements. No per-frame texture generation.
- JavaScript syntax checked; in-browser visual, material, clipping and device FPS tests remain open.

## V14.8 — Mount & Fantasy (candidate, combines V14.6–V14.8)
- Removed the primitive horse fallback. Require the Western Horse GLB (vinish.dev, CC BY 4.0) with validated same-origin server cache and explicit error if unavailable. Idle, Walk, Trot, Gallop; no separate Canter clip upstream.
- Spine-relative estimated saddle, stirrup and rein sockets; two-link raw VRM leg and arm IK; gait-specific procedural rider pose states and mount/dismount transitions. These are not authored mocap clips. Model socket calibration, cloth collision and real-browser visuals remain unverified.
- Changed the five original fantasy companion shape recipes (body proportions, rabbit ears, fox brush, cat tail, deer antlers and legs, dragon wings and spines). Prefer these visible templates rather than old GLBs; retained original per-species motion and following logic.
- JavaScript syntax checked; full runtime, performance and asset-delivery tests remain open.

## V14.5 — Wildlife & Mount IK (candidate)
- Optional animated Western Horse by vinish.dev (CC BY 4.0); external GLB lazy loaded with procedural fallback. Rest saddle estimate follows spine; hips offset and raw-bone two-link leg targets outside mount width.
- Refined five procedural companion palettes and adornments; dragon GLB material tint and roughness. Existing skinned animal geometry retained.
- External model availability, actual saddle/stirrup alignment, cloth clipping and real-device visual/FPS QA remain unverified.

## V14.4 — Equestrian & HUD (candidate)
- Rebuilt procedural horse with refined head, mane, articulated legs, saddle and stirrups; speed-smoothed gait and saddle-relative rider hip alignment; dedicated VRM horseback pose.
- Compact two-column quick actions, improved hotbar and touch button contrast, visible mount/dismount and retained V14.3 audio recovery.
- Syntax checked; visual rider/cloth contact, real-device FPS and listening tests remain open.

## V14.3 — Audio Recovery (candidate)
- Expose sound toggle on main HUD and mobile settings; explicit user-gesture AudioContext resume, audible two-note speaker test and persistent opt-in.
- Independent 250 ms audio scheduler, suspend when muted or hidden; resume on interaction after interruption. Increased music level. Real device listening QA remains open.

## V14.2 — Immersive Audio (candidate)
- Opt-in procedural music, weather and river ambience, terrain-specific footsteps, companion feeding and dungeon action cues; independent persistent music, ambience and effects levels.
- Limit transient voices to 6 on coarse-pointer devices and 12 otherwise; suspend audio when hidden or muted. No external audio downloads.
- Stereo panning for ambient cues only; full positional 3D, recorded samples, voice chat, actual device FPS and listening QA remain open.

## V14.1 — Mobile Physics (candidate)
- Bound simulation catch-up to 100 ms and collision-checked movement to at most four substeps of 25 ms, preventing unbounded work after stalls. Smooth character heading with time-based angle damping.
- Integrate jump height analytically and consume preparation time separately; preserve existing jump speed and gravity, landing cue, and collision routine.
- Smooth mobile orbit yaw/pitch/zoom before collision checks, use rendered yaw for controls and minimap, snap distant focus and reset orbit on resume. Desktop orbit remains direct.
- Test numerical 10–60 FPS jump timing and bounded steps. Existing Chromium/bridge regressions remain; no hardware performance certification, cloth collision fix or asynchronous terrain streaming claim.

## V14.0 — Mobile Engine (candidate)
- Bound compressed VRM buffer cache to 24 MiB/3 entries on mobile and 80 MiB/6 entries on desktop. Deduplicate active fetches; pending fetch bytes and parsed model memory are not included in that bound.
- Keep at most two cached local avatar bases on mobile; release hidden distant peer/NPC VRMs after 20 seconds, preserve visible fallback. Desktop local roster cache retained.
- Throttle expensive diagnostic arm/leg measurements on mobile while retaining animation, IK and spring updates. Cache legacy-avatar URL selection rather than parsing every frame. Report source bytes and resident actor counts in graphics diagnostics.
- Tests exercise cache bounds, eviction, retry and active model protection. Real-device memory/FPS, full cloth collision and asynchronous terrain streaming remain open.

## V13.9 — Mobile Performance (candidate)
- Default mobile starts Low, 30 FPS; strong devices may explicitly select Balanced/High/HD and 60 FPS. Legacy desktop policy unchanged.
- Mobile render buffer capped by effect tier (420k / 850k / 1.25M pixels, explicit HD up to 1.8M); sustained slow frames quickly reduce effects and scale; recovery requires twelve good windows. Manual quality still protects render scale/effects.
- Bound nearby detailed VRM actors and model loading concurrency on mobile; distant actors retain visible fallback, no name-only regression. Avoid NPC impostor GPU readback on mobile, reduce map and scenery refresh.
- Policy tests and separate touch/high-DPR Chromium context validate budgets and compatibility; no measured real-device FPS. WebGL compatibility fallback remains available. Sources: https://threejs.org/manual/pages/responsive.html ; https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

## V13.8 — Combat & Dungeon (candidate)
- Server-resolved turn-based solo PvE, five stages and escalating crystal dragon boss. Strike, burst, guard, heal and retreat; visible next enemy damage. Revision rejects stale/replayed actions; account-bound progress, no coins or tradable reward.
- Responsive modal arena with HP/energy bars and illustrative enemy icons, reachable from quest drawer. Not a real-time 3D dungeon or new character models.
- Tests cover five-stage progression, locked stages, stale revisions, tampering, account isolation and retreat. No claim of 100 levels, 3D skills, multiplayer combat, visual quality or production persistence.

## V13.7 — World Expansion II (candidate)
- Increase playable rectangular bounds from 144×144 to 144×176 world units. Preserve all legacy locations, original central terrain grid and bridge geometry. Add two matching 16-unit terrain strips with distance visibility, updated horizon and raycast.
- Four candidate frontier landmarks in north/south strips; atlas, minimap, route and visit persistence include them. Sand/grass vertex tint blends at seams; no new asset downloads.
- Extend server presence Y bounds, preserve X and coordinate transform. Regression for expanded bounds, reciprocal presence and bridge/non-bridge collision.
- Terrain strips are constructed at startup and culled, not asynchronous streaming. No caves/islands/boats, new NPCs, hardware FPS or full visual QA claim.

## V13.6 — Co-op Adventure (candidate)
- Daily two-player scenic route with nearby friend invitation, explicit recipient consent, cancellation and three shared checkpoints. Server checks current public presence for both, order, friendship and blocking. No new coins or tradable rewards.
- One accepted/completed pair per player/day, three outgoing invitations/day, day rollover and private progress. UI reachable from daily adventure. Tests for consent, isolation, stale/missing presence, repeat check-ins and block visibility.
- Client-reported coordinates remain non-authoritative; no live multiplayer visual certification. No new minigame or combat.

## V13.5 — Companion Care (candidate)
- Separate saved fullness, energy and mood for each of five existing species. Feed uses existing inventory; touch and rest have cooldowns, travel consumes a bounded amount of energy. No pet loss, extra currency, new economy or mandatory care penalty.
- Fix follower offset using actual avatar forward convention. Preserve bridge/walkability checks, GLBs, animation and remote follower behavior.
- Tests cover all five profiles, four headings, bounds, old/malformed save data, cooldown and long absence. Device/visual tests and new model evolution remain pending.

## V13.4 — Adventure & Stability (candidate)
- Deduplicate repeated presence packets by server sample timestamp, smooth local timestamp mapping and keep bounded predicted position when motion becomes stale. Preserve HTTP fallback and privacy.
- Weekly account-bound challenge: complete three daily routes within the Vietnam Monday–Sunday week; derived from existing completion history; no currency or tradable rewards.
- Add two independent authenticated Chromium API sessions to verify reciprocal presence and leave, plus landscape viewport smoke check. Existing synthetic peer visual checks still run. This is not two simultaneous 3D clients or a live production load test.
- See RELEASE-AUDIT.md for remaining requirements. No claim of production readiness or hardware FPS.

## V13.3 — Cinematic World (candidate)
- Existing physical river shader reacts to wind/rain via bounded wave, ripple and Fresnel parameters; lightweight river receives continuous day/night and storm tint. Preserve optional reflector and original water geometry.
- Decorative low riverbank reeds, shared geometry/material and per-cell instancing, bridge/obstacle/site exclusion. No collision changes, no new texture downloads.
- Cap visible reeds, mist and waterfall foam by graphics/effect tier; use visible ground for contact shadow placement. No additional post-processing render pass.
- Add water/material, budget and placement policy regression. Visual/device FPS, shader compatibility across real GPUs and architectural remodeling remain pending.
- Three.js documentation: https://threejs.org/docs/pages/InstancedMesh.html ; https://threejs.org/manual/pages/materials.html


## V13.2 — Character & Animation (candidate)
- Smooth entry, exit and switching between VRM action poses. Preserve locomotion and existing foot IK; add bounded bow, cheer, hug, hand and portrait overlays on existing skeletons. Existing consent/nearby matching remains unchanged.
- Ease facial expression weights rather than snap; preserve existing blinking. Bounded secondary response of custom identity wearables to gait, turning and local wind. Native VRM spring update remains unchanged.
- Retain current 20 presets, geometry, textures and existing network protocol. Numerical tests cover action weights, expressions and secondary motion. No new model meshes, exact paired hand contact, full cloth physics or hardware QA claim.

## V13.1 — Graphics & Gameplay (candidate)
- Three blended lighting styles, preserve ACES renderer and independent graphics budget; original default. No added post-process render passes.
- Immediate camera obstruction contraction, gradual clearance recovery. Ground collision unchanged.
- Original synthesized optional step/jump/landing/emote effects routed through existing user-enabled audio master. No external music/assets or autoplay.
- Expose previously hidden Adventure and Regional Atlas actions in immersive quests drawer, show NPC fallback while VRM is pending. Retain all 20 current avatars and existing five companion models.
- Add numerical regression and browser look-switch checks; no hardware FPS, new map/character mesh, new combat skills or visual-quality guarantee.
- References: https://threejs.org/docs/pages/WebGLRenderer ; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

## V13.0 — Online Beta (candidate)
- Strict bounded JSON parser rejects duplicate keys, nonfinite numbers, oversized integers, invalid Unicode and excessive nesting; validate Content-Length and reject cross-site browser POSTs.
- Per-account separate quotas for presence and other authenticated POSTs, Retry-After header, client presence backoff. SQLite busy/locked responses return HTTP 503. Process-local counters, no request payload or account identifier in metrics.
- Authenticated admin runtime panel with uptime, aggregate HTTP status counters, SQLite journal/storage indication and sandbox payment mode; secure admin cookie on Render HTTPS. No paid hosting change or real payment activation.
- Keep existing SQLite and backup/export tools. No live database migration, backup or durable storage assurance. Full production readiness, anti-cheat and independent security testing remain pending.
- References: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html ; https://docs.python.org/3.12/library/json.html

## V12.4 — World Expansion (candidate)
- Four candidate scenic landmarks within existing playable pine, ruins, amber and summit regions. Deterministic terrain/slope/walkability and existing-site clearance checks; omit a site if no safe location is found. Decorative marker only, not new collision platform.
- Regional atlas, route navigation, minimap markers and local cosmetic discovery progress. No reward currency or account-wide new achievement claim.
- Hysteresis for existing building/forest/scenery visibility and new landmark labels, squared-distance checks. This is render culling, not asynchronous terrain streaming.
- Preserve map bounds, existing terrain, bridges, NPC and saved coordinates. Tests cover placement policy, bounds, invalid visits and culling boundaries. Actual new-site reachability, architecture quality and device FPS still need visual QA.

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

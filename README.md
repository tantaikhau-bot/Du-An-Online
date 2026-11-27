# WISH WORLD V2.0 RC

Bản thử nghiệm. Không thu tiền thật. Dữ liệu thử nghiệm có thể mất khi máy chủ khởi động lại.


### V4.5 optional photo textures

Optional browser-side loading of Poly Haven CC0 assets: [Forest Ground 01](https://polyhaven.com/a/forrest_ground_01), [Medieval Blocks 05](https://polyhaven.com/a/medieval_blocks_05), [Medieval Wood](https://polyhaven.com/a/medieval_wood), authored by Rob Tuytel. Original procedural textures remain the default and fallback. 4K JPGs are resized to 1024×1024 in memory. No external assets are bundled. Browser download/CORS availability is not guaranteed.


### V4.6 optional skeletal character assets

- KayKit Character Pack: Adventurers, Rogue.glb, by Kay Lousberg, CC0 1.0. Source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 ; license: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/blob/main/LICENSE.txt
- Fox: PixelMannen (model, CC0), tomkranis (rig and animation, CC BY 4.0), AsoboStudio and scurest (glTF conversion, CC BY 4.0). Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox ; license: https://creativecommons.org/licenses/by/4.0/ . Changes in WISH WORLD: runtime normalization of scale/orientation, animation selection and transition. No asset files are bundled. Optional runtime download; if unavailable or missing idle/walk/run clips, procedural fallback remains. KayKit preview uses its original outfit rather than the existing custom clothing system.


### V4.9 performance and community

Adaptive quality is selected under Settings; manual presets remain available. FPS and draw calls are shown in graphics settings. Shared box geometry reduces allocations; peer interpolation is visual only and presence is still polling, not authoritative multiplayer. Hidden tabs pause the 3D frame loop and presence updates; the renderer recovery dialog offers reload or classic mode. No paid hosting or live payments. Browser/GPU validation and load testing remain required.


### V5.0 Alpha playtest

Open playtest (not an invitation-gated closed beta). Includes first-run guide, seven one-time local achievements, safer local/cloud restore with a previous-save snapshot, and authenticated feedback submitted explicitly by players. Staff review is under Admin → Phản hồi Alpha and requires a configured admin password. Feedback is limited to 10–1000 characters, one per minute and ten per rolling 24 hours per account. Render free storage remains ephemeral; export saves before deployments. The local coin economy is not authoritative. No real payments, no commercial launch, and no GPU/load-test certification.


### V5.5 Atmosphere

Original procedural sky clouds and stars, terrain snow/rock/riverbank shading, Fresnel-style water coloring (not scene reflections), curved animated grass clusters grouped into 16-unit cells with quality/distance culling, local contact shadows and mist/snow particles. `/play?fx=basic` disables the new custom shader effects while retaining Three.js. `/play?engine=classic` remains the older compatibility engine. Shader-hook string tests and JS syntax checks are not browser shader compilation or measured GPU benchmarks. No hardware ray tracing or external assets added. Free hosting remains unchanged.


### V5.6 Together

Press Y or open Community → Chat & kết đôi. Authenticated public text chat and private friend chat, refreshed every three seconds while open. Companionship is a game-only, mutual, single-partner relationship; either party can cancel. Joint daily blessing requires both authenticated players to be nearby in the same area, based on reported presence. User blocking removes friendship and companionship and denies private chat and garden interactions. Reported messages are visible to authenticated staff and can be hidden. Chat reads show at most the latest 50 messages within seven days; cleanup occurs when a message is sent. Reports retain a copy for review. Basic anti-spam/contact filters are not comprehensive moderation. Private chat is access-controlled, not end-to-end encrypted. Admin password and active moderation are required before broad promotion. Free Render storage is ephemeral; no load test or guaranteed concurrency. Startup runs isolated in-memory smoke tests; no real accounts created.


### V5.7 Guilds & Parties

Press U or use Community → Tổ đội & bang hội. One party (4 members) and one guild (20 members) per account; invitations from leaders to accepted friends expire after 24h. Members may leave, leaders may remove members; leadership transfers on departure. Private group chat shares the existing chat rate limits, report and block filtering. Blocked players already in the same group remain members but cannot see each other's messages; joining a group with a blocked member is refused. Daily expedition grants 25 group XP when at least two members report nearby presence at the same landmark; no cash or personal currency rewards. Presence is client-reported, not authoritative. Startup smoke tests run in memory. Hosting and storage limitations remain unchanged.


### V5.8 Natural Light

Graphics-focused release; V5.7 social features remain intact. Six procedural materials generate 512x512 color, height, tangent-space normal and roughness maps. A prefiltered procedural HDR environment supplies indirect ambient illumination, not full global illumination. High quality requests Three.js r164 Reflector with a custom water shader and 768x512 render target near the river; it falls back to V5.5 water if loading or shader compilation fails. Reflection is planar, not ray tracing. High shadow map up to 4096 depending on hardware. Terrain and rectangular obstacle camera clearance. JavaScript parsing and all 24 generated map buffers were checked with a mock Canvas; actual WebGL rendering, shader compilation and FPS were not tested because DNS access is unavailable in the local environment. Free hosting unchanged.


### V23.5 Engine Testing
Run `node test_engine235.cjs` from the repository root for offline engine regression checks, and `python test_http_assets.py` for HTTP cache checks. Tests cover syntax, mobile quality policy, fixed-step simulation, avatar cache, nearby chat, decorative throttling, forest LOD and GLB header/size rejection. They do not measure GPU FPS or validate actual browser rendering. Render free storage remains ephemeral; do not use for production player data without durable storage.


### V24.0 World Streaming (forest pilot)
Shared GLB tree assets remain cached, while nearby forest instance batches are constructed incrementally (1 mobile / 2 desktop per tick), with directional prefetch and bounded resident cells. Distant instance buffers are disposed without disposing shared geometry/materials; original procedural trees remain as fallback. Buildings, collision and terrain still use the existing loading system. GPU/browser playtesting remains required.


### V24.1 Terrain Streaming
All 64 low-resolution terrain tiles remain available as a visual fallback. Detailed tile geometry is generated near the player/camera incrementally, bounded by quality-dependent resident caps, and disposed outside the target set. Height interpolation follows the currently displayed LOD for actor grounding. Analytic collision, roads and bridge rules remain unchanged. Test browser seam transitions and mobile GPU performance before production.


### V24.2 Architecture Streaming
Optional authored house and lantern clones are instantiated near the player with directional prefetch, per-tick construction budgets and a bounded resident set. Original procedural structures remain as fallback and are restored when optional clones leave the resident set. Source asset geometry and materials remain shared; existing civic buildings, bridges, stage, collision and world coordinates are unchanged. Browser visual tests and GPU benchmarks remain required.


### V24.3 World Preloading
Terrain, forest and architecture use a common per-frame construction budget (one attempt on mobile or severe effect pressure, three on desktop), with rotating subsystem priority and urgent current-terrain priority. Speed-based bounded forward lookahead is used for all three. Shared source assets and procedural fallbacks are retained. This limits synchronous construction attempts, not all GPU work or background network downloads. Browser testing and FPS benchmarks are still required.


### V24.4 Seamless World
High-detail terrain border vertices follow the coarse edge interpolation, with a 2.2-unit smooth transition strip. Actor ground interpolation uses the same terrain vertex heights. Static scenery construction uses canonical detailed ground, while runtime grounding follows the visible LOD. Resident priority bias reduces model churn near streaming thresholds; hard caps and current tile priority remain. Numeric edge tests are not a real WebGL seam or FPS test.


### V24.5 World Testing
Run `node test_world245.cjs` alongside `node test_engine235.cjs`. The world suite checks shared terrain edges for both densities, 900 simulated moving frames per device class with changing quality tiers, construction and resident budgets, architecture legacy selection and safe high forest LOD eviction. High forest instance buffers are released when no longer eligible or distant, without disposing shared geometry/materials. These offline tests are not GPU, multiplayer, or real-device benchmarks.


### V25.0 Natural Motion
Measured local speed gates locomotion phase and blends when available, reducing residual steps while blocked or stopped. Bounded braking and turning responses affect torso/head, idle posture retains subtle motion, and gait labels use hysteresis. Preview/peer animation without measured speed retains the previous gait input; horse mount IK and jump priority remain unchanged. Run `node test_motion250.cjs` for offline numerical regression checks across all 20 profiles. Real skeleton rendering, clothing intersections and mobile FPS still need playtesting.


### V25.1 Hand Motion
Body-local arm targets are eased before the directional arm solver. Each finger uses joint-specific closing/release response, and wrist follow-through is bounded. Riding keeps the existing rein IK; grip targets are refined but actual palm/rein contact and clothing clipping need real skeleton visual tests. Run `node test_hands251.cjs` for numerical regression checks.


### V25.2 Locomotion
Landing compression peaks earlier and recovers more gradually without changing jump physics. Running now uses a short, low-weight vertical support window without horizontal foot locking. Walking stance Jacobian probes update the humanoid pose after vertical correction. Run `node test_locomotion252.cjs` for numerical tests across 20 motion profiles. Ground contact, skin deformation and slopes still need browser visual testing.


### V25.3 Horse Motion
Normalize the four existing horse animation clip weights, smooth cadence and add dominant-gait hysteresis. Rider pose, reins and horse head use a common smoothed brake/turn response; residual brake fades at rest so idle motion can return. Existing clip phase alignment, mount IK and collision remain unchanged. Run `node test_horse253.cjs`; real horse skeletal clip transitions and hand contact still require browser playtesting.


### V25.4 Spirit Motion
Species-specific gait thresholds and smoothed playback rates drive equipped GLB spirits and procedural fallback animation. Locomotion clips transfer normalized phase on gait changes (existing clip alignment is not reauthored). Companion stop hysteresis reduces near-owner shuffling while preserving segment collision checks and immediate wait commands. Dragon flight uses filtered speed and late loads are guarded. Run `node test_spirit254.cjs`. Visual contact and actual skeletal animations still require browser testing.


### V25.5 Expression & Interaction
Action weights are bounded and action clocks start with each interaction. VRM expressions use distinct smile targets and asymmetric blinks with profile-dependent timing; optional relaxed expression is used only where supported. A mutually matched nearby peer can drive a bounded, eased local head/neck look for matching social actions. Existing interaction permissions, paired contact and mount IK remain unchanged. Run `node test_expression255.cjs`; actual facial blendshapes and paired contact require visual tests.


### V25.6 Animation Testing
Re-run all Engine/World and Natural Motion regression suites (test_engine235.cjs, test_world245.cjs, test_motion250.cjs, test_hands251.cjs, test_locomotion252.cjs, test_horse253.cjs, test_spirit254.cjs, test_expression255.cjs, test_animation256.cjs). The new mixed-action numerical suite covers 25,200 frames across 20 profiles and three time steps. Prevent stale social overlays from overriding mounted/airborne poses, correct duet clock selection, and guard invalid animation inputs. Offline numerical tests do not establish visual contact, GPU FPS or multiplayer correctness.


### V26.0 Living World
Existing procedural crown animation uses a bounded nearest-first active set, separate from slower visibility checks, with coherent weather-driven gusts and a 30/60 Hz target update cadence on mobile/desktop. Butterfly wing motion is also decoupled from coarse visibility updates. River surface shader time advances continuously at a wind-dependent rate, without adding render passes. Existing GLB tree models, water geometry, collisions and world events remain unchanged. Run `node test_living260.cjs` for numerical checks. Real GPU, shader and visual testing remain required.


### V26.1 Dynamic Weather
Rain and snow use wrapped world-coordinate particle positions, varying fall speeds and bounded wind response. Rain height follows the player's ground elevation; snow continues to sample terrain per flake. Mist uses drifting world-coordinate positions. Weather particle updates are capped at approximately 30 Hz mobile/60 Hz desktop, with immediate refresh on movement or quality change; existing shared weather schedule and transition blend remain intact. Run `node test_weather261.cjs`. Real GPU/visual tests, including weather clipping on slopes, remain required.


### V26.2 Dynamic Sky
Signed sun and moon paths move across the horizon with visibility fades; twilight follows celestial altitude. Cloud drift integrates weather wind continuously, and moon light is attenuated behind clouds. The existing shadow-light direction and water material are preserved for stability; no extra render passes are introduced. Run `node test_sky262.cjs` for numerical tests. Shader compilation and visual/device tests remain required.


### V26.3 NPC Living
Four existing residents have staggered five-state daily routines (rest, preparation, work, lunch break, evening leisure), driven by the shared world clock or manual day mode. Existing day/evening/night anchors and collision-aware asynchronous route queue are reused. Off-camera travel continues without rendering or posing hidden residents; route requests use bounded retries and stale-job invalidation. Resident dialogue and the society journal show the current routine or travel status. Mây and An remain at their original quest locations. Run `node test_npc263.cjs` for schedule checks. Actual route reachability, VRM motion and device performance still require in-game validation.


### V26.4 Wildlife Ecosystem
Existing wild creatures use species-specific daily routines and weather-sensitive rest, foraging, roaming, flight from nearby players and optional riverbank visits. Two additional deer spawn near the river if valid walkable positions exist. Deer and rabbits maintain loose same-habitat group cohesion. Movement uses smoothed measured speed, collision-checked short paths and an eight-unit home radius; head poses provide basic foraging/drinking motion. Hidden animals skip locomotion and pose work and re-evaluate on approach. Existing feeding, taming and rewards are unchanged. Run `node test_wildlife264.cjs` for numerical decisions. Actual bank reachability, model motion and device FPS require browser testing; wildlife remains local simulation, not server-replicated AI.


### V26.5 Interactive Environment
The existing procedural instanced grass material bends away from the local player or horse using one uniform; nearby procedural canopy motion adds a small proximity response within the existing animation budget. The existing snow track buffer also supports tinted sand and rain-wet ground footprints/hoofprints with shorter lifetimes. Riverbank movement or landing can generate cosmetic ripples inside the existing ring instance pool, capped at two mobile/four desktop and disabled on basic or lowest effects. No extra render passes or persistent world changes. Run `node test_interaction265.cjs` for interaction rules; actual GLSL compilation, ground contact, visual quality, and GPU performance still require browser/device checks. Authored GLB grass/tree materials and other water bodies are unchanged; interactions are local cosmetics.


### V26.6 Festival & Events
Recurring world-clock phases: preparation 15–17, light festival 17–19, lantern night 19–22, closing 22–23. Existing stage materials and capped river lantern batches respond to the schedule without additional render passes. Up to two existing residents have collision-aware festival destinations where valid walkable slots exist; original quest guides remain unchanged. The community/menu panel offers schedule, stage navigation, dance and a one-time browser-local souvenir. Account events and crystal rewards continue through the existing server-validated festival APIs and admin-created events; recurring cosmetic events do not issue currency or account inventory. Guests or offline sessions use a local clock; online public-world sessions use the shared world clock. Run `node test_festival266.cjs` for timing checks. Browser, stage reachability, NPC arrivals, and multiplayer visual testing remain necessary.


### V26.7 Living World Final
Regression hardening across V26.0–V26.6. Private-world visits suspend public NPC travel, hide wildlife and invalidate stale NPC routes; returning to the public world resumes schedules. Route jobs retry when the zone or obstacle set changes. Terrain tracks reset continuity on surface, mount, zone, airborne or teleport transitions. Interactive grass falls back to a non-deformed material after a detected vertex shader compilation failure. Festival diagnostics update when the clock source changes. All eight Living World JavaScript regression scripts passed in an isolated V8 environment with a restricted fs/assert shim; all 16 inline scripts parsed. Run `node test_living267.cjs` and the seven previous V26 regression tests locally. Browser rendering, shader behavior, FPS, actual route arrival, multiplayer simulation and Render deployment still require live verification. No claim of validated GPU performance or server-replicated wildlife.


### V27.0 Multiplayer Foundation
Validate and deduplicate authoritative public presence snapshots by account ID and sample time; normalize invalid appearance and motion fields. Nearby peer selection favors already resident avatars within bounded distance and count, reducing churn. The procedural avatar remains visible until the VRM receives a successful pose update; diagnostics count peers lacking a body/vehicle. Server presence excludes private areas and reports protocol 2. Existing HTTP polling, optional transport, authentication, block filtering and interaction consent remain in place. Run `node test_multiplayer270.cjs`; isolated JS checks passed, but real two-client sessions, Python integration, VRM rendering, and mobile FPS require validation. No WebSocket server was added.


### V27.1 Player Synchronization
Remote players use an eight-snapshot bounded history, adaptive interpolation delay (350–1700 ms) estimated from server sample spacing and arrival jitter, and gait sampled on the same timeline as position, heading and jump. Duplicate or older samples no longer overwrite accepted peer state. Large discontinuities reset history and snap the transform; stale movement and jump decay to idle/grounded. Existing avatar preset, appearance fields, pets and vehicle replication remain in use; custom VRM clothing/accessories and mounted horse synchronization are not expanded in this release. Run `node test_sync271.cjs` and `node test_multiplayer270.cjs`. Both scripts passed in an isolated JavaScript environment with an assert shim, including 576 timing samples; 16 inline scripts parsed. Real multi-client rendering, latency, FPS and server deployment remain to be verified.


### V27.2 Real-time Animation
Actions and vehicle state now follow the same snapshot timeline as position. Smoothed gait and phase, estimated jump velocity, and a short landing response drive remote procedural and VRM poses. Remote horses use a lightweight procedural model with animated legs and rider pose rather than replicating the local Western Horse GLB skeleton or rein IK. Existing HTTP presence accepts horse as a cosmetic vehicle; no ownership or economy changes. Run `node test_animation272.cjs`, `node test_sync271.cjs`, and `node test_multiplayer270.cjs`. All three passed in isolated JavaScript with an assert shim, including 960 motion frames and 576 timing samples; 16 inline scripts parsed. Visual quality, foot contact, multi-client gameplay, Python integration, mobile FPS and deployment still need verification.


### V27.3 Network Optimization
Adaptive HTTP presence cadence targets roughly 650 ms for urgent interactions, 750 ms for movement/nearby peers, and 2200 ms for quiet sessions, with bounded RTT-based adjustments and jitter. Scheduler checks every 200 ms locally, skips hidden/offline/unauthenticated sessions and prevents overlapping pulses. Diagnostics expose smoothed RTT, target cadence and serialized response character counts (not actual wire bytes). Six SQLite presence companion tables use conditional UPSERTs to avoid unchanged writes; expired presence cleanup skips orphan scans when no presence expires. Existing privacy, blocking, consent and payload compatibility remain. Run the four V27 JavaScript regression tests. All four passed in isolated JavaScript with an assert shim, including 984 cadence cases; 16 inline scripts parsed. Python end-to-end, real network throughput, server load, multi-client FPS and deployment require live verification; no WebSocket server or delta protocol added.


### V27.4 Shared World
Public online sessions use the existing server clock for deterministic NPC schedule transitions and distance-based route sampling. NPC routes are calculated locally against collision geometry; when no route exists, the NPC uses the destination anchor after a short delay. Wildlife uses stable spawn IDs and seeded 12-second out-and-back movement slots based on shared time, weather and species; nearby-player fleeing remains an offline behavior only. Existing day/night, weather and festival schedules remain clock-driven. Private-world discovery ignores hidden NPCs and animals. No new network messages or server-authoritative actor replication; route availability, local obstacles, rendering and network clock skew can still produce differences. Local quests, inventory and personal environmental effects remain unchanged. Five V27 JavaScript regression scripts and two prior NPC/festival scripts passed in an isolated JS environment with an assert shim, including 19,200 schedule checks; 16 inline scripts parsed. Actual multi-client gameplay, path arrivals, FPS, Python integration and deployment require live verification.


### V27.5 Multiplayer Interaction
Paired emotes require reciprocal server-confirmed targets, accepted friendship, public world, unblocked accounts, recent presence and stationary unmounted grounded participants. Client additionally checks mode-specific distance and height before applying poses. Incoming invitations are filtered, deduplicated, announced and can be ignored locally or cancelled; paired photography requires readiness and a short settle delay. Hand/duet reach reuses bounded procedural or VRM arm IK where bones are available, without forcing character positions. Moving still cancels the interaction; synchronized hand-in-hand walking, exact finger contact and third-person pair choreography are not implemented. All six V27 JS regression suites passed using an isolated JS runner with an assert shim, including 1,080 readiness cases; 16 inline scripts parsed. Server Python runtime, real two-client consent and animation, visual quality, FPS and Render live status require verification.


### V27.6 Connection Recovery
Temporary network loss freezes existing remote avatars for at most eight seconds from the last accepted presence response, excludes stale peers from interactive selection, cancels paired consent and clears ephemeral chat/invitations. After the cache expires, remote actors and shared clock are cleared. Response epochs reject stale network results after backgrounding or recovery; new accepted snapshots reset cached peer histories. Going offline or hiding the tab saves local progress; backgrounding stops movement. Existing opt-in revision-guarded cloud autosave may retry after a valid same-account recovery, never auto-overwrites a conflicting revision. Seven V27 JavaScript suites passed in isolated JS with an assert shim, including 670 recovery checks; 16 inline scripts parsed. No guarantee of cloud persistence on free Render or recovery after session expiry. Actual browser network interruptions, mobile app switching, multi-client recovery and deployment require live verification.


### V27.7 Multiplayer Final
Presence freshness is checked independently of pending network requests; expired snapshots and clock are removed after 8 seconds, paired consent after 4 seconds. Account transitions invalidate prior responses, clear invitations and reset the presence roster; private-world rendering immediately removes remote peers. Remote horse fallback geometry uses existing distance-based LOD; only peer-owned rig lathe geometries are disposed, and peer render diagnostics use a single traversal. The V26.7 regression now accepts later daylight cache versions. All 8 Living World and 8 Multiplayer JavaScript regression scripts passed in an isolated JS environment with assert/fs shims, including 4914 new final checks; 16 inline scripts parsed. This is a source-level release milestone, not a completed browser multiplayer or FPS certification. Python runtime, VRM contact quality, actual multi-client recovery, server capacity and Render deployment require live verification. HTTP polling, deterministic world schedules and opt-in cloud saves remain; no new WebSocket server or persistent disk added.

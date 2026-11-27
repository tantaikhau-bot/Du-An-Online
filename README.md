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

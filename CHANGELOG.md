# WISH WORLD — Release history

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

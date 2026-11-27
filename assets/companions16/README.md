# V16 — Next Gen Companions (staging only)

No new production GLBs are included yet. Keep the current game working until all five assets pass review.

Expected: fox.glb, cat.glb, rabbit.glb, dragon.glb, deer.glb. Self-contained textures, skinned mesh, clips named idle/walk/run/reaction; optional jump/fly/sleep/eat/sit. Forward -Z, Y up, in-place locomotion. Preserve PBR materials. Target 8k triangles mobile, 25k desktop maximum; 512–1024 textures.

Record authorship and commercial-use license, inspect silhouette and motion against approved concept art, check limb clipping, measure mobile performance. Run python tools/validate_companions16.py; only after visual and license review run with --approve. The game does not activate the new assets until the manifest approves all five. This is a staging branch, not a V16 release.

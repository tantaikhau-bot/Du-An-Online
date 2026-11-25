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

# Traveler / Lữ Khách — appearance prototype v1

Base: V35.2.8, m1, Sakurada_Fumiriya VRM sample. This branch is not a production release. Current change: softer skin/hair/fabric cel shading and outline, bounded surface roughness. No change to source mesh, bone transforms, maps, textures, facial blendshapes, animation, or any other roster entry. Run node test_traveler_appearance.cjs.

## Target original asset (not yet implemented)
Adult male explorer, naturally proportioned athletic lean body, distinctive mature oval face with defined jaw and restrained eye size, layered wind-swept dark hair. Practical earth-tone woven tunic, fitted leather travel coat, asymmetrical shoulder protection, weathered boots, belt with attached sword sheath. Model a dedicated silhouette, face, garments and hair rather than recoloring shared VRM. Design is a proposal, not a new asset.
 
Use a dedicated licensed or original rigged VRM, preserving compatible humanoid mapping, eye/blink expressions and finger bones. Validate source provenance, skinning and clothing clipping, sheath/hand alignment, idle/walk/run and melee stances, portrait preview and gameplay, mobile GPU and fallback behavior before integrating. Aim for <= 35k triangles and texture atlas <= 2048 px as initial targets, benchmark actual hardware. No production deployment until visual check.

## V2 — reversible geometry study
A bounded rest-space width field widens the lower jaw and upper torso slightly, narrows the crown and waist, leaves height and depth unchanged, and transforms relative and absolute position morph targets. Only m1 on the original male source uses cloned geometry; switching presets or releasing restores the source. Original normals and tangents remain authored; visual shading and expression alignment must be checked in a browser. 1,000 numerical sample points checked for symmetry, bounds and unchanged vertical/depth positions. Three.js geometry regression is provided but not yet executed. This is a derivative sculpt, not a new standalone character asset. No production deployment.

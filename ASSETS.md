# Animated character assets — 2.2

This release uses real mesh assets and authored skeletal animations from [Quaternius Ultimate Space Kit](https://quaternius.com/packs/ultimatespacekit.html), released March 2023 under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Source GLTF files include embedded atlas textures and animation clips. They are preserved in `assets/characters/sources/`; optimized standard GLB exports can be opened in Blender.

| Game role | Original model | Runtime motion | Optimized triangles |
|---|---|---|---|
| Repair squad | Mech_RaeTheRedPanda | Run | 1,715 |
| Swarm drone | Enemy_Small | Fast_Flying | 1,936 |
| Runner, armored stalker, boss | Enemy_Large | Run | 2,642 |
| Ranged spitter | Enemy_Flying | Fast_Flying | 2,730 |

Models are scaled to gameplay footprints and tinted by role. Brutes and bosses use a larger stalker silhouette; spitters have a purple tint. Original rigged exports retain the other authored clips for future attack, reaction, and death transitions. The present game loops locomotion; firing and defeat are shown through projectile and particle effects.

Local Blender 4.5.1 reduces selected models and samples 16 poses of each locomotion clip. `tools/bake_characters.py` recreates the runtime data from the included source files. The browser interpolates position and normal textures, with an independent phase for each character. All squad members share one character draw; enemies share draws by role. Up to 360 enemies can exist; distant entities outside the road view are omitted from character drawing. No online model service, external model loader, or sign-in is needed to play, including the Desktop copy.

## Meshy production brief

Meshy supports rigging humanoids and exporting animated GLB, as documented in its [Rigging API](https://docs.meshy.ai/en/api/rigging) and [Animation API](https://docs.meshy.ai/en/api/animation). Access requires a signed-in workspace or an authorized API key and sufficient credits. At this checkpoint, the Meshy workspace is signed in but shows 0 credits, and the user has not yet supplied a generation credit limit; **no Meshy generation or credit spending has occurred**.

Start with two humanoids, rather than spending credits on every swarm creature. Use smart topology, a clear silhouette, separated limbs in an A-pose, and a target of 1,500–3,000 triangles after optimization. Export a rigged GLB with an in-place run/walk clip. Normalize height and orientation with Blender, then bake into the same crowd format. Keep service credentials outside this public repository. Verify the license shown by the workspace before distributing a generated asset and retain its attribution if required.

**Repair guardian:** Stylized tall humanoid science-fiction rescue android, mint and ivory armor, navy joints, rounded visor with warm amber eyes, compact forearm pulse blaster, small medical cross on chest, sturdy readable boots, distinct separate fingers and limbs, friendly confident silhouette, clean game-ready low-poly surfaces, fully textured, symmetrical A-pose, no environment or ground platform, no floating accessories. Readable from an elevated camera.

**Armored cell stalker:** Tall imposing humanoid synthetic invader, coral and deep-plum segmented armor, pale luminous eyes, exaggerated shoulder plates and angular head, visibly distinct articulated limbs and large feet, claw-like mechanical hands, no weapon held across the torso, clean low-poly game character, fully textured symmetrical A-pose, no background or base. Readable from an elevated camera. Reuse at larger scale with amber accents for the boss.

A generated character must pass the same animated-deformation, topology, browser-rendering, offline, and crowd-budget checks as the present assets before it replaces them.

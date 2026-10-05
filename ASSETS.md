# Animated character assets — 2.4

The squad and armored pursuers use two original textured robots generated with Hyper3D Rodin. The mint and ivory **rescue guardian** has amber eyes and a teal chest emblem. The coral and plum **armored stalker** has angular armor and bright eyes. Local Blender 4.5.1 supplies their 17-bone skeletons and authored running loops.

[Meet the squad](character-gallery.html) lets you rotate the characters, pause motion, inspect a 150-pursuer crowd drill, and download animated GLBs. It also works offline from the Desktop folder.

| Game role | Source | Motion | Triangles | Runtime vertices |
|---|---|---|---|---|
| Player and recruited squad | Rodin rescue guardian | Run · 24 poses | 2,700 | 2,964 |
| Runner, armored stalker and boss | Rodin armored stalker | Run · 24 poses | 2,700 | 2,953 |
| Swarm drone | Quaternius Enemy_Small | Fast_Flying · 16 poses | 1,936 | 1,477 |
| Ranged spitter | Quaternius Enemy_Flying | Fast_Flying · 16 poses | 2,730 | 2,253 |

## Rodin production and provenance

The user authorized the 7 credits available on October 5, 2026. Three confirmations used **1.5 credits total**, leaving **5.5 credits** at the last observed balance. No subscription or credit purchase was made.

The first Gen-2.5 guardian produced a complete preview but required a subscription for download. Production used the supported **Gen-1.5 Zero** export workflow for both final characters. The original PBR GLB, shaded GLB and emissive map are retained under `assets/characters/rodin/guardian-original/` and `stalker-original/`. References, prompts, job URLs, SHA-256 hashes and costs are recorded in [RODIN-ASSET-PLAN.md](RODIN-ASSET-PLAN.md) and `assets/characters/rodin-ledger.json`.

These are Rodin-generated project assets, subject to [Hyper3D's output terms](https://hyper3d.ai/legal/terms), section 5(b), and applicable third-party rights. They are not the CC0 Quaternius assets. The ordinary permitted download controls supplied both meshes; no subscription restriction was bypassed.

Rodin's [animation workflow](https://hyper3d.ai/use-cases/animation) supplies meshes ready for rigging. The final downloads were static 60,000-triangle meshes. Blender welds UV-boundary duplicates before reducing each to 2,700 triangles, retains per-corner UVs, attaches a biped with blended joint weights, and authors opposite arm/leg motion, knee bends, hip movement and chest counter-rotation. Reproduction:

```
blender --background --python tools/rig_rodin.py -- medic
blender --background --python tools/rig_rodin.py -- stalker
blender --background --python tools/bake_rodin.py
```

The rigging commands save editable `.blend` files alongside the originals. The baker preserves the flying creatures, updates `medic.glb` and `stalker.glb`, and samples 24 running poses into the runtime data. Standard GLBs retain the skeleton and Run action. Attack and death clips are not authored for the new robots yet; projectiles and particles represent those events.

## Browser and mobile rendering

Shared 1,024-pixel base-color atlases preserve faces and armor detail. Atlases and UVs are embedded in `character-data.js`, keeping direct-file play self-contained. Position and normal textures interpolate motion with independent phases per character.

Squad members share one animated draw; enemies share draws by role, retaining at most five character draws. Up to 360 enemies can exist; entities outside the road view are omitted from character drawing. No online model loader, generation service, sign-in or API key is needed to play. Low graphics quality reduces pixel density. Desktop browser checks do not establish physical-phone frame rates.

## Quaternius assets

Flying creatures come from [Quaternius Ultimate Space Kit](https://quaternius.com/packs/ultimatespacekit.html), released March 2023 under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Original GLTF files with textures and clips remain in `assets/characters/sources/`, including the previous mech and large-enemy models. `tools/bake_characters.py` recreates the earlier CC0 bake; run the Rodin steps afterward to restore this release's humanoids.

Meshy was investigated earlier but its signed-in workspace showed no credits. No Meshy generation occurred.

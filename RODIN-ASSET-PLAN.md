# Rodin character pilot

Prepared October 5, 2026 for Neon Swarm: Bodyguard.

Use Hyper3D Rodin for custom textured character meshes, then local Blender for cleanup, rigging, animation and crowd optimization. [Rodin's animation workflow](https://hyper3d.ai/use-cases/animation) describes FBX/GLB meshes ready for rigging; a finished running character still needs animation work.

## Budget and current status

The user authorized using the existing available Rodin credits for these assets. The signed-in workspace showed **7 credits** at the start. No subscription or credit purchase is authorized. The Gen-2.5 generation control shows **0.5 credits**; record each actual confirmation cost and remaining balance below. Start with one guardian, inspect the result, then create a stalker in the same visual style. Use free redos where offered before confirming an unsuitable result.

Hyper3D advertises previews before paid confirmation and plan-dependent exports. Check the actual result/export screen; a preview is not evidence that a downloadable model has been obtained. [Pricing](https://hyper3d.ai/pricing?lang=en). Rodin output rights are described in section 5(b), subject to applicable restrictions. Retain the asset's export/license details before adding its files to the public game. [Terms](https://hyper3d.ai/legal/terms).

| Asset | Purpose | Status | Credits confirmed |
|---|---|---|---|
| Rescue guardian | Player and recruited squad | Gen-1.5 exported, locally rigged and installed; Gen-2.5 preview retained | 1.0 |
| Armored stalker | Pursuers, armored enemies and boss variant | Gen-1.5 exported, locally rigged and installed | 0.5 |

The actual download screen requires a subscription for Gen-2.5 files and explicitly permits free Gen-1.5 downloads. The completed Gen-2.5 guardian remains in the workspace at https://hyper3d.ai/workspace/rodin/ca6e7649-137e-449b-bbc7-0be4ab71b726. No subscription was purchased. Production is testing **Gen-1.5 Zero** with the same original references to obtain models through the supported free export route. The Gen-1.5 enemy job is https://hyper3d.ai/workspace/rodin/22421bdf-efc6-41a0-8814-ad1006cdc538.

## Guardian prompt

Original stylized tall humanoid science-fiction rescue android for a colorful mobile action game. Mint green and ivory armor plates over dark navy articulated joints, friendly rounded helmet with a black visor and warm amber eyes, bright teal circular rescue emblem on the chest, broad shoulders, narrow waist, long clearly separated arms and legs, large sturdy boots, simple five-finger hands. Clean readable silhouette and rich painted surface details, softly rounded hard-surface armor, symmetrical neutral T-pose, arms straight out horizontally with open hands, legs slightly apart, palms facing down. One complete character, fully visible head to feet. No weapon, no accessories floating around it, no base or scenery. Original design, no text or logos. Textured game character with economical topology and distinct elbow, knee, shoulder and hip joints suitable for skeletal rigging. Readable from an elevated camera.

## Stalker prompt

Original stylized tall sci-fi humanoid robot game character with coral red and deep plum segmented armor over dark articulated joints. Beetle-inspired angular helmet with pale luminous eyes, broad rounded shoulder plates, narrow waist, long separated arms and legs, large stable feet, simple five-finger mechanical hands. Playful toy-like science-fiction style matching a mint rescue android. Clean readable silhouette, rich painted surface details, symmetrical neutral T-pose, arms straight out horizontally, hands open, legs slightly apart. One complete textured character, fully visible head to feet on a plain white background. Economical topology and clear shoulder, elbow, hip and knee joints for skeletal animation. No text, no logos, no weapon or pedestal.

## Settings and integration

Use Gen-1.5 Zero with one reference per job under the current account's export permissions. Gen-2.5 High remains an option if the user later obtains a plan that enables its downloads. Enable T/A-pose conversion if available. Request a textured GLB, or FBX with texture maps when GLB is unavailable. Select low-poly export if the account offers it; otherwise reduce the mesh in Blender. Target 1,500–3,000 triangles per character after optimization. Keep the recognizable silhouette before adding tiny detail.

Preserve downloaded originals, prompts, job URLs and actual costs. In Blender, inspect rear surfaces and limb separation, normalize orientation and scale, rig the biped, and create an in-place locomotion loop. The guardian uses steady forward running; the stalker uses a heavier hunched pursuit. A larger stalker with amber accents can serve as the boss without another generation job.

Bake the running meshes into the existing shared crowd animation format. The current renderer samples vertex colors from textures, so verify how the generated paint looks at game distance; preserve full textures in the editable GLB. A detailed export alone will not automatically improve the current browser material.

Compare the pilot at actual squad size on desktop and phone layouts. Inspect feet, knees, wrists, loop seams, weapons attached later as game effects, and overlap in dense waves. Check crowded Expert play and offline loading before replacing the present animated assets. Save generated originals and playable checkpoints to the Desktop project as work proceeds.

## Completed pilot — release 2.4.0

Both final Gen-1.5 Zero exports are downloaded and installed. Total actual balance decrease: **1.5 credits**, with **5.5 remaining**. No purchase or subscription. Originals, references, credit events and hashes are retained. Each static 60,000-triangle export was welded and reduced to 2,700 triangles, then given a 17-bone biped and an authored 24-pose Run loop. Runtime vertices: guardian 2,964; stalker 2,953. Full 1,024-pixel atlases and UVs now preserve their faces and armor in the browser. The flying creature assets remain available.

Open `character-gallery.html` to orbit the characters, pause their animation, inspect a 150-pursuer crowd or download animated GLBs. Editable Blender scenes are saved in `assets/characters/rodin/`. Only locomotion is authored at this checkpoint; firing and defeat use game effects.

# Development checkpoints



- Research and design saved. Original robot skyway theme selected.

- First playable checkpoint saved: original 3D robots and city, gate arithmetic, recruit and weapon crates, shields, Overdrive, three modes, bosses, sector upgrades, pause, and local records.

- Visual polish saved: rounded robot helmets, antennas, battery packs, improved camera framing, and batched scenery for fewer draw calls.

- Ten rule checks passed. An automated player completed 20 seeded campaigns. Desktop and phone viewport previews verified live steering, growth to 60, weapon loot, pause, and a sector victory with upgrade choices.

- Final responsive checks passed at desktop, portrait phone, compact phone, and landscape phone sizes. Graphics settings persist across reopening. Scenery and road decorations use instanced rendering.

- Published repository: https://github.com/RorriMaesu/neon-swarm

- Live game: https://rorrimaesu.github.io/neon-swarm/

- GitHub Actions rule checks and Pages deployment passed. The hosted 3D scene was opened and verified.

- Complete source, research, design notes, instructions, and verification notes are saved with the game. See QA.md for the physical-phone and offline-preview testing limits.

- Final balance polish: endless enemy and boss toughness accelerates after sector three, so a strong squad still faces increasing pressure. The campaign and daily balance are preserved.



Open index.html or double-click Play Neon Swarm.cmd to play. This folder is updated throughout development.



## Bodyguard 2.0 checkpoint



- Rebuilt campaign growth, capsule defense, four combat profiles, warnings, weapon caps, and Overdrive.

- All 28 chapters are selectable, with 224 concepts, three prompt forms, 16 pathways, and two original scanner diagrams.

- Added untimed Focus encounters, independent knowledge settings, hints, explanations, spaced retries, Study mode, and a final-boss knowledge sequence.

- Saved missions restore combat and learning; sector retry, export/import, and version 1 record migration are implemented.

- 25 rule and learning checks passed; a 480-run balance audit and desktop/phone-layout browser checks passed.

- The playable Desktop copy is updated as development progresses. Content and physical-device review limits are recorded in QA.md.



## Section expansion 2.1 checkpoint



- Added 15,976 source-linked questions across all 169 numbered sections and 28 introductions.

- The source map includes 606 learning objectives, 1,724 table questions, and 52 authored mechanism/career supplements.

- Added section selection, a coverage browser, distinct-question progress, 20/40/full Study sets, unseen-question priority, and compact saved decks.

- Preserved prior checkpoints and records.

- All 31 automated checks and section-focused desktop/phone browser checks passed.

- COVERAGE.md and coverage.json document the scope and instructor-review limits.



## Hordes and animated characters 2.2 checkpoint



- Expert waves now contain 28–50 enemies in sector one, arriving every 2.65–2.3 seconds, with armored pursuers, fast flanks, and ranged spitters.

- All profiles have denser waves; bosses receive continuing reinforcements. Pulse ammunition penetrates a second target, and bullets cannot erase distant waves before they reach the visible road.

- Added four real CC0 animated character assets, optimized with local Blender, and a larger animated boss. Shared vertex animation textures render independent animation phases with five character draws at most.

- 37 rule, learning, and model checks pass. A 600-run balance audit separates the four settings and demonstrates Expert victories under a tactical policy.

- Desktop progress is saved. Meshy is signed in but shows 0 credits; custom generation awaits available credits and the user’s spending limit.


## Question review 2.3 checkpoint

- Audited every prior question ID; retired 5,781 unsafe entries, corrected retained questions, and added 101 replacements. Current bank: 10,296 questions.
- Preserved all sections, previously represented teaching headings, objectives, and historical progress.
- Added persistent presentation and per-question review history, source-fact cooldowns, boss selection with history, labeled spaced retries, and refreshed older checkpoints.
- All 47 automated checks and final local browser checks pass, including repeated-session variety, labeled review, progress transfer, old-session migration, phone layouts, and offline animated models.

- GitHub Pages and all 28 hosted banks passed the review scenarios; final release 2.3.1 clarifies the diencephalon identification prompt.

## Rodin characters 2.4 checkpoint

- Downloaded original guardian and stalker PBR/shaded models through Rodin Gen-1.5 Zero. The Gen-2.5 guardian preview remains subscription gated; no purchase was made.
- Used 1.5 of the 7 existing credits. Last observed balance: 5.5. Prompts, references, job URLs, hashes and costs are retained.
- Welded and optimized both meshes to 2,700 triangles, created 17-bone bipeds, and authored 24-pose running loops in local Blender.
- Added shared base-color atlases and UVs to the crowd renderer, retaining five or fewer character draws. Standard animated GLBs and editable Blender scenes are saved.
- Added an offline character gallery with rotation, animation pause, downloads and a 150-pursuer/18-guardian crowd drill.
- Browser, mobile-layout and final publishing results are recorded in QA.md as verification completes.

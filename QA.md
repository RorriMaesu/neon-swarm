# Bodyguard verification — current release 2.3

## Rules and learning

47 Node checks pass, including complete section-bank and question-review checks. The combat checks cover: gate math, road-safe formations, date seeding, one-time gate selection, crate collection, shield defeat, bounded Overdrive, boss transitions, seeded replay, late endless pressure, selectable profiles, leaks and per-wave caps, a feasible escape for every squad size, bounded doubling, capped learning bonuses, deterministic checkpoint restoration, all 28 chapter banks, shuffled correct-answer identities, focused-topic selection, assisted and later-day progress, import validation, appropriate feedback gauges, and bounded boss exposure.

The campaign balance audit covers 480 runs, across four policies and four combat settings. See BALANCE.md. No stationary policy won; the settings produce clearly different pressure. This is not a human usability or learning-effectiveness study.

## Browser verification

An isolated local Edge browser with WebGL tested the actual interface at 1440×1000, 390×844, 320×720, and 844×390. Menus and Focus encounters fit without horizontal page overflow; the launch control remains available on a compact phone layout.

Verified: 28 selectable chapters; four difficulty settings; search by topic; Study practice; deliberate answer selection; wrong-answer explanations; hints; pathway ordering; old-record migration; progress persistence; saving and restoring a Focus encounter; frozen combat, integrity, and charge during reading; steering; pause; restoring combat; defeat and sector retry; progress export/import; keyboard answering; three final-boss decisions and a temporary weak point; hint assistance retained through saving and reloading; resetting learning during a mission without recreating the saved mission. No browser exceptions were observed.

The runtime contains only relative local scripts and assets. No runtime question generator or external content fetch is used. Static checks verify local assets are present. Direct file:// execution now passes an isolated Edge check for animated model rendering and chapter 28 Study loading.

## Content review and limits

Core concepts were author-checked against public OpenStax chapter references. The reviewed bank contains 10,296 source-linked questions, including public definitions, passage completion, table relationships, and authored supplements. Every numbered section and introduction has questions; all named explanatory headings are represented. The original authored prompts and simplified diagrams are also preserved. See COVERAGE.md for the scope of this audit. It has not received an independent A&P instructor review. Automated content checks detect structural errors, not every possible ambiguity or factual error. Additional objectives can be added using the same content format.

Phone checks use viewport emulation on this PC. Physical iOS/Android touch behavior, sustained frame rate, and device speech voices remain to be field-tested. The read-aloud control depends on browser/device support. Local progress is per browser; export/import transfers learning records, not automatic cross-device sync.

Classic Three.js prints a deprecation notice. The pinned local distribution supports this build and its offline asset packaging.

## Section expansion verification

All 28 section selectors and the section browser passed browser checks. Scoped 40-question sessions, full-section completion, compact saves, restoring resolved answers and hints, frozen chapter combat, progress export, and phone/compact-phone layouts passed with no browser exceptions or failed requests. Unit checks validate all question banks, scope integrity, answer identities, exact restoration of answer order, review priority, unseen-question selection, and distinct-question progress.

This audit establishes broad section/topic coverage and structural integrity. It does not certify every textbook fact or validate every distractor with an instructor. No physical-phone or measured learning-efficacy study has been completed.

## Animated characters and pressure 2.2 verification

All 37 game, learning, and character checks pass. New checks cover denser Expert waves, faster boss reinforcements, single-lane spitter telegraphs, bounded crowd capacity, bullet penetration/range, real animated deformation, and valid GLB geometry. A 600-campaign-seed audit is recorded in BALANCE.md and balance-audit-v3.json.

Isolated Edge checks passed all chapter/section controls, full-section practice, educational Focus freezing, boss decisions, hints and saves, steering, combat pause/resume, defeat/retry, keyboard answers, progress export/import, and 320/390-pixel phone layouts. A stress fixture displayed 135 Expert enemies with all four model assets loaded, 85 total scene draw calls, about 319,470 rendered triangles, and no JavaScript, shader, or failed-request errors. Those are rendering counts on this PC, not a physical-phone frame-rate claim.

Source GLTF and optimized GLB files are included; active animations are interpolated locomotion clips with per-character phases. Attack, reaction, and death clips remain available in the exports but are not separate gameplay animation states yet. Meshy custom generation has not occurred: the signed-in workspace showed 0 credits, and a spending limit was not supplied.

## Question review and variety 2.3 verification

Every previous question has an editorial disposition in question-review.json. 5,781 unsafe items were retired and 101 source-grounded questions were added to preserve affected topics; 10,296 questions remain. All 169 numbered sections, 28 introductions, previously represented teaching headings, and 606 learning goals remain represented. Source-aware screening covers navigation/objectives, missing references and figures, malformed blanks, scientific target identity, aliases and choices, and unique structured table rows. This combines automated full-bank checks and targeted editorial review; it is not individual instructor approval of every retained item.

All 47 Node checks pass. An isolated Edge browser verified 12 successive abandoned sessions with fresh facts, reload persistence, labeled missed-answer reviews after two intervening facts, compact retry restoration, presentation-history export/import between browser contexts, and migration of the exact retired nervous-tissue link question while preserving completed results and historical question IDs.

The final bank also passed all chapter/section selectors, scoped Study sessions, full-section completion, hints and wrong-answer resume, frozen combat during Focus, coverage browsing, and 320/390-pixel phone layouts with no browser exceptions or failed requests. Three final-boss decisions and hint restoration passed. Animated asset and offline checks passed with 135 Expert enemies, 85 scene draw calls, no shader errors, and direct-file chapter 28 Study loading.

Local browser reports are saved in the development workspace. Hosted verification runs the same review scenarios against the published game. Physical-phone and independent instructor-review limits described above still apply.

## Rodin characters 2.4 verification

All 48 Node checks pass, including valid animated GLBs, 17-bone skins, 24-pose humanoid motion, bounded topology, finite UVs, embedded JPEG atlases and a smooth loop boundary. Both humanoids have 2,700 triangles and fewer than 3,000 runtime vertices. The bank and combat rule checks continue to pass.

Blender inspection covered front, rear and elevated views of both original meshes and sampled running poses. The original UV-split surface is welded before decimation to prevent disconnected armor edges. Close-up browser previews show the generated paint and independently phased motion without shader or JavaScript errors. The gallery crowd drill renders 150 pursuers and 18 guardians in four total scene draws, with 453,602 triangles including the floor. This is a renderer count, not a physical-phone performance measurement.

Local browser checks covered desktop Expert combat, the corrected 390-pixel gallery framing, a verified 390-by-844 gameplay viewport, pointer steering, combat pause and saving back to setup. All runtime resources are local or embedded; hashes verified the complete saved Desktop checkpoint. The in-app browser blocks file:// navigation, so direct-file execution of this new release could not be checked in that browser. The localhost and hosted paths remain testable; direct-file compatibility is supported by the self-contained asset format and relative-path checks.

Only running locomotion is authored for the new robots. Firing, damage and defeat still use game effects. Their original generated exports, local rigging tools, editable Blender scenes, credit ledger and provenance are retained. Total actual observed Rodin credit use: 1.5; remaining balance: 5.5. No purchase or subscription.

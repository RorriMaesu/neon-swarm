# Bodyguard 2.0 verification

## Rules and learning

31 Node checks pass, including complete section-bank checks. The combat checks cover: gate math, road-safe formations, date seeding, one-time gate selection, crate collection, shield defeat, bounded Overdrive, boss transitions, seeded replay, late endless pressure, selectable profiles, leaks and per-wave caps, a feasible escape for every squad size, bounded doubling, capped learning bonuses, deterministic checkpoint restoration, all 28 chapter banks, shuffled correct-answer identities, focused-topic selection, assisted and later-day progress, import validation, appropriate feedback gauges, and bounded boss exposure.

The campaign balance audit covers 480 runs, across four policies and four combat settings. See BALANCE.md. No stationary policy won; the settings produce clearly different pressure. This is not a human usability or learning-effectiveness study.

## Browser verification

An isolated local Edge browser with WebGL tested the actual interface at 1440×1000, 390×844, 320×720, and 844×390. Menus and Focus encounters fit without horizontal page overflow; the launch control remains available on a compact phone layout.

Verified: 28 selectable chapters; four difficulty settings; search by topic; Study practice; deliberate answer selection; wrong-answer explanations; hints; pathway ordering; old-record migration; progress persistence; saving and restoring a Focus encounter; frozen combat, integrity, and charge during reading; steering; pause; restoring combat; defeat and sector retry; progress export/import; keyboard answering; three final-boss decisions and a temporary weak point; hint assistance retained through saving and reloading; resetting learning during a mission without recreating the saved mission. No browser exceptions were observed.

The runtime contains only relative local scripts and assets. No runtime question generator or external content fetch is used. Static checks verify local assets are present. Direct file:// execution now passes an isolated Edge check for animated model rendering and chapter 28 Study loading.

## Content review and limits

Core concepts were author-checked against public OpenStax chapter references. The expanded bank contains 15,976 source-linked questions, including public definitions, passage completion, table relationships, and authored supplements. Every numbered section and introduction has questions; all named explanatory headings are represented. The original authored prompts and simplified diagrams are also preserved. See COVERAGE.md for the scope of this audit. It has not received an independent A&P instructor review. Automated content checks detect structural errors, not every possible ambiguity or factual error. Additional objectives can be added using the same content format.

Phone checks use viewport emulation on this PC. Physical iOS/Android touch behavior, sustained frame rate, and device speech voices remain to be field-tested. The read-aloud control depends on browser/device support. Local progress is per browser; export/import transfers learning records, not automatic cross-device sync.

Classic Three.js prints a deprecation notice. The pinned local distribution supports this build and its offline asset packaging.

## Section expansion verification

All 28 section selectors and the section browser passed browser checks. Scoped 40-question sessions, full-section completion, compact saves, restoring resolved answers and hints, frozen chapter combat, progress export, and phone/compact-phone layouts passed with no browser exceptions or failed requests. Unit checks validate all question banks, scope integrity, answer identities, exact restoration of answer order, review priority, unseen-question selection, and distinct-question progress.

This audit establishes broad section/topic coverage and structural integrity. It does not certify every textbook fact or validate every distractor with an instructor. No physical-phone or measured learning-efficacy study has been completed.

## Animated characters and pressure 2.2 verification

All 37 game, learning, and character checks pass. New checks cover denser Expert waves, faster boss reinforcements, single-lane spitter telegraphs, bounded crowd capacity, bullet penetration/range, real animated deformation, and valid GLB geometry. A 600-campaign-seed audit is recorded in BALANCE.md and balance-audit-v3.json.

Isolated Edge checks passed all chapter/section controls, full-section practice, educational Focus freezing, boss decisions, hints and saves, steering, combat pause/resume, defeat/retry, keyboard answers, progress export/import, and 320/390-pixel phone layouts. A stress fixture displayed 135 Expert enemies with all four model assets loaded, 85 total scene draw calls, about 319,470 rendered triangles, and no JavaScript, shader, or failed-request errors. Those are rendering counts on this PC, not a physical-phone frame-rate claim.

Source GLTF and optimized GLB files are included; active animations are interpolated locomotion clips with per-character phases. Attack, reaction, and death clips remain available in the exports but are not separate gameplay animation states yet. Meshy custom generation has not occurred: the signed-in workspace showed 0 credits, and a spending limit was not supplied.

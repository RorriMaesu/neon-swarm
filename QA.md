# Bodyguard 2.0 verification

## Rules and learning

25 Node checks pass: gate math, road-safe formations, date seeding, one-time gate selection, crate collection, shield defeat, bounded Overdrive, boss transitions, seeded replay, late endless pressure, selectable profiles, leaks and per-wave caps, a feasible escape for every squad size, bounded doubling, capped learning bonuses, deterministic checkpoint restoration, all 28 chapter banks, shuffled correct-answer identities, focused-topic selection, assisted and later-day progress, import validation, appropriate feedback gauges, and bounded boss exposure.

The campaign balance audit covers 480 runs, across four policies and four combat settings. See BALANCE.md. No stationary policy won; the settings produce clearly different pressure. This is not a human usability or learning-effectiveness study.

## Browser verification

An isolated local Edge browser with WebGL tested the actual interface at 1440×1000, 390×844, 320×720, and 844×390. Menus and Focus encounters fit without horizontal page overflow; the launch control remains available on a compact phone layout.

Verified: 28 selectable chapters; four difficulty settings; search by topic; Study practice; deliberate answer selection; wrong-answer explanations; hints; pathway ordering; old-record migration; progress persistence; saving and restoring a Focus encounter; frozen combat, integrity, and charge during reading; steering; pause; restoring combat; defeat and sector retry; progress export/import; keyboard answering; three final-boss decisions and a temporary weak point; hint assistance retained through saving and reloading; resetting learning during a mission without recreating the saved mission. No browser exceptions were observed.

The runtime contains only relative local scripts and assets. No runtime question generator or external content fetch is used. Static checks verify local assets are present. Direct file:// browser execution has not been visually verified by the preview tools.

## Content review and limits

Core concepts were author-checked against public OpenStax chapter references. The bank contains original prompts, simplified diagrams, and selected objectives. It has not received an independent A&P instructor review. Automated content checks detect structural errors, not every possible ambiguity or factual error. Additional objectives can be added using the same content format.

Phone checks use viewport emulation on this PC. Physical iOS/Android touch behavior, sustained frame rate, and device speech voices remain to be field-tested. The read-aloud control depends on browser/device support. Local progress is per browser; export/import transfers learning records, not automatic cross-device sync.

Classic Three.js prints a deprecation notice. The pinned local distribution supports this build and its offline asset packaging.

# Verification

## Game rules

Nine checks passed with Node’s built-in test runner: arithmetic operations and overflow; formation stays inside the road without stacking bots onto one edge; date seeding; one-time gate selection; crate break and collection; shields and defeat; Overdrive requirements and effects; mode-specific boss transitions; seeded repeatability.

An automated player completed 20 of 20 seeded campaigns. Winning runs took about 136–148 seconds. This checks that full campaigns are reachable through ordinary steering, crate collection, gate choices, and earned Overdrive. It is not a substitute for human fun testing.

## Browser checks in progress

The 3D scene loaded without runtime errors in the desktop preview. Tested real drag steering, squad growth to 60, weapon pickups, readable phone layout at 390 × 844, and pause controls. The camera was adjusted after the first visual inspection so the entire squad remains visible.

## Practical limits

- Phone testing uses browser viewport emulation on this PC; performance and touch behavior on physical iOS/Android devices still need a field test.
- Best scores are stored locally. The daily seed is shared by date, but there is no server leaderboard.
- There is no saved in-progress run, multiplayer, or backend.
- The vendored engine prints a deprecation notice for its classic script distribution. It is pinned and works offline; this is not a runtime failure.

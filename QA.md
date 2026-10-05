# Verification

## Game rules

Nine checks passed with Node’s built-in test runner: arithmetic operations and overflow; formation stays inside the road without stacking bots onto one edge; date seeding; one-time gate selection; crate break and collection; shields and defeat; Overdrive requirements and effects; mode-specific boss transitions; seeded repeatability.

An automated player completed 20 of 20 seeded campaigns. Winning runs took about 136–148 seconds. This checks that full campaigns are reachable through ordinary steering, crate collection, gate choices, and earned Overdrive. It is not a substitute for human fun testing.

## Browser checks

The 3D scene loaded without runtime errors in the desktop preview and the live GitHub Pages site. Tested real drag steering, squad growth to 60, weapon pickups, pause/resume, first-boss victory, and upgrade choices. Graphics preferences survived reopening. Responsive views checked at 390 × 844, 320 × 568, and 844 × 390, with no horizontal page overflow. Landscape launch positioning and compact-phone score layouts were repaired. The camera was adjusted after the first visual inspection so the entire squad remains visible.

Scenery and road decorations were batched, in addition to the robot crowds and bullets. The landscape attract scene rendered in 73 draw calls in the preview. This measures rendering work, not physical-phone frame rate.

GitHub Actions passed the rule checks and deployed the static game successfully. The live site opened with its local engine and assets. Desktop files are copied independently of the temporary preview server.

## Practical limits

- Phone testing uses browser viewport emulation on this PC; performance and touch behavior on physical iOS/Android devices still need a field test.
- The preview browser permits HTTP(S) and blocks local-file URLs. Direct offline-file launch could not be visually verified there. The Desktop package uses classic local scripts and contains every required asset, with no online fetches; double-click its shortcut in a normal local browser to check it.
- Best scores are stored locally. The daily seed is shared by date, but there is no server leaderboard.
- There is no saved in-progress run, multiplayer, or backend.
- The vendored engine prints a deprecation notice for its classic script distribution. It is pinned and works offline; this is not a runtime failure.

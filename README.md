# Neon Swarm: Bodyguard

Build a squad of repair bots, defend a research capsule, and practice anatomy and physiology. Four combat settings and 28 selectable chapters. Free, static, and playable on desktop and phone browsers.

## Play

[Play the published game](https://rorrimaesu.github.io/neon-swarm/).

For the Desktop copy, double-click **Play Neon Swarm.cmd** or open **index.html**. All gameplay scripts, content, and 3D assets are included locally; textbook links and some device speech voices need an internet connection. No build step, sign-in, payment, or API key is required.

Choose Chapter mission, Study, Arcade, Endless, or Daily. Study has no combat and remains usable when WebGL is unavailable. Any of the 28 chapters can be selected immediately. Section practice includes 15,976 source-linked questions across all 169 numbered sections and 28 introductions. Explore section coverage lists objectives, topics, counts, and your progress. Study offers 20, 40, or the full set; chapter missions sample a short set. See COVERAGE.md for the scope and review limits.

Detailed animated characters replace the original primitive figures. Four CC0 Quaternius characters include running mechs, flying swarm drones, armored stalkers, spitters, and a scaled animated boss. The game shares animation textures across the crowd to keep drawing costs bounded. See ASSETS.md for source models, Blender processing, and the Meshy replacement plan.

## Controls

| Action | Desktop | Phone |
|---|---|---|
| Steer | A/D, arrows, or drag | Drag horizontally |
| Shoot in combat | Automatic | Automatic |
| Overdrive | Space or purple button | Purple button |
| Answer a question | Select a target; Enter or Fire answer | Select a target; Fire answer |
| Select an answer by keyboard | Number keys | Onscreen targets |
| Pause | P, Escape, or pause button | Pause button |

Combat, warnings, charge, and buffs freeze during Focus. Held controls cannot submit answers. Pathways require one stage at a time. Hints count as assisted practice. Wrong answers show an explanation and are revisited after intervening concepts or in a later session.

Correct independent recall awards at most six bonus shield points per sector. Three final-boss decisions can expose a short weak point; the maximum reward is eight seconds with 25% additional boss damage. Knowledge progress is recorded separately from combat survival and score.

## Difficulty

Explorer has generous warnings and shields. Standard requires active defense. Veteran adds mixed-wave pressure. Expert now opens with 28 enemies per wave and reaches about 50 in the first sector, with faster spawns, armored pursuers, ranged spitters, and continuing boss reinforcements. Pulse rounds penetrate two enemies. Question types are independent: All types, Terminology, Relationships, or Examples & application. Reading is untimed at every combat setting.

Escaped enemies damage capsule integrity, with a per-wave limit. Losing the capsule or all bots ends the run. Defeat offers a sector retry. Recruitment grows gradually, doubling is limited to recovery opportunities, weapon stacking is capped, and Overdrive weakens heavies without automatically breaking crates.

See **BALANCE.md** for measured simulation results and **QA.md** for verification and remaining device-testing limits.

## Progress

Preferences, chapter progress, records, and an in-progress mission are stored in this browser. The game saves at Focus checkpoints, between sectors, and periodically during combat. Save & return to setup preserves a mission. Continue saved mission restores it. Partial pathway entry restarts the current pathway; using a hint remains recorded through saving.

Question banks load per chapter. Saved sessions store compact question IDs and answer order, so a full Study set can resume without saving all its text. Prior 2.0 checkpoints and learning records remain readable. New section question coverage is tracked separately from the original sampler.

Settings provides progress export/import for moving learning data between devices. Import merges newer objective records. There is no automatic cloud synchronization. Reset learning asks before clearing it. Retained requires varied, unassisted recall on later days (different forms or questions); a later mistake returns the concept to Practicing. Existing version 1 arcade records are preserved, and new scores are separated by version, mode, difficulty, chapter, learning level, and practice focus.

## Source

- `core.js`: seeded combat rules, profiles, capsule defense, checkpoint restore.
- `curriculum.js`: original authored concepts, 16 pathways, chapter references.
- `section-catalog.js` and `content/`: section map and 15,976 static source-linked questions.
- `learning.js`: question preparation, section selection, review priority, compact checkpoints, progress validation.
- `game.js`: 3D scene, interface, audio, input, educational encounters.
- `characters.js` and `assets/characters/`: animated mesh crowds, rigged GLB exports, original source models, and the runtime pose data.
- `index.html` and `style.css`: responsive and keyboard-accessible interface.
- `tests/`: 31 rule, save, learning, and section-coverage checks.
- `CONTENT.md`: coverage and source notes.
- `LICENSE.md`: code, learning content, and asset notices.

Run checks with `node --test tests/*.test.js`. A local web preview can use `python -m http.server 8787` in this folder and `http://127.0.0.1:8787`.

The GitHub Pages workflow tests rules and syntax, packages only runtime assets, and deploys on pushes to main. Bump stylesheet and script version queries when publishing new assets so returning players receive the update.

## Credits

Original robots, capsule, abstract cell scenery, diagrams, sounds, and gameplay. Three.js 0.160.1 is vendored under MIT; its notice is in `vendor/THREE-LICENSE.txt`.

The original curriculum and expanded adapted question bank are aligned with [OpenStax Anatomy and Physiology 2e](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction). Source links appear inside learning encounters. No OpenStax logo, textbook artwork, or instructor question bank is included. This project is independent of OpenStax. Learning content is CC BY-NC-SA 4.0; see LICENSE.md.

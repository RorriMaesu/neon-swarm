# Neon Swarm

**The game from the ads. Actually.** An original 3D arcade shooter with a growing robot squad, arithmetic gates, shootable loot crates, incoming scrap swarms, and boss battles. Made for desktop and phone browsers.

## Play

Open **index.html**, or on Windows double-click **Play Neon Swarm.cmd**. The 3D engine is included, so the local copy works offline. No build step, account, ads, payments, or energy timers.

Once published: [Play on GitHub Pages](https://rorrimaesu.github.io/neon-swarm/).

### Controls

| Action | Desktop | Phone / tablet |
|---|---|---|
| Steer | Hold A/D or left/right arrows; drag on the road | Drag horizontally on the road |
| Shoot | Automatic | Automatic |
| Overdrive | Space or purple button | Purple button |
| Pause | P, Escape, or pause button | Pause button |
| Sound / quality / reduced effects | Header controls | Header controls |

Choose green + / × gates with the **center** of your squad. Red − / ÷ gates reduce your numbers. Shoot numbered crates until they break, then steer into the floating pickup. Shields absorb damage first. At 60 bots, extra recruits become score. Kills charge Overdrive, which clears the road and speeds up firing for four seconds. Boss target strips warn you before heavy bolts arrive.

### Modes

- **Skyway run:** three sectors, three bosses, and an upgrade choice between sectors. A successful run takes roughly 2½ minutes.
- **Endless rush:** increasingly difficult sectors until the last bot falls.
- **Daily circuit:** two sectors with a shared seed for the local calendar date. Personal records are local to the browser; there is no global leaderboard.

## Saved progress

Personal bests and preferences use browser local storage. Offline-file and hosted versions may keep separate records because their addresses differ. A run itself is not saved after closing the page. Losing focus pauses a live run.

## Files

- `index.html` / `style.css`: responsive interface.
- `core.js`: seeded, fixed-step gameplay rules, independent of the renderer.
- `game.js`: original procedural 3D assets, instanced crowd rendering, input, synthesized sound, and interface.
- `vendor/`: Three.js 0.160.1 and its license, bundled for offline use.
- `DESIGN.md`: research sources and design rationale.
- `PROGRESS.md`: development checkpoints.
- `QA.md`: verification and remaining limitations.
- `tests/core.test.js`: meaningful rule checks using Node’s built-in test runner.
- `.github/workflows/pages.yml`: checks and deploys the static site to GitHub Pages.

## Develop

Edit the HTML, CSS, or JavaScript and reopen/reload the page. For a local web preview, run `python -m http.server 8787` from this folder and visit `http://127.0.0.1:8787`.

Run rule checks with `node --test tests/core.test.js`. No dependencies need to be installed. Static scenery and crowds use instancing to reduce draw calls. The low-quality option caps render resolution for slower devices. A current browser with WebGL is required.

## Publish your own copy

1. Create a GitHub repository and push these files to its `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Run the **Check and publish Neon Swarm** workflow, or push a commit.

The workflow tests the rules, packages only game assets, and deploys them. All asset paths are relative, so repository subpaths work. GitHub Pages hosts the static game; no backend or secret key is needed. See [GitHub’s official workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Credits

All game models, interface graphics, synthesized sounds, and gameplay code are original. The 3D engine is Three.js under the MIT license; its full notice is in `vendor/THREE-LICENSE.txt`. Genre research links are in `DESIGN.md`. No third-party character models or paid generation services were used.

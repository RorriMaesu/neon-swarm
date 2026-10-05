# Neon Swarm — design and research

The game from the ads. Actually.

## Research, 4 October 2026

- [Mob Control — publisher store description](https://www.xbox.com/en-US/games/store/mob-control/9ND27X1GNWPS): crowd multiplication, gate selection, moving gates, speed boosts, champions, and visible army growth. The strongest transferable idea is immediate visual reward for a simple steering decision.
- [Last War — developer's Google Play listing](https://play.google.com/store/apps/details?id=com.fun.lastwar.gp&hl=en_US): lane survival, incoming zombie waves, and obstacles, followed by base building and hero collection. Our game keeps lane survival as the entire playable experience.
- [Mob Control — official App Store listing](https://apps.apple.com/na/app/endless-loot/id1562817072/): a small force explodes into a crowd; champions break defensive lines. We translate the dramatic release into a charged Overdrive ability.
- [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): static files are suitable for Pages; keep relative asset paths so project URLs work.

These sources establish genre mechanics. The theme, pacing, visual treatment, and balance below are original design decisions, not claims that the sources prove which game is most entertaining.

## Theme and visual direction

Friendly mint-green rescue robots reclaim an elevated highway from mischievous coral scrap robots. A blue-green night city, illuminated rails, angular towers, glowing batteries, readable holographic gates, and a huge mechanical boss make a coherent miniature world. No gore. Robots have expressive visors, little legs, and oversized blasters.

Charcoal editorial interface; lime action buttons; mint friendlies; coral danger; violet special upgrades. Large silhouettes and number signs stay readable on a phone. Real 3D geometry rather than a screenshot or fake advert.

## Asset decision

Build original low-poly assets directly in the 3D engine from reusable geometric parts. This is a better first-release fit than downloaded character packs, an external AI subscription, or high-detail Blender exports: tiny download, consistent style, simple animation, no borrowed character designs, and efficient rendering of a crowd. The engine is vendored locally with its MIT license. No online model service is needed. Blender can replace the geometric parts later without changing the rules.

## The playable loop

1. Steer horizontally; the squad fires automatically. Keyboard A/D or arrows; mouse drag; direct touch drag. Keep controls within thumb reach.
2. Select green addition/multiplication gates. Red subtraction/division gates make an interesting bad alternative. One gate is chosen by the squad center, so the arithmetic is unambiguous.
3. Focus fire on rescue crates and loadout caches. Broken crates become collectible bonuses. Recruit more bots, increase fire rate, get a spread weapon, or build shields.
4. Incoming enemies include ordinary walkers, fast runners, and tougher brutes. Collision losses are local to the formation and consume shields first.
5. Kills charge Overdrive. Press Space or the large touch button for a shockwave plus a short rapid-fire burst.
6. Conquer a sector boss, pick one meaningful upgrade, and enter the next district. Keep score and personal bests locally.

## Modes and pacing

- **Skyway run:** three districts, each with a short wave sequence and a boss. A complete run is a few minutes. Sector upgrades offer a breather and a tactical choice.
- **Endless rush:** escalating sectors until the squad is lost. Local score chasing with immediate retry.
- **Daily circuit:** the same deterministic seed for everyone on the same local calendar date. Local records only; no server or global leaderboard.

The first gates arrive before the first threatening crowd. A guaranteed early recruit makes the fantasy happen immediately. Difficulty grows through density, faster enemies, and tougher bosses. Army size has a readable cap; extra recruits become score so good decisions still pay off. Reward hitting a cap, do not silently discard it.

## Comfort and accessibility

Pause, automatic pause on focus loss, sound toggle, reduced effects, quality setting, visible instructions, keyboard focus indicators, modal focus handling, and touch controls without browser scrolling. Auto-fire reduces input burden. Gates use signs and words as well as color. No energy system, ads, payments, or login requirement to play.

## Delivery

Static HTML/CSS/JavaScript, local 3D engine, no build step, offline file launch, local progress, and GitHub Pages workflow. Desktop copies are saved at checkpoints. Publishing needs an authenticated GitHub account; no credentials belong in the project.

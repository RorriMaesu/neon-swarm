# Combat balance — 2.2

The prior Expert opening had about nine fragile enemies per wave, followed by gaps near five seconds. A growing squad could erase waves at long range. This update raises visible density, shortens reinforcement gaps, limits ammunition range, introduces ranged spitters, and keeps mixed reinforcements arriving during bosses.

| Setting | Opening wave | Wave at 40 seconds, sector 1 | Base wave gap | Initial shield | Strike warning |
|---|---:|---:|---:|---:|---:|
| Explorer | 10 | 18 | 4.1 s | 12 | 1.65 s |
| Standard | 17 | 30 | 3.5 s | 8 | 1.35 s |
| Veteran | 23 | 41 | 2.9 s | 5 | 1.15 s |
| Expert | 28 | 50 | 2.65 s | 3 | 1.0 s |

Gaps shorten by 0.008 seconds per elapsed sector second and another 0.12 seconds each sector, with a minimum of 1.65 seconds. Expert enemies move 12% faster than Standard. Later waves mix runners, armored stalkers, and spitters; formation patterns alternate between broad fronts and concentrated attacks. Pulse ammunition penetrates two enemies, rewarding alignment through rows. Spread and piercing upgrades remain distinct. Ordinary ammunition expires at z=-29, so enemies are engaged on the visible road rather than erased in the distance.

Boss reinforcements use 65% of ordinary wave size and arrive at the base gap plus 0.6 seconds. Boss strikes and spitter attacks share a single targeted bolt budget: overlapping unavoidable strike lanes are prevented. A center-targeted bolt remains dodgeable at every squad size. Escaped-enemy capsule loss stays bounded at 12 points per wave; avoiding combat indefinitely still fails. Overdrive clears small enemies and warned bolts, weakens armor, and grants temporary protection, making timing valuable.

The 600-run audit uses 30 campaign seeds for each of five input policies at each difficulty. Three actively steering policies pursue threats and resources; two remain stationary. The strongest tactical policy evaluates lane density, collects upgrades, dodges warned strikes, and chooses Overdrive timing. It has complete game-state access, so results are reproducible engineering evidence, **not measured human win rates**.

| Setting | Tactical policy wins / 30 | Reactive policy wins / 30 | Stationary policy wins / 30 |
|---|---:|---:|---:|
| Explorer | 30 | 29 | 0 |
| Standard | 24 | 8 | 0 |
| Veteran | 7 | 0 | 0 |
| Expert | 5 | 0 | 0 |

No audit run hit the 360-second cutoff or the 60-bot squad cap. Expert is intentionally severe, with a demonstrable winning path rather than universal failure. The audit and its runnable source are included as `balance-audit-v3.json` and `tools/balance-audit.js`. Direct playtesting and physical phone performance remain useful follow-up evidence; the audit does not establish ideal balance for every player.

Questions remain untimed, and combat freezes during Focus at every difficulty. Study remains available without combat. Combat difficulty does not alter answer correctness, chapter coverage, or learning progress.

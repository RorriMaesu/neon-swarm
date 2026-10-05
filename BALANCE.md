# Bodyguard 2.0 balance audit

The original game allowed a stationary right-lane policy to win 36 of 50 campaigns. The rebuilt rules remove that exploit and slow squad growth.

## Rebuilt campaign results

Thirty seeds per control policy and combat setting; 60 Hz; 360-second limit. Sector upgrades are automatic: repair below 45 integrity, otherwise recruit below 22 bots, otherwise damage. No learning bonuses are included. These policies have perfect access to game state and are not human playtests.

| Setting | Stationary center wins | Stationary right wins | Reactive wins | Interceptor wins | Reactive median defeated-boss time |
|---|---:|---:|---:|---:|---:|
| Explorer | 0/30 | 0/30 | 29/30 | 29/30 | 23.92 s |
| Standard | 0/30 | 0/30 | 20/30 | 26/30 | 26.53 s |
| Veteran | 0/30 | 0/30 | 9/30 | 12/30 | 27.85 s |
| Expert | 0/30 | 0/30 | 6/30 | 6/30 | 34.98 s |

No policy reached the 60-bot cap in this audit. All 480 runs ended before the timeout. Boss-time medians include only defeated bosses.

The reactive policy prioritizes gates and pickups, aligns with bosses, and evades warned strikes. The interceptor also prioritizes approaching enemies. Both use earned Overdrive. Stationary policies never activate it.

## Tuning choices

- Six initial bots; mostly +2 to +4 gates, less frequent recruitment, +3 sector recruit upgrades.
- A doubling opportunity is limited to at most one per mission and only when below 16 bots.
- Capsule damage from leaks is capped per wave; shield and capsule repair offer recovery choices.
- A seven-column formation gives every squad size a feasible escape from a central targeted strike. Targeted bolts are not stacked into unavoidable patterns.
- Boss warning and enemy pressure differ by setting. Weapon and rate increases have caps.
- Learning bonuses are bounded, and final-boss exposure is limited to eight seconds and 25% extra damage.

## Next playtesting

Check actual desktop and phone players with different action-game and A&P experience. Measure understandable deaths, response opportunities, completion, frustration, question feedback use, and later recall. Automated win rates demonstrate exploit resistance and relative pressure, not proof that a difficulty is balanced for people.

'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../core');
test('Expert fields substantially larger waves than the prior nine-enemy opening',()=>{
 const g=new Game('campaign',31,'expert');g.spawnWave();assert(g.enemies.length>=28);
 g.enemies=[];g.sectorTime=32;g.spawnWave();assert(g.enemies.length>=44);assert(g.enemies.some(e=>e.kind==='brute'));assert(g.enemies.some(e=>e.kind==='spitter'));
});
test('Expert launches reinforcements more frequently than Standard, including during a boss',()=>{
 const standard=new Game('campaign',21,'standard'),expert=new Game('campaign',21,'expert');
 for(const g of [standard,expert]){g.invulnerable=100;g.count=1;g.integrity=100;g.leakEnemy=()=>{};g.spawnBoss();g.waveTimer=0;}
 for(let i=0;i<480;i++){standard.update(1/60);expert.update(1/60);}
 assert(expert.waveId>standard.waveId);assert(expert.waveId>=3);assert(expert.boss&&expert.enemies.length>0);
});
test('spitters telegraph a dodgeable strike and cannot stack concurrent targeted bolts',()=>{
 const g=new Game('campaign',1,'expert');g.gates=[];g.crates=[];g.waveTimer=100;
 g.enemies=[{id:90,wave:1,x:-3,z:-12,kind:'spitter',hp:10,maxHp:10,speed:1,damage:1,attack:0},{id:91,wave:1,x:3,z:-12,kind:'spitter',hp:10,maxHp:10,speed:1,damage:1,attack:0}];
 g.update(1/60);assert.equal(g.hazards.length,1);assert.equal(g.hazards[0].delay,1);assert(g.hazards[0].age<g.hazards[0].delay);
 const restored=Game.restore(g.checkpoint());assert.deepEqual(restored.enemies,g.enemies);assert.deepEqual(restored.hazards,g.hazards);
});
test('ordinary pulse rounds penetrate a second enemy but stop at the range limit',()=>{
 const g=new Game();g.count=1;g.gates=[];g.crates=[];g.waveTimer=100;g.fire();assert.equal(g.shots[0].pierce,1);
 g.fireTimer=100;for(let i=0;i<90;i++)g.update(1/60);assert.equal(g.shots.length,0);
});
test('crowd budgets stay within the animated renderer capacity',()=>{
 const g=new Game('endless',55,'expert');g.sector=100;for(let i=0;i<20;i++)g.spawnWave();assert.equal(g.enemies.length,360);
});

'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,applyGate,formation,dateSeed,CAP}=require('../core.js');

test('gate math handles every operation, caps, overflow, and a last surviving bot',()=>{
  assert.deepEqual(applyGate(5,'+',8),{count:13,overflow:0,delta:8});
  assert.deepEqual(applyGate(35,'×',2),{count:60,overflow:10,delta:25});
  assert.deepEqual(applyGate(17,'÷',2),{count:8,overflow:0,delta:-9});
  assert.deepEqual(applyGate(3,'−',10),{count:1,overflow:0,delta:-2});
});
test('formation stays on the road even when a maximum squad steers to an edge',()=>{
  for(let n=1;n<=CAP;n++)for(const x of [-3.7,0,3.7]){
    const p=formation(n,x);assert.equal(p.length,n);assert(p.every(b=>b.x>=-4.3&&b.x<=4.3));
    assert.equal(new Set(p.map(b=>`${b.x}:${b.z}`)).size,n,'robots should not collapse onto an edge');
  }
});
test('daily seed follows the local date and repeats exactly',()=>{
  const a=new Date(2026,9,4,1),b=new Date(2026,9,4,23),c=new Date(2026,9,5,1);
  assert.equal(dateSeed(a),dateSeed(b));assert.notEqual(dateSeed(a),dateSeed(c));
});
test('the selected gate is applied once, according to squad center',()=>{
  const g=new Game('campaign',8);g.enemies=[];g.gates=[{id:999,z:12.8,offset:0,left:{op:'×',value:2},right:{op:'−',value:3}}];g.x=-2;g.targetX=-2;
  g.update(1/60);assert.equal(g.count,12);g.update(1/60);assert.equal(g.count,12);assert.equal(g.gates.length,0);
});
test('a crate must break and its pickup must be collected to award recruits',()=>{
  const g=new Game('campaign',9);g.gates=[];g.crates=[{id:777,x:0,z:11,kind:'recruits',amount:8,hp:1,maxHp:1}];
  g.update(1/60);assert.equal(g.count,6);
  for(let i=0;i<30;i++)g.update(1/60);
  assert(g.count>=14);assert(g.drainEvents().some(e=>e.type==='crateBreak'));
});
test('shields absorb damage first; losing the final bot produces one result',()=>{
  const g=new Game();g.shield=3;g.hitSquad(2,0,13);assert.equal(g.count,6);assert.equal(g.shield,1);
  g.hitSquad(3,0,13);assert.equal(g.count,4);assert.equal(g.shield,0);
  g.invulnerable=0;g.hitSquad(9,0,13);assert.equal(g.count,0);assert.equal(g.phase,'result');
  g.finish(false);assert.equal(g.drainEvents().filter(e=>e.type==='result').length,1);
});
test('Overdrive is earned and clears enemies, damages the boss, and resets charge',()=>{
  const g=new Game();assert.equal(g.useOverdrive(),false);g.charge=100;g.spawnWave();g.spawnBoss();const hp=g.boss.hp;
  assert.equal(g.useOverdrive(),true);assert.equal(g.charge,0);assert.equal(g.enemies.length,0);assert(g.boss.hp<hp);assert.equal(g.overdrive,2);
});
test('boss victories advance campaign and daily, while endless keeps going',()=>{
  for(const [mode,last]of [['campaign',3],['daily',2],['endless',4]]){
    const g=new Game(mode,1);g.spawnBoss();g.bossKilled();assert.equal(g.phase,'upgrade');const before=g.damage;g.nextSector('damage');assert.equal(g.sector,2);assert(g.damage>before);
    g.sector=last;g.spawnBoss();g.bossKilled();assert.equal(g.phase,mode==='endless'?'upgrade':'result');
  }
});
test('identical seeds and steering inputs reproduce a complete first sector',()=>{
  const a=new Game('daily',42),b=new Game('daily',42);
  for(let i=0;i<5000;i++){
    const x=Math.sin(i*.001)*2.5;a.steer(x);b.steer(x);if(a.charge===100)a.useOverdrive();if(b.charge===100)b.useOverdrive();
    a.update(1/60);b.update(1/60);a.drainEvents();b.drainEvents();
  }
  assert.deepEqual(a.snapshot(),b.snapshot());
  assert(['playing','upgrade','result'].includes(a.phase));assert(a.shots.length<=720);
});
test('late endless sectors become tougher faster than linear weapon upgrades',()=>{
  const endless=new Game('endless',51),ordinary=new Game('campaign',51);
  endless.sector=ordinary.sector=12;endless.spawnWave();ordinary.spawnWave();endless.spawnBoss();ordinary.spawnBoss();
  assert(endless.boss.hp>ordinary.boss.hp*2);
  assert(endless.enemies.every((e,i)=>e.hp>ordinary.enemies[i].hp*2));
});

'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {Game,formation,DIFFICULTIES}=require('../core');const Curriculum=require('../curriculum');const Learning=require('../learning');
test('difficulty changes pressure and starting protection without changing reading rules',()=>{
 const games=Object.keys(DIFFICULTIES).map(d=>new Game('lesson',71,d));
 games.forEach(g=>g.spawnWave());assert(games.every(g=>g.count===6&&g.integrity===100));
 assert(games[0].enemies.length<games[1].enemies.length);assert(games[1].enemies.length<games[2].enemies.length);assert(games[2].enemies.length<games[3].enemies.length);
 assert(games[0].shield>games[3].shield);assert(games[0].profile.warning>games[3].profile.warning);assert.equal(new Game('lesson',1,'unknown').difficulty,'standard');
});
test('escaped enemies damage the capsule and exhausting integrity finishes once',()=>{
 const g=new Game('lesson',1);g.gates=[];g.crates=[];g.enemies=[{id:100,wave:1,x:4.2,z:17.5,kind:'walker',hp:100,speed:1,damage:1}];g.update(1/60);
 assert.equal(g.integrity,98);assert.equal(g.leaks,1);assert(g.drainEvents().some(e=>e.type==='leak'));
 g.integrity=1;g.leakEnemy({wave:2,kind:'runner',x:4});g.leakEnemy({wave:2,kind:'runner',x:4});assert.equal(g.phase,'result');assert.equal(g.drainEvents().filter(e=>e.type==='result').length,1);
});
test('leak losses are bounded per wave, while another wave remains dangerous',()=>{
 const g=new Game();for(let i=0;i<20;i++)g.leakEnemy({wave:1,kind:'brute',x:4});assert.equal(g.integrity,88);g.leakEnemy({wave:2,kind:'walker',x:4});assert.equal(g.integrity,86);
});
test('every squad size can clear a center-targeted bolt by steering to an edge',()=>{
 for(let count=1;count<=60;count++){const g=new Game();g.count=count;g.gates=[];g.crates=[];g.steer(3.7);for(let i=0;i<60;i++)g.update(1/60);assert(formation(count,g.x).every(p=>Math.abs(p.x)>.78),'unavoidable center strike at '+count);}
});
test('doubling is a bounded recovery reward rather than a full-squad snowball',()=>{
 const g=new Game('lesson',1);g.sector=2;g.count=12;for(let i=0;i<100;i++)g.spawnGate();assert(g.gates.filter(x=>x.left.op==='×'||x.right.op==='×').length<=1);
 const large=new Game('lesson',1);large.sector=2;large.count=40;for(let i=0;i<100;i++)large.spawnGate();assert(!large.gates.some(x=>x.left.op==='×'||x.right.op==='×'));
});
test('Overdrive weakens heavies and leaves crates intact',()=>{
 const g=new Game();g.charge=100;g.enemies=[{id:200,kind:'brute',hp:20,x:0,z:0}];const hp=g.crates[0].hp;g.spawnBoss();const bossHp=g.boss.hp;g.useOverdrive();assert.equal(g.enemies[0].hp,13);assert.equal(g.crates[0].hp,hp);assert.equal(g.boss.hp,bossHp-45);
});
test('learning bonuses stop at six shield points and reset between sectors',()=>{
 const g=new Game('lesson');const shield=g.shield;for(let i=0;i<10;i++)g.rewardLearning();assert.equal(g.shield,shield+6);assert.equal(g.learningBonus,6);g.phase='upgrade';g.nextSector('recruits');assert.equal(g.learningBonus,0);assert.equal(g.rewardLearning(),2);
});
test('a restored run preserves random choices and physics',()=>{
 const a=new Game('lesson',734,'veteran');for(let i=0;i<600;i++){a.steer(Math.sin(i/40)*2);a.update(1/60);}const b=Game.restore(a.checkpoint());
 for(let i=0;i<1800;i++){const x=Math.sin(i/70)*2;a.steer(x);b.steer(x);a.update(1/60);b.update(1/60);}assert.deepEqual(a.checkpoint(),b.checkpoint());assert.throws(()=>Game.restore({version:2,state:{difficulty:'standard',mode:'bad'}}));
});
test('lesson campaigns finish after three bosses and preserve sector retry state',()=>{
 const g=new Game('lesson',1);g.sector=3;g.spawnBoss();g.bossKilled();assert.equal(g.won,true);assert.equal(g.phase,'result');
});
test('all 28 expanded chapter banks have unique answer identities and valid source references',()=>{
 assert.deepEqual(Curriculum.chapters.map(c=>c.id),Array.from({length:28},(_,i)=>i+1));const ids=new Set();
 for(const c of Curriculum.chapters){assert.equal(c.concepts.length,8);for(const level of Learning.validLevels){const items=Learning.makeItems(c.id,level);assert(items.length>=8);for(const item of items){assert(!ids.has(item.id));ids.add(item.id);assert(item.explanation&&item.hint&&item.source.startsWith('https://openstax.org/'));if(item.kind==='sequence'){assert(item.steps.length>=3);assert.equal(new Set(item.steps).size,item.steps.length);}else{assert.equal(item.options.filter(o=>o.id===item.answer).length,1);assert.equal(new Set(item.options.map(o=>o.label)).size,item.options.length);}}}}
 assert(ids.size>=Curriculum.summary.questions);assert.equal(Curriculum.summary.numberedSections,169);
});
test('seeded decks keep correct identities after shuffling and respect selected focus',()=>{
 for(const c of Curriculum.chapters)for(const level of Learning.validLevels){const a=Learning.buildDeck(c.id,level,'all',123),b=Learning.buildDeck(c.id,level,'all',123);assert.deepEqual(a,b);for(const i of a){if(i.kind!=='sequence'){assert.equal(i.options.filter(o=>o.id===i.answer).length,1);assert(i.options.length>=2&&i.options.length<=4);}}}
 const focused=Learning.buildDeck(19,'application','Function & regulation',42);assert(focused.every(i=>['c19-5','c19-6','c19-7','c19-8'].includes(i.concept)));
});
test('hints and same-day recognition cannot count as retained learning',()=>{
 const p={},item=Learning.makeItems(1)[0],now=1700000000000;
 Learning.updateProgress(p,item,true,true,now,'2023-11-14');assert.equal(p[item.concept].independent,0);
 for(let i=0;i<3;i++)Learning.updateProgress(p,item,true,false,now,'2023-11-14');assert.equal(Learning.status(p[item.concept]),'Practicing');
 Learning.updateProgress(p,{...item,level:'application'},true,false,now+86400000,'2023-11-15');assert.equal(Learning.status(p[item.concept]),'Retained');
 const before=p[item.concept].independent;Learning.updateProgress(p,item,false,false,now+2*86400000,'2023-11-16');assert.equal(p[item.concept].independent,before);assert.equal(p[item.concept].due,now+2*86400000+3600000);assert.equal(Learning.status(p[item.concept]),'Practicing');
});
test('import validation accepts exported objectives and rejects invalid progress',()=>{
 const p={},item=Learning.makeItems(1)[0];Learning.updateProgress(p,item,true,false);assert.deepEqual(Learning.validateProgress(p),p);
 assert.throws(()=>Learning.validateProgress({...p,[item.concept]:{...p[item.concept],correct:100}}));assert.deepEqual(Learning.validateProgress({unrecognized:{}}),{});
});
test('feedback gauges are limited to appropriate regulation scenarios',()=>{
 const items=Curriculum.chapters.flatMap(c=>Learning.makeItems(c.id,'application'));assert.deepEqual(items.filter(i=>i.kind==='balance').map(i=>i.concept),['c1-5','c26-5']);
});
test('boss knowledge rewards are bounded and expire only during combat',()=>{
 const g=new Game('lesson',2);g.spawnBoss();assert.equal(g.exposeBoss(3),8);assert.equal(g.boss.exposureBonus,.25);
 const h=Game.restore(g.checkpoint());assert.equal(h.boss.exposure,8);g.update(.04);assert.equal(g.boss.exposure,7.96);
 assert.equal(g.exposeBoss(0),0);assert.equal(g.exposeBoss(1),4);assert.equal(g.exposeBoss(99),8);
});

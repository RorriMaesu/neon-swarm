'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../section-catalog'),L=require('../learning'),audit=require('../question-review.json');
const items=C.chapters.flatMap(c=>L.makeItems(c.id,'mixed').filter(i=>i.section));
test('every original question has an editorial disposition and all replacements are playable',()=>{
 assert.equal(audit.dispositions.length,15976);assert.equal(new Set(audit.dispositions.map(x=>x.id)).size,15976);
 const active=new Set(items.map(i=>i.id));for(const d of audit.dispositions)assert.equal(active.has(d.id),d.disposition!=='retired');
 for(const r of audit.replacements)assert(active.has(r.id));assert.equal(active.size,audit.publishedQuestions);
 assert.deepEqual(audit.sectionsWithoutQuestions,[]);assert.deepEqual(audit.topicsNeedingReplacement,[]);
});
test('navigation, learning objectives, figure-dependent passages and broken blanks cannot become questions',()=>{
 for(const i of items){assert(!/follow (this|the) link|link to learn|webscope|click|see \)|\. shows|\(\s*\)/i.test(i.prompt),i.id);
  if(i.prompt.includes('____')){const statement=i.prompt.split('\n')[1];assert.equal(i.prompt.split('____').length,2);assert(!/^(Identify|Discuss|Describe|Explain|Compare|List|Name|Define)\b/i.test(statement),i.id);assert(!/\b(this|these|those|they|their|them|its|figure|image|shown|above|below)\b/i.test(statement),i.id);}
 }
 assert(!items.some(i=>i.prompt.includes('Follow this link to learn more about')||i.prompt.includes('and discuss their roles in the human body')));
});
test('fresh source facts are not repeated across successive chapter sessions until exhausted',()=>{
 const history={seen:{}},p={},seen=new Set();for(let run=0;run<15;run++){const deck=L.buildDeck(4,'mixed','all',900+run,p,false,9,{history});assert.equal(deck.length,9);for(const i of deck){assert(!seen.has(L.familyOf(i)),`repeated fact at run ${run}: ${i.id}`);seen.add(L.familyOf(i));L.recordPresentation(history,i,Date.now()+run);L.updateProgress(p,i,true,false,Date.now()+run);}}
});
test('abandoned questions count as seen and identical definitions across sections share a cooldown',()=>{
 const history={seen:{}},first=L.buildDeck(4,'mixed','all',121,{},false,20);first.forEach(i=>L.recordPresentation(history,i));
 const next=L.buildDeck(4,'mixed','all',121,{},false,20,{history});assert(next.every(i=>!first.some(x=>L.familyOf(i)===L.familyOf(x))));assert.deepEqual(L.validateHistory(history),history);
 const definitions=items.filter(i=>i.level==='foundations');const pair=definitions.find(i=>definitions.some(j=>j.id!==i.id&&L.familyOf(j)===L.familyOf(i)));assert(pair);
 L.recordPresentation(history,pair);const other=definitions.find(i=>i.id!==pair.id&&L.familyOf(i)===L.familyOf(pair));const fresh=L.buildDeck(other.chapter,'foundations','all',432,{},false,20,{history});assert(fresh.every(i=>L.familyOf(i)!==L.familyOf(pair)));
});
test('default practice caps due review while explicit review returns the missed question',()=>{
 const p={},old=L.buildDeck(4,'mixed','all',73,{},false,20),now=1800000000000;old.forEach(i=>L.updateProgress(p,i,false,false,now-7200000));
 const deck=L.buildDeck(4,'mixed','all',74,p,false,20,{now});assert(deck.filter(i=>old.some(x=>x.id===i.id)).length<=4);
 const review=L.buildDeck(4,'mixed','all',74,p,true,20,{now});assert(review.every(i=>old.some(x=>x.id===i.id)));assert(review.length>0);
});
test('question choices and session order vary across seeds without changing answer identities',()=>{
 const a=L.buildDeck(4,'mixed','4.3',541,{},false,20),b=L.buildDeck(4,'mixed','4.3',971,{},false,20);assert.notDeepEqual(a.map(i=>i.id),b.map(i=>i.id));assert(a.filter(i=>b.some(j=>j.id===i.id)).length<15);
 const orders=new Set(Array.from({length:10},(_,n)=>L.prepare(items[0],L.random(n)).options.map(o=>o.id).join('|')));assert(orders.size>=4);
});
test('boss questions honor question and fact history from the mission',()=>{
 const history={seen:{}},p={},deck=L.buildDeck(4,'mixed','all',177,p,false,9);deck.forEach(i=>{L.recordPresentation(history,i);L.updateProgress(p,i,true,false);});
 const boss=L.bossDeck({chapter:4,level:'mixed',group:'all',deck,at:6},p,history,288);assert.equal(boss.length,3);assert(boss.every(i=>!deck.some(x=>L.familyOf(x)===L.familyOf(i))));assert.equal(new Set(boss.map(L.familyOf)).size,3);
});
test('tiny pools exhaust without duplicate IDs within a session and reuse least-recently seen questions',()=>{
 const pool=L.makeItems(4,'mixed','4.0'),history={seen:{}};pool.forEach((i,n)=>L.recordPresentation(history,i,1000+n));const deck=L.buildDeck(4,'mixed','4.0',512,{},false,40,{history});assert.equal(deck.length,pool.length);assert.equal(new Set(deck.map(i=>i.id)).size,pool.length);
 const two=L.buildDeck(4,'mixed','4.0',612,{},false,2,{history});assert.deepEqual(two.map(i=>i.id),pool.slice(0,2).map(i=>i.id));
});
test('older checkpoints refresh retired items while retaining attempts, results and progress IDs',()=>{
 const d=audit.dispositions.find(i=>i.chapter===4&&i.disposition==='retired'),old={chapter:4,level:'mixed',group:d.section,seed:3,deck:[{id:d.id,order:[]}],at:1,answered:7,correct:5,current:{item:{id:d.id},resolved:false},asked:{'1-1':true}};
 const restored=L.migrateLesson(old,{}, {seen:{}},22);assert.equal(restored.answered,7);assert.equal(restored.correct,5);assert.equal(restored.contentRevision,C.version);assert.equal(restored.current,null);assert.equal(restored.deck.length,1);assert.notEqual(restored.deck[0].id,d.id);
 assert(C.knownQuestion(d.id));const now=Date.now(),record={attempts:2,correct:1,independent:1,forms:['connections'],days:['2026-10-05'],questions:[d.id],independentQuestions:[d.id],lastSeen:now,due:now+3600000,lapsed:true};assert.deepEqual(L.validateProgress({[d.concept]:record})[d.concept],record);
});
test('compact saves preserve the deliberate review label',()=>{
 const deck=L.buildDeck(4,'mixed','4.5',43);deck[2].review=true;deck[1].review=true;deck[1].reviewReason='due';assert.deepEqual(L.unpackDeck(4,L.packDeck(deck)),deck);
});

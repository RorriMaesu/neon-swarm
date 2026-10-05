'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../section-catalog'),L=require('../learning'),coverage=require('../coverage.json');
test('every textbook teaching section and introduction has a playable source-linked bank',()=>{
 const sections=C.chapters.flatMap(c=>c.sections);assert.equal(sections.filter(s=>s.kind==='numbered-section').length,169);assert.equal(sections.filter(s=>s.kind==='intro').length,28);
 assert.equal(sections.reduce((n,s)=>n+s.objectives.length,0),606);assert.deepEqual(coverage.summary.unrepresentedTeachingHeadings,[]);
 for(const c of C.chapters)for(const s of c.sections){const items=L.makeItems(c.id,'mixed',s.id);assert.equal(items.length,s.count,`count drift in ${s.id}`);assert(items.length>0);assert(items.every(i=>i.section===s.id));assert.equal(new Set(items.map(i=>i.id)).size,items.length);}
 assert.equal(sections.reduce((n,s)=>n+s.count,0),C.summary.questions);
});
test('expanded questions have readable prompts and two to four unique choices',()=>{
 for(const c of C.chapters){C.ensureChapter(c.id);for(const i of c.expanded){assert(i.prompt.trim().length>12);assert(i.explanation&&i.hint&&i.source.startsWith('https://openstax.org/books/anatomy-and-physiology-2e/pages/'));assert(i.options.length>=2&&i.options.length<=4);assert.equal(new Set(i.options.map(o=>o.label.trim().toLowerCase())).size,i.options.length);assert.equal(i.options.filter(o=>o.id===i.answer).length,1);assert(!i.prompt.includes('\ufffd'));}}
});
test('section sessions preserve scope, longer sets, and whole-chapter variety',()=>{
 const c=C.chapters[0],s=c.sections.find(s=>s.id==='1.6');const all=L.buildDeck(1,'mixed',s.id,12,{},false,'all');assert.equal(all.length,s.count);assert(all.every(i=>i.section===s.id));
 const medium=L.buildDeck(1,'mixed',s.id,12,{},false,40);assert.equal(medium.length,40);assert.equal(new Set(medium.map(i=>i.id)).size,40);
 const mixed=L.buildDeck(1,'mixed','all',12,{},false,20);assert(new Set(mixed.map(i=>i.section)).size>=5);
});
test('seen questions yield to unseen questions and hints remain due for deliberate review',()=>{
 const first=L.buildDeck(1,'mixed','1.6',21,{},false,20),progress={};for(const i of first)L.updateProgress(progress,i,true,false);
 const next=L.buildDeck(1,'mixed','1.6',21,progress,false,20);assert(next.every(i=>!first.some(x=>x.id===i.id)));
 const assisted=L.makeItems(1,'mixed','1.6')[0];L.updateProgress(progress,assisted,true,true);const review=L.buildDeck(1,'mixed','1.6',51,progress,true,40);assert(review.some(i=>i.concept===assisted.concept));
});
test('compact question checkpoints restore exact choices without embedding the full bank',()=>{
 const deck=L.buildDeck(19,'mixed','all',434,{},false,40);const packed=L.packDeck(deck),restored=L.unpackDeck(19,JSON.parse(JSON.stringify(packed)));assert.deepEqual(restored,deck);assert(JSON.stringify(packed).length<JSON.stringify(deck).length/4);
 const old=L.legacyItems(19,'application').slice(0,3).map(i=>L.prepare(i,L.random(3)));assert.deepEqual(L.unpackDeck(19,old),old);
 assert.throws(()=>L.unpackDeck(19,[{id:'unknown',order:[]} ]));
});
test('section progress counts distinct questions, validates imports, and preserves old records',()=>{
 const progress={},item=L.makeItems(25,'mixed','25.9')[0];L.updateProgress(progress,item,true,false);L.updateProgress(progress,item,true,false);assert.equal(L.chapterProgress(25,progress,Date.now(),'25.9').practiced,1);assert.equal(L.chapterProgress(25,progress,Date.now(),'25.1').practiced,0);assert.deepEqual(L.validateProgress(progress),progress);
 const old={attempts:3,correct:3,independent:3,forms:['foundations','connections'],days:['2026-10-03','2026-10-04'],due:Date.now(),lastSeen:Date.now(),lapsed:false};assert.equal(L.validateProgress({'c19-1':old})['c19-1'].independent,3);
 const legacy=L.chapterProgress(19,{'c19-1':old},Date.now(),'Structure & identity');assert.equal(legacy.sampled,1);assert(legacy.questions>0);
 const bad={...progress,[item.concept]:{...progress[item.concept],questions:['made-up']}};assert.deepEqual(L.validateProgress(bad)[item.concept].questions,[]);
});

/* Deterministic practice selection and local objective progress. No network required. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./curriculum.js'):root.BodyguardCurriculum);if(typeof module==='object'&&module.exports)module.exports=api;else root.BodyguardLearning=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Curriculum){
'use strict';
function random(seed){let v=seed>>>0;return ()=>{v+=0x6D2B79F5;let t=Math.imul(v^v>>>15,1|v);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle(values,rng){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const validLevels=['foundations','connections','application'];
function makeItems(chapterId,level='foundations',group='all'){
 const chapter=Curriculum.chapters.find(c=>c.id===Number(chapterId));if(!chapter)return [];
 if(!validLevels.includes(level))level='foundations';
 const facts=chapter.concepts.filter(f=>group==='all'||f.group===group);
 const items=facts.map(f=>({id:`${f.id}-${level}`,concept:f.id,chapter:chapter.id,level,group:f.group,kind:level==='application'&&['c1-5','c26-5'].includes(f.id)?'balance':'answer',prompt:level==='foundations'?f.question:level==='application'?f.scenario:`Which defining description best matches ${f.term}?`,answer:f.id,options:chapter.concepts.map(x=>({id:x.id,label:level==='connections'?x.meaning:x.term,meaning:x.meaning,term:x.term,group:x.group})),explanation:`${f.term}: ${f.meaning}.`,hint:level==='connections'?`Think about the main role or defining feature of ${f.term}.`:f.meaning,source:chapter.source,topic:f.term}));
 const path=Curriculum.pathways[chapter.id];
 if(path&&group==='all')items.push({id:`c${chapter.id}-route-${level}`,concept:`c${chapter.id}-route`,chapter:chapter.id,level,kind:'sequence',prompt:path.title,steps:path.steps,explanation:path.explanation,hint:'Follow the direction of the process, starting with its earliest listed stage.',source:chapter.source,topic:'Pathway order'});
 if(chapter.id===19&&group==='all')items.push({id:`c19-scan-${level}`,concept:'c19-1',chapter:19,level,kind:'diagram',diagram:'heart',prompt:'Which labeled chamber receives blood from the venae cavae?',answer:'A',options:[{id:'A',label:'A · upper right-heart chamber'},{id:'B',label:'B · lower right-heart chamber'},{id:'C',label:'C · upper left-heart chamber'},{id:'D',label:'D · lower left-heart chamber'}],explanation:'A represents the right atrium, which receives systemic venous blood. Anatomical right appears on the viewer’s left in this front view.',hint:'Find the chamber that receives systemic venous return before the right ventricle.',source:chapter.source,topic:'Right atrium'});
 if(chapter.id===25&&group==='all')items.push({id:`c25-scan-${level}`,concept:'c25-4',chapter:25,level,kind:'diagram',diagram:'kidney',prompt:'Which arrow represents tubular reabsorption?',answer:'B',options:[{id:'A',label:'A · glomerular blood → capsule'},{id:'B',label:'B · tubule → nearby blood'},{id:'C',label:'C · nearby blood → tubule'}],explanation:'Reabsorption returns material from tubular fluid toward blood. Filtration enters capsular space; secretion moves material into tubular fluid.',hint:'Recovered substances return from the tubule toward the circulation.',source:chapter.source,topic:'Reabsorption'});
 return items;
}
function prepare(item,rng){
 if(item.kind==='sequence')return {...item,options:shuffle(item.steps.map((label,i)=>({id:String(i),label})),rng)};
 const correct=item.options.find(o=>o.id===item.answer);
 const others=item.options.filter(o=>o.id!==item.answer);
 const related=others.filter(o=>o.group===item.group);
 const alternatives=shuffle(related.length>=2?related:others,rng).slice(0,item.kind==='diagram'?item.options.length-1:2);
 return {...item,options:shuffle([correct,...alternatives],rng)};
}
function buildDeck(chapter,level,group,seed,progress={},reviewOnly=false){
 const rng=random(seed),items=makeItems(chapter,level,group);
 const shuffled=shuffle(items,rng);
 const now=Date.now();
 shuffled.sort((a,b)=>{
  const rank=i=>{const p=progress[i.concept];return !p?1:p.due<=now?0:2;};return rank(a)-rank(b);
 });
 let selected=reviewOnly?shuffled.filter(i=>progress[i.concept]&&(progress[i.concept].due<=now||progress[i.concept].correct<progress[i.concept].attempts)):shuffled;
 if(!selected.length)selected=shuffled;
 // A route or scanner adds spatial/sequence variety without forcing a topic outside a selected group.
 if(!reviewOnly&&group==='all'&&selected.length>9){const special=selected.find(i=>i.kind==='sequence'||i.kind==='diagram');if(special&&!selected.slice(0,9).includes(special)){selected=selected.slice();selected.splice(selected.indexOf(special),1);selected.splice(7,0,special);}}
 return selected.slice(0,9).map(i=>prepare(i,rng));
}
function updateProgress(progress,item,correct,assisted,now=Date.now(),day=new Date(now).toISOString().slice(0,10)){
 const old=progress[item.concept]||{attempts:0,correct:0,independent:0,forms:[],days:[]};
 const p={...old,forms:[...old.forms],days:[...old.days]};p.attempts++;p.lastSeen=now;p.lapsed=!correct||assisted;
 if(correct){p.correct++;if(!assisted){p.independent++;if(!p.forms.includes(item.level))p.forms.push(item.level);if(!p.days.includes(day))p.days.push(day);}}
 const days=correct&&!assisted?(p.independent>=3?7:p.independent>=2?3:1):0;
 p.due=now+(days?days*86400000:3600000);progress[item.concept]=p;return p;
}
function status(p){return !p?'New':!p.lapsed&&p.independent>=3&&p.forms.length>=2&&p.days.length>=2?'Retained':'Practicing';}
function chapterProgress(id,progress,now=Date.now()){
 const c=Curriculum.chapters.find(c=>c.id===Number(id));const values=c.concepts.map(f=>progress[f.id]);
 return {sampled:values.filter(Boolean).length,total:values.length,retained:values.filter(p=>status(p)==='Retained').length,due:values.filter(p=>p&&p.due<=now).length};
}
function validateProgress(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('This file does not contain valid learning progress.');
 const valid=new Set(Curriculum.chapters.flatMap(c=>[...c.concepts.map(f=>f.id),`c${c.id}-route`]));const out={};
 for(const [id,p] of Object.entries(input)){
  if(!valid.has(id)||!p||typeof p!=='object')continue;
  const counts=['attempts','correct','independent'];if(counts.some(k=>!Number.isSafeInteger(p[k])||p[k]<0||p[k]>1000000)||p.correct>p.attempts||p.independent>p.correct)throw Error('The progress file has invalid attempt counts.');
  if(!Array.isArray(p.forms)||!Array.isArray(p.days)||p.days.length>10000||!Number.isFinite(p.due)||p.due<0||!Number.isFinite(p.lastSeen))throw Error('The progress file has invalid review data.');
  out[id]={attempts:p.attempts,correct:p.correct,independent:p.independent,forms:[...new Set(p.forms.filter(x=>validLevels.includes(x)))],days:[...new Set(p.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))],due:p.due,lastSeen:p.lastSeen,lapsed:!!p.lapsed};
 }
 return out;
}
return {makeItems,prepare,buildDeck,shuffle,random,updateProgress,status,chapterProgress,validateProgress,validLevels};
});


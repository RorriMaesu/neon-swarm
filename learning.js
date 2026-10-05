/* Deterministic practice selection and local objective progress. No network required. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./section-catalog.js'):root.BodyguardCurriculum);if(typeof module==='object'&&module.exports)module.exports=api;else root.BodyguardLearning=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Curriculum){
'use strict';
function random(seed){let v=seed>>>0;return ()=>{v+=0x6D2B79F5;let t=Math.imul(v^v>>>15,1|v);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle(values,rng){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const validLevels=['foundations','connections','application'];
function legacyItems(chapterId,level='foundations',group='all'){
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
function makeItems(chapterId,level='mixed',group='all'){
 const c=Curriculum.chapters.find(c=>c.id===Number(chapterId));if(!c)return [];
 if(['Structure & identity','Function & regulation'].includes(group))return legacyItems(chapterId,level,group);
 Curriculum.ensureChapter(chapterId);
 const items=c.expanded.filter(i=>(group==='all'||i.section===group)&&(level==='mixed'||i.level===level));
 if(group==='all')items.push(...legacyItems(chapterId,level==='mixed'?'application':level).filter(i=>['sequence','diagram','balance'].includes(i.kind)));
 return items;
}
function prepare(item,rng){
 if(item.kind==='sequence')return {...item,options:shuffle(item.steps.map((label,i)=>({id:String(i),label})),rng)};
 const correct=item.options.find(o=>o.id===item.answer);
 const others=item.options.filter(o=>o.id!==item.answer);
 const related=others.filter(o=>o.group===item.group);
 const alternatives=shuffle(related.length>=2?related:others,rng).slice(0,item.kind==='diagram'?item.options.length-1:item.section?3:2);
 return {...item,options:shuffle([correct,...alternatives],rng)};
}
function buildDeck(chapter,level,group,seed,progress={},reviewOnly=false,length=9){
 const rng=random(seed),items=makeItems(chapter,level,group);
 const shuffled=shuffle(items,rng);
 const now=Date.now();
 const rank=i=>{const p=progress[i.concept];return p?.questions?.includes(i.id)?(p.due<=now?0:2):1;};
 shuffled.sort((a,b)=>rank(a)-rank(b));
 let selected=reviewOnly?shuffled.filter(i=>progress[i.concept]&&(progress[i.concept].due<=now||progress[i.concept].lapsed||progress[i.concept].correct<progress[i.concept].attempts)):shuffled;
 if(!selected.length)selected=shuffled;
 const limit=length==='all'?selected.length:Math.max(1,Math.min(100,Number(length)||9));
 // Interleave sections within each priority group, so a whole-chapter run visits more than its opening section.
 const buckets=new Map();for(const item of selected){const k=rank(item)+':'+(item.section||'extra');if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(item);}
 const balanced=[];for(const priority of [0,1,2]){const groups=[...buckets].filter(([k])=>k.startsWith(priority+':')).map(([,v])=>v);let remain=true;while(remain){remain=false;for(const bucket of groups)if(bucket.length){balanced.push(bucket.shift());remain=true;}}}
 const seen=new Set(),unique=[],repeated=[];for(const item of balanced){if(seen.has(item.concept))repeated.push(item);else{unique.push(item);seen.add(item.concept);}}
 return (length==='all'?balanced:[...unique,...repeated]).slice(0,limit).map(i=>prepare(i,rng));
}
function packDeck(deck){return deck.map(i=>({id:i.id,order:i.options.map(o=>o.id)}));}
function unpackDeck(chapter,deck){
 if(deck.every(i=>i.prompt))return deck; // Compatible with 2.0 checkpoints.
 const items=[...makeItems(chapter,'mixed'),...validLevels.flatMap(l=>legacyItems(chapter,l))];const map=new Map(items.map(i=>[i.id,i]));
 return deck.map(saved=>{const item=map.get(saved.id);if(!item||!Array.isArray(saved.order))throw Error('Unknown saved question.');const prepared=prepare(item,random(1)),options=new Map((item.kind==='sequence'?item.steps.map((label,i)=>({id:String(i),label})):item.options).map(o=>[o.id,o]));return {...prepared,options:saved.order.map(id=>{if(!options.has(id))throw Error('Invalid saved answer.');return options.get(id);})};});
}
function updateProgress(progress,item,correct,assisted,now=Date.now(),day=new Date(now).toISOString().slice(0,10)){
 const old=progress[item.concept]||{attempts:0,correct:0,independent:0,forms:[],days:[]};
 const p={...old,forms:[...old.forms],days:[...old.days],questions:[...(old.questions||[])],independentQuestions:[...(old.independentQuestions||[])]};p.attempts++;p.lastSeen=now;p.lapsed=!correct||assisted;
 if(!p.questions.includes(item.id))p.questions.push(item.id);
 if(correct){p.correct++;if(!assisted){p.independent++;if(!p.independentQuestions.includes(item.id))p.independentQuestions.push(item.id);if(!p.forms.includes(item.level))p.forms.push(item.level);if(!p.days.includes(day))p.days.push(day);}}
 const days=correct&&!assisted?(p.independent>=3?7:p.independent>=2?3:1):0;
 p.due=now+(days?days*86400000:3600000);progress[item.concept]=p;return p;
}
function status(p){return !p?'New':!p.lapsed&&p.independent>=3&&(p.forms.length>=2||(p.independentQuestions||[]).length>=2)&&p.days.length>=2?'Retained':'Practicing';}
function chapterProgress(id,progress,now=Date.now(),scope='all'){
 const c=Curriculum.chapters.find(c=>c.id===Number(id)),legacy=['Structure & identity','Function & regulation'].includes(scope);
 const concepts=legacy?c.concepts.filter(f=>f.group===scope):Curriculum.scope(id,scope).flatMap(s=>s.concepts),values=concepts.map(f=>progress[f.id]);
 const questions=new Set(legacy?validLevels.flatMap(l=>legacyItems(id,l,scope).map(i=>i.id)):concepts.flatMap(c=>c.questions));
 return {sampled:values.filter(Boolean).length,total:values.length,questions:questions.size,practiced:values.reduce((n,p)=>n+(p?.questions?.filter(q=>questions.has(q)).length||0),0),retained:values.filter(p=>status(p)==='Retained').length,due:values.filter(p=>p&&p.due<=now).length};
}
function validateProgress(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('This file does not contain valid learning progress.');
 const out={};
 for(const [id,p] of Object.entries(input)){
  if(!Curriculum.validConcept(id)||!p||typeof p!=='object')continue;
  const counts=['attempts','correct','independent'];if(counts.some(k=>!Number.isSafeInteger(p[k])||p[k]<0||p[k]>1000000)||p.correct>p.attempts||p.independent>p.correct)throw Error('The progress file has invalid attempt counts.');
  if(!Array.isArray(p.forms)||!Array.isArray(p.days)||p.days.length>10000||!Number.isFinite(p.due)||p.due<0||!Number.isFinite(p.lastSeen))throw Error('The progress file has invalid review data.');
  if(p.questions!==undefined&&(!Array.isArray(p.questions)||p.questions.length>10000))throw Error('The progress file has invalid question history.');
  if(p.independentQuestions!==undefined&&(!Array.isArray(p.independentQuestions)||p.independentQuestions.length>10000))throw Error('The progress file has invalid independent recall history.');
  const questions=[...new Set((p.questions||[]).filter(q=>typeof q==='string'&&Curriculum.validQuestion(id,q)))];
  out[id]={attempts:p.attempts,correct:p.correct,independent:p.independent,forms:[...new Set(p.forms.filter(x=>validLevels.includes(x)))],days:[...new Set(p.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))],questions,independentQuestions:[...new Set((p.independentQuestions||[]).filter(q=>questions.includes(q)))],due:p.due,lastSeen:p.lastSeen,lapsed:!!p.lapsed};
 }
 return out;
}
return {makeItems,legacyItems,prepare,buildDeck,packDeck,unpackDeck,shuffle,random,updateProgress,status,chapterProgress,validateProgress,validLevels};
});


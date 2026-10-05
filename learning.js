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
const familyOf=item=>item.family||Curriculum.familyForQuestion(item.id)||item.id;
function validateHistory(input){
 const seen={};if(input?.seen&&typeof input.seen==='object')for(const [id,at] of Object.entries(input.seen).slice(0,50000))if(Curriculum.knownQuestion(id)&&Number.isFinite(at)&&at>=0)seen[id]=at;
 return {seen};
}
function recordPresentation(history,item,now=Date.now()){
 history.seen=history.seen||{};history.seen[item.id]=now;return history;
}
function questionHistory(progress,history){
 const states=new Map(),families=new Map();
 for(const p of Object.values(progress))for(const id of p.questions||[]){const q=p.questionState?.[id]||{lastSeen:p.lastSeen,due:p.due,lapsed:p.lapsed};states.set(id,q);const family=q.family||Curriculum.familyForQuestion(id);families.set(family,Math.max(families.get(family)||0,q.lastSeen||0));}
 for(const [id,lastSeen] of Object.entries(history?.seen||{})){const old=states.get(id)||{};states.set(id,{...old,lastSeen:Math.max(old.lastSeen||0,lastSeen)});const family=Curriculum.familyForQuestion(id);families.set(family,Math.max(families.get(family)||0,lastSeen));}
 return {states,families};
}
function interleave(items,rng){
 const buckets=new Map();for(const item of items){const key=item.section||'extra';if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(item);}
 const groups=shuffle([...buckets.values()],rng),out=[];while(groups.some(g=>g.length))for(const g of groups)if(g.length)out.push(g.shift());return out;
}
function buildDeck(chapter,level,group,seed,progress={},reviewOnly=false,length=9,context={}){
 const rng=random(seed),excluded=new Set(context.excludeIds||[]),excludedFamilies=new Set(context.excludeFamilies||[]);
 const items=shuffle(makeItems(chapter,level,group).filter(i=>!excluded.has(i.id)&&!excludedFamilies.has(familyOf(i))&&(!context.kinds||context.kinds.includes(i.kind))),rng);
 const {states,families}=questionHistory(progress,context.history),now=context.now??Date.now();
 const due=i=>{const q=states.get(i.id);return q?.due!==undefined&&(q.due<=now||q.lapsed)&&now-q.lastSeen>=3600000;};
 const review=items.filter(i=>{const q=states.get(i.id);return q&&(reviewOnly?(q.lapsed||q.due<=now):due(i));}).sort((a,b)=>(Number(!states.get(a.id).lapsed)-Number(!states.get(b.id).lapsed))||states.get(a.id).lastSeen-states.get(b.id).lastSeen);
 const pool=reviewOnly&&review.length?review:items,limit=length==='all'?pool.length:Math.min(pool.length,Math.max(1,Math.min(100,Number(length)||9)));
 const chosen=[],ids=new Set(),usedFamilies=new Set();
 const add=(list,target,allowFamily=false)=>{for(const i of list){if(chosen.length>=target)break;if(ids.has(i.id)||(!allowFamily&&usedFamilies.has(familyOf(i))))continue;chosen.push(i);ids.add(i.id);usedFamilies.add(familyOf(i));}};
 if(length==='all'){
  // Keep every question; spread duplicate source facts through the full set.
  const balanced=interleave(pool,rng);add(balanced,limit);add(balanced,limit,true);
 }else if(reviewOnly&&review.length){add(review,limit);add(review,limit,true);}
 else{
  const fresh=interleave(items.filter(i=>!families.has(familyOf(i))),rng);
  const unseen=interleave(items.filter(i=>!states.has(i.id)).sort((a,b)=>(families.get(familyOf(a))||0)-(families.get(familyOf(b))||0)),rng);
  const old=items.slice().sort((a,b)=>(states.get(a.id)?.lastSeen||0)-(states.get(b.id)?.lastSeen||0));
  // Fresh practice stays dominant; deliberate review is separately selectable.
  const reviewSlots=fresh.length?Math.min(review.length,Math.floor(limit*.2)):0;
  add(fresh,limit-reviewSlots);add(review,Math.min(limit,chosen.length+reviewSlots));add(fresh,limit);add(unseen,limit);add(old,limit);add(unseen,limit,true);add(old,limit,true);
 }
 return chosen.map(i=>({...prepare(i,rng),...(review.some(r=>r.id===i.id)?{review:true,reviewReason:states.get(i.id).lapsed?'missed':'due'}:{})}));
}
function packDeck(deck){return deck.map(i=>({id:i.id,order:i.options.map(o=>o.id),...(i.review?{review:true,...(i.reviewReason?{reviewReason:i.reviewReason}:{})}:{})}));}
function unpackDeck(chapter,deck){
 if(deck.every(i=>i.prompt))return deck; // Compatible with 2.0 checkpoints.
 const items=[...makeItems(chapter,'mixed'),...validLevels.flatMap(l=>legacyItems(chapter,l))];const map=new Map(items.map(i=>[i.id,i]));
 return deck.map(saved=>{const item=map.get(saved.id);if(!item||!Array.isArray(saved.order))throw Error('Unknown saved question.');const prepared=prepare(item,random(1)),options=new Map((item.kind==='sequence'?item.steps.map((label,i)=>({id:String(i),label})):item.options).map(o=>[o.id,o]));return {...prepared,...(saved.review?{review:true,...(saved.reviewReason?{reviewReason:saved.reviewReason}:{})}:{}),options:saved.order.map(id=>{if(!options.has(id))throw Error('Invalid saved answer.');return options.get(id);})};});
}
function bossDeck(lesson,progress,history,seed){
 const used=lesson.deck||[],context={history,kinds:['answer','balance'],excludeIds:used.map(i=>i.id),excludeFamilies:used.map(familyOf)};
 let items=buildDeck(lesson.chapter,lesson.level,lesson.group,seed,progress,false,3,context);
 // Small sections can run out. Reuse the oldest other facts before the current one.
 if(items.length<3){const ids=[...used.slice(0,lesson.at||0).slice(-3).map(i=>i.id),...items.map(i=>i.id)],extra=buildDeck(lesson.chapter,lesson.level,lesson.group,seed+1,progress,false,3-items.length,{history,kinds:context.kinds,excludeIds:ids,excludeFamilies:items.map(familyOf)});items.push(...extra);}
 return items;
}
function migrateLesson(lesson,progress,history,seed){
 if(lesson.contentRevision===Curriculum.version)return {...lesson,deck:unpackDeck(lesson.chapter,lesson.deck)};
 const pending=Math.max(0,lesson.deck.length-(lesson.at||0)+(lesson.current&&!lesson.current.resolved?1:0));
 const fresh=buildDeck(lesson.chapter,lesson.level,lesson.group,seed,progress,false,pending>100?'all':Math.max(1,pending),{history}).slice(0,pending);
 const next={...lesson,contentRevision:Curriculum.version,deck:fresh,at:0,current:null};
 if(lesson.bossChain){const n=Math.max(0,lesson.bossChain.items.length-lesson.bossChain.at+(lesson.current&&!lesson.current.resolved?1:0)),items=bossDeck(next,progress,history,seed+700).slice(0,n);next.bossChain=items.length?{items,at:1,correct:lesson.bossChain.correct||0}:null;if(items.length)next.current={item:items[0],resolved:false};}
 return next;
}
function updateProgress(progress,item,correct,assisted,now=Date.now(),day=new Date(now).toISOString().slice(0,10)){
 const old=progress[item.concept]||{attempts:0,correct:0,independent:0,forms:[],days:[]};
 const p={...old,forms:[...old.forms],days:[...old.days],questions:[...(old.questions||[])],independentQuestions:[...(old.independentQuestions||[])],questionState:{...(old.questionState||{})}};p.attempts++;p.lastSeen=now;p.lapsed=!correct||assisted;
 if(!p.questions.includes(item.id))p.questions.push(item.id);
 if(correct){p.correct++;if(!assisted){p.independent++;if(!p.independentQuestions.includes(item.id))p.independentQuestions.push(item.id);if(!p.forms.includes(item.level))p.forms.push(item.level);if(!p.days.includes(day))p.days.push(day);}}
 const days=correct&&!assisted?(p.independent>=3?7:p.independent>=2?3:1):0;
 p.due=now+(days?days*86400000:3600000);
 const q=p.questionState[item.id]||{attempts:0,correct:0};p.questionState[item.id]={attempts:q.attempts+1,correct:q.correct+Number(correct),lastSeen:now,due:p.due,lapsed:!correct||assisted,family:familyOf(item)};
 progress[item.concept]=p;return p;
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
  if(p.questionState!==undefined){const qs={};for(const qid of questions){const q=p.questionState?.[qid];if(!q)continue;if(!Number.isSafeInteger(q.attempts)||!Number.isSafeInteger(q.correct)||q.correct<0||q.attempts<q.correct||q.attempts>1000000||!Number.isFinite(q.lastSeen)||q.lastSeen<0||!Number.isFinite(q.due)||q.due<0)throw Error('The progress file has invalid question review data.');qs[qid]={attempts:q.attempts,correct:q.correct,lastSeen:q.lastSeen,due:q.due,lapsed:!!q.lapsed,family:Curriculum.familyForQuestion(qid)};}out[id].questionState=qs;}
 }
 return out;
}
return {makeItems,legacyItems,prepare,buildDeck,packDeck,unpackDeck,bossDeck,migrateLesson,shuffle,random,updateProgress,status,chapterProgress,validateProgress,validateHistory,recordPresentation,familyOf,validLevels};
});


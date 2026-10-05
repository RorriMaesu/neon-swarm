/* Original models, rendering, input, audio and interface for Neon Swarm. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const Core = window.SwarmCore;
  const colors = {lime:0xbcf779,mint:0x66efd1,coral:0xff8b73,violet:0xb69aff,road:0x304f59};
  const districtNames=['CELL CIRCUIT','SIGNAL NETWORK','SYSTEM CORE'];
  const bossNames=['THE DISRUPTOR','SIGNAL JAMMER','CORE IMBALANCE'];
  const labels={recruits:'RESCUE BOTS',rapid:'RAPID FIRE',spread:'SPLIT SHOT',shield:'SHIELD CELL',pierce:'RAIL BLASTER'};
  const icons={recruits:'+',rapid:'»',spread:'⋔',shield:'◇',pierce:'↟'};
  const weaponNames={pulse:'PULSE BLASTER',spread:'SPLIT BLASTER',pierce:'RAIL BLASTER'};
  let save={version:2,records:{},learning:{},resume:null,settings:{mode:'lesson',chapter:1,topic:'all',knowledge:'mixed',studyLength:'20',difficulty:'standard',sound:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'auto'}};
  let storageOK=true,storageWarned=false;
  try{const loaded=JSON.parse(localStorage.getItem('neon-swarm-v2')||localStorage.getItem('neon-swarm-v1')||'null');if(loaded){save.records=loaded.records||{};save.settings={...save.settings,...loaded.settings};save.learning=window.BodyguardLearning.validateProgress(loaded.learning||{});save.resume=loaded.resume||null;}}catch{storageOK=false;}
  if(!['lesson','study','campaign','endless','daily'].includes(save.settings.mode))save.settings.mode='lesson';
  if(!window.SwarmCore.DIFFICULTIES[save.settings.difficulty])save.settings.difficulty='standard';
  if(!window.BodyguardCurriculum.chapters.some(c=>c.id===Number(save.settings.chapter)))save.settings.chapter=1;
  if(!['mixed','foundations','connections','application'].includes(save.settings.knowledge))save.settings.knowledge='mixed';
  if(!['20','40','all'].includes(save.settings.studyLength))save.settings.studyLength='20';
  if(!window.BodyguardCurriculum.scope(save.settings.chapter,save.settings.topic).length)save.settings.topic='all';
  function persist(){try{localStorage.setItem('neon-swarm-v2',JSON.stringify(save));storageOK=true;}catch{storageOK=false;if(!storageWarned){storageWarned=true;toast('Browser saving is unavailable. Export progress in Settings before leaving.');}}}
  let selectedMode=save.settings.mode,game=null,paused=false,modalKind=null,lastFocus=null,wasPaused=false;
  let engine=null,renderTime=0,previousTime=performance.now(),demoClock=0,hudTimer=0,simAccumulator=0;
  let announceTimeout,toastTimeout,flashTime=0,shakeTime=0,dragging=false;
  const keys=new Set();let audioCtx=null,lastShootSound=0;
  function unlockAudio(){if(!save.settings.sound)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch{}}
  function tone(freq,duration=.09,type='sine',volume=.035,slide=0){
    if(!save.settings.sound||!audioCtx||audioCtx.state!=='running')return;
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime;
    osc.type=type;osc.frequency.setValueAtTime(freq,now);if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),now+duration);
    gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(now+duration);
  }
  function chime(){tone(530,.12,'sine',.04,220);setTimeout(()=>tone(800,.16,'sine',.035,180),80);}
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),2600);}
  function announce(title,subtitle='',color='lime'){
    const a=$('announcer');a.replaceChildren(document.createTextNode(title));
    if(subtitle){const s=document.createElement('small');s.textContent=subtitle;a.appendChild(s);}
    a.style.color=`#${colors[color].toString(16).padStart(6,'0')}`;a.classList.add('show');
    clearTimeout(announceTimeout);announceTimeout=setTimeout(()=>a.classList.remove('show'),2000);
  }
  function floatText(text,x,z,bad=false){
    if(!engine)return;const p=engine.project(x,2,z);const el=document.createElement('span');el.className=`float-label${bad?' bad':''}`;el.textContent=text;el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;$('float-labels').appendChild(el);setTimeout(()=>el.remove(),1050);
  }
  const Curriculum=window.BodyguardCurriculum, Learning=window.BodyguardLearning;
  const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modeNames={lesson:'Chapter mission',study:'Study',campaign:'Arcade',endless:'Endless',daily:'Daily'};
  const difficultyNotes={explorer:'Generous warnings and shields. Defend every lane at a gentler pace.',standard:'Active defense, measured growth, and bosses that fight back.',veteran:'Dense waves with armored pursuers and ranged spitters. Fast decisions and well-timed Overdrive matter.',expert:'Relentless hordes, fast flanks, armored attackers, and almost no starting protection. For practiced defenders.'};
  let activeLesson=null,sectorCheckpoint=null,focusSelection=null,focusStep=0,focusAssisted=false,focusOpened=0,checkpointTimer=0;
  function chapter(){return Curriculum.chapters.find(c=>c.id===Number(save.settings.chapter))||Curriculum.chapters[0];}
  function educational(){return ['lesson','study'].includes(selectedMode);}
  function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function recordKey(){return ['v2.2.0',selectedMode,save.settings.difficulty,educational()?chapter().id:'arcade',educational()?save.settings.knowledge:'',educational()?save.settings.topic:'',selectedMode==='daily'?localDate():''].join(':');}
  function refreshRecord(){const r=save.records[recordKey()];$('best-score').textContent=String(r?.score||0).padStart(6,'0');$('best-caption').textContent=selectedMode==='study'?'Study tracks concepts, with no combat score.':r?`${r.peak} bots at peak · ${r.kills} disruptions cleared`:'Your first mission with this setup awaits.';}
  function refreshSetup(){
    const c=chapter();if(!Curriculum.scope(c.id,save.settings.topic).length)save.settings.topic='all';
    const scope=Curriculum.scope(c.id,save.settings.topic),p=Learning.chapterProgress(c.id,save.learning,Date.now(),save.settings.topic);
    $('topic-select').innerHTML=`<option value="all">Whole chapter · ${c.questionCount.toLocaleString()} questions</option>`+c.sections.map(s=>`<option value="${s.id}">${s.id} · ${escapeHTML(s.title)} · ${s.count} questions</option>`).join('');
    const available=scope.reduce((n,s)=>{for(const [level,count]of Object.entries(s.levels))n[level]=(n[level]||0)+count;return n;},{});
    for(const option of $('knowledge-select').options){option.disabled=option.value!=='mixed'&&!available[option.value];}
    if(save.settings.knowledge!=='mixed'&&!available[save.settings.knowledge])save.settings.knowledge='mixed';
    $('chapter-select').value=c.id;$('difficulty-select').value=save.settings.difficulty;$('knowledge-select').value=save.settings.knowledge;$('topic-select').value=save.settings.topic;$('study-length').value=save.settings.studyLength;
    document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===selectedMode);b.setAttribute('aria-pressed',String(b.dataset.mode===selectedMode));});
    $('chapter-settings').classList.toggle('hidden',!educational());$('combat-settings').classList.toggle('hidden',selectedMode==='study');$('study-settings').classList.toggle('hidden',selectedMode!=='study');
    $('difficulty-note').textContent=difficultyNotes[save.settings.difficulty];
    $('start-btn').innerHTML=`${selectedMode==='study'?'START UNTIMED PRACTICE':selectedMode==='lesson'?'START CHAPTER MISSION':'START '+modeNames[selectedMode].toUpperCase()} <span>↗</span>`;
    $('controls-hint').textContent=selectedMode==='study'?'Select an answer. Fire to commit. Take your time.':'A / D or drag to steer · automatic shooting';
    $('chapter-caption').textContent=`CHAPTER ${String(c.id).padStart(2,'0')} / ${Curriculum.units[c.unit-1].toUpperCase()}`;
    $('chapter-title').textContent=educational()?c.title:'Capsule defense';$('concept-list').classList.toggle('hidden',!educational());$('chapter-description').textContent=educational()?`${c.sections.filter(s=>s.kind==='numbered-section').length} teaching sections · ${c.questionCount.toLocaleString()} source-linked questions. Choose a section or mix the chapter.`:'Defend the research capsule from simulation disruptions. Rescue bots and choose your upgrades.';
    $('concept-list').innerHTML=scope.slice(0,5).map(s=>`<span class="concept-chip">${s.id} ${escapeHTML(s.title)} <small>${s.count} Q</small></span>`).join('')+(scope.length>5?`<span class="setup-note">+ ${scope.length-5} more sections</span>`:'');
    $('progress-caption').textContent=educational()?`${p.practiced} / ${p.questions.toLocaleString()} questions practiced · ${p.retained} topics retained · ${p.due} due for review`:'';
    $('sector-number').textContent=educational()?`CHAPTER ${String(c.id).padStart(2,'0')} · ${modeNames[selectedMode].toUpperCase()}`:`${Core.DIFFICULTIES[save.settings.difficulty].name.toUpperCase()} / ${modeNames[selectedMode].toUpperCase()}`;
    $('sector-name').textContent=educational()?c.mission.toUpperCase():'CAPSULE DEFENSE';$('mission-preview').textContent=educational()?c.title:'Rescue. Upgrade. Intercept.';
    $('resume-run').classList.toggle('hidden',!save.resume);refreshRecord();
  }
  function selectMode(mode){if(game&&game.phase!=='result')return;if(!modeNames[mode])return;selectedMode=mode;save.settings.mode=mode;refreshSetup();persist();}
  function rememberRun(){
    if((game&&['playing','upgrade'].includes(game.phase))||(selectedMode==='study'&&activeLesson))save.resume={version:2,mode:selectedMode,settings:{chapter:save.settings.chapter,topic:save.settings.topic,knowledge:save.settings.knowledge,studyLength:save.settings.studyLength,difficulty:save.settings.difficulty},game:game?game.checkpoint():null,lesson:activeLesson?{...activeLesson,deck:Learning.packDeck(activeLesson.deck)}:null,sectorCheckpoint};
    persist();
  }
  function beginRun(reviewOnly=false){
    if(!engine&&selectedMode!=='study'){toast('3D is unavailable. Choose Study to practice this chapter.');return;}
    unlockAudio();closeModal(false);keys.clear();dragging=false;paused=false;simAccumulator=0;demoClock=0;engine?.clearDynamic();
    game=selectedMode==='study'?null:new Core.Game(selectedMode,selectedMode==='daily'?Core.dateSeed():Date.now()>>>0,save.settings.difficulty);
    activeLesson=educational()?{chapter:chapter().id,level:save.settings.knowledge,group:save.settings.topic,seed:Date.now()>>>0,deck:[],at:0,answered:0,correct:0,assisted:0,missed:[],asked:{},current:null,reviews:0}:null;
    if(activeLesson)activeLesson.deck=Learning.buildDeck(activeLesson.chapter,activeLesson.level,activeLesson.group,activeLesson.seed,save.learning,reviewOnly,selectedMode==='study'?save.settings.studyLength:9);
    sectorCheckpoint=game?game.checkpoint():null;activateRun();rememberRun();
    if(selectedMode==='study')openFocus();else announce('DEFEND THE CAPSULE',`${Core.DIFFICULTIES[game.difficulty].name.toUpperCase()} · DRAG OR A / D TO STEER`);
  }
  async function start(){
    if(!educational()){beginRun();return;}
    const c=chapter(),requested=[selectedMode,save.settings.chapter,save.settings.topic,save.settings.knowledge].join(':');$('start-btn').disabled=true;
    try{await Curriculum.load(c.id);}catch(e){toast(e.message);$('start-btn').disabled=false;return;}$('start-btn').disabled=false;
    if(requested!==[selectedMode,save.settings.chapter,save.settings.topic,save.settings.knowledge].join(':')){refreshSetup();return;}
    const sections=Curriculum.scope(c.id,save.settings.topic),objectives=sections.flatMap(s=>s.objectives).slice(0,4);
    const count=Learning.makeItems(c.id,save.settings.knowledge,save.settings.topic).length;
    if(!count){toast('Choose another question type for this section.');return;}
    showModal('briefing',`<span class="eyebrow">CHAPTER ${c.id} / ${modeNames[selectedMode].toUpperCase()}</span><h2>${escapeHTML(sections.length===1?sections[0].title:c.mission)}</h2><p>${count.toLocaleString()} available questions · ${sections.length===1?'Section '+sections[0].id:sections.length+' sections'} · ${selectedMode==='study'?save.settings.studyLength==='all'?'full question set':save.settings.studyLength+'-question session':'short mission sample'}</p><div class="briefing-facts">${objectives.map(t=>`<div><p>${escapeHTML(t)}</p></div>`).join('')}</div><p>Source-linked recall includes definitions, relationships, examples, and applied passages. Combat freezes during every question. Correct recall can earn up to six bonus shield points per sector.</p><button class="primary" id="briefing-go">${selectedMode==='study'?'BEGIN PRACTICE':'DEPLOY THE SQUAD'} ↗</button><button class="secondary" id="review-go">PRACTICE MISSED & DUE TOPICS</button>${sourceLine(sections[0].source)}`,false);
    $('briefing-go').onclick=()=>beginRun();$('review-go').onclick=()=>beginRun(true);
  }
  function activateRun(){
    document.querySelectorAll('.brief select,.brief [data-mode],#browse-btn').forEach(el=>el.disabled=true);document.body.classList.add('playing');document.body.classList.toggle('studying',selectedMode==='study');engine?.theme(game?.sector||1);$('float-labels').replaceChildren();
    for(const id of ['attract-caption','stage-footer','mobile-launch'])$(id).classList.add('hidden');
    for(const id of ['hud-stats','play-bottom','pause-btn','capsule-track'])$(id).classList.toggle('hidden',!game);
    $('learning-hud').classList.toggle('hidden',!activeLesson);$('start-btn').disabled=true;updateHUD();
  }
  function home(preserve=false){
    if(preserve)rememberRun();else{save.resume=null;persist();}
    document.querySelectorAll('.brief select,.brief [data-mode],#browse-btn').forEach(el=>el.disabled=false);window.speechSynthesis?.cancel();game=null;activeLesson=null;sectorCheckpoint=null;paused=false;keys.clear();dragging=false;engine?.clearDynamic();document.body.classList.remove('playing','studying');
    for(const id of ['hud-stats','play-bottom','pause-btn','boss-hud','learning-hud','capsule-track'])$(id).classList.add('hidden');
    for(const id of ['attract-caption','stage-footer'])$(id).classList.remove('hidden');
    $('start-btn').disabled=false;$('wave-progress').style.width='0';$('run-clock').textContent='00:00';closeModal(false);refreshSetup();
  }
  async function resumeRun(){
    paused=true;
    const r=save.resume;try{
      if(!r||r.version!==2||!modeNames[r.mode])throw Error('No compatible saved mission.');
      selectedMode=r.mode;Object.assign(save.settings,r.settings);save.settings.mode=r.mode;game=r.game?Core.Game.restore(r.game):null;activeLesson=r.lesson;sectorCheckpoint=r.sectorCheckpoint;
      if(educational()&&(!activeLesson||!Array.isArray(activeLesson.deck)||activeLesson.deck.length>5000))throw Error('Invalid saved practice.');
      if(activeLesson){await Curriculum.load(activeLesson.chapter);activeLesson.deck=Learning.unpackDeck(activeLesson.chapter,activeLesson.deck);}
      closeModal(false);paused=false;keys.clear();dragging=false;simAccumulator=0;refreshSetup();activateRun();
      if(activeLesson?.current)openFocus(activeLesson.current.item,true);else if(selectedMode==='study')openFocus();else if(game?.phase==='upgrade')showUpgrade();else showPause();
    }catch(e){save.resume=null;persist();home();toast('The saved mission could not be restored. Your learning progress is still available.');}
  }
  function updateHUD(){
    if(activeLesson)$('learning-hud').textContent=`CH ${activeLesson.chapter} · ${activeLesson.correct}/${activeLesson.answered} correct · ${activeLesson.level}`;
    if(!game)return;
    $('squad-count').textContent=game.count;$('score-count').textContent=Math.floor(game.score).toLocaleString();$('shield-count').textContent=game.shield;$('integrity-count').textContent=game.integrity;
    $('capsule-progress').style.width=`${game.integrity}%`;$('capsule-track').setAttribute('aria-valuenow',String(game.integrity));$('capsule-track').classList.toggle('danger',game.integrity<30);
    $('run-clock').textContent=`${String(Math.floor(game.time/60)).padStart(2,'0')}:${String(Math.floor(game.time%60)).padStart(2,'0')}`;
    $('sector-number').textContent=`${Core.DIFFICULTIES[game.difficulty].name.toUpperCase()} · SECTOR ${String(game.sector).padStart(2,'0')}${selectedMode==='endless'?'':' / '+(selectedMode==='daily'?2:3)}`;
    $('sector-name').textContent=activeLesson?chapter().mission.toUpperCase():districtNames[(game.sector-1)%3];$('wave-progress').style.width=`${Math.min(100,game.sectorTime/44*100)}%`;
    $('weapon-name').textContent=weaponNames[game.weapon];$('weapon-level').textContent=`LV. ${game.weaponLevel}${game.fireRate>1?' · RAPID':''}`;
    const ready=game.charge>=100;$('surge-btn').disabled=!ready;$('surge-btn').classList.toggle('ready',ready);$('surge-label').textContent=game.overdrive>0?'BURST ACTIVE':ready?'READY · UNLEASH IT':`CHARGING · ${Math.floor(game.charge)}%`;$('surge-fill').style.transform=`scaleX(${game.charge/100})`;
    $('boss-hud').classList.toggle('hidden',!game.boss);if(game.boss){$('boss-name').textContent=game.boss.exposure>0?`WEAK POINT · ${Math.ceil(game.boss.exposure)}s`:bossNames[(game.sector-1)%3];const hp=Math.max(0,game.boss.hp/game.boss.maxHp*100);$('boss-health').style.width=`${hp}%`;$('boss-hp-label').textContent=`${Math.ceil(hp)}%`;}
  }
  function handleEvents(){
    for(const e of game.drainEvents()){
      if(e.type==='fire'){if(renderTime-lastShootSound>.13){tone(135,.045,'triangle',.008,-70);lastShootSound=renderTime;}}
      else if(e.type==='pop'){engine?.particles(e.x,.8,e.z,colors.coral,e.kind==='brute'?12:5);}
      else if(e.type==='gate'){floatText(e.delta>=0?`+${e.delta} BOTS`:`${e.delta} BOTS`,e.x,e.z,e.delta<0);e.delta>=0?chime():tone(150,.2,'sawtooth',.03,-70);}
      else if(e.type==='bonus'){floatText(e.text,e.x,e.z);chime();}
      else if(e.type==='crateBreak')engine?.particles(e.x,1,e.z,colors.violet,15);
      else if(e.type==='weapon')announce(labels[e.kind],`LOADOUT · LEVEL ${e.level}`,'violet');
      else if(e.type==='hurt'){if(!save.settings.reduced)shakeTime=.17;floatText(`−${e.amount}`,e.x,e.z,true);tone(90,.15,'sawtooth',.04,-50);}
      else if(e.type==='leak'){floatText(`CAPSULE −${e.damage}`,e.x,e.z,true);tone(170,.1,'triangle',.025,-70);}
      else if(e.type==='shieldHit')tone(650,.1,'sine',.03,-350);
      else if(e.type==='overdrive'){flashTime=.25;announce('OVERDRIVE','SHORT BURST · MOVE TO SAFETY','violet');engine?.shockwave();tone(80,.4,'sawtooth',.04,500);}
      else if(e.type==='boss')announce(bossNames[(e.sector-1)%3],'DODGE THE TARGET LINES','coral');
      else if(e.type==='warning')tone(490,.14,'square',.012,-90);
      else if(e.type==='bossDown')engine?.particles(e.x,2,e.z,colors.coral,40);
      else if(e.type==='upgrade')showUpgrade();
      else if(e.type==='sector'){engine?.theme(e.sector);announce(`SECTOR ${e.sector}`,'INTERCEPT EVERY LANE');}
      else if(e.type==='result')showResult(e);
    }
  }
  function showModal(kind,html,pause=true){
    if(!modalKind){lastFocus=document.activeElement;wasPaused=paused;}
    if(pause&&game?.phase==='playing')paused=true;keys.clear();dragging=false;
    modalKind=kind;$('modal-content').innerHTML=html;const h=$('modal-content').querySelector('h2');if(h)h.id='modal-title';$('modal-backdrop').classList.remove('hidden');$('modal-backdrop').classList.toggle('focus-mode',kind==='focus');$('modal-close').classList.toggle('hidden',['focus','upgrade','result','pause'].includes(kind));$('modal').focus();
  }
  function closeModal(resume=true){
    if(!modalKind)return;if(['focus','upgrade'].includes(modalKind)&&resume)return;modalKind=null;$('modal-backdrop').classList.add('hidden');$('modal-backdrop').classList.remove('focus-mode');if(resume&&game?.phase==='playing')paused=wasPaused;if(lastFocus?.isConnected)lastFocus.focus();
  }
  function sourceLine(url){return `<p class="source-note">Independent practice · <a href="${url}" target="_blank" rel="noopener">Read the OpenStax chapter</a>. Access for free at <a href="${Curriculum.book}1-introduction" target="_blank" rel="noopener">Anatomy &amp; Physiology 2e</a> · learning content CC BY-NC-SA 4.0.</p>`;}
  function diagram(item){
    if(item.diagram==='heart')return `<figure class="anatomy-diagram"><svg viewBox="0 0 440 240" role="img" aria-label="Front-view chamber map: A upper anatomical right, B lower anatomical right, C upper anatomical left, D lower anatomical left"><text x="110" y="22">BODY RIGHT</text><text x="330" y="22">BODY LEFT</text><rect x="35" y="40" width="150" height="70" rx="22" class="right-heart"/><rect x="35" y="132" width="150" height="83" rx="22" class="right-heart"/><rect x="255" y="40" width="150" height="70" rx="22" class="left-heart"/><rect x="255" y="132" width="150" height="83" rx="22" class="left-heart"/><text x="110" y="84" class="diagram-letter">A</text><text x="110" y="183" class="diagram-letter">B</text><text x="330" y="84" class="diagram-letter">C</text><text x="330" y="183" class="diagram-letter">D</text><path d="M110 112v18m220-18v18" class="diagram-flow"/></svg><figcaption>Chamber map · schematic, not anatomical scale. Body right appears on your left. Text labels below provide the same choices.</figcaption></figure>`;
    if(item.diagram==='kidney')return `<figure class="anatomy-diagram"><svg viewBox="0 0 480 215" role="img" aria-label="A: glomerular blood to capsular space; B: tubule to nearby blood; C: nearby blood to tubule"><rect x="18" y="26" width="205" height="54" rx="16" class="right-heart"/><rect x="257" y="26" width="205" height="54" rx="16" class="left-heart"/><rect x="18" y="146" width="205" height="54" rx="16" class="left-heart"/><rect x="257" y="146" width="205" height="54" rx="16" class="right-heart"/><text x="120" y="49"><tspan x="120">Glomerular</tspan><tspan x="120" dy="24">blood</tspan></text><text x="360" y="60">Nearby blood</text><text x="120" y="170"><tspan x="120">Capsule /</tspan><tspan x="120" dy="24">tubule</tspan></text><text x="360" y="180">Tubular fluid</text><path d="M85 84v57m245 57V84m65 0v57" class="diagram-flow"/><text x="104" y="120" class="diagram-letter">A ↓</text><text x="307" y="120" class="diagram-letter">B ↑</text><text x="423" y="120" class="diagram-letter">C ↓</text></svg><figcaption>Directional model · simplified. Each arrow is also described in the answer targets.</figcaption></figure>`;
    if(item.kind==='balance')return `<div class="balance-visual" aria-label="Conceptual feedback gauge"><span>DEVIATION</span><div class="balance-track"><i></i><b class="balance-marker"></b></div><span>TARGET RANGE</span></div>`;
    return '';
  }
  function checkFocus(){
    if(!activeLesson||selectedMode!=='lesson'||paused||modalKind||game.phase!=='playing')return;
    const stage=game.sectorTime>=32?2:game.sectorTime>=18?1:0;
    const mark=game.boss&&game.boss.age>=6?3:stage;
    if(!mark||activeLesson.asked[`${game.sector}-${mark}`])return;
    // Do not skip an earlier checkpoint if the page resumes at a later time.
    const pending=[1,2,3].find(i=>i<=mark&&!activeLesson.asked[`${game.sector}-${i}`]);
    if(pending){
      activeLesson.asked[`${game.sector}-${pending}`]=true;
      if(pending===3&&game.sector===3){
        const rng=Learning.random(activeLesson.seed+700),pool=Learning.makeItems(activeLesson.chapter,activeLesson.level,activeLesson.group).filter(i=>i.kind!=='sequence'&&i.kind!=='diagram');
        const related=Learning.shuffle(pool,rng).slice(0,3).map(i=>Learning.prepare(i,rng));
        activeLesson.bossChain={items:related,at:1,correct:0};
        openFocus(activeLesson.bossChain.items[0]);
      }else openFocus();
    }
  }
  function openFocus(item=null,restoring=false){
    if(!activeLesson)return;
    if(!item){item=activeLesson.deck[activeLesson.at++];if(!item){if(selectedMode==='study')showStudyResult();return;}activeLesson.current={item,resolved:false};}
    else if(!restoring)activeLesson.current={item,resolved:false};
    paused=true;keys.clear();dragging=false;focusSelection=null;focusStep=0;focusAssisted=!!activeLesson.current.assisted;focusOpened=performance.now();
    renderFocus();rememberRun();
  }
  function renderFocus(){
    const state=activeLesson.current,item=state.item,resolved=state.resolved;
    const title=activeLesson.bossChain?`Boss focus ${activeLesson.bossChain.at} / ${activeLesson.bossChain.items.length}`:item.kind==='sequence'?'Build the pathway':item.kind==='diagram'?'Anatomy scanner':item.kind==='balance'?'Restore the balance':'Aim your answer';
    const step=item.kind==='sequence'&&!resolved?`<div class="route-progress" aria-label="Completed pathway stages">${item.steps.map((s,i)=>`<span class="${i<focusStep?'complete':''}">${i<focusStep?escapeHTML(s):i+1}</span>`).join('<b>→</b>')}</div><p class="step-caption">Choose stage ${focusStep+1} of ${item.steps.length}.</p>`:'';
    const options=item.options.filter(o=>item.kind!=='sequence'||resolved||Number(o.id)>=focusStep);
    showModal('focus',`<span class="eyebrow">FOCUS / ${item.section?'SECTION '+item.section:'CHAPTER '+activeLesson.chapter} · ${item.level.toUpperCase()}</span><h2>${title}</h2>${item.heading?`<p class="question-topic">${escapeHTML(item.heading)} · ${Math.min(activeLesson.at,activeLesson.deck.length)} / ${activeLesson.deck.length} in this session</p>`:''}<p class="focus-prompt" id="focus-prompt">${escapeHTML(item.prompt)}</p>${diagram(item)}${step}<div class="answer-targets ${resolved?'resolved':''}" role="group" aria-label="Answer targets">${options.map((o,i)=>`<button class="answer-target ${resolved&&item.kind!=='sequence'&&o.id===item.answer?'correct-answer':''} ${resolved&&o.id===state.chosen&&!state.correct?'wrong-answer':''}" data-answer="${escapeHTML(o.id)}" ${resolved?'disabled':''} aria-pressed="false"><span class="target-number">${i+1}</span><span>${escapeHTML(o.label)}</span><b aria-hidden="true">◎</b></button>`).join('')}</div>${resolved?`<div class="answer-feedback ${state.correct?'success':'retry'}" role="status"><strong>${state.correct?(state.assisted?'Correct with a hint':'Correct — concept connected'):'Let’s make that connection'}</strong><p>${escapeHTML(state.explanation)}</p>${item.kind==='sequence'?`<p class="completed-route">${item.steps.map(escapeHTML).join(' → ')}</p>`:''}<small>${state.bonus?`+${state.bonus} bonus shields. `:''}${state.correct?'':'This topic is marked for another attempt. '}Combat and learning progress are tracked separately.</small></div><button class="primary" id="focus-continue">${selectedMode==='study'?'NEXT QUESTION':'BACK TO THE MISSION'} ↗</button>`:`<button class="primary" id="fire-answer" disabled>SELECT A TARGET, THEN FIRE ↗</button><div class="focus-tools"><button class="secondary" id="hint-btn">SHOW A HINT</button><button class="secondary" id="read-btn">READ ALOUD</button></div><p class="hint-text hidden" id="hint-text"></p><p class="focus-instructions">No timer. Click or tap a target, then Fire answer. Keyboard: number keys select; Enter fires.</p>`}<button class="text-btn focus-save" id="focus-save">SAVE & RETURN TO SETUP ↗</button>${sourceLine(item.source)}${item.definitionSource?`<p class="source-note">Definition adapted from the <a href="${item.definitionSource}" target="_blank" rel="noopener">chapter key terms</a>.</p>`:''}`,false);
    if(resolved){$('focus-continue').onclick=continueFocus;return wireFocusSave();}
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>selectAnswer(b.dataset.answer));
    $('fire-answer').onclick=fireAnswer;
    $('hint-btn').onclick=()=>{focusAssisted=true;activeLesson.current.assisted=true;$('hint-text').textContent=item.hint;$('hint-text').classList.remove('hidden');$('hint-btn').disabled=true;rememberRun();};
    $('read-btn').onclick=()=>{if(!('speechSynthesis'in window)){toast('Read-aloud is unavailable in this browser.');return;}speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(item.prompt+'. '+options.map((o,i)=>`${i+1}. ${o.label}`).join('. ')));};
    wireFocusSave();
  }
  function wireFocusSave(){$('focus-save').onclick=()=>home(true);}
  function selectAnswer(id){
    if(modalKind!=='focus'||activeLesson.current.resolved||performance.now()-focusOpened<220)return;
    focusSelection=id;document.querySelectorAll('[data-answer]').forEach(b=>{const on=b.dataset.answer===id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});$('fire-answer').disabled=false;$('fire-answer').textContent='FIRE ANSWER ↗';
  }
  function fireAnswer(){
    if(focusSelection===null||activeLesson.current.resolved)return;const item=activeLesson.current.item,chosen=focusSelection;
    if(item.kind==='sequence'&&chosen===String(focusStep)){focusStep++;chime();if(focusStep<item.steps.length){focusSelection=null;renderFocus();return;}}
    const correct=item.kind==='sequence'?focusStep===item.steps.length:chosen===item.answer;
    activeLesson.answered++;if(correct)activeLesson.correct++;if(focusAssisted)activeLesson.assisted++;
    if(activeLesson.bossChain&&correct&&!focusAssisted)activeLesson.bossChain.correct++;
    Learning.updateProgress(save.learning,item,correct,focusAssisted,Date.now(),localDate());
    const selected=item.options.find(o=>o.id===chosen);
    const explanation=!correct&&selected?.meaning?`You chose ${selected.term}: ${selected.meaning}. ${item.explanation}`:item.explanation;
    const bonus=correct&&!focusAssisted&&game?game.rewardLearning():0;
    activeLesson.current={item,resolved:true,correct,assisted:focusAssisted,chosen,explanation,bonus};
    if(!correct){activeLesson.missed.push({concept:item.concept,topic:item.topic,explanation:item.explanation,source:item.source});queueReview(item);}
    correct?chime():tone(160,.12,'triangle',.025,-50);renderFocus();rememberRun();updateHUD();
  }
  function queueReview(item){
    if(activeLesson.bossChain||activeLesson.reviews>=3)return;
    const variant=Learning.makeItems(item.chapter,'mixed',activeLesson.group).find(i=>i.concept===item.concept&&i.id!==item.id)||item;
    const remaining=activeLesson.deck.length-activeLesson.at,needed=Math.max(0,2-remaining);
    if(activeLesson.deck.length+needed+1>(selectedMode==='study'?activeLesson.deck.length+3:12))return; // Otherwise leave it due for the next session.
    const rng=Learning.random(activeLesson.seed+activeLesson.reviews+1);
    if(needed){const fillers=Learning.shuffle(Learning.makeItems(item.chapter,item.level,activeLesson.group).filter(i=>i.concept!==item.concept),rng).slice(0,needed);activeLesson.deck.push(...fillers.map(i=>Learning.prepare(i,rng)));}
    activeLesson.deck.splice(activeLesson.at+2,0,Learning.prepare(variant,rng));activeLesson.reviews++;
  }
  function continueFocus(){
    if(!activeLesson?.current?.resolved)return;window.speechSynthesis?.cancel();activeLesson.current=null;closeModal(false);paused=false;
    if(activeLesson.bossChain){
      const chain=activeLesson.bossChain;
      if(chain.at<chain.items.length){openFocus(chain.items[chain.at++]);return;}
      const duration=game?.exposeBoss(chain.correct)||0;activeLesson.bossChain=null;
      if(duration)announce('WEAK POINT EXPOSED',`${duration} SECONDS · KEEP FIRING`,'violet');
    }
    rememberRun();
    if(selectedMode==='study')openFocus();
  }
  function lessonSummary(){
    if(!activeLesson)return '';const p=Learning.chapterProgress(activeLesson.chapter,save.learning,Date.now(),activeLesson.group);const missed=[...new Map(activeLesson.missed.map(x=>[x.concept,x])).values()].slice(0,3);
    return `<div class="learning-summary"><h3>What you practiced</h3><p><strong>${activeLesson.correct} / ${activeLesson.answered}</strong> correct · ${activeLesson.assisted} hint-assisted attempts. ${p.practiced} of ${p.questions.toLocaleString()} questions practiced in this scope; ${p.retained} topics retained across later practice.</p>${missed.length?'<p>Revisit these connections:</p>'+missed.map(m=>`<div class="review-note"><strong>${escapeHTML(m.topic)}</strong><p>${escapeHTML(m.explanation)}</p></div>`).join(''):'<p>Return for unseen questions, try another question type, or revisit on a later day.</p>'}${sourceLine(chapter().source)}</div>`;
  }
  function showStudyResult(){
    save.resume=null;persist();showModal('result',`<span class="eyebrow">UNTIMED PRACTICE COMPLETE</span><h2>Connections made.</h2>${lessonSummary()}<button class="primary" id="study-again">PRACTICE MISSED & DUE CONCEPTS ↗</button><button class="secondary" id="result-home">CHOOSE ANOTHER CHAPTER</button>`,false);$('study-again').onclick=()=>beginRun(true);$('result-home').onclick=()=>home();
  }
  function showUpgrade(){
    rememberRun();showModal('upgrade',`<span class="eyebrow">SECTOR ${game.sector} COMPLETE</span><h2>Refit your crew.</h2><p>The capsule recovers 10 integrity when you enter the next sector.</p><div class="upgrade-options"><button class="upgrade-option" data-upgrade="recruits"><span>+3</span><div><strong>Bring backup</strong><small>Three more shooters</small></div></button><button class="upgrade-option" data-upgrade="damage"><span>↟</span><div><strong>Focused power</strong><small>A modest damage increase, capped at 1.25</small></div></button><button class="upgrade-option" data-upgrade="shield"><span>◇</span><div><strong>Repair & protect</strong><small>Six shields and 15 extra capsule integrity</small></div></button></div>`,false);
    document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{closeModal(false);game.nextSector(b.dataset.upgrade);sectorCheckpoint=game.checkpoint();paused=false;rememberRun();chime();updateHUD();});
  }
  function showResult(e){
    paused=false;save.resume=null;const key=recordKey(),old=save.records[key],best=!old||e.score>old.score;if(best)save.records[key]={score:Math.floor(e.score),peak:e.peak,kills:e.kills,time:Math.floor(e.time),date:localDate()};persist();updateHUD();refreshRecord();
    showModal('result',`<span class="eyebrow">${e.won?'MISSION COMPLETE':'MISSION ENDED'} / ${Core.DIFFICULTIES[game.difficulty].name.toUpperCase()}</span><h2>${e.won?'System defended.':'Regroup and return.'}</h2><p>${e.won?'Your capsule made it through.':'Your '+(game.integrity===0?'capsule lost its integrity. Intercept enemies before they pass.':'squad ran out of bots. Read the warnings and keep room to move.')+' Your learning progress is saved.'}</p>${best?'<span class="new-best">NEW BEST FOR THIS SETUP ↗</span>':''}<div class="result-stats"><div><small>SCORE</small><strong>${Math.floor(e.score).toLocaleString()}</strong></div><div><small>PEAK SQUAD</small><strong>${e.peak}</strong></div><div><small>ESCAPED</small><strong>${e.leaks}</strong></div></div>${lessonSummary()}${!e.won&&sectorCheckpoint?'<button class="primary" id="retry-sector">RETRY THIS SECTOR ↗</button>':''}<button class="${e.won?'primary':'secondary'}" id="retry-btn">START A NEW RUN ↗</button>${activeLesson?'<button class="secondary" id="result-study">PRACTICE MISSED CONCEPTS IN STUDY</button>':''}<button class="secondary" id="result-home">RETURN TO SETUP</button>`,false);
    $('retry-btn').onclick=()=>beginRun();$('result-home').onclick=()=>home();
    if($('result-study'))$('result-study').onclick=()=>{selectedMode='study';save.settings.mode='study';beginRun(true);};
    if($('retry-sector'))$('retry-sector').onclick=()=>{game=Core.Game.restore(sectorCheckpoint);if(activeLesson){for(const key of Object.keys(activeLesson.asked))if(key.startsWith(game.sector+'-'))delete activeLesson.asked[key];activeLesson.current=null;activeLesson.deck=Learning.buildDeck(activeLesson.chapter,activeLesson.level,activeLesson.group,Date.now()>>>0,save.learning);activeLesson.at=0;}closeModal(false);paused=false;keys.clear();dragging=false;simAccumulator=0;activateRun();rememberRun();};
  }
  function showPause(){
    if(!game||game.phase!=='playing')return;paused=true;keys.clear();dragging=false;rememberRun();showModal('pause','<span class="eyebrow">TAKE A BREATHER</span><h2>The capsule can wait.</h2><p>Movement, warnings, charge, and buffs are frozen.</p><button class="primary" id="resume-btn">CONTINUE MISSION ↗</button><button class="secondary" id="pause-home">SAVE & RETURN TO SETUP</button><button class="secondary" id="end-run">END THIS RUN</button>',false);$('resume-btn').onclick=()=>{closeModal(false);paused=false;unlockAudio();};$('pause-home').onclick=()=>home(true);$('end-run').onclick=()=>home();
  }
  function showGuide(){showModal('guide','<span class="eyebrow">BODYGUARD FIELD GUIDE</span><h2>Defend. Discover. Remember.</h2><div class="guide-row"><span>↔</span><div><strong>Intercept the waves</strong><p>Steer with A/D, arrows, or drag. Shooting is automatic. Pulse shots penetrate two targets: line up rows. Small drones swarm, runners rush, armored stalkers absorb fire, and purple spitters launch warned strikes. Escaped enemies damage your capsule; losing every bot also ends the run.</p></div></div><div class="guide-row"><span>+</span><div><strong>Grow with care</strong><p>Pick gates with your squad center. Break crates and collect their loot. Recruits, weapon choices, and shields help, but growth is limited.</p></div></div><div class="guide-row"><span>◎</span><div><strong>Focus checkpoints</strong><p>Combat freezes while you read. Select one answer target, then Fire answer. Number keys select; Enter fires. A hint marks an assisted attempt. Pathways require each stage in order.</p></div></div><div class="guide-row"><span>✳</span><div><strong>Use your emergency burst</strong><p>Space or the Overdrive button clears small enemies and warning bolts, weakens heavies, and gives brief protection. It does not open crates for you.</p></div></div><div class="guide-row"><span>↗</span><div><strong>Keep learning</strong><p>Choose a chapter and a section, or mix a whole chapter. Explore section coverage shows topics and question counts. Study has no combat and offers 20, 40, or the full question set. Progress is saved in this browser; export it in Settings to move it between devices. Retained requires varied, unassisted recall on later days.</p></div></div><button class="primary" id="guide-done">GOT IT ↗</button>');$('guide-done').onclick=()=>closeModal();}
  function showSettings(){
    showModal('settings',`<span class="eyebrow">MAKE YOURSELF COMFORTABLE</span><h2>Your simulation.</h2><div class="settings-row"><label for="sound-setting">Sound effects</label><input type="checkbox" id="sound-setting" ${save.settings.sound?'checked':''}></div><div class="settings-row"><label for="reduced-setting">Reduced motion</label><input type="checkbox" id="reduced-setting" ${save.settings.reduced?'checked':''}></div><div class="settings-row"><label for="quality-setting">Graphics quality</label><select id="quality-setting"><option value="auto">Auto</option><option value="low">Low</option><option value="high">High</option></select></div><p>Progress stays in this browser. Export a copy to transfer it to another device. Existing arcade records are preserved separately.</p><button class="secondary" id="export-progress">EXPORT LEARNING PROGRESS</button><label class="import-control">IMPORT LEARNING PROGRESS<input type="file" id="import-progress" accept="application/json,.json"></label><button class="secondary" id="reset-progress">RESET LEARNING PROGRESS…</button><p class="setup-note">Source-linked questions practice terminology, relationships, and examples. The textbook links provide complete explanations.</p><button class="primary" id="settings-done">DONE ↗</button>`);
    $('quality-setting').value=save.settings.quality;$('sound-setting').onchange=e=>{save.settings.sound=e.target.checked;updateSound();unlockAudio();persist();};$('reduced-setting').onchange=e=>{save.settings.reduced=e.target.checked;persist();};$('quality-setting').onchange=e=>{save.settings.quality=e.target.value;engine?.resize();persist();};$('settings-done').onclick=()=>closeModal();
    $('export-progress').onclick=()=>{const blob=new Blob([JSON.stringify({format:'bodyguard-progress',version:2,exported:localDate(),progress:save.learning},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`bodyguard-progress-${localDate()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Learning progress exported.');};
    $('import-progress').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>8000000)throw Error('Please choose a progress file smaller than 8 MB.');const data=JSON.parse(await file.text());if(data.format!=='bodyguard-progress'||data.version!==2)throw Error('Choose an exported Bodyguard progress file.');const imported=Learning.validateProgress(data.progress);for(const [id,p]of Object.entries(imported))if(!save.learning[id]||p.lastSeen>save.learning[id].lastSeen)save.learning[id]=p;persist();refreshSetup();toast('Learning progress imported.');}catch(err){toast(err.message);}e.target.value='';};
    $('reset-progress').onclick=()=>{showModal('reset','<span class="eyebrow">RESET LEARNING</span><h2>Start a fresh notebook?</h2><p>This clears learned concepts, review dates, and the saved mission, and ends any current mission. Export your progress first if you want a copy. Arcade records and settings are kept.</p><button class="primary" id="reset-confirm">RESET LEARNING PROGRESS</button><button class="secondary" id="reset-cancel">KEEP MY PROGRESS</button>');$('reset-confirm').onclick=()=>{save.learning={};home();toast('Learning progress reset.');};$('reset-cancel').onclick=showSettings;};
  }
  function showChapters(){
    showModal('chapters',`<span class="eyebrow">28 CHAPTERS / SIX UNITS</span><h2>Where will you explore?</h2><div class="chapter-filters"><label>Find a topic<input type="search" id="chapter-search" placeholder="Heart, muscle, kidney…"></label><label>Unit<select id="unit-filter"><option value="all">All six units</option>${Curriculum.units.map((u,i)=>`<option value="${i+1}">${i+1}. ${u}</option>`).join('')}</select></label></div><div class="chapter-grid" id="chapter-grid"></div>`,false);
    function fill(){const q=$('chapter-search').value.trim().toLowerCase(),unit=$('unit-filter').value;const list=Curriculum.chapters.filter(c=>(unit==='all'||String(c.unit)===unit)&&(`${c.title} ${c.mission} ${c.sections.map(s=>s.title+' '+s.concepts.map(f=>f.term).join(' ')).join(' ')}`).toLowerCase().includes(q));$('chapter-grid').innerHTML=list.length?list.map(c=>{const p=Learning.chapterProgress(c.id,save.learning);return `<button class="chapter-card" data-chapter="${c.id}"><small>CHAPTER ${String(c.id).padStart(2,'0')}</small><strong>${escapeHTML(c.title)}</strong><span>${c.questionCount.toLocaleString()} questions · ${p.practiced} practiced · ${c.sections.length} sections</span></button>`;}).join(''):'<p>No matching chapters. Try a broader term.</p>';document.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{save.settings.chapter=Number(b.dataset.chapter);save.settings.topic='all';persist();closeModal(false);refreshSetup();});}
    $('chapter-search').oninput=fill;$('unit-filter').onchange=fill;fill();
  }
  function showCoverage(){
    const c=chapter();showModal('coverage',`<span class="eyebrow">CHAPTER ${c.id} / SECTION PRACTICE</span><h2>${escapeHTML(c.title)}</h2><p>${c.questionCount.toLocaleString()} source-linked recall questions. Each numbered section and introduction is available. Study offers short sessions or the full set. Use the textbook links for complete explanations.</p><div class="section-library">${c.sections.map(s=>{const p=Learning.chapterProgress(c.id,save.learning,Date.now(),s.id);return `<article class="section-card"><h3>${s.id} · ${escapeHTML(s.title)}</h3><p>${s.count} questions · ${p.practiced} practiced · ${p.retained} topics retained</p><p class="question-topic">${s.levels.foundations||0} terminology · ${s.levels.connections||0} relationships · ${s.levels.application||0} examples & application</p>${s.objectives.length?`<details><summary>Textbook learning objectives (${s.objectives.length})</summary><ul>${s.objectives.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul></details>`:''}<details><summary>Topics represented in practice</summary><ul>${s.headings.map(h=>`<li>${escapeHTML(h.title)} · ${h.count} questions</li>`).join('')}</ul></details><button class="secondary" data-section="${s.id}">PRACTICE THIS SECTION ↗</button><a class="section-source" href="${s.source}" target="_blank" rel="noopener">Read section at OpenStax ↗</a></article>`;}).join('')}</div>${sourceLine(c.source)}`,false);
    document.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{save.settings.topic=b.dataset.section;save.settings.knowledge='mixed';persist();closeModal(false);refreshSetup();});
  }
  function updateSound(){$('sound-btn').classList.toggle('sound-on',save.settings.sound);$('sound-btn').setAttribute('aria-label',save.settings.sound?'Mute sound':'Enable sound');}
  function surge(){if(game&&!paused&&!modalKind){unlockAudio();game.useOverdrive();}}

  class Scene {
    constructor(){
      const T=window.THREE;if(!T)throw new Error('The local 3D engine is missing. Keep the vendor folder beside index.html.');this.T=T;
      this.scene=new T.Scene();this.scene.background=new T.Color(0x163440);this.scene.fog=new T.Fog(0x163440,38,105);
      this.camera=new T.PerspectiveCamera(43,1,.1,180);this.camera.position.set(0,24,29);this.camera.lookAt(0,0,0);
      this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
      $('scene').appendChild(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Drag horizontally to steer your robot squad');
      this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;showError('The graphics connection was interrupted. Reload to return to the skyway.');});
      this.scene.add(new T.HemisphereLight(0xc6e4ee,0x203745,2.3));const sun=new T.DirectionalLight(0xffe4cf,3.1);sun.position.set(-9,22,12);this.scene.add(sun);const rim=new T.DirectionalLight(0x6ba9ff,1.6);rim.position.set(9,8,-20);this.scene.add(rim);
      this.unitCube=new T.BoxGeometry(1,1,1);this.dummy=new T.Object3D();this.dynamic=new Map();this.effects=[];this.effectGeo=new T.BoxGeometry(.09,.09,.09);this.materials=new Map();this.textureCache=new Map();
      this.city=[];this.stripes=[];this.panels=[];this.world=new T.Group();this.scene.add(this.world);this.buildWorld();this.batchStaticWorld();this.batchMovingWorld();
      this.friends=new SwarmCharacters.AnimatedCrowd(this.scene,'medic',60,0x9ffff0);
      this.enemyCrowds={walker:new SwarmCharacters.AnimatedCrowd(this.scene,'drone',360,0xff738b),stalker:new SwarmCharacters.AnimatedCrowd(this.scene,'stalker',360,0xff8b99),spitter:new SwarmCharacters.AnimatedCrowd(this.scene,'spitter',360,0xff77e5)};
      this.bossCrowd=new SwarmCharacters.AnimatedCrowd(this.scene,'stalker',1,0xffcf90);
      $('scene').dataset.characters='animated-models';
      this.shots=new T.InstancedMesh(this.unitCube,this.mat(0x91ffda,true),720);this.shots.instanceMatrix.setUsage(T.DynamicDrawUsage);this.shots.count=0;this.shots.frustumCulled=false;this.scene.add(this.shots);
      this.armorBars=[0x412a39,colors.coral].map(color=>{const m=new T.InstancedMesh(this.unitCube,this.mat(color,true),360);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.frustumCulled=false;m.count=0;this.scene.add(m);return m;});
      this.shadowGeo=new T.CircleGeometry(1,10);this.shadows=new T.InstancedMesh(this.shadowGeo,new T.MeshBasicMaterial({color:0x071d26,transparent:true,opacity:.24,depthWrite:false}),420);this.shadows.frustumCulled=false;this.scene.add(this.shadows);
      this.squadRing=new T.Mesh(new T.RingGeometry(1.85,1.91,48),new T.MeshBasicMaterial({color:colors.mint,transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));this.squadRing.rotation.x=-Math.PI/2;this.squadRing.position.set(0,.035,12);this.scene.add(this.squadRing);
      this.squadTag=this.sprite('5 BOTS',colors.mint,2.6,1.1);this.scene.add(this.squadTag);this.lastCount=0;
      this.capsule=new T.Group();this.capsule.position.set(0,0,14.8);this.scene.add(this.capsule);
      this.box(this.capsule,0,.5,0,1.45,.65,1.65,0x3d737c);
      const pod=new T.Mesh(new T.SphereGeometry(.72,16,10),this.mat(0xc5dfd1));pod.position.y=.86;pod.scale.set(1,.7,1.2);this.capsule.add(pod);
      this.box(this.capsule,0,1.42,0,.12,.07,.65,colors.mint,true);this.box(this.capsule,0,1.43,0,.58,.07,.12,colors.mint,true);
      this.capsuleTag=this.sprite('RESEARCH CAPSULE',colors.mint,3,.65);this.capsuleTag.position.set(0,2.1,14.8);this.scene.add(this.capsuleTag);
      this.resize();new ResizeObserver(()=>this.resize()).observe($('arena'));
    }
    mat(color,glow=false){const key=`${color}-${glow}`;if(!this.materials.has(key))this.materials.set(key,glow?new this.T.MeshBasicMaterial({color}):new this.T.MeshStandardMaterial({color,roughness:.75,metalness:.15}));return this.materials.get(key);}
    theme(sector){const i=activeLesson?(chapter().unit-1)%3:(sector-1)%3;const sky=[0x163440,0x241d36,0x17342e][i];this.scene.background.set(sky);this.scene.fog.color.set(sky);this.mat(colors.road).color.set([0x304f59,0x43384f,0x3b5c52][i]);}
    box(group,x,y,z,sx,sy,sz,color,glow=false){const m=new this.T.Mesh(this.unitCube,this.mat(color,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;}
    buildWorld(){
      const T=this.T;this.box(this.world,0,-.27,-26,10,.45,110,colors.road);
      this.box(this.world,0,-.6,-26,10.7,.22,110,0x183039);
      for(const side of [-1,1]){
        this.box(this.world,side*5.1,.18,-26,.18,.36,110,0x44636c);
        this.box(this.world,side*5.16,.4,-26,.065,.055,110,colors.mint,true);
        this.box(this.world,side*5.19,-.49,-26,.04,.08,110,colors.lime,true);
        for(let i=0;i<45;i++)this.stripes.push(this.box(this.world,side*4.76,.005,-70+i*2.6,.17,.025,.95,i%2?0x719a9b:colors.lime,i%2===0));
        for(let i=0;i<10;i++){const z=-65+i*12;this.box(this.world,side*4.9,-4,z,.7,8,.8,0x203d48);this.box(this.world,side*4.9,-2,z,1.3,.3,1.2,0x34525d);}
      }
      for(let i=0;i<26;i++){
        const z=-70+i*4.6;
        for(const x of [-1.64,1.64])this.stripes.push(this.box(this.world,x,.007,z,.055,.015,1.7,0x7baca9));
        this.panels.push(this.box(this.world,0,.008,z,9.4,.007,.025,0x4e7276));
      }
      const cityRng=Core.random(77221);
      for(const side of [-1,1])for(let i=0;i<12;i++){
        const x=side*(8+cityRng()*17),z=12-cityRng()*95,r=1.2+cityRng()*2.2;
        const cell=new T.Mesh(new T.SphereGeometry(r,12,8),new T.MeshStandardMaterial({color:i%2?0x285f68:0x374f76,roughness:.65,transparent:true,opacity:.6}));cell.position.set(x,-2+cityRng()*8,z);this.world.add(cell);
        const nucleus=new T.Mesh(new T.SphereGeometry(r*.32,10,8),this.mat(i%2?colors.mint:colors.violet,true));nucleus.position.copy(cell.position);this.world.add(nucleus);
        this.box(this.world,x,-5,z,.18,5,1,0x304f65);this.box(this.world,x,-2.5,z,4,.14,.16,i%2?colors.mint:colors.violet,true);
      }
      const floor=new T.Mesh(new T.PlaneGeometry(200,200),this.mat(0x152b37));floor.rotation.x=-Math.PI/2;floor.position.y=-11;this.world.add(floor);
      const moon=new T.Mesh(new T.SphereGeometry(4.5,32,20),this.mat(0xb9d9c3,true));moon.position.set(-17,17,-75);this.scene.add(moon);
      const halo=new T.Mesh(new T.RingGeometry(5.6,5.64,80),new T.MeshBasicMaterial({color:0x83b5ac,side:T.DoubleSide,transparent:true,opacity:.4}));halo.position.copy(moon.position);this.scene.add(halo);
      for(let i=0;i<3;i++){const cloud=this.box(this.world,-20+i*17,15+i*4,-79-i*3,14,1,1,0x244551);cloud.rotation.z=-.05;}
      const starGeo=new T.BufferGeometry(),stars=[];for(let i=0;i<180;i++)stars.push((cityRng()-.5)*170,18+cityRng()*45,-65-cityRng()*40);starGeo.setAttribute('position',new T.Float32BufferAttribute(stars,3));this.scene.add(new T.Points(starGeo,new T.PointsMaterial({color:0xc0d9cf,size:.1,transparent:true,opacity:.65})));
    }
    batchStaticWorld(){
      this.world.updateMatrixWorld(true);
      const moving=new Set([...this.stripes,...this.panels]),groups=new Map();
      this.world.traverse(n=>{if(n.isMesh&&n.geometry===this.unitCube&&!moving.has(n)){if(!groups.has(n.material))groups.set(n.material,[]);groups.get(n.material).push(n);}});
      for(const [material,parts]of groups){const batch=new this.T.InstancedMesh(this.unitCube,material,parts.length);parts.forEach((p,i)=>{batch.setMatrixAt(i,p.matrixWorld);p.parent.remove(p);});batch.instanceMatrix.needsUpdate=true;this.world.add(batch);}
    }
    batchMovingWorld(){
      const groups=new Map();this.movingBatches=[];
      for(const part of [...this.stripes,...this.panels]){if(!groups.has(part.material))groups.set(part.material,[]);groups.get(part.material).push(part);this.world.remove(part);}
      for(const [material,parts]of groups){const mesh=new this.T.InstancedMesh(this.unitCube,material,parts.length);mesh.instanceMatrix.setUsage(this.T.DynamicDrawUsage);mesh.frustumCulled=false;this.world.add(mesh);this.movingBatches.push({mesh,parts});}
    }
    textTexture(text,color=colors.mint,sub='',transparent=false){
      const key=`${text}-${color}-${sub}-${transparent}`;if(this.textureCache.has(key))return this.textureCache.get(key);
      const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
      if(!transparent){ctx.fillStyle='#102b35';ctx.fillRect(0,0,512,256);ctx.strokeStyle=`#${color.toString(16).padStart(6,'0')}`;ctx.lineWidth=7;ctx.strokeRect(5,5,502,246);ctx.fillStyle=`#${color.toString(16).padStart(6,'0')}25`;ctx.fillRect(8,8,496,240);}
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=`#${color.toString(16).padStart(6,'0')}`;ctx.font=`700 ${text.length>10?42:text.length>6?56:116}px 'Segoe UI',Arial`;ctx.fillText(text,256,sub?108:128);
      if(sub){ctx.fillStyle='#d7e9e5';ctx.font="500 25px 'Segoe UI',Arial";ctx.fillText(sub,256,208);}
      const texture=new this.T.CanvasTexture(c);texture.colorSpace=this.T.SRGBColorSpace;texture.anisotropy=2;this.textureCache.set(key,texture);return texture;
    }
    sprite(text,color,width=2,height=1,sub='',transparent=false){const mat=new this.T.SpriteMaterial({map:this.textTexture(text,color,sub,transparent),transparent:true,depthWrite:false});const s=new this.T.Sprite(mat);s.scale.set(width,height,1);return s;}
    createGate(g){
      const group=new this.T.Group();
      for(const [side,choice] of [[-1,g.left],[1,g.right]]){
        const good=['+','×'].includes(choice.op),color=good?colors.mint:colors.coral;
        const x=side*2.45;
        for(const edge of [-1,1])this.box(group,x+edge*2.25,1.3,0,.065,2.6,.09,color,true);
        this.box(group,x,2.58,0,4.56,.065,.09,color,true);this.box(group,x,.03,0,4.5,.035,.75,color,true);
        const mat=new this.T.MeshBasicMaterial({color,transparent:true,opacity:.085,side:this.T.DoubleSide,depthWrite:false});const veil=new this.T.Mesh(new this.T.PlaneGeometry(4.4,2.5),mat);veil.position.set(x,1.3,0);group.add(veil);
        const sign=this.sprite(`${choice.op}${choice.value}`,color,3.2,1.65,choice.op==='×'?'MULTIPLY':choice.op==='+'?'RECRUIT':'SQUAD LOSS');sign.position.set(x,2.8,0);group.add(sign);
      }
      this.scene.add(group);return group;
    }
    createCrate(c){
      const group=new this.T.Group(),color=c.kind==='recruits'?colors.mint:c.kind==='shield'?colors.lime:colors.violet;
      this.box(group,0,.65,0,1.35,1.3,1.2,0x3e405d);
      this.box(group,0,1.32,0,1.43,.12,1.28,color);
      for(const x of [-.51,.51])this.box(group,x,.65,.63,.08,1.1,.04,color,true);
      this.box(group,0,.65,.645,1.15,.065,.025,color,true);
      const sign=this.sprite(String(Math.ceil(c.hp)),color,1.65,.95,labels[c.kind]);sign.position.set(0,2.4,0);group.add(sign);group.userData.sign=sign;group.userData.hp=Math.ceil(c.hp);group.userData.color=color;this.scene.add(group);return group;
    }
    createPickup(p){
      const group=new this.T.Group(),color=p.kind==='recruits'?colors.mint:p.kind==='shield'?colors.lime:colors.violet;
      const orb=new this.T.Mesh(new this.T.OctahedronGeometry(.48,0),this.mat(color,true));orb.position.y=1;group.add(orb);group.userData.orb=orb;
      const ring=new this.T.Mesh(new this.T.TorusGeometry(.71,.026,6,30),this.mat(color,true));ring.position.y=1;ring.rotation.x=.4;group.add(ring);
      const tag=this.sprite(p.kind==='recruits'?`+${p.amount}`:icons[p.kind],color,1.9,.85);tag.position.y=2.15;group.add(tag);this.scene.add(group);return group;
    }
    createBoss(){
      const group=new this.T.Group(),accent=[colors.coral,colors.violet,colors.lime][((game?.sector||1)-1)%3];
      const core=new this.T.Mesh(new this.T.OctahedronGeometry(.34),this.mat(accent,true));core.position.set(0,2.7,.85);group.add(core);group.userData.core=core;
      const halo=new this.T.Mesh(new this.T.TorusGeometry(1.9,.025,6,40),this.mat(accent,true));halo.rotation.x=-Math.PI/2;halo.position.y=.05;group.add(halo);
      this.scene.add(group);return group;
    }
    createHazard(){
      const group=new this.T.Group();const line=new this.T.Mesh(new this.T.PlaneGeometry(1.45,51),new this.T.MeshBasicMaterial({color:colors.coral,transparent:true,opacity:.16,depthWrite:false,side:this.T.DoubleSide}));line.rotation.x=-Math.PI/2;line.position.set(0,.06,-11);group.add(line);group.userData.line=line;
      const bolt=new this.T.Mesh(new this.T.OctahedronGeometry(.45),this.mat(colors.coral,true));bolt.position.y=.7;group.add(bolt);group.userData.bolt=bolt;this.scene.add(group);return group;
    }
    syncItems(list,type,t){
      for(const item of list){const key=`${type}${item.id}`;let obj=this.dynamic.get(key);if(!obj){obj=type==='g'?this.createGate(item):type==='c'?this.createCrate(item):type==='p'?this.createPickup(item):type==='b'?this.createBoss():this.createHazard();this.dynamic.set(key,obj);}obj.userData.alive=true;
        obj.position.set(item.x||item.offset||0,0,item.z);
        if(type==='c'&&obj.userData.hp!==Math.ceil(item.hp)){obj.userData.sign.material.map=this.textTexture(String(Math.max(0,Math.ceil(item.hp))),obj.userData.color,labels[item.kind]);obj.userData.hp=Math.ceil(item.hp);}
        if(type==='p'){obj.userData.orb.rotation.y=t*2;obj.position.y=Math.sin(t*4)*.15;}
        if(type==='b'){obj.userData.core.rotation.y=t*2;obj.rotation.z=Math.sin(t*3)*.02;}
        if(type==='h'){obj.position.z=0;obj.userData.bolt.position.z=item.z;obj.userData.line.position.z=-11;obj.userData.line.visible=item.age<item.delay;obj.userData.line.material.opacity=.12+Math.sin(t*22)*.06;obj.userData.bolt.visible=item.age>=item.delay;}
      }
    }
    clearDynamic(){for(const obj of this.dynamic.values()){this.scene.remove(obj);this.disposeObject(obj);}this.dynamic.clear();for(const fx of this.effects){this.scene.remove(fx.mesh);if(fx.ownsGeometry)fx.mesh.geometry.dispose();fx.mesh.material.dispose();}this.effects=[];}
    disposeObject(obj){obj.traverse(n=>{if(n.isSprite)n.material.dispose();else if(n.isMesh){if(n.geometry!==this.unitCube)n.geometry.dispose();if(![...this.materials.values()].includes(n.material))n.material.dispose();}});}
    particles(x,y,z,color,n=10){
      if(save.settings.reduced)n=Math.min(3,n);if(this.effects.length>240)return;
      for(let i=0;i<n;i++){const mesh=new this.T.Mesh(this.effectGeo,new this.T.MeshBasicMaterial({color,transparent:true}));mesh.position.set(x,y,z);const scale=.6+Math.random()*1.5;mesh.scale.setScalar(scale);this.scene.add(mesh);this.effects.push({mesh,vx:(Math.random()-.5)*5,vy:1+Math.random()*4,vz:(Math.random()-.5)*5,life:.4+Math.random()*.35,max:.75});}
    }
    shockwave(){const mesh=new this.T.Mesh(new this.T.RingGeometry(.8,1.1,48),new this.T.MeshBasicMaterial({color:colors.violet,transparent:true,side:this.T.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.set(game.x,.08,Core.PLAYER_Z);this.scene.add(mesh);this.effects.push({mesh,life:.7,max:.7,ring:true,ownsGeometry:true});}
    resize(){
      const rect=$('arena').getBoundingClientRect();if(!rect.width||!rect.height)return;this.w=rect.width;this.h=rect.height;
      this.camera.aspect=this.w/this.h;
      // Keep the entire road visible on narrow displays while retaining its depth.
      this.camera.fov=this.camera.aspect<.7?54:this.camera.aspect<.95?48:43;
      this.camera.position.set(0,this.camera.aspect<.7?28:24,this.camera.aspect<.7?33:29);this.baseCamera=this.camera.position.clone();this.camera.lookAt(0,0,this.camera.aspect<.7?-6:0);this.camera.updateProjectionMatrix();
      const quality=save.settings.quality,low=quality==='low',high=quality==='high';this.renderer.setPixelRatio(low?1:Math.min(window.devicePixelRatio||1,high?2:1.5));this.renderer.setSize(this.w,this.h,false);
    }
    project(x,y,z){const p=new this.T.Vector3(x,y,z).project(this.camera);return {x:(p.x+1)/2*this.w,y:(1-p.y)/2*this.h};}
    pointerX(clientX){const rect=this.renderer.domElement.getBoundingClientRect();const left=this.project(-4.5,0,Core.PLAYER_Z).x,right=this.project(4.5,0,Core.PLAYER_Z).x;return Core.clamp(((clientX-rect.left-left)/(right-left)-.5)*9,-3.7,3.7);}
    render(state,t,dt,attract=false){
      this.capsule.visible=!attract;this.capsuleTag.visible=!attract;
      const poses=Core.formation(state.count,state.x),enemyList=state.enemies;
      this.friends.update(poses,t,true);
      for(const [kind,crowd]of Object.entries(this.enemyCrowds))crowd.update(enemyList.filter(e=>(kind==='stalker'?['runner','brute'].includes(e.kind):e.kind===kind)&&e.z>-49&&e.z<18),t);
      this.bossCrowd.update(state.boss?[{...state.boss,scale:3.15}]:[],t);
      const d=this.dummy;this.shots.count=Math.min(state.shots.length,720);
      const armored=enemyList.filter(e=>['brute','spitter'].includes(e.kind)&&e.maxHp&&e.z>-30&&e.z<14).slice(0,360);
      this.armorBars.forEach((mesh,part)=>{mesh.count=armored.length;armored.forEach((e,i)=>{const ratio=part?Math.max(.01,e.hp/e.maxHp):1;d.position.set(e.x-(1-ratio)*.4,e.kind==='brute'?2.6:1.8,e.z);d.rotation.set(0,0,0);d.scale.set(.8*ratio,.055,.09);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});mesh.instanceMatrix.needsUpdate=true;});
      for(let i=0;i<this.shots.count;i++){const b=state.shots[i];d.position.set(b.x,.68,b.z);d.rotation.set(0,Math.atan(b.dx||0),0);d.scale.set(.055,.065,.7);d.updateMatrix();this.shots.setMatrixAt(i,d.matrix);this.shots.setColorAt(i,new this.T.Color(b.color==='violet'?0xddbeff:0xffffff));}
      this.shots.instanceMatrix.needsUpdate=true;if(this.shots.instanceColor)this.shots.instanceColor.needsUpdate=true;
      const all=[...poses,...enemyList];this.shadows.count=Math.min(all.length,420);
      for(let i=0;i<this.shadows.count;i++){const p=all[i];d.position.set(p.x,.023,p.z);d.rotation.set(-Math.PI/2,0,0);const s=p.kind==='brute'?.66:.34;d.scale.set(s,s,1);d.updateMatrix();this.shadows.setMatrixAt(i,d.matrix);}this.shadows.instanceMatrix.needsUpdate=true;
      this.squadRing.position.x=state.x;this.squadRing.position.z=Core.PLAYER_Z-1;this.squadRing.material.color.set(state.overdrive>0?colors.violet:colors.mint);
      this.squadTag.position.set(state.x,2.1,Core.PLAYER_Z+1);this.squadTag.visible=!attract;
      if(this.lastCount!==state.count){this.squadTag.material.map=this.textTexture(`${state.count} BOTS`,colors.lime,'',true);this.lastCount=state.count;}
      for(const o of this.dynamic.values())o.userData.alive=false;
      this.syncItems(state.gates,'g',t);this.syncItems(state.crates,'c',t);this.syncItems(state.pickups,'p',t);this.syncItems(state.hazards,'h',t);if(state.boss)this.syncItems([state.boss],'b',t);
      for(const [key,o]of this.dynamic){if(!o.userData.alive){this.scene.remove(o);this.disposeObject(o);this.dynamic.delete(key);}}
      if(!paused&&(!game||game.phase==='playing')){
        for(const s of this.stripes){s.position.z+=dt*(state.speed||7);if(s.position.z>23)s.position.z-=117;}
        for(const p of this.panels){p.position.z+=dt*(state.speed||7);if(p.position.z>23)p.position.z-=119.6;}
      }
      for(const batch of this.movingBatches){batch.parts.forEach((p,i)=>{p.updateMatrix();batch.mesh.setMatrixAt(i,p.matrix);});batch.mesh.instanceMatrix.needsUpdate=true;}
      for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.life-=dt;if(e.life<=0){this.scene.remove(e.mesh);if(e.ownsGeometry)e.mesh.geometry.dispose();e.mesh.material.dispose();this.effects.splice(i,1);continue;}e.mesh.material.opacity=Math.min(1,e.life/e.max);if(e.ring)e.mesh.scale.setScalar(1+(1-e.life/e.max)*22);else{e.mesh.position.x+=e.vx*dt;e.mesh.position.y+=e.vy*dt;e.mesh.position.z+=e.vz*dt;e.vy-=dt*7;e.mesh.rotation.x+=dt*3;}}
      this.camera.position.copy(this.baseCamera);
      if(shakeTime>0&&!save.settings.reduced){this.camera.position.x+=(Math.random()-.5)*.12;this.camera.position.y+=(Math.random()-.5)*.1;}
      this.renderer.toneMappingExposure=1.25+(flashTime>0&&!save.settings.reduced?flashTime*.6:0);this.renderer.render(this.scene,this.camera);$('scene').dataset.drawCalls=String(this.renderer.info.render.calls);$('scene').dataset.triangles=String(this.renderer.info.render.triangles);
    }
  }
  function demoState(t){
    const count=18,x=Math.sin(t*.3)*1.15,enemies=[];
    for(let i=0;i<64;i++)enemies.push({id:i,x:(i%11-5)*.78,z:-44+((t*4.2+Math.floor(i/11)*1.7)%42),kind:i%17===0?'brute':i%13===0?'spitter':i%7===0?'runner':'walker'});
    const shots=[];for(let i=0;i<50;i++)shots.push({x:x+(i%6-2.5)*.55,z:12-((t*25+i*1.2)%52),dx:0});
    return{count,x,enemies,shots,gates:[{id:9001,z:-29+((t*3)%23),offset:0,left:{op:'+',value:4},right:{op:'+',value:2}}],crates:[],pickups:[],hazards:[],boss:null,speed:4,overdrive:0};
  }
  function frame(now){
    const elapsed=Math.min(.1,Math.max(0,(now-previousTime)/1000)),dt=Math.min(.04,elapsed);previousTime=now;
    if(!document.hidden){
      if(!paused)renderTime+=dt;
      if(game){
        if(!paused&&game.phase==='playing'){
          const move=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0);
          if(move)game.steer(game.targetX+move*dt*6.2);
          simAccumulator+=elapsed;
          while(simAccumulator>=1/60&&game.phase==='playing'&&!paused){game.update(1/60);handleEvents();checkFocus();simAccumulator-=1/60;}
          if(game.phase!=='playing'||paused)simAccumulator=0;
          checkpointTimer+=dt;if(checkpointTimer>5){rememberRun();checkpointTimer=0;}
        }
        engine?.render(game,renderTime,paused?0:dt);hudTimer+=dt;if(hudTimer>.1){updateHUD();hudTimer=0;}
      }else{if(!paused)demoClock+=dt;engine?.render(demoState(demoClock),renderTime,paused?0:dt,true);}
      flashTime=Math.max(0,flashTime-dt);shakeTime=Math.max(0,shakeTime-dt);
    }
    requestAnimationFrame(frame);
  }
  function showError(text){$('error-text').textContent=text+' Study mode remains available.';$('error-panel').classList.remove('hidden');}
  function wire(){
    $('chapter-select').innerHTML=Curriculum.chapters.map(c=>`<option value="${c.id}">${String(c.id).padStart(2,'0')} · ${escapeHTML(c.title)}</option>`).join('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>selectMode(b.dataset.mode));
    for(const [id,key]of [['chapter-select','chapter'],['topic-select','topic'],['difficulty-select','difficulty'],['knowledge-select','knowledge'],['study-length','studyLength']])$(id).onchange=e=>{save.settings[key]=key==='chapter'?Number(e.target.value):e.target.value;if(key==='chapter')save.settings.topic='all';persist();refreshSetup();};
    $('start-btn').onclick=start;$('mobile-start').onclick=start;$('resume-run').onclick=resumeRun;$('browse-btn').onclick=showChapters;$('coverage-btn').onclick=showCoverage;
    $('help-btn').onclick=showGuide;$('field-guide-btn').onclick=showGuide;$('settings-btn').onclick=showSettings;$('pause-btn').onclick=showPause;$('surge-btn').onclick=surge;$('error-study').onclick=()=>{home();selectMode('study');start();};
    $('sound-btn').onclick=()=>{save.settings.sound=!save.settings.sound;updateSound();unlockAudio();persist();if(save.settings.sound)chime();};
    $('fullscreen-btn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}};
    $('modal-close').onclick=()=>closeModal();$('modal-backdrop').onclick=e=>{if(e.target===$('modal-backdrop')&&!['focus','upgrade','result','pause'].includes(modalKind))closeModal();};
    document.addEventListener('keydown',e=>{
      if(modalKind){
        if(e.key==='Tab'){const items=[...$('modal').querySelectorAll('button,input,select,a')].filter(x=>!x.disabled&&x.getClientRects().length);if(items.length){const first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('modal'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===$('modal'))){e.preventDefault();first.focus();}}}
        if(modalKind==='focus'&&!e.repeat){if(/^[1-6]$/.test(e.key)){e.preventDefault();const b=[...document.querySelectorAll('[data-answer]')][Number(e.key)-1];if(b&&!b.disabled)selectAnswer(b.dataset.answer);}if(e.key==='Enter'){e.preventDefault();if(activeLesson.current.resolved)continueFocus();else fireAnswer();}}
        if(e.key==='Escape'){if(modalKind==='pause')$('resume-btn').click();else if(!['focus','upgrade','result'].includes(modalKind))closeModal();}return;
      }
      if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
      if(['ArrowLeft','ArrowRight',' ','a','d','A','D'].includes(e.key)&&game){e.preventDefault();keys.add(e.key.toLowerCase());}
      if(e.repeat)return;if(e.key===' ')surge();if((e.key.toLowerCase()==='p'||e.key==='Escape')&&game?.phase==='playing')showPause();
    });
    document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
    const canvas=engine?.renderer.domElement;
    if(canvas){canvas.addEventListener('pointerdown',e=>{if(!game||paused||game.phase!=='playing'||modalKind)return;dragging=true;canvas.setPointerCapture(e.pointerId);game.steer(engine.pointerX(e.clientX));unlockAudio();});canvas.addEventListener('pointermove',e=>{if(dragging&&game&&!paused&&!modalKind)game.steer(engine.pointerX(e.clientX));});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>dragging=false);}
    function focusLost(){keys.clear();dragging=false;window.speechSynthesis?.cancel();if(game?.phase==='playing'&&!paused&&!modalKind)showPause();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden){rememberRun();focusLost();}previousTime=performance.now();});window.addEventListener('blur',focusLost);window.addEventListener('pagehide',rememberRun);
  }
  try{engine=new Scene();}catch(e){console.error(e);showError(e.message);}
  wire();updateSound();refreshSetup();if(engine)requestAnimationFrame(frame);
  window.NeonSwarm={snapshot:()=>game?{...game.snapshot(),paused,modal:modalKind,learning:activeLesson?{chapter:activeLesson.chapter,level:activeLesson.level,answered:activeLesson.answered,correct:activeLesson.correct}:null}:({phase:activeLesson?'study':'menu',mode:selectedMode,modal:modalKind,storage:storageOK,learning:activeLesson?{chapter:activeLesson.chapter,answered:activeLesson.answered,correct:activeLesson.correct}:null}),version:'2.2.0'};
})();

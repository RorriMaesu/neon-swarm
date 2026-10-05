/* Original models, rendering, input, audio and interface for Neon Swarm. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const Core = window.SwarmCore;
  const colors = {lime:0xbcf779,mint:0x66efd1,coral:0xff8b73,violet:0xb69aff,road:0x304f59};
  const districtNames=['THE SKYWAY','AFTER HOURS','THE REACTOR'];
  const bossNames=['THE SCRAP KING','THE NIGHT SHIFT','CORE OVERRIDE'];
  const labels={recruits:'RESCUE BOTS',rapid:'RAPID FIRE',spread:'SPLIT SHOT',shield:'SHIELD CELL',pierce:'RAIL BLASTER'};
  const icons={recruits:'+',rapid:'»',spread:'⋔',shield:'◇',pierce:'↟'};
  const weaponNames={pulse:'PULSE BLASTER',spread:'SPLIT BLASTER',pierce:'RAIL BLASTER'};
  let save={records:{},settings:{sound:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'auto'}};
  let storageOK=true;
  try {const loaded=JSON.parse(localStorage.getItem('neon-swarm-v1')||'null');if(loaded){save.records=loaded.records||{};save.settings={...save.settings,...loaded.settings};}}catch{storageOK=false;}
  function persist(){try{localStorage.setItem('neon-swarm-v1',JSON.stringify(save));}catch{storageOK=false;}}
  let selectedMode='campaign',game=null,paused=false,modalKind=null,lastFocus=null,wasPaused=false;
  let engine=null,renderTime=0,previousTime=performance.now(),demoClock=0,hudTimer=0,simAccumulator=0;
  let announceTimeout,toastTimeout,flashTime=0,shakeTime=0,dragging=false;
  const keys=new Set();
  let audioCtx=null,lastShootSound=0;
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
  function recordKey(){return selectedMode==='daily'?`daily-${localDate()}`:selectedMode;}
  function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function refreshRecord(){const r=save.records[recordKey()];$('best-score').textContent=String(r?.score||0).padStart(6,'0');$('best-caption').textContent=r?`${r.peak} bots at peak · ${r.kills} scrap bots recycled`:(selectedMode==='daily'?`Today’s circuit · ${localDate()}`:'Your first big run awaits.');}
  function selectMode(mode){if(game&&game.phase!=='result')return;selectedMode=mode;document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});refreshRecord();$('sector-number').textContent=mode==='endless'?'ENDLESS / SECTOR 01':mode==='daily'?'DAILY / SECTOR 01':'SECTOR 01 / 03';}
  function start(){
    if(!engine)return;unlockAudio();closeModal(false);
    game=new Core.Game(selectedMode,selectedMode==='daily'?Core.dateSeed():Date.now()>>>0);
    paused=false;demoClock=0;simAccumulator=0;engine.clearDynamic();engine.theme(1);$('float-labels').replaceChildren();
    document.body.classList.add('playing');$('attract-caption').classList.add('hidden');$('mobile-launch').classList.add('hidden');$('stage-footer').classList.add('hidden');
    $('hud-stats').classList.remove('hidden');$('play-bottom').classList.remove('hidden');$('pause-btn').classList.remove('hidden');
    $('start-btn').innerHTML='RUN IN PROGRESS <span>↗</span>';$('start-btn').disabled=true;
    $('run-clock').textContent='00:00';updateHUD();announce('LET’S MAKE A SWARM','DRAG OR A / D TO STEER');tone(220,.25,'triangle',.05,360);
  }
  function home(){
    game=null;paused=false;engine?.clearDynamic();engine?.theme(1);document.body.classList.remove('playing');
    for(const id of ['hud-stats','play-bottom','pause-btn','boss-hud'])$(id).classList.add('hidden');
    for(const id of ['attract-caption','mobile-launch','stage-footer'])$(id).classList.remove('hidden');
    $('start-btn').disabled=false;$('start-btn').innerHTML='LET’S MAKE A SWARM <span>↗</span>';$('wave-progress').style.width='0';$('run-clock').textContent='00:00';$('sector-name').textContent='THE SKYWAY';
    closeModal(false);selectMode(selectedMode);refreshRecord();
  }
  function updateHUD(){
    if(!game)return;
    $('squad-count').textContent=game.count;$('score-count').textContent=Math.floor(game.score).toLocaleString();$('shield-count').textContent=game.shield;
    $('run-clock').textContent=`${String(Math.floor(game.time/60)).padStart(2,'0')}:${String(Math.floor(game.time%60)).padStart(2,'0')}`;
    const number=String(game.sector).padStart(2,'0');$('sector-number').textContent=selectedMode==='campaign'?`SECTOR ${number} / 03`:selectedMode==='daily'?`DAILY / SECTOR ${number} / 02`:`ENDLESS / SECTOR ${number}`;
    $('sector-name').textContent=districtNames[(game.sector-1)%3];$('wave-progress').style.width=`${Math.min(100,game.sectorTime/44*100)}%`;
    $('weapon-name').textContent=weaponNames[game.weapon];$('weapon-level').textContent=`LV. ${game.weaponLevel}${game.fireRate>1?' · RAPID':''}`;
    const ready=game.charge>=100,btn=$('surge-btn');btn.disabled=!ready;btn.classList.toggle('ready',ready);$('surge-label').textContent=game.overdrive>0?'OVERDRIVE ACTIVE':ready?'READY · UNLEASH IT':`CHARGING · ${Math.floor(game.charge)}%`;$('surge-fill').style.transform=`scaleX(${game.charge/100})`;
    $('boss-hud').classList.toggle('hidden',!game.boss);
    if(game.boss){$('boss-name').textContent=bossNames[(game.sector-1)%3];const hp=Math.max(0,game.boss.hp/game.boss.maxHp*100);$('boss-health').style.width=`${hp}%`;$('boss-hp-label').textContent=`${Math.ceil(hp)}%`;}
  }
  function handleEvents(){
    for(const e of game.drainEvents()){
      if(e.type==='fire'){if(renderTime-lastShootSound>.13){tone(game.overdrive>0?190:135,.045,'triangle',.008,-70);lastShootSound=renderTime;}}
      else if(e.type==='pop'){engine.particles(e.x,.8,e.z,colors.coral,e.kind==='brute'?12:5);tone(90,.045,'triangle',.007,-50);}
      else if(e.type==='gate'){const text=e.overflow?`SQUAD MAX · +${e.overflow*30} SCORE`:e.delta>=0?`+${e.delta} BOTS`:`${e.delta} BOTS`;floatText(text,e.x,e.z,e.delta<0);engine.particles(e.x,1,e.z,e.delta<0?colors.coral:colors.mint,18);e.delta>=0?chime():tone(150,.2,'sawtooth',.03,-70);}
      else if(e.type==='bonus'){floatText(e.text,e.x,e.z);chime();engine.particles(e.x,1,e.z,colors.mint,16);}
      else if(e.type==='crateBreak'){engine.particles(e.x,1,e.z,colors.violet,15);tone(310,.08,'square',.02,-180);}
      else if(e.type==='weapon'){announce(labels[e.kind],`LOADOUT UPGRADED · LEVEL ${e.level}`,'violet');chime();}
      else if(e.type==='hurt'){if(!save.settings.reduced)shakeTime=.17;floatText(`−${e.amount}`,e.x,e.z,true);engine.particles(e.x,1,e.z,colors.coral,12);tone(90,.15,'sawtooth',.04,-50);}
      else if(e.type==='shieldHit'){engine.particles(e.x,1,e.z,colors.mint,10);tone(650,.1,'sine',.03,-350);}
      else if(e.type==='overdrive'){flashTime=.25;announce('OVERDRIVE','FOUR SECONDS OF BIG ENERGY','violet');engine.shockwave();tone(80,.8,'sawtooth',.045,800);}
      else if(e.type==='boss'){announce(bossNames[(e.sector-1)%3],'DODGE THE RED TARGET LINES','coral');tone(110,.5,'triangle',.055,-40);}
      else if(e.type==='warning'){tone(490,.14,'square',.012,-90);}
      else if(e.type==='bossDown'){engine.particles(e.x,2,e.z,colors.coral,50);chime();}
      else if(e.type==='upgrade'){showUpgrade();}
      else if(e.type==='sector'){engine.theme(e.sector);announce(`SECTOR ${String(e.sector).padStart(2,'0')}`,districtNames[(e.sector-1)%3]);}
      else if(e.type==='result'){showResult(e);}
    }
  }
  function showModal(kind,html,pause=true){
    if(modalKind==='settings')persist();
    if(!modalKind){lastFocus=document.activeElement;wasPaused=paused;}
    if(pause&&game?.phase==='playing')paused=true;
    modalKind=kind;$('modal-content').innerHTML=html;$('modal-backdrop').classList.remove('hidden');$('modal-close').classList.toggle('hidden',['upgrade','result','pause'].includes(kind));$('modal').focus();
  }
  function closeModal(resume=true){
    if(!modalKind)return;
    const kind=modalKind;
    if(kind==='upgrade'&&resume)return;
    modalKind=null;$('modal-backdrop').classList.add('hidden');
    if(resume&&game?.phase==='playing')paused=wasPaused;
    if(lastFocus?.isConnected)lastFocus.focus();
  }
  function showPause(){
    if(!game||game.phase!=='playing')return;
    const alreadyPaused=paused;paused=true;keys.clear();dragging=false;
    showModal('pause','<span class="eyebrow">TAKE A BREATHER</span><h2>The swarm can wait.</h2><p>Your squad is right where you left it.</p><button class="primary" id="resume-btn">BACK TO THE SKYWAY ↗</button><button class="secondary" id="pause-home">END RUN & RETURN HOME</button>');
    wasPaused=alreadyPaused;$('resume-btn').onclick=()=>{closeModal(false);paused=false;unlockAudio();};$('pause-home').onclick=home;
  }
  function showGuide(){
    showModal('guide','<span class="eyebrow">THE FIELD GUIDE</span><h2>More bots.<br>More boom.</h2><div class="guide-row"><span>↔</span><div><strong>Steer. We’ll do the shooting.</strong><p>Hold A / D or the arrow keys. On a phone, drag anywhere on the skyway. Your squad fires automatically.</p></div></div><div class="guide-row"><span>×2</span><div><strong>Pick a gate with your squad center.</strong><p>+ adds bots. × multiplies them. − and ÷ shrink the squad. At 60 bots, extra recruits turn into score.</p></div></div><div class="guide-row"><span>▣</span><div><strong>Aim at crates, then collect the loot.</strong><p>Break numbered crates to rescue bots, upgrade weapons, or add shields. Move into the floating pickup before it passes.</p></div></div><div class="guide-row"><span>✳</span><div><strong>Charge up. Clear the road.</strong><p>Kills charge Overdrive. Press Space or tap the purple button to clear enemies and fire faster for four seconds.</p></div></div><div class="guide-row"><span>!</span><div><strong>Keep moving during boss fights.</strong><p>Red target strips warn you before a heavy bolt arrives. Shields absorb losses; losing every bot ends the run. Press P or Escape to pause.</p></div></div><button class="primary" id="guide-done">GOT IT ↗</button>');
    $('guide-done').onclick=()=>closeModal();
  }
  function showSettings(){
    showModal('settings',`<span class="eyebrow">MAKE YOURSELF COMFORTABLE</span><h2>Your skyway.</h2><div class="settings-row"><label for="sound-setting">Sound effects<small>Synthesized arcade sounds</small></label><input id="sound-setting" type="checkbox" ${save.settings.sound?'checked':''}></div><div class="settings-row"><label for="reduced-setting">Reduced effects<small>Less shake, particles, and flashes</small></label><input id="reduced-setting" type="checkbox" ${save.settings.reduced?'checked':''}></div><div class="settings-row"><label for="quality-setting">Graphics quality<small>Lower detail saves battery</small></label><select id="quality-setting"><option value="auto">Auto</option><option value="low">Low</option><option value="high">High</option></select></div><p>Records and preferences are saved on this browser.${storageOK?'':' Browser storage is unavailable, so records last for this session.'}</p><button class="primary" id="settings-done">SAVE & CLOSE ↗</button>`);
    $('quality-setting').value=save.settings.quality;
    $('sound-setting').onchange=e=>{save.settings.sound=e.target.checked;updateSound();unlockAudio();persist();};
    $('reduced-setting').onchange=e=>{save.settings.reduced=e.target.checked;persist();};
    $('quality-setting').onchange=e=>{save.settings.quality=e.target.value;engine?.resize();persist();};
    $('settings-done').onclick=()=>{persist();closeModal();};
  }
  function showUpgrade(){
    paused=false;
    showModal('upgrade',`<span class="eyebrow">SECTOR ${String(game.sector).padStart(2,'0')} CLEARED</span><h2>That’s a big little win.</h2><p>Pick one upgrade for the next district.</p><div class="upgrade-options"><button class="upgrade-option" data-upgrade="recruits"><span>+12</span><div><strong>Bring backup</strong><small>Rescue 12 more shooters. Overflow becomes score.</small></div></button><button class="upgrade-option" data-upgrade="damage"><span>↟</span><div><strong>Turn it up</strong><small>Every shot hits harder. Increase your weapon level.</small></div></button><button class="upgrade-option" data-upgrade="shield"><span>◇</span><div><strong>Safety in numbers</strong><small>Gain 18 shields to absorb incoming damage.</small></div></button></div>`,false);
    document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{const u=b.dataset.upgrade;closeModal(false);game.nextSector(u);paused=false;unlockAudio();chime();updateHUD();});
  }
  function showResult(e){
    paused=false;updateHUD();const key=recordKey(),old=save.records[key];const isBest=!old||e.score>old.score;
    if(isBest){save.records[key]={score:Math.floor(e.score),peak:e.peak,kills:e.kills,time:Math.floor(e.time),date:localDate()};persist();}refreshRecord();
    const title=e.won?'City reclaimed.':'Small bots. Big effort.';
    const caption=e.won?'You took back the skyway. The scrap swarm never stood a chance.':'Your squad went down swinging. Try a different gate, grab a crate, and come back bigger.';
    showModal('result',`<span class="eyebrow">${e.won?'MISSION COMPLETE':'RUN COMPLETE'} / ${selectedMode==='daily'?localDate():selectedMode==='endless'?'ENDLESS RUSH':'SKYWAY RUN'}</span><h2>${title}</h2><p>${caption}</p>${isBest?'<span class="new-best">↗ NEW PERSONAL BEST</span>':''}<div class="result-stats"><div><small>SCORE</small><strong>${Math.floor(e.score).toLocaleString()}</strong></div><div><small>PEAK SQUAD</small><strong>${e.peak}</strong></div><div><small>RECYCLED</small><strong>${e.kills}</strong></div></div><button class="primary" id="retry-btn">ONE MORE RUN ↗</button><button class="secondary" id="result-home">BACK TO HOME</button>`,false);
    $('retry-btn').onclick=start;$('result-home').onclick=home;chime();
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
      this.city=[];this.stripes=[];this.panels=[];this.world=new T.Group();this.scene.add(this.world);this.buildWorld();this.batchStaticWorld();
      this.friends=this.robotBatch(60,true);this.enemies=this.robotBatch(350,false);
      this.shots=new T.InstancedMesh(this.unitCube,this.mat(0x91ffda,true),720);this.shots.instanceMatrix.setUsage(T.DynamicDrawUsage);this.shots.count=0;this.shots.frustumCulled=false;this.scene.add(this.shots);
      this.shadowGeo=new T.CircleGeometry(1,10);this.shadows=new T.InstancedMesh(this.shadowGeo,new T.MeshBasicMaterial({color:0x071d26,transparent:true,opacity:.24,depthWrite:false}),420);this.shadows.frustumCulled=false;this.scene.add(this.shadows);
      this.squadRing=new T.Mesh(new T.RingGeometry(1.85,1.91,48),new T.MeshBasicMaterial({color:colors.mint,transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));this.squadRing.rotation.x=-Math.PI/2;this.squadRing.position.set(0,.035,12);this.scene.add(this.squadRing);
      this.squadTag=this.sprite('5 BOTS',colors.mint,2.6,1.1);this.scene.add(this.squadTag);this.lastCount=0;
      this.resize();new ResizeObserver(()=>this.resize()).observe($('arena'));
    }
    mat(color,glow=false){const key=`${color}-${glow}`;if(!this.materials.has(key))this.materials.set(key,glow?new this.T.MeshBasicMaterial({color}):new this.T.MeshStandardMaterial({color,roughness:.75,metalness:.15}));return this.materials.get(key);}
    theme(sector){const i=(sector-1)%3;const sky=[0x163440,0x241d36,0x17342e][i];this.scene.background.set(sky);this.scene.fog.color.set(sky);this.mat(colors.road).color.set([0x304f59,0x43384f,0x3b5c52][i]);}
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
      for(const side of [-1,1])for(let i=0;i<44;i++){
        const x=side*(8+cityRng()*30),z=16-cityRng()*100,h=2+cityRng()*18,w=1.6+cityRng()*3;
        const group=new T.Group();group.position.set(x,-10,z);this.world.add(group);
        const c=[0x1a303d,0x1b3c48,0x294653][i%3];this.box(group,0,h/2,0,w,h,2+cityRng()*2,c);
        this.box(group,0,h+.15,0,w+.12,.2,2.2,0x466270);
        if(i%3===0)this.box(group,side*(-w/2-.025),h*.65,0,.05,h*.33,.45,i%2?colors.coral:colors.mint,true);
        for(let j=0;j<Math.floor(h/1.8);j++)for(let k=0;k<2;k++)if(cityRng()>.22)this.box(group,(k-.5)*w*.52,1.2+j*1.7,1.13,.2,.35,.03,j%3?0x82b0a5:0xdaa48b,true);
        this.city.push(group);
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
    robotBatch(max,friendly){
      const T=this.T,body=this.mat(friendly?0x21b894:0xeb745f),head=this.mat(friendly?0x65bca8:0xf9a181),dark=this.mat(friendly?0x174d57:0x583447),eye=this.mat(friendly?0xceff9f:0xffebb0,true);
      const helmet=new T.SphereGeometry(.5,10,8);
      const specs=[{p:[0,.62,0],s:[.42,.49,.34],mat:body},{p:[0,1.02,0],s:[.51,.4,.42],mat:head,geo:helmet},{p:[0,1.035,-.202],s:[.35,.095,.025],mat:eye},{p:[-.13,.25,.01],s:[.13,.3,.16],mat:dark,leg:-1},{p:[.13,.25,.01],s:[.13,.3,.16],mat:dark,leg:1},{p:[-.13,.085,-.035],s:[.19,.12,.27],mat:dark,leg:-1},{p:[.13,.085,-.035],s:[.19,.12,.27],mat:dark,leg:1},{p:[.29,.65,-.24],s:[.15,.19,.68],mat:dark},{p:[.29,.67,-.59],s:[.115,.11,.06],mat:eye},{p:[-.26,.65,0],s:[.13,.25,.16],mat:body},{p:[0,.72,.192],s:[.24,.24,.06],mat:dark},{p:[0,.73,.229],s:[.15,.13,.025],mat:eye},{p:[0,1.29,.025],s:[.035,.23,.035],mat:dark},{p:[0,1.43,.025],s:[.08,.08,.08],mat:eye}];
      const meshes=specs.map(s=>{const m=new T.InstancedMesh(s.geo||this.unitCube,s.mat,max);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.frustumCulled=false;m.count=0;this.scene.add(m);return m;});return {specs,meshes,max,friendly};
    }
    updateRobots(batch,list,t){
      const T=this.T,n=Math.min(list.length,batch.max);const d=this.dummy;
      for(let part=0;part<batch.specs.length;part++){
        const spec=batch.specs[part],mesh=batch.meshes[part];mesh.count=n;
        for(let i=0;i<n;i++){
          const p=list[i],scale=p.kind==='brute'?1.45:p.kind==='runner'?.84:1,rot=batch.friendly?0:Math.PI;
          const bounce=Math.sin(t*11+i*1.7)*.055,step=spec.leg?Math.sin(t*11+i*1.7)*.10*spec.leg:0;
          const ox=spec.p[0]*scale*(batch.friendly?1:-1),oz=(spec.p[2]+step)*scale*(batch.friendly?1:-1);
          d.position.set(p.x+ox,spec.p[1]*scale+bounce,p.z+oz);d.rotation.set(0,rot,0);d.scale.set(...spec.s.map(v=>v*scale));d.updateMatrix();mesh.setMatrixAt(i,d.matrix);
          if(!batch.friendly&&(part===0||part===1)){mesh.setColorAt(i,new T.Color(p.kind==='brute'?0xffc579:p.kind==='runner'?0xf387c4:0xffffff));}
        }
        mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
      }
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
      const group=new this.T.Group();
      const accent=[colors.coral,colors.violet,colors.lime][((game?.sector||1)-1)%3];
      this.box(group,0,1.6,0,3.4,2.8,2.4,0x5c4451);this.box(group,0,3.1,0,2.6,.35,2.4,0xc78065);
      this.box(group,0,2.2,1.25,2.4,.45,.09,accent,true);this.box(group,0,1.28,1.27,1.3,.35,.08,0xffc198,true);
      for(const side of [-1,1]){
        this.box(group,side*1.95,1.4,.45,.75,1.35,2.4,0x364150);this.box(group,side*1.95,1.45,1.7,.42,.48,.4,accent,true);
        this.box(group,side*1.2,.36,0,.9,.7,2.5,0x24333e);this.box(group,side*1.2,.33,1.3,.75,.22,.1,0xefbf79,true);
      }
      this.box(group,0,3.9,0,.18,1.3,.18,0x879ba0);const core=new this.T.Mesh(new this.T.OctahedronGeometry(.6),this.mat(accent,true));core.position.set(0,4.55,0);group.add(core);group.userData.core=core;
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
      const poses=Core.formation(state.count,state.x),enemyList=state.enemies;
      this.updateRobots(this.friends,poses,t);this.updateRobots(this.enemies,enemyList,t);
      const d=this.dummy;this.shots.count=Math.min(state.shots.length,720);
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
      for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.life-=dt;if(e.life<=0){this.scene.remove(e.mesh);if(e.ownsGeometry)e.mesh.geometry.dispose();e.mesh.material.dispose();this.effects.splice(i,1);continue;}e.mesh.material.opacity=Math.min(1,e.life/e.max);if(e.ring)e.mesh.scale.setScalar(1+(1-e.life/e.max)*22);else{e.mesh.position.x+=e.vx*dt;e.mesh.position.y+=e.vy*dt;e.mesh.position.z+=e.vz*dt;e.vy-=dt*7;e.mesh.rotation.x+=dt*3;}}
      this.camera.position.copy(this.baseCamera);
      if(shakeTime>0&&!save.settings.reduced){this.camera.position.x+=(Math.random()-.5)*.12;this.camera.position.y+=(Math.random()-.5)*.1;}
      this.renderer.toneMappingExposure=1.25+(flashTime>0&&!save.settings.reduced?flashTime*.6:0);this.renderer.render(this.scene,this.camera);
    }
  }
  function demoState(t){
    const count=18,x=Math.sin(t*.3)*1.15,enemies=[];
    for(let i=0;i<22;i++){const z=-41+((t*4.2+i*2.3)%45);enemies.push({id:i,x:(i%7-3)*1.06,z,kind:i%9===0?'brute':'walker'});}
    const shots=[];for(let i=0;i<50;i++)shots.push({x:x+(i%6-2.5)*.55,z:12-((t*25+i*1.2)%52),dx:0});
    const z=-29+((t*3)%23);
    return{count,x,enemies,shots,gates:[{id:9001,z,offset:0,left:{op:'×',value:2},right:{op:'+',value:8}}],crates:[{id:9002,x:-2.8,z:-9,kind:'recruits',amount:8,hp:12,maxHp:12}],pickups:[],hazards:[],boss:null,speed:4,overdrive:0};
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
          while(simAccumulator>=1/60&&game.phase==='playing'&&!paused){game.update(1/60);handleEvents();simAccumulator-=1/60;}
          if(game.phase!=='playing'||paused)simAccumulator=0;
        }
        engine?.render(game,renderTime,paused?0:dt);
        hudTimer+=dt;if(hudTimer>.1){updateHUD();hudTimer=0;}
      }else{demoClock+=dt;engine?.render(demoState(demoClock),renderTime,dt,true);}
      flashTime=Math.max(0,flashTime-dt);shakeTime=Math.max(0,shakeTime-dt);
    }
    requestAnimationFrame(frame);
  }
  function showError(text){$('error-text').textContent=text;$('error-panel').classList.remove('hidden');$('start-btn').disabled=true;$('mobile-start').disabled=true;}
  function wire(){
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>selectMode(b.dataset.mode));
    $('start-btn').onclick=start;$('mobile-start').onclick=start;$('help-btn').onclick=showGuide;$('field-guide-btn').onclick=showGuide;$('settings-btn').onclick=showSettings;$('pause-btn').onclick=showPause;$('surge-btn').onclick=surge;
    $('sound-btn').onclick=()=>{save.settings.sound=!save.settings.sound;updateSound();unlockAudio();persist();if(save.settings.sound)chime();};
    $('fullscreen-btn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}};
    $('modal-close').onclick=()=>closeModal();$('modal-backdrop').onclick=e=>{if(e.target===$('modal-backdrop')&&!['upgrade','result','pause'].includes(modalKind))closeModal();};
    document.addEventListener('keydown',e=>{
      if(modalKind){if(e.key==='Tab'){const items=[...$('modal').querySelectorAll('button:not(.hidden),input,select,a')].filter(x=>!x.disabled);if(items.length){const first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('modal'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===$('modal'))){e.preventDefault();first.focus();}}}if(e.key==='Escape'){if(modalKind==='pause')$('resume-btn').click();else if(!['upgrade','result'].includes(modalKind))closeModal();}return;}
      if(['ArrowLeft','ArrowRight',' ','a','d','A','D'].includes(e.key)&&game){e.preventDefault();keys.add(e.key.toLowerCase());}
      if(e.repeat)return;
      if(e.key===' ')surge();if((e.key.toLowerCase()==='p'||e.key==='Escape')&&game?.phase==='playing')showPause();
    });
    document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
    const canvas=engine?.renderer.domElement;
    if(canvas){canvas.addEventListener('pointerdown',e=>{if(!game||paused||game.phase!=='playing'||modalKind)return;dragging=true;canvas.setPointerCapture(e.pointerId);game.steer(engine.pointerX(e.clientX));unlockAudio();});canvas.addEventListener('pointermove',e=>{if(dragging&&game&&!paused)game.steer(engine.pointerX(e.clientX));});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);canvas.addEventListener('lostpointercapture',()=>dragging=false);}
    function focusLost(){keys.clear();dragging=false;if(game?.phase==='playing'&&!paused&&!modalKind)showPause();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden)focusLost();previousTime=performance.now();});window.addEventListener('blur',focusLost);
  }
  try{engine=new Scene();}catch(e){console.error(e);showError(e.message);}
  wire();updateSound();refreshRecord();if(engine)requestAnimationFrame(frame);
  // A read-only snapshot helps reproduce issues without exposing or mutating the run.
  window.NeonSwarm={snapshot:()=>game?{...game.snapshot(),paused}:({phase:'menu',mode:selectedMode,storage:storageOK}),version:'1.0.0'};
})();

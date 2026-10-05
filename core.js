/* Neon Swarm rules. Deliberately independent of graphics for deterministic checks. */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SwarmCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const CAP = 60, PLAYER_Z = 13, ROAD_HALF = 4.8;
  const DIFFICULTIES = Object.freeze({
    explorer: Object.freeze({name:'Explorer',budget:1,hp:.85,warning:1.65,shield:12,leak:.75,interval:4.1,pace:.92,elite:.10}),
    standard: Object.freeze({name:'Standard',budget:1.65,hp:1,warning:1.35,shield:8,leak:1,interval:3.5,pace:1,elite:.15}),
    veteran: Object.freeze({name:'Veteran',budget:2.25,hp:1.18,warning:1.15,shield:5,leak:1.15,interval:2.9,pace:1.08,elite:.20}),
    expert: Object.freeze({name:'Expert',budget:2.8,hp:1.25,warning:1,shield:3,leak:1.3,interval:2.65,pace:1.12,elite:.20})
  });
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function random(seed) {
    let v = seed >>> 0;
    const next = () => {
      v += 0x6D2B79F5;
      let t = Math.imul(v ^ v >>> 15, 1 | v);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    next.getState=()=>v>>>0;
    next.setState=state=>{v=state>>>0;};
    return next;
  }
  function dateSeed(date = new Date()) {
    const key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    let h = 2166136261;
    for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  }
  function applyGate(count, op, value) {
    const raw = op === '+' ? count + value : op === '×' ? count * value : op === '−' ? count - value : Math.floor(count / value);
    return { count: clamp(raw, 1, CAP), overflow: Math.max(0, raw - CAP), delta: clamp(raw, 1, CAP) - count };
  }
  function formation(count, center = 0) {
    const columns = Math.min(7, Math.ceil(Math.sqrt(count * 1.5)));
    const spacing = .55;
    const halfWidth = (columns-1)*spacing/2;
    center = clamp(center, -4.3+halfWidth, 4.3-halfWidth);
    const positions = [];
    for (let i=0; i<count; i++) {
      const row = Math.floor(i/columns), col = i % columns;
      const rowCount = Math.min(columns, count - row*columns);
      positions.push({ x: clamp(center + (col-(rowCount-1)/2)*spacing, -4.3, 4.3), z: PLAYER_Z - row*.68 });
    }
    return positions;
  }
  class Game {
    constructor(mode = 'campaign', seed = Date.now() >>> 0, difficulty = 'standard') {
      this.mode = mode;
      this.seed = seed;
      this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'standard';
      this.profile = DIFFICULTIES[this.difficulty];
      this.rng = random(seed);
      this.id = 0;
      this.phase = 'playing';
      this.sector = 1;
      this.time = 0;
      this.sectorTime = 0;
      this.count = 6;
      this.peak = 6;
      this.x = 0;
      this.targetX = 0;
      this.score = 0;
      this.kills = 0;
      this.rescued = 0;
      this.shield = this.profile.shield;
      this.integrity = 100;
      this.leaks = 0;
      this.waveId = 0;
      this.waveLeaks = new Map();
      this.doubled = false;
      this.learningBonus = 0;
      this.charge = 0;
      this.overdrive = 0;
      this.invulnerable = 0;
      this.weapon = 'pulse';
      this.weaponLevel = 1;
      this.fireRate = 1;
      this.damage = .85;
      this.speed = 8;
      this.enemies = [];
      this.shots = [];
      this.gates = [];
      this.crates = [];
      this.pickups = [];
      this.hazards = [];
      this.boss = null;
      this.events = [];
      this.waveTimer = 3;
      this.gateTimer = 18;
      this.crateTimer = 16;
      this.fireTimer = 0;
      this.bossAppeared = false;
      this.spawnGate(-9, true);
      this.spawnCrate(-22, -2.5, 'recruits', 3);
      this.emit('start', {sector:1});
    }
    uid() { return ++this.id; }
    emit(type, data = {}) { this.events.push({type,...data}); }
    drainEvents() { return this.events.splice(0); }
    spawnGate(z = -48, first = false) {
      const double = !first && !this.doubled && this.count<16 && this.sector>=2 && this.rng()<.2;
      if(double)this.doubled=true;
      const good = double ? {op:'×',value:2} : {op:'+',value:first?4:2+Math.floor(this.rng()*3)};
      let other;
      if (first) other = {op:'+',value:2};
      else if (this.rng()<.6) other = {op:'+',value:1+Math.floor(this.rng()*3)};
      else other = {op:'−',value:2+Math.floor(this.rng()*3)};
      const flip = !first && this.rng()<.5;
      this.gates.push({id:this.uid(),z,offset:0,moving:!first && this.sector>1 && this.rng()<.35,phase:this.rng()*6.28,left:flip?other:good,right:flip?good:other});
    }
    spawnCrate(z = -45, x = (this.rng()<.5?-1:1)*2.5, kind, amount) {
      const choices = ['recruits','rapid','spread','shield','pierce'];
      kind = kind || choices[Math.floor(this.rng()*choices.length)];
      const hp = kind==='recruits'?9+this.sector*2:14+this.sector*3;
      this.crates.push({id:this.uid(),x,z,kind,amount:amount || (kind==='recruits'?2:kind==='shield'?4:1),hp,maxHp:hp});
    }
    spawnWave(z = -36, bossWave = false) {
      // Dense, staggered rows reach the visible road before bullets can erase them.
      const n = Math.min(90,Math.round((8+this.sector*2+Math.min(10,Math.floor(this.sectorTime/10)*2))*this.profile.budget*(bossWave?.65:1)),360-this.enemies.length);
      if(n<=0)return;
      const wave = ++this.waveId;
      for(const key of this.waveLeaks.keys())if(key<wave-50)this.waveLeaks.delete(key);
      const spread = this.rng();
      const lane = (Math.floor(this.rng()*3)-1)*2.8;
      for(let i=0;i<n;i++) {
        let kind = 'walker';
        const r=this.rng();
        if(this.sectorTime>9 && r<.22) kind='runner';
        else if(this.sectorTime>15 && r>1-this.profile.elite) kind=i%3===0?'spitter':'brute';
        const pressure=this.mode==='endless'?Math.pow(1.18,Math.max(0,this.sector-3)):1;
        const hp = Math.ceil((kind==='brute'?9+this.sector*3:kind==='spitter'?5+this.sector*2:kind==='runner'?1+this.sector*.6:1+this.sector*.35)*pressure*this.profile.hp);
        const x = spread<.22?clamp(lane+(i%5-2)*.72,-4.1,4.1):-4+(i%11)*.8+(this.rng()-.5)*.13;
        this.enemies.push({id:this.uid(),wave,x,z:z-Math.floor(i/11)*1.4-this.rng()*.8,kind,hp,maxHp:hp,speed:(kind==='runner'?1.5:kind==='brute'?.83:1)*this.profile.pace,damage:kind==='brute'?4:kind==='runner'?2:1,wobble:this.rng()*6.28,attack:1+this.rng()*1.5});
      }
      if(!bossWave&&this.sectorTime>23&&this.hazards.length===0&&this.rng()<.32)this.spawnHazard(this.x,-25);
    }
    spawnHazard(x,z){
      this.hazards.push({id:this.uid(),x,z,age:0,delay:this.profile.warning});
      this.emit('warning',{x,z:PLAYER_Z});
    }
    leakEnemy(e){
      const old=this.waveLeaks.get(e.wave)||0;
      const damage=Math.min(Math.ceil((e.kind==='brute'?5:e.kind==='runner'?3:2)*this.profile.leak),Math.max(0,12-old));
      this.waveLeaks.set(e.wave,old+damage);
      this.integrity=Math.max(0,this.integrity-damage);this.leaks++;
      if(damage)this.emit('leak',{damage,integrity:this.integrity,x:e.x,z:PLAYER_Z});
      if(this.integrity===0)this.finish(false);
    }
    rewardLearning(){
      const amount=Math.min(2,6-this.learningBonus);
      this.learningBonus+=amount;this.shield=Math.min(24,this.shield+amount);
      return amount;
    }
    exposeBoss(correct){
      if(!this.boss)return 0;
      const n=clamp(Math.floor(correct)||0,0,3);
      this.boss.exposure=n>=2?8:n===1?4:0;
      this.boss.exposureBonus=.1+.05*n;
      return this.boss.exposure;
    }
    spawnBoss() {
      const pressure=this.mode==='endless'?Math.pow(1.12,Math.max(0,this.sector-3)):1;
      const hp = Math.round((620 + this.sector*360)*pressure*this.profile.hp);
      this.boss = {id:this.uid(),x:0,z:-34,hp,maxHp:hp,attack:2.2,age:0,exposure:0,exposureBonus:0};
      this.bossAppeared = true;
      this.emit('boss',{sector:this.sector});
    }
    steer(x) {
      const columns=Math.min(7,Math.ceil(Math.sqrt(this.count*1.5)));
      const limit=Math.min(3.7,4.3-(columns-1)*.55/2);
      this.targetX=clamp(Number(x)||0,-limit,limit);
    }
    fire() {
      const poses = formation(this.count,this.x);
      for(let i=0;i<poses.length;i++) {
        const p=poses[i];
        const spread = this.weapon==='spread' && i%2===0 ? [-.075,.075] : [0];
        for(const dx of spread) {
          this.shots.push({id:this.uid(),x:p.x,z:p.z-.6,previousZ:p.z-.6,dx,damage:this.damage*(1+.25*(this.weaponLevel-1))*(this.weapon==='spread'?.75:1),pierce:this.weapon==='pierce'?3:this.weapon==='pulse'?1:0,hit:[],life:0,color:this.overdrive>0?'violet':'mint'});
        }
      }
      if(this.shots.length>720)this.shots.splice(0,this.shots.length-720);
      this.emit('fire');
    }
    useOverdrive() {
      if(this.phase!=='playing'||this.charge<100)return false;
      this.charge=0;
      this.overdrive=2;
      this.invulnerable=1.5;
      for(const e of this.enemies) {e.hp-=e.kind==='brute'?7:99;if(e.hp<=0){this.kills++;this.score+=kindScore(e.kind);this.emit('pop',{x:e.x,z:e.z,kind:e.kind});}}
      this.enemies=this.enemies.filter(e=>e.hp>0);
      this.hazards=[];
      if(this.boss)this.boss.hp-=45;
      this.emit('overdrive');
      return true;
    }
    gainBots(amount) {
      const old=this.count;
      this.count=clamp(this.count+amount,1,CAP);
      this.rescued+=Math.min(amount,CAP-old);
      this.score+=amount*15+Math.max(0,old+amount-CAP)*30;
      this.peak=Math.max(this.peak,this.count);
    }
    hitSquad(amount,x,z) {
      if(this.invulnerable>0)return;
      const covered=Math.min(this.shield,amount);
      this.shield-=covered;
      const loss=amount-covered;
      this.count=Math.max(0,this.count-loss);
      this.emit(covered?'shieldHit':'hurt',{amount:loss,x,z});
      if(loss)this.invulnerable=.3;
      if(this.count===0)this.finish(false);
    }
    collect(p) {
      if(p.kind==='recruits'){this.gainBots(p.amount);this.emit('bonus',{text:`+${p.amount} BOTS`,x:p.x,z:p.z});}
      else if(p.kind==='shield'){this.shield=Math.min(24,this.shield+p.amount);this.emit('bonus',{text:`+${p.amount} SHIELD`,x:p.x,z:p.z});}
      else {
        if(p.kind==='rapid')this.fireRate=Math.min(1.35,this.fireRate+.1);
        else this.weapon=p.kind;
        this.weaponLevel=Math.min(3,this.weaponLevel+1);
        this.score+=150;
        this.emit('weapon',{kind:p.kind,level:this.weaponLevel});
      }
      this.charge=Math.min(100,this.charge+6);
    }
    nextSector(upgrade) {
      if(this.phase!=='upgrade')return false;
      if(upgrade==='recruits')this.gainBots(3);
      else if(upgrade==='damage'){this.damage=Math.min(1.25,this.damage+.15);}
      else if(upgrade==='shield'){this.shield=Math.min(24,this.shield+6);this.integrity=Math.min(100,this.integrity+15);}
      this.sector++;
      this.sectorTime=0;
      this.speed=Math.min(12,8+(this.sector-1)*.6);
      this.bossAppeared=false;
      this.boss=null;
      this.learningBonus=0;
      this.integrity=Math.min(100,this.integrity+10);
      this.waveTimer=3;
      this.gateTimer=18;
      this.crateTimer=16;
      this.phase='playing';
      this.invulnerable=1;
      this.spawnGate(-18);
      this.emit('sector',{sector:this.sector});
      return true;
    }
    bossKilled() {
      const b=this.boss;
      this.score+=2000*this.sector;
      this.charge=Math.min(100,this.charge+15);
      this.emit('bossDown',{x:b.x,z:b.z});
      this.boss=null;
      this.enemies=[];this.shots=[];this.hazards=[];this.gates=[];this.crates=[];this.pickups=[];
      if((this.mode==='campaign'||this.mode==='lesson')&&this.sector>=3)this.finish(true);
      else if(this.mode==='daily'&&this.sector>=2)this.finish(true);
      else {this.phase='upgrade';this.emit('upgrade',{sector:this.sector});}
    }
    finish(won) {
      if(this.phase==='result')return;
      this.phase='result';
      this.won=won;
      this.emit('result',{won,score:this.score,kills:this.kills,peak:this.peak,time:this.time,integrity:this.integrity,leaks:this.leaks,difficulty:this.difficulty});
    }
    update(dt) {
      if(this.phase!=='playing')return;
      dt=clamp(dt,0,.04);
      this.time+=dt;this.sectorTime+=dt;
      this.x+=(this.targetX-this.x)*Math.min(1,dt*12);
      this.overdrive=Math.max(0,this.overdrive-dt);
      this.invulnerable=Math.max(0,this.invulnerable-dt);
      this.charge=Math.min(100,this.charge+dt*.55);
      const travel=this.speed*dt;
      if(!this.bossAppeared) {
        this.waveTimer-=dt;this.gateTimer-=dt;this.crateTimer-=dt;
        if(this.waveTimer<=0){this.spawnWave();this.waveTimer=Math.max(1.65,this.profile.interval-(this.sector-1)*.12-this.sectorTime*.008);}
        if(this.gateTimer<=0 && this.sectorTime<34){this.spawnGate();this.gateTimer=18+this.rng()*3;}
        if(this.crateTimer<=0 && this.sectorTime<39){this.spawnCrate();this.crateTimer=15+this.rng()*3;}
        if(this.sectorTime>=44)this.spawnBoss();
      }
      this.fireTimer-=dt;
      if(this.fireTimer<=0){this.fire();this.fireTimer=.36/this.fireRate/(this.overdrive>0?1.25:1);}
      // Arithmetic is applied exactly once, based on the commander's center.
      for(let i=this.gates.length-1;i>=0;i--) {
        const gate=this.gates[i];gate.z+=travel;
        if(gate.moving)gate.offset=Math.sin(this.time*1.3+gate.phase)*.65;
        if(gate.z>=PLAYER_Z-.4) {
          const choice=this.x<gate.offset?gate.left:gate.right;
          const result=applyGate(this.count,choice.op,choice.value);
          const before=this.count;this.count=result.count;
          if(result.delta>0){this.rescued+=result.delta;this.score+=result.delta*20+result.overflow*30;}
          this.peak=Math.max(this.peak,this.count);
          this.emit('gate',{...choice,delta:result.delta,count:this.count,before,overflow:result.overflow,x:this.x,z:PLAYER_Z});
          this.gates.splice(i,1);
        }
      }
      for(let i=this.crates.length-1;i>=0;i--) {
        const c=this.crates[i];c.z+=travel;
        if(c.hp<=0) {this.pickups.push({id:this.uid(),x:c.x,z:c.z,kind:c.kind,amount:c.amount});this.emit('crateBreak',{x:c.x,z:c.z,kind:c.kind});this.crates.splice(i,1);}
        else if(c.z>PLAYER_Z+3)this.crates.splice(i,1);
      }
      for(let i=this.pickups.length-1;i>=0;i--) {
        const p=this.pickups[i];p.z+=travel;
        if(Math.abs(p.z-(PLAYER_Z-1.4))<1.8 && Math.abs(p.x-this.x)<2.05){this.collect(p);this.pickups.splice(i,1);}
        else if(p.z>PLAYER_Z+3)this.pickups.splice(i,1);
      }
      const poses=formation(this.count,this.x);
      for(let i=this.enemies.length-1;i>=0;i--) {
        const e=this.enemies[i];e.z+=travel*e.speed;
        if(e.kind==='spitter'&&e.z>-13&&e.hp>0){e.attack-=dt;if(e.attack<=0){if(!this.hazards.length)this.spawnHazard(this.x,e.z);e.attack=4;}}
        if(e.kind==='runner')e.x=clamp(e.x+Math.sin(this.time*3+e.wobble)*dt*.35,-4.2,4.2);
        if(e.hp<=0){this.kills++;this.score+=kindScore(e.kind);this.charge=Math.min(100,this.charge+(e.kind==='brute'?3:1.05));this.emit('pop',{x:e.x,z:e.z,kind:e.kind});this.enemies.splice(i,1);continue;}
        const collision=poses.some(p=>Math.abs(p.x-e.x)<(e.kind==='brute'?.65:.43)&&Math.abs(p.z-e.z)<.68);
        if(collision){this.hitSquad(e.damage,e.x,e.z);this.enemies.splice(i,1);if(this.phase==='result')return;}
        else if(e.z>PLAYER_Z+4){this.leakEnemy(e);this.enemies.splice(i,1);if(this.phase==='result')return;}
      }
      if(this.boss) {
        const b=this.boss;b.age+=dt;b.exposure=Math.max(0,(b.exposure||0)-dt);
        b.z=Math.min(-16,b.z+travel*.6);
        b.x=Math.sin(b.age*.6)*2.05;
        b.attack-=dt;
        if(b.attack<=0){if(this.hazards.length===0)this.spawnHazard(this.x,b.z+2);b.attack=Math.max(1.85,3.8-this.sector*.2)/Math.sqrt(this.profile.pace);}
        this.waveTimer-=dt;
        if(this.waveTimer<=0){this.spawnWave(-34,true);this.waveTimer=this.profile.interval+.6;}
        if(b.hp<=0){this.bossKilled();return;}
      }
      for(let i=this.hazards.length-1;i>=0;i--) {
        const h=this.hazards[i];h.age+=dt;
        if(h.age>h.delay)h.z+=dt*22;
        if(h.age>h.delay && poses.some(p=>Math.abs(p.x-h.x)<.78&&Math.abs(p.z-h.z)<.85)){this.hitSquad(5,h.x,h.z);this.hazards.splice(i,1);if(this.phase==='result')return;}
        else if(h.z>PLAYER_Z+4)this.hazards.splice(i,1);
      }
      // Sort potential targets front-to-back; a shot cannot hit through a nearer crate.
      const targets=[...this.enemies,...this.crates];
      if(this.boss)targets.push({...this.boss,isBoss:true,source:this.boss});
      targets.sort((a,b)=>b.z-a.z);
      for(let i=this.shots.length-1;i>=0;i--) {
        const s=this.shots[i];s.previousZ=s.z;s.z-=dt*47;s.x+=s.dx*dt*47;s.life+=dt;
        let consumed=false;
        for(const t of targets) {
          if(t.hp<=0||s.hit.includes(t.id))continue;
          const width=t.isBoss?2.15:t.kind==='brute'?.68:t.maxHp && t.amount?.9:.4;
          const depth=t.isBoss?1.9:t.amount?.9:.5;
          if(Math.abs(s.x-t.x)<width && s.z<=t.z+depth && s.previousZ>=t.z-depth) {
            const source=t.source||t;source.hp-=s.damage*(t.isBoss&&source.exposure>0?1+source.exposureBonus:1);s.hit.push(t.id);
            if(t.isBoss)t.hp=source.hp;
            if(s.pierce>0)s.pierce--;else{consumed=true;break;}
          }
        }
        if(consumed||s.z<-29||Math.abs(s.x)>6||s.life>2)this.shots.splice(i,1);
      }
      if(this.boss && this.boss.age>75){this.emit('enrage');this.boss.attack=Math.min(this.boss.attack,.6);}
    }
    snapshot() {
      return {mode:this.mode,difficulty:this.difficulty,integrity:this.integrity,leaks:this.leaks,seed:this.seed,phase:this.phase,sector:this.sector,time:+this.time.toFixed(2),count:this.count,peak:this.peak,shield:this.shield,score:Math.floor(this.score),kills:this.kills,charge:Math.floor(this.charge),weapon:this.weapon,weaponLevel:this.weaponLevel,bossHp:this.boss?Math.max(0,Math.ceil(this.boss.hp)):null,enemies:this.enemies.length,gates:this.gates.length,crates:this.crates.length,shots:this.shots.length,x:+this.x.toFixed(2)};
    }
    checkpoint(){
      const state={};
      for(const [key,value]of Object.entries(this))if(!['rng','profile','events','waveLeaks'].includes(key))state[key]=value;
      return JSON.parse(JSON.stringify({version:2,state,rng:this.rng.getState(),waveLeaks:[...this.waveLeaks]}));
    }
    static restore(saved){
      if(!saved||saved.version!==2||!saved.state||!DIFFICULTIES[saved.state.difficulty])throw Error('Invalid run checkpoint.');
      const s=saved.state;
      if(!['campaign','lesson','endless','daily'].includes(s.mode)||!['playing','upgrade','result'].includes(s.phase)||!Number.isInteger(s.count)||s.count<0||s.count>CAP||!Number.isInteger(s.sector)||s.sector<1||s.sector>10000||!Number.isFinite(s.integrity)||s.integrity<0||s.integrity>100)throw Error('Invalid checkpoint values.');
      for(const key of ['enemies','shots','gates','crates','pickups','hazards'])if(!Array.isArray(s[key])||s[key].length>1000)throw Error('Invalid checkpoint entities.');
      const g=new Game(s.mode,s.seed,s.difficulty);
      for(const key of Object.keys(g))if(!['rng','profile','events','waveLeaks'].includes(key)&&Object.hasOwn(s,key))g[key]=s[key];
      g.rng.setState(saved.rng);g.waveLeaks=new Map(saved.waveLeaks||[]);g.events=[];
      return g;
    }
  }
  function kindScore(kind){return kind==='brute'?80:kind==='spitter'?60:kind==='runner'?40:25;}
  return {Game,random,dateSeed,applyGate,formation,clamp,CAP,PLAYER_Z,ROAD_HALF,DIFFICULTIES};
});

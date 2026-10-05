'use strict';
const {Game,applyGate,DIFFICULTIES}=require('../core.js');
const fs=require('fs');
function pilot(g,strong){
 let target=g.x;
 const urgent=g.enemies.filter(e=>e.z>0).sort((a,b)=>b.z-a.z)[0];
 const gate=g.gates.reduce((a,b)=>!a||b.z>a.z?b:a,null);
 if(strong&&urgent)target=urgent.x;
 else if(gate&&gate.z>-10){const l=applyGate(g.count,gate.left.op,gate.left.value),r=applyGate(g.count,gate.right.op,gate.right.value);target=l.count+l.overflow>=r.count+r.overflow?-2.8:2.8;}
 else if(g.pickups.length)target=g.pickups.reduce((a,b)=>a.z>b.z?a:b).x;
 else if(g.crates.length)target=g.crates.reduce((a,b)=>a.z>b.z?a:b).x;
 else if(g.boss)target=g.boss.x;
 else if(urgent)target=urgent.x;
 else target=0;
 if(g.hazards.some(h=>Math.abs(h.x-target)<2.7&&h.age>.2))target=g.hazards[0].x<0?3.7:-3.7;
 g.steer(target);
 if(g.charge>=100&&(g.boss||g.enemies.some(e=>e.z>3)))g.useOverdrive();
}
const median=a=>{a=a.slice().sort((a,b)=>a-b);return a.length?+a[Math.floor(a.length/2)].toFixed(2):null;};
function tactical(g){
 let target=0,best=-Infinity;
 for(const x of [-2.65,-1.3,0,1.3,2.65]){let score=0;for(const e of g.enemies)if(e.z>-23&&Math.abs(e.x-x)<1.6)score+=(e.z+26)*(e.kind==='runner'?1.3:1);if(g.boss)score+=60-Math.abs(x-g.boss.x)*10;if(score>best){best=score;target=x;}}
 const gate=g.gates.find(q=>q.z>6);if(gate){target=applyGate(g.count,gate.left.op,gate.left.value).count>=applyGate(g.count,gate.right.op,gate.right.value).count?-2.6:2.6;}
 const pickup=g.pickups.find(p=>p.z>3);if(pickup)target=pickup.x;
 const crate=g.crates.find(c=>c.z>-10&&c.z<8);if(crate&&!g.enemies.some(e=>e.z>2))target=crate.x;
 const h=g.hazards[0];if(h&&h.age>.15&&Math.abs(target-h.x)<2.4)target=h.x<0?2.65:-2.65;g.steer(target);
 if(g.charge>=100&&g.enemies.filter(e=>e.z>-25).length>8)g.useOverdrive();
}
const result={version:'2.2.0',method:'30 campaign seeds per policy and difficulty (five policies, 600 runs); 60Hz, 360-second cutoff; automatic sector upgrade (3 recruits below 22 bots, otherwise damage or repairs below 45 integrity). Simulations detect exploits and pacing; they do not predict human win rates.',profiles:{}};
for(const d of Object.keys(DIFFICULTIES)){
 const reports={};
 for(const [name,policy]of Object.entries({stationaryCenter:g=>g.steer(0),stationaryRight:g=>g.steer(2.8),reactive:g=>pilot(g,false),interceptor:g=>pilot(g,true),tactical})){
  const rows=[];for(let seed=1;seed<=30;seed++){
   const g=new Game('campaign',seed,d);let cap=null,bossTimes=[];
   for(let frame=0;frame<60*360&&g.phase!=='result';frame++){
    if(g.phase==='upgrade')g.nextSector(g.integrity<45?'shield':g.count<22?'recruits':'damage');
    policy(g);const age=g.boss?.age;g.update(1/60);if(cap===null&&g.count===60)cap=g.time;
    for(const e of g.drainEvents())if(e.type==='bossDown')bossTimes.push((age||0)+1/60);
   }
   rows.push({won:!!g.won,time:g.time,integrity:g.integrity,count:g.count,cap,bossTimes,timeout:g.phase!=='result'});
  }
  reports[name]={runs:rows.length,wins:rows.filter(r=>r.won).length,timeouts:rows.filter(r=>r.timeout).length,medianTime:median(rows.map(r=>r.time)),medianIntegrity:median(rows.map(r=>r.integrity)),medianBossSeconds:median(rows.flatMap(r=>r.bossTimes)),reachedCap:rows.filter(r=>r.cap!==null).length};
 }
 result.profiles[d]=reports;console.log(d,JSON.stringify(reports));
}
fs.writeFileSync(require('path').join(__dirname,'../balance-audit-v3.json'),JSON.stringify(result,null,2)+'\n');


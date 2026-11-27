/* Run: node test_motion250.cjs */
const M=require('./assets/smooth-motion.js'),check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
for(const id of Object.keys(M.profiles)){
 const s=M.newState();let p;for(let i=0;i<90;i++)p=M.step(s,1/60,1,{speed:3.8,turn:0},'idle',id);
 if(s.state!=='run'||!Object.values(p).every(Number.isFinite))throw Error('run '+id);
 let cycle=s.cycle,brake=0;for(let i=0;i<60;i++){p=M.step(s,1/60,1,{speed:0,turn:0},'idle',id);brake=Math.max(brake,s.brake250)}
 if(s.cycle!==cycle||s.state!=='idle'||s.walk+s.run>.03||brake<.1)throw Error('stop '+id);
 for(let i=0;i<60;i++)p=M.step(s,1/60,.62,{speed:1.65,turn:3},'idle',id);
 if(s.state!=='walk'||s.turnBody250<.6)throw Error('turn '+id);
 for(let i=0;i<120;i++){p=M.step(s,1/60,.62,{speed:1.65,turn:-3},'idle',id);if(!Object.values(p).every(Number.isFinite)||p.kneeL<0||p.kneeR>1.12)throw Error('joint '+id)}
 if(s.turnBody250>-.6)throw Error('reverse '+id);
}check(true,'20 profiles: accelerate, stop, turn, reverse and bounded joints');
let s=M.newState();for(let i=0;i<90;i++)M.step(s,1/60,1,{},'idle','m1');check(s.state==='run','preview without measured speed');
s=M.newState();for(let i=0;i<60;i++)M.step(s,1/60,0,{speed:0},'ride','m1');check(s.state==='ride'&&s.brake250===0,'mount mode preserved');
s=M.newState();M.step(s,.016,.6,{height:.5,velocity:3,speed:1},'idle','f1');check(s.state==='jump_takeoff','jump priority');
for(const dt of [1/120,1/60,1/30,.1,.35]){s=M.newState();for(let t=0;t<2;t+=dt)M.step(s,dt,1,{speed:3.8,turn:2},'idle','m1');check(s.state==='run'&&Number.isFinite(s.cycle),'time step '+dt);}

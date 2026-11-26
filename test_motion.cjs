const assert=require('node:assert/strict');
const M=require('./assets/smooth-motion.js');
let a=M.newState();
for(let i=0;i<60;i++)M.step(a,1/60,0);
assert.equal(a.state,'idle');
const before={...a.pose};
M.step(a,1/60,.65);assert.ok(Math.abs(a.pose.hipL-before.hipL)<.2);
for(let i=0;i<60;i++)M.step(a,1/60,.65);
assert.equal(a.state,'walk');assert.ok(a.walk>.85);
for(let i=0;i<60;i++)M.step(a,1/60,1);
assert.equal(a.state,'run');assert.ok(a.run>.85);assert.ok(a.pose.spineX>.15);
const phases=[[{prep:.07},'jump_start'],[{height:.03,velocity:3.6},'jump_takeoff'],[{height:.7,velocity:0},'jump_air'],[{land:.18},'jump_land']];
for(const [j,s] of phases){for(let i=0;i<5;i++)M.step(a,1/60,0,j);assert.equal(a.state,s);assert.ok(Object.values(a.pose).every(Number.isFinite));}
for(let i=0;i<60;i++)M.step(a,1/60,0);
assert.equal(a.state,'idle');assert.ok(a.jump<.01);
assert.equal(M.npcLOD(3,0).level,0);assert.equal(M.npcLOD(25,0).level,1);assert.equal(M.npcLOD(42,0).level,2);
assert.equal(M.npcLOD(25,2).level,2);
console.log('Smooth motion blend, idle/walk/run, 4 jump phases and NPC LOD passed');

assert.equal(Object.keys(M.profiles).length,20);
const signatures=new Set();
for(const id of Object.keys(M.profiles)){
 const cfg=M.profile(id);signatures.add(JSON.stringify([cfg.stride,cfg.cadence,cfg.arms,cfg.elbow,cfg.sway,cfg.lean,cfg.spread,cfg.bounce]));
 const state=M.newState();
 for(let n=0;n<450;n++){
  const gait=n<90?.65:n<210?1:n<280?.65:0,j=n>=280&&n<300?{prep:.09}:n>=300&&n<320?{height:.1,velocity:3.4}:n>=320&&n<350?{height:.4,velocity:-1}:n>=350&&n<375?{land:.18}:{};
  const v=M.step(state,1/60,gait,j,'idle',id);
  assert.ok(Object.values(v).every(Number.isFinite));
  for(const k of ['kneeL','kneeR'])assert.ok(v[k]>=0&&v[k]<=1.12+1e-6,id);
  for(const k of ['hipL','hipR'])assert.ok(v[k]>=-.620001&&v[k]<=.570001,id);
 }
}
assert.equal(signatures.size,20);
assert.ok(M.profile('m4').arms>M.profile('f1').arms);
assert.equal(M.animalState('run',1.65),'run');assert.equal(M.animalState('walk',1.65),'walk');assert.equal(M.animalState('walk',2.1),'run');assert.equal(M.animalState('run',.05),'idle');
console.log('20 unique profiles, 9000 bounded pose samples and pet gait hysteresis passed');

// V11.3: stronger continuous motion at multiple frame rates and responsive transitions.
for(const hz of [15,30,60,120])for(const id of Object.keys(M.profiles)){
 const state=M.newState();let min=Infinity,max=-Infinity;
 for(let i=0;i<8*hz;i++){
  const t=i/hz,g=t<1?0:t<3?.65:t<5?1:t<6?.65:0;
  const v=M.step(state,1/hz,g,{},'idle',id);
  assert.ok(Object.values(v).every(Number.isFinite));
  assert.ok(v.kneeL>=0&&v.kneeL<=1.120001);
  assert.ok(v.hipL>=-.620001&&v.hipL<=.570001);
  if(t>=2&&t<3){min=Math.min(min,v.hipL);max=Math.max(max,v.hipL);}
 }
 assert.equal(state.state,'idle');assert.ok(max-min>.40,id+' @ '+hz);
}
console.log('V11.3: 36000 motion samples, frame rate and gait range passed');

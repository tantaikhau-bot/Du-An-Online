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

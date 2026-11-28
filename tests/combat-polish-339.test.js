// Node-only regression checks for the V33.9 animation math.
const assert=require('node:assert/strict');
const api=require('../assets/vrm-character.js');
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};
for(const [weapon,clips] of Object.entries(api.clips321))for(let form=0;form<5;form++){
 for(const hit of [.25,.45,.62])for(let i=0;i<=200;i++){
  const pose=api.weaponKeyframe321(weapon,form,i/200,hit);
  ok(pose.length===10&&pose.every(Number.isFinite),'finite pose');
  for(let n=0;n<10;n++)ok(pose[n]>=Math.min(...clips[form].map(a=>a[n]))-1e-8&&pose[n]<=Math.max(...clips[form].map(a=>a[n]))+1e-8,'bounded joint');
 }
 const exact=api.weaponKeyframe321(weapon,form,.45,.45);
 ok(exact.every((v,i)=>Math.abs(v-clips[form][3][i])<1e-8),'exact impact key');
}
for(const weapon of Object.keys(api.clips321))for(const leg of [true,false]){
 ok(api.blendRate339(1/60,weapon,'strike',.45,.45,leg)>api.blendRate339(1/60,weapon,'strike',0,.45,leg),'impact responsiveness');
 ok(api.blendRate339(NaN,weapon,'strike',0,.45,leg)===0,'invalid dt');
 const a=api.blendRate339(1/30,weapon,'strike',.45,.45,leg),b=api.blendRate339(1/60,weapon,'strike',.45,.45,leg);
 ok(Math.abs(a-(1-(1-b)**2))<1e-9,'frame rate independent fixed target');
}
for(const id of Object.keys(api.ultimate338))for(let i=0;i<=100;i++){
 const p=i/100,frame=api.ultimateFrame338(id,p,.56);
 ok(Object.values(frame).filter(v=>typeof v==='number').every(Number.isFinite),'ultimate finite');
 for(const n of [2,3,5])for(let j=0;j<n;j++){const v=api.ultimatePath338(id,j,n,p,.56,.9);ok([v.x,v.y,v.z,v.alpha,v.scale].every(Number.isFinite)&&v.alpha>=0&&v.alpha<=1&&Math.hypot(v.x,v.z)<6,'bounded ultimate');}
}
console.log('V33.9 checks passed: '+checks);

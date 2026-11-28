// V34.1 deterministic animation regression tests.
const assert=require('node:assert/strict'),a=require('../assets/vrm-character.js'),m=require('../assets/smooth-motion.js');
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++};
ok(Object.keys(a.expression341).length===20,'roster');
for(const id of Object.keys(a.expression341)){
 for(const weapon of ['sword','great','dual','bow','staff'])for(const kind of ['strike','spin','ultimate','guard','dodge']){
  for(let i=0;i<=100;i++){const v=a.kineticFrame341(id,{kind,weapon,combo:3,progress:i/100,impact:.45});ok(Object.values(v).filter(x=>typeof x==='number').every(Number.isFinite),'finite');ok(Math.abs(v.pelvis)<.6&&Math.abs(v.shift)<.05&&v.knee<=.22&&Math.abs(v.wrist)<.25,'bounded');if(i===0||i===100||kind==='guard'||kind==='dodge')ok(v.env===0&&Math.abs(v.pelvis)<1e-9,'neutral endpoint');}
 }
 for(const hz of [30,60]){const st=m.newState();for(let i=0;i<hz*8;i++){const t=i/hz,g=t<2?0:t<4?.7:t<6?1:0,v=m.step(st,1/hz,g,{speed:g*4,turn:i%13===0?NaN:Math.sin(t)*3},'idle',id);ok(Object.values(v).every(Number.isFinite),'finite locomotion');ok(Math.abs(st.momentum341.pitch)<=.055&&Math.abs(st.momentum341.roll)<=.065,'bounded momentum');ok(v.kneeL>=0&&v.kneeR>=0,'knee');}}
 const rest=a.idleCombat341(id,'great',3,0);ok(Object.values(rest).every(v=>v===0),'idle layer neutral');
}
console.log('V34.1 checks passed: '+checks);

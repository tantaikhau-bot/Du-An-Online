const fs = require('node:fs');
const assert = require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const {clarityStep100:clarity,resolution77:resolution}=require('./assets/game-policy.js');
let v={tier:0,scale:1};
for(let i=0;i<12;i++)v=clarity(v,15,100,45,true,false);
assert.equal(v.tier,2);assert.equal(v.scale,.85);
let mobile=resolution(390,780,3,0,v.scale,false,false,4096,true);
assert.ok(mobile>=1.15);
let hd=resolution(390,780,3,0,v.scale,false,true,4096,true);
assert.ok(hd>=1.5);
let battery=resolution(390,780,3,0,.62,true,false,4096,true);
assert.ok(battery<=1);
let limited=resolution(4096,4096,3,2,1,false,true,1024,true);
assert.ok(limited<=.25);
assert.equal(resolution(390,780,1,1,1,false,false,4096,true),1);
assert.match(html,/BUILD62='13\.0-online-beta'/);
console.log('Mobile resolution regression checks passed');

// V11.5.1: no experimental Original entry point in the game.
const restoredHtml=require('node:fs').readFileSync('index.html','utf8');require('node:assert/strict').ok(!/WWOriginal|avatar=original|original-avatar\.js/.test(restoredHtml));

const D=require('./assets/daylight.js');assert.equal(D.duration,420);assert.equal(D.format(D.hour(0)),'08:00');assert.equal(D.hour(420),D.hour(0));assert.equal(D.label(6),'Bình minh');assert.equal(D.label(14),'Buổi chiều');assert.equal(D.label(18),'Hoàng hôn');assert.ok(D.sample(12).direct>D.sample(18).direct&&D.sample(18).direct>D.sample(22).direct);
for(let h=0;h<24;h+=.01){const a=D.sample(h),b=D.sample(h+.01);assert.ok(Math.abs(a.direct-b.direct)<.03);assert.ok(Math.abs(a.night-b.night)<.015);assert.ok(a.dir.every(Number.isFinite))}assert.ok(D.approachHour(23.9,.1,.1)>23.9);console.log('Continuous daylight, midnight wrap and clock labels passed');

assert.equal(D.weatherProfiles.length,6);
assert.equal(D.weatherAt(0),0);assert.equal(D.weatherAt(100),3);assert.equal(D.weatherAt(1200),0);
for(let target=0;target<6;target++){
 const w=D.weatherState();const prev=w.sun;D.blendWeather(w,target,0);assert.equal(w.sun,prev);
 for(let i=0;i<2400;i++){let old=w.fog;D.blendWeather(w,target,1/60);assert.ok(Math.abs(w.fog-old)<.001);assert.ok(w.rain>=0&&w.rain<=1&&w.snow>=0&&w.snow<=1);assert.ok(w.wind>=.45&&w.wind<=2.8);}
 assert.ok(Math.abs(w.fog-D.weatherProfiles[target].fog)<.0001);
 assert.ok(Math.abs(w.sun-D.weatherProfiles[target].sun)<.001);
}
assert.equal(D.weatherCount(1,120),120);assert.equal(D.weatherCount(0,500),0);assert.equal(D.weatherCount(.5,70),35);
console.log('V12.0 six weather profiles, continuous blending, weather schedule and particle budgets passed');

const RT=require('./assets/realtime.js'),history=[];
assert.ok(RT.addSnapshot(history,{t:1000,x:0,z:0,jump:0,heading:3.1,moving:true}));
assert.ok(RT.addSnapshot(history,{t:1750,x:3,z:0,jump:1,heading:-3.1,moving:true}));
assert.equal(RT.addSnapshot(history,{t:1600,x:0,z:0,jump:0,heading:0}),false);
const mid=RT.sample(history,2225);assert.equal(mid.x,1.5);assert.equal(mid.jump,.5);assert.ok(Math.abs(Math.abs(mid.heading)-Math.PI)<.01);
assert.ok(RT.sample(history,3000).x<=3.65);
assert.equal(RT.sample(history,5000).moving,false);
assert.ok(RT.addSnapshot(history,{t:2500,x:25,z:0,jump:0,heading:0,moving:false}));assert.equal(history.length,1);
const clk=RT.clockReading(1700000000000,100,200);assert.equal(RT.clockSeconds(clk,200),1700000000.2);
assert.equal(RT.clockReading(1,0,13000),null);
assert.ok(RT.retryDelay(3,.1)<RT.retryDelay(3,.9));
console.log('V12.1 interpolation, teleport reset, bounded prediction, server clock and retry tests passed');

const G124=require('./assets/game-policy.js');
assert.equal(G124.WW_LANDMARK124.length,4);
for(const spec of G124.WW_LANDMARK124){
 const p=G124.landmarkSite124(spec,()=>true,()=>0,()=>spec.region);
 assert.ok(p&&Math.abs(p.x)<=69&&Math.abs(p.z)<=69);
 assert.equal(G124.landmarkSite124(spec,()=>false,()=>0,()=>spec.region),null);
 assert.equal(G124.landmarkSite124(spec,()=>true,()=>0,()=>'other'),null);
}
assert.equal(G124.cellVisible124(31,0,30,false),false);
assert.equal(G124.cellVisible124(31,0,30,true),true);
assert.equal(G124.cellVisible124(36,0,30,true),false);
assert.deepEqual(G124.landmarkVisits124(['pine-lookout','fake','pine-lookout']),['pine-lookout']);
console.log('V12.4 safe landmark placement, bounded world coordinates, visit migration and LOD hysteresis passed');

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
assert.match(html,/BUILD62='12\.0-living-world'/);
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

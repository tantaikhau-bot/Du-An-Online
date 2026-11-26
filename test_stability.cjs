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
assert.match(html,/BUILD62='11\.8-performance-master'/);
console.log('Mobile resolution regression checks passed');

// V11.5.1: no experimental Original entry point in the game.
const restoredHtml=require('node:fs').readFileSync('index.html','utf8');require('node:assert/strict').ok(!/WWOriginal|avatar=original|original-avatar\.js/.test(restoredHtml));

const D=require('./assets/daylight.js');assert.equal(D.duration,420);assert.equal(D.format(D.hour(0)),'08:00');assert.equal(D.hour(420),D.hour(0));assert.equal(D.label(6),'Bình minh');assert.equal(D.label(14),'Buổi chiều');assert.equal(D.label(18),'Hoàng hôn');assert.ok(D.sample(12).direct>D.sample(18).direct&&D.sample(18).direct>D.sample(22).direct);
for(let h=0;h<24;h+=.01){const a=D.sample(h),b=D.sample(h+.01);assert.ok(Math.abs(a.direct-b.direct)<.03);assert.ok(Math.abs(a.night-b.night)<.015);assert.ok(a.dir.every(Number.isFinite))}assert.ok(D.approachHour(23.9,.1,.1)>23.9);console.log('Continuous daylight, midnight wrap and clock labels passed');

const P=require('./assets/performance.js');
assert.equal(Object.keys(P.profiles).length,5);
assert.equal(P.recommend({mobile:true,memory:2,cores:8}),'battery');
assert.equal(P.recommend({mobile:true,memory:4,cores:8}),'low');
assert.equal(P.recommend({mobile:false,memory:16,cores:8}),'balanced');
let calls=0;const height=(x,z)=>Math.sin(x*.3)+Math.cos(z*.7)*.4;
const grid=P.grid((x,z)=>{calls++;return height(x,z)},0,0,10,10,10,10);
assert.equal(calls,121);
for(let i=0;i<10000;i++){let x=-5+(i*17%1000)/100,z=-5+(i*31%1000)/100,ix=Math.min(9,Math.floor(x+5))-5,iz=Math.min(9,Math.floor(z+5))-5,u=x-ix,v=z-iz,a=height(ix,iz),b=height(ix,iz+1),c=height(ix+1,iz+1),d=height(ix+1,iz),expected=u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);assert.ok(Math.abs(grid(x,z)-expected)<1e-10)}
assert.equal(calls,121);
let near={elapsed:0},far={elapsed:0},n=0,f=0,total=0;for(let i=0;i<600;i++){if(P.advance(near,1000/60,P.interval(2,0,true)))n++;const step=P.advance(far,1000/60,P.interval(30,2,false));if(step){f++;total+=step}}
assert.equal(n,600);assert.ok(f<70&&f>40);assert.ok(total>9800&&total<=10001);
const map=new Map([['a',1],['b',2],['c',3],['d',4]]),disposed=[];P.trim(map,2,new Set(['a','d']),v=>disposed.push(v));assert.equal(map.size,2);assert.ok(map.has('a')&&map.has('d'));assert.equal(disposed.length,2);
assert.ok(P.warnings({fps:15,frameP95ms:80,drawCalls:2000,textures:400}).length===4);
console.log('Performance regression: 10000 exact terrain queries, '+calls+' height evaluations at setup, near '+n+' vs far '+f+' animation updates, cache eviction and graphics profiles passed');

// Run: node test_graphics100.cjs
// Tests pure policy extracted from the shipped HTML, not a GPU benchmark.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const h=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
function extract(a,b){const start=h.indexOf(a),end=h.indexOf(b,start+1);assert(start>=0&&end>start);return h.slice(start,end)}
const {clarityStep100,resolution77,WW_PERF118,perfPreset118,perfWarning118}=require('./assets/game-policy.js');
let n=0;
let v=clarityStep100({tier:1,scale:1},7,140,45,true,false);assert.equal(v.tier,2);assert.equal(v.scale,1);n++;
v=clarityStep100(v,7,140,45,true,false);assert(v.scale<1);assert.equal(v.tier,2);n++;
v=clarityStep100({tier:1,scale:1},30,34,30,true,false);assert(v.good&&!v.slow);n++;
v=clarityStep100({tier:2,scale:.7},43,28,45,true,false);assert(v.scale>.7);assert.equal(v.tier,2);n++;
for(const w of [360,740,960,1920,3840])for(const h of [320,420,1080,2160])for(const dpr of [1,2,3,4])for(const q of [0,1,2])for(const scale of [.6,.82,1,1.35])for(const mobile of [true,false])for(const [fast,hd] of [[true,false],[false,false],[false,true]]){
 const r=resolution77(w,h,dpr,q,scale,fast,hd,4096,mobile);
 const budget=fast?700000:hd?3600000:mobile?[2200000,3000000,3800000][q]:[1800000,2600000,3600000][q];
 assert(Number.isFinite(r)&&r>0&&r<=dpr&&r*Math.max(w,h)<=4096+.001&&w*h*r*r<=budget+.01);n++;
}
for (const [w,h] of [[390,844],[844,390]]) {
  for (const scale of [.6,.75,.76,1]) {
    assert(resolution77(w,h,3,0,scale,false,false,4096,true)>=1);
    assert(resolution77(w,h,3,0,scale,false,true,4096,true)>=1.25);
  }
}
assert.equal(clarityStep100({tier:2,scale:1.34},45,25,45,true,false).scale,1.35);
let scripts=0;for(const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=/.test(m[1])||/type\s*=\s*["'](?:module|importmap|application\/ld\+json)/.test(m[1]))continue;new Function(m[2]);scripts++}
console.log(n+' policy cases and '+scripts+' inline scripts passed');

const q=s=>new URLSearchParams(s);
assert.equal(Object.keys(WW_PERF118).length,5);
assert.equal(perfPreset118(q(''),null,4,8,false),'low');
assert.equal(perfPreset118(q(''),null,8,4,true),'balanced');
assert.equal(perfPreset118(q(''),null,undefined,undefined,true),'balanced');
for(const k of Object.keys(WW_PERF118))assert.equal(perfPreset118(q('gfx='+k),'balanced',2,2,true),k);
assert.equal(perfPreset118(q('perf=1&hd=1'),'sharp',16,16,false),'battery');
assert.equal(perfPreset118(q('hd=1'),'low',4,4,true),'sharp');
assert.deepEqual(perfWarning118(20,65,60,.9),{framePressure:true,heapPressure:true});
assert.deepEqual(perfWarning118(30,34,30,null),{framePressure:false,heapPressure:false});
console.log('Five profiles, URL compatibility, device heuristics and pressure cases passed');

const P139=require('./assets/game-policy.js');
assert.equal(P139.mobileCap139('low',60),30);assert.equal(P139.mobileCap139('balanced',0),60);assert.equal(P139.mobileCap139('balanced',30),30);assert.equal(P139.mobileCap139('balanced',90),90);assert.equal(P139.mobileCap139('high',60),60);
for(const [w,h] of [[360,640],[390,844],[844,390],[873,392],[1280,720],[1920,1080]])for(const [preset,p] of Object.entries(P139.MOBILE_CLARITY171))for(const tier of [0,1,2])for(const scale of [.5,.75,1,1.25])for(const dpr of [1,3]){
 const r=P139.mobileResolution139(w,h,dpr,0,tier,scale,preset==='sharp',4096,preset);
 const floor=Math.min(p.floor,dpr,Math.sqrt(p.budget/(w*h)),4096/Math.max(w,h));assert.ok(r>=floor-1e-9&&w*h*r*r<=p.budget+.01&&r<=dpr);
 assert.equal(r,P139.mobileResolution139(w,h,dpr,0,0,scale,preset==='sharp',4096,preset));
}
for(const [preset,p] of Object.entries(P139.MOBILE_CLARITY171)){let bad={tier:1,quality:1,scale:1,slow:0,good:0};bad=P139.mobileStep139(bad,9,120,30,1,1,1,false,preset);assert.equal(bad.tier,2);assert.equal(bad.quality,0);for(let i=0;i<30;i++)bad=P139.mobileStep139(bad,9,120,30,1,1,1,false,preset);assert.equal(bad.scale,p.scaleFloor);for(let i=0;i<12;i++)bad=P139.mobileStep139(bad,30,34,30,1,1,1,false,preset);if(p.scaleFloor<.975)assert.ok(bad.scale>p.scaleFloor);else{assert.equal(bad.scale,p.scaleFloor);assert.equal(bad.tier,1);}}
const budget=P139.actorBudget139(true,2,0);assert.equal(budget.load,1);assert.equal(budget.npcCount,1);assert.ok(budget.peerCount>=1&&budget.peerRig<budget.peerRange);
console.log('V13.9 mobile render budgets, 60 FPS default with explicit 30/90 FPS options, fast degradation, slow recovery and visible actor policy passed');

const P140=require('./assets/game-policy.js');const map140=new Map([['a',1],['b',2],['c',3],['d',4]]),disposed140=[];
assert.equal(P140.trimModels140(map140,'a',2,v=>disposed140.push(v)),2);assert.deepEqual([...map140.keys()],['a','d']);assert.deepEqual(disposed140,[2,3]);assert.equal(P140.expiredModel140(0,19999),false);assert.equal(P140.expiredModel140(0,20000),true);assert.equal(P140.expiredModel140(undefined,30000),false);
console.log('V14.0 active-model preservation, eviction and inactivity grace passed');

const P141=require('./assets/game-policy.js');
for(const dt of [1000/60,1000/30,1000/20,1000/15,100,5000,NaN,-1]){let sum=0,n=P141.physicsSteps141(dt,d=>{assert.ok(d>0&&d<=25);sum+=d});assert.ok(n<=4);assert.ok(Math.abs(sum-P141.physicsDelta141(dt))<1e-9)}
let near=P141.angle141(Math.PI-.01,-Math.PI+.01,50);assert.ok(near>Math.PI-.01&&near<Math.PI+.01);
for(const hz of [60,30,20,15,10]){let j={prep:.2,height:0,velocity:0,land:0},peak=0,time=0,landed=false;while(time<2&&!landed){j=P141.jumpStep141(j,1000/hz,true);peak=Math.max(peak,j.height);time+=1/hz;landed=j.landed}assert.ok(landed&&peak>.70&&peak<.79&&time>.90&&time<1.08,JSON.stringify({hz,peak,time}));assert.equal(j.height,0);assert.equal(j.velocity,0)}
let camera141=P141.orbit141({},0,.3,1,16);P141.orbit141(camera141,1,.5,2,30);assert.ok(camera141.yaw>0&&camera141.yaw<1&&camera141.zoom>1&&camera141.zoom<2);
assert.equal(P141.orbit141(camera141,2,.5,2,30,true).yaw,2);
console.log('V14.1 bounded physics, jump timing at 10–60 FPS and camera angle wrapping passed');

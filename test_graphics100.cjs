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
assert.equal(perfPreset118(q(''),null,8,4,true),'low');
assert.equal(perfPreset118(q(''),null,undefined,undefined,true),'balanced');
for(const k of Object.keys(WW_PERF118))assert.equal(perfPreset118(q('gfx='+k),'balanced',2,2,true),k);
assert.equal(perfPreset118(q('perf=1&hd=1'),'sharp',16,16,false),'battery');
assert.equal(perfPreset118(q('hd=1'),'low',4,4,true),'sharp');
assert.deepEqual(perfWarning118(20,65,60,.9),{framePressure:true,heapPressure:true});
assert.deepEqual(perfWarning118(30,34,30,null),{framePressure:false,heapPressure:false});
console.log('Five profiles, URL compatibility, device heuristics and pressure cases passed');

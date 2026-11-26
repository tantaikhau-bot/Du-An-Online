// Run: node test_graphics100.cjs
// Tests pure policy extracted from the shipped HTML, not a GPU benchmark.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const h=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
function extract(a,b){const start=h.indexOf(a),end=h.indexOf(b,start+1);assert(start>=0&&end>start);return h.slice(start,end)}
const {clarityStep100,resolution77}=new Function(extract('function clarityStep100(','function openPerformance100(')+extract('function resolution77(','const gl74=')+'return {clarityStep100,resolution77}')();
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
let scripts=0;for(const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=/.test(m[1])||/type\s*=\s*["'](?:module|importmap|application\/ld\+json)/.test(m[1]))continue;new Function(m[2]);scripts++}
console.log(n+' policy cases and '+scripts+' inline scripts passed');

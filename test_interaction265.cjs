const assert=require('node:assert/strict');
const {environment265:E,groundTrack265:G,bankRipple265:B}=require('./assets/daylight.js');
for(const m of [false,true])for(const t of [0,1,2])for(const b of [false,true]){const q=E(m,t,b);assert(q.ripples>=0&&q.ripples<=4);assert(q.interval>=33);if(b||t===2){assert.equal(q.grass,false);assert.equal(q.ripples,0);}}
assert.equal(G(true,true,1,false),'snow');assert.equal(G(false,true,1,false),'sand');assert.equal(G(false,false,.38,false),'mud');assert.equal(G(false,false,.37,false),'');assert.equal(G(true,true,1,true),'');
for(let x=-125;x<=125;x++)for(let z=-4;z<=4;z+=.25){const r=B(x,z,0,[0,24,-24]);if(r){assert.equal(Math.abs(r.z),1.15);assert(Math.abs(x)<=119);assert(Math.abs(z)>=2.05&&Math.abs(z)<=3.4);assert([0,24,-24].every(b=>Math.abs(x-b)>=2.4));}}
assert.deepEqual(B(10,2.8,0,[0]),{x:10,z:1.15});assert.equal(B(10,0,0,[0]),null);assert.equal(B(NaN,2.8,0,[0]),null);
console.log('V26.5 interaction helper checks passed');

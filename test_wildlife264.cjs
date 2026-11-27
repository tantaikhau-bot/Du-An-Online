const assert=require('node:assert/strict');
const {wildlife264:W}=require('./assets/fantasy-creatures.js');
let count=0;
for(const k of ['rabbit','deer','fox','dragon'])for(let h=0;h<24;h+=.5)for(let w=0;w<6;w++)for(const n of [0,.25,.5,.9]){const r=W(k,h,w,n,99,true,'rest');assert(['rest','forage','drink','roam'].includes(r.mode));assert(Number.isFinite(r.speed)&&r.speed>=0&&r.speed<=3.2);assert(r.seconds>0);assert.deepEqual(r,W(k,h+24,w,n,99,true,'rest'));assert.notEqual(W(k,h,w,n,99,false,'rest').mode,'drink');count++;}
assert.equal(W('deer',12,5,.2,1,false,'rest').mode,'flee');
assert.equal(W('deer',12,0,.2,4,false,'flee').mode,'flee');
assert.notEqual(W('deer',12,0,.2,5,false,'flee').mode,'flee');
assert.equal(W('deer',8,0,.2,99,true,'rest').mode,'drink');
assert.equal(W('fox',12,0,.9,99,true,'rest').mode,'rest');
assert.equal(W('fox',23,0,.9,99,true,'rest').mode,'roam');
assert.equal(W('rabbit',23,0,.9,99,true,'rest').mode,'rest');
console.log('Wildlife decision checks:',count);

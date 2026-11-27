const assert=require('node:assert/strict');
const D=require('./assets/daylight.js');
const ids=['linh54','hai54','moc54','sao54'];
for(const id of ids){for(let h=0;h<24;h+=.25){const r=D.routine263(id,h);assert(['night','day','evening'].includes(r.anchor));assert(['rest','prepare','work','break','leisure'].includes(r.activity));assert(r.speed>=1&&r.speed<=1.25);assert.deepEqual(r,D.routine263(id,h+24));assert.deepEqual(r,D.routine263(id,h-24));}assert.equal(D.routine263(id,0).activity,'rest');assert.equal(D.routine263(id,10).activity,'work');}
assert.equal(D.routine263('hai54',5.25).activity,'prepare');assert.equal(D.routine263('sao54',5.25).activity,'rest');assert.equal(D.routine263('moc54',12).activity,'break');assert.equal(D.routine263('moc54',17).anchor,'evening');assert.equal(D.routine263('moc54',20).anchor,'night');assert.equal(D.routine263('unknown',NaN).activity,'break');
console.log('V26.3 NPC routine checks passed');

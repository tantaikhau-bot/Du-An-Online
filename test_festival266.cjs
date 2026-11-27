const assert=require('node:assert/strict');
const {festival266:F}=require('./assets/daylight.js');
for(let h=-48;h<=72;h+=.125){const v=F(h);assert.deepEqual(v,F(h+24));assert(v.glow>=0);assert(v.lanterns>=0&&v.lanterns<=4);assert(!v.active||v.gather);}
assert.equal(F(14.99).id,'quiet');assert.equal(F(15).id,'prepare');assert.equal(F(17).id,'dance');assert.equal(F(19).id,'lantern');assert.equal(F(22).id,'closing');assert.equal(F(23).id,'quiet');assert.equal(F(NaN).id,'quiet');assert.equal(F(24).id,'quiet');
console.log('V26.6 festival schedule checks passed');

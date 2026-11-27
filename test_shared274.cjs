const assert=require('node:assert/strict'),D=require('./assets/daylight.js');
let count=0;
for(let s=0;s<1200;s+=.5){const w=D.world274(s);assert(w.hour>=0&&w.hour<24);assert.equal(w.weather,D.weatherAt(s));assert.equal(w.festival,D.festival266(w.hour).id);for(const id of ['linh54','hai54','moc54','sao54'])for(const guest of [false,true]){const p=D.citizenPlan274(id,s,guest);assert.equal(p.anchor,guest&&D.festival266(w.hour).gather?'festival':D.routine263(id,w.hour).anchor);assert(p.elapsed>=0&&p.elapsed<=420);assert(['day','night','evening','festival'].includes(p.previous));count++}const a=D.wildlifeSlot274('deer-1',s);assert(a.progress>=0&&a.progress<=1);assert.deepEqual(a,D.wildlifeSlot274('deer-1',s));}
const path=[{x:0,z:0},{x:3,z:0},{x:3,z:4}];assert.equal(D.travel274(path,2,1.5).x,3);assert.equal(D.travel274(path,3,1.5).z,1.5);assert.equal(D.travel274(path,8,1.5).moving,false);assert.equal(D.travel274(path,8,1.5).z,4);
assert.equal(D.wildlifeSlot274('deer',12).progress,0);assert.equal(D.wildlifeSlot274('deer',4).progress,1);assert.equal(D.wildlifeSlot274('deer',10).progress,.5);
console.log('V27.4 schedule checks: '+count);

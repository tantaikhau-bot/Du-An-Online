const assert=require('node:assert/strict');
const {roster,preset,applyPreset,sources}=require('./assets/vrm-character.js');
assert.equal(roster.length,20);
assert.equal(new Set(roster.map(p=>p.id)).size,20);
for(const gender of ['male','female'])assert.equal(roster.filter(p=>p.gender===gender).length,10);
for(const p of roster){assert.ok(sources[p.source]);assert.equal(preset(p.id),p);}
assert.equal(preset('invalid','female').id,'f1');
assert.equal(preset('invalid','male').id,'m1');
class Color{constructor(x){this.x=x}copy(b){this.x=b.x;return this}multiply(b){this.x*=b.x;return this}}
const fake={baseScale:2,root:{scale:{setScalar(v){this.v=v}}},colors:[{material:{color:new Color(1)},base:new Color(1),role:'hair'}]};
applyPreset({Color},fake,preset('m3'));assert.equal(fake.applied,'m3');assert.equal(fake.root.scale.v,2.06);
applyPreset({Color},fake,preset('m1'));assert.equal(fake.colors[0].material.color.x,0xffffff);assert.equal(fake.root.scale.v,2);
console.log('Twenty presets, defaults and repeatable shared appearance passed');

assert.equal(new Set(roster.map(p=>p.source)).size,6);
assert.equal(preset('f3').source,'female4');assert.equal(preset('f4').source,'female3');

const {heightFactor}=require('./assets/vrm-character.js');for(const p of roster){assert.ok(Math.abs(heightFactor(p)-p.height*(p.gender==='female'?.92:1))<1e-9)}assert.ok(Math.max(...roster.filter(p=>p.gender==='female').map(heightFactor))<1);console.log('Female relative scale and preserved male sizes passed');

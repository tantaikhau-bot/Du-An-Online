const assert=require('node:assert/strict');
const {combatGrip312}=require('./assets/vrm-character.js');
for(const w of ['sword','great','dual','bow','staff'])for(const side of ['left','right'])for(const progress of [0,.25,.5,.75,1]){const target=combatGrip312(w,side,{kind:'strike',progress,impact:.45});if(target){assert.equal(Object.keys(target).length,15);for(const pair of Object.values(target))assert.ok(pair.every(x=>Number.isFinite(x)&&Math.abs(x)<=1.5));}if(w==='bow'&&side==='right')assert.equal(Boolean(target),progress<.45);}
assert.ok(combatGrip312('great','left',null));assert.equal(combatGrip312('sword','left',null),null);console.log('V31.2 grip profiles passed');

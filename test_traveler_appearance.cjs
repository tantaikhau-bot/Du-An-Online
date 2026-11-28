const assert=require('node:assert/strict'),V=require('./assets/vrm-character.js');
const original={roughness:.8,metalness:0,shadingToonyFactor:.9,outlineWidthFactor:.01,shadingShiftFactor:0};
function run(id,role){const m={...original,isMeshStandardMaterial:true};V.travelerFinish(m,original,role,id);return m;}
for(const p of V.roster.filter(p=>p.id!=='m1'))for(const role of ['skin','hair','cloth','eye','unknown'])assert.deepEqual(run(p.id,role),{...original,isMeshStandardMaterial:true});
for(const role of ['skin','hair','cloth']){const m=run('m1',role);assert(m.outlineWidthFactor<original.outlineWidthFactor);assert(m.shadingToonyFactor<original.shadingToonyFactor);assert(Number.isFinite(m.roughness));}
const m=run('m1','skin');V.travelerFinish(m,original,'skin','m2');assert.equal(m.shadingShiftFactor,original.shadingShiftFactor);
assert.deepEqual(run('m1','unknown'),{...original,isMeshStandardMaterial:true});
console.log('Traveler-only material policy checks passed; visual verification still required.');

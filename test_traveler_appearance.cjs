const assert=require('node:assert/strict'),V=require('./assets/vrm-character.js');
const original={roughness:.8,metalness:0,shadingToonyFactor:.9,outlineWidthFactor:.01,shadingShiftFactor:0};
function run(id,role){const m={...original,isMeshStandardMaterial:true};V.travelerFinish(m,original,role,id);return m;}
for(const p of V.roster.filter(p=>p.id!=='m1'))for(const role of ['skin','hair','cloth','eye','unknown'])assert.deepEqual(run(p.id,role),{...original,isMeshStandardMaterial:true});
for(const role of ['skin','hair','cloth']){const m=run('m1',role);assert(m.outlineWidthFactor<original.outlineWidthFactor);assert(m.shadingToonyFactor<original.shadingToonyFactor);assert(Number.isFinite(m.roughness));}
const m=run('m1','skin');V.travelerFinish(m,original,'skin','m2');assert.equal(m.shadingShiftFactor,original.shadingShiftFactor);
assert.deepEqual(run('m1','unknown'),{...original,isMeshStandardMaterial:true});
console.log('Traveler-only material policy checks passed; visual verification still required.');

const T=require('three');
for(let i=0;i<1000;i++){
 const x=(i%53-26)/100,y=(i%167)/100,z=.12,a=V.travelerSculptPoint(x,y,z,0,1.42),b=V.travelerSculptPoint(-x,y,z,0,1.42);
 assert(Math.abs(a[0]+b[0])<1e-9);assert.equal(a[1],y);assert.equal(a[2],z);assert(Math.abs(a[0]-x)<.04);
}
assert(V.travelerSculptPoint(.1,1.46,0,0,1.42)[0]>.1);
assert(V.travelerSculptPoint(.1,1.65,0,0,1.42)[0]<.1);
assert.equal(V.travelerSculptPoint(.1,0,0,0,1.42)[0],.1);
for(const relative of [true,false]){
 const original=new T.BufferGeometry();
 original.setAttribute('position',new T.Float32BufferAttribute([.10,1.46,0,-.10,1.46,0,.1,1.65,0],3));
 original.morphTargetsRelative=relative;
 original.morphAttributes.position=[new T.Float32BufferAttribute(relative?[.01,.01,0,0,0,0,0,0,0]:[.11,1.47,0,-.10,1.46,0,.1,1.65,0],3)];
 const mesh=new T.Mesh(original),record={mesh,original,matrix:new T.Matrix4(),back:new T.Matrix4()},a={travelerRest:{headX:0,headY:1.42,scale:1,records:[record]}};
 const before=Array.from(original.attributes.position.array);
 V.applyTravelerSculpt(T,a,'m1');assert.notEqual(mesh.geometry,original);
 const base=mesh.geometry.attributes.position,morph=mesh.geometry.morphAttributes.position[0];
 const expected=V.travelerSculptPoint(.11,1.47,0,0,1.42)[0];
 assert(Math.abs(morph.getX(0)+(relative?base.getX(0):0)-expected)<1e-6);
 assert.deepEqual(Array.from(original.attributes.position.array),before);
 V.applyTravelerSculpt(T,a,'m3');assert.equal(mesh.geometry,original);assert.equal(record.sculpted,null);
 V.applyTravelerSculpt(T,a,'m1');V.restoreTravelerSculpt(a);assert.equal(mesh.geometry,original);
}
console.log('Traveler sculpt symmetry, bounded shape, relative/absolute morph and preset restore checks passed.');

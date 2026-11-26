const assert=require('node:assert/strict'),T=require('three');
global.WWMotion=require('./assets/smooth-motion.js');
global.WWArms=require('./assets/arm-motion.js');
global.WWFootIK=require('./assets/foot-ik.js');
const O=require('./assets/original-avatar.js'),V=require('./assets/vrm-character.js');
assert.equal(Object.keys(O.designs).length,20);
assert.equal(new Set(Object.values(O.designs).map(d=>d.slice(0,7).join(','))).size,20);
for(const p of V.roster){
 const a=O.build(T,p);V.applyPreset(T,a,p);let skins=[],verts=0;
 a.root.traverse(o=>{if(o.isSkinnedMesh)skins.push(o)});
 assert.equal(skins.length,5,p.id);
 for(const o of skins){
  const w=o.geometry.attributes.skinWeight,ix=o.geometry.attributes.skinIndex;
  for(let i=0;i<w.count;i++){assert.ok(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1)<1e-5);assert.ok(ix.getX(i)<o.skeleton.bones.length&&ix.getY(i)<o.skeleton.bones.length)}
  verts+=w.count;
 }
 assert.ok(verts>300);
 for(let i=0;i<180;i++){
  let t=i/60,g=t<.5?0:t<1.3?.65:t<2?1:0,j=t>2&&t<2.25?{prep:.2}:t>=2.25&&t<2.55?{height:.3,velocity:1}:t>=2.55&&t<2.8?{land:.22}:{speed:g===1?3.8:g===.65?1.65:0};
  V.animate(a,1/60,g,'idle',j,0);
  assert.ok(a.poseCheck&&a.poseCheck.hip.every(Number.isFinite),p.id);
  for(const bone of skins[0].skeleton.bones)assert.ok(bone.matrixWorld.elements.every(Number.isFinite),p.id);
 }
 for(const o of skins){const v=new T.Vector3();o.getVertexPosition(0,v);assert.ok(v.toArray().every(Number.isFinite),p.id)}
 V.release(a);
}
console.log('20 original mesh profiles, 100 skinned surfaces, weight and animation checks passed');

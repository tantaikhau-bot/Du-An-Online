const assert=require('node:assert/strict'),T=require('three'),IK=require('./assets/foot-ik.js');
const A=new T.Vector3(0,1,0),B=new T.Vector3(0,.55,.15),C=new T.Vector3(0,.10,0),target=new T.Vector3(0,.16,0),forward=new T.Vector3(0,0,1);
const r=IK.solve(T,A,B,C,target,forward);
assert.ok(r.foot.distanceTo(target)<1e-6);assert.ok(r.knee.z>0);
assert.ok(Math.abs(A.distanceTo(r.knee)-A.distanceTo(B))<1e-6);
assert.ok(Math.abs(r.knee.distanceTo(r.foot)-B.distanceTo(C))<1e-6);
const root=new T.Group(),u=new T.Bone(),k=new T.Bone(),f=new T.Bone();root.add(u);u.position.copy(A);u.add(k);k.position.set(0,-.45,0);k.add(f);f.position.set(0,-.45,0);
k.rotation.x=.2;u.rotation.x=-.1;root.updateMatrixWorld(true);
const sole=f.getWorldPosition(new T.Vector3()).y;
const a={root,baseScale:1,legSign:1,motion:{cycle:0,run:0},soleHeight:{left:sole},vrm:{humanoid:{getNormalizedBoneNode:n=>({leftUpperLeg:u,leftLowerLeg:k,leftFoot:f})[n]}}};
const contact=IK.apply(T,a,()=>.025,.033,0,false,'idle');assert.equal(contact.planted,1);assert.ok(contact.maxCorrection<=.045);assert.equal(contact.mode,'vertical-only');
assert.equal(k.rotation.y,0);assert.equal(k.rotation.z,0);assert.ok(k.rotation.x>=0&&k.rotation.x<.26);
assert.equal(IK.apply(T,a,()=>0,.033,1,false,'idle'),null);assert.deepEqual(a.contacts,{});
IK.apply(T,a,()=>0,.033,0,false,'idle');root.rotation.y=1;assert.equal(IK.apply(T,a,()=>0,.033,0,false,'idle'),null);
assert.equal(IK.apply(T,a,()=>0,.033,0,true,'idle'),null);assert.deepEqual(a.contacts,{});
assert.equal(IK.apply(T,a,()=>0,.033,0,false,'ride'),null);
console.log('Stable knee plane, bounded hinge, fast-turn/run/jump lock release passed');

// Ground idle aligns the sole on flat terrain, including scaled parents, and releases for jumps.
const parent=new T.Group();parent.position.set(2,1,3);parent.scale.setScalar(1.2);const r2=new T.Group();parent.add(r2);const lf=new T.Bone(),rf=new T.Bone();lf.position.set(-.1,.14,0);rf.position.set(.1,.145,0);r2.add(lf,rf);const a2={root:r2,baseScale:1,soleHeight:{left:.08,right:.08},motion:{run:0},vrm:{humanoid:{getNormalizedBoneNode:n=>n==='leftFoot'?lf:n==='rightFoot'?rf:null}}};let out;
for(let i=0;i<80;i++){r2.position.y=0;out=IK.groundIdle(T,a2,()=>1,1/60,0,false,'idle')}
assert.equal(out.mode,'grounded-idle');assert.equal(out.planted,2);assert.ok(Math.abs(lf.getWorldPosition(new T.Vector3()).y-1.097)<.001);assert.ok(out.offset<0);r2.position.y=0;assert.equal(IK.groundIdle(T,a2,()=>1,1/60,0,true,'idle'),null);assert.equal(r2.position.y,0);
console.log('Grounded idle terrain alignment and jump release passed');

// V11.5.3: use actual shoe vertices rather than a guessed ankle offset.
const r3=new T.Group(),f3=new T.Bone(),f4=new T.Bone();r3.add(f3,f4);f3.position.set(-.12,.20,0);f4.position.set(.12,.20,0);
for(const foot of [f3,f4]){const shoe=new T.Mesh(new T.BoxGeometry(.10,.08,.20),new T.MeshBasicMaterial());shoe.position.y=-.12;foot.add(shoe);}
const a3={root:r3,baseScale:1,soleHeight:{left:.02,right:.02},motion:{run:0},vrm:{humanoid:{getNormalizedBoneNode:n=>n==='leftFoot'?f3:n==='rightFoot'?f4:null}}};IK.calibrateSoles(T,a3);assert.ok(a3.soleSamples.left.length>0&&a3.soleSamples.right.length>0);r3.position.y=.09;f3.rotation.x=.12;f4.rotation.x=.12;r3.updateMatrixWorld(true);let c3;for(let i=0;i<100;i++){r3.position.y=.09;c3=IK.groundIdle(T,a3,()=>.035,1/60,0,false,'idle')}assert.equal(c3.source,'mesh');assert.equal(c3.planted,2);assert.ok(c3.maxError<.004,JSON.stringify(c3));assert.ok(c3.offset<0);assert.equal(IK.groundIdle(T,a3,()=>.035,1/60,1,false,'idle'),null);console.log('Actual shoe vertices, raised road and jump/run release passed');

// V11.5.4: stationary sole offset must be exact at settled idle and release when airborne.
for(let i=0;i<90;i++){r3.position.y=.09;c3=IK.groundIdle(T,a3,()=>.035,1/60,0,false,'idle')}assert.ok(c3.maxError<.002);assert.equal(c3.planted,2);r3.position.y=.09;assert.equal(IK.groundIdle(T,a3,()=>.035,1/60,0,true,'idle'),null);

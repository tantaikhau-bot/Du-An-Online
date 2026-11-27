const assert=require('node:assert/strict'),T=require('three'),D=require('./assets/jade-dragon156.js');
const a=D.create(T),b=D.create(T);assert.equal(a.root.userData.source,D.SOURCE);assert.notEqual(a.root,b.root);
let verts=0,tri=0,meshes=0;a.root.traverse(o=>{if(!o.isMesh)return;meshes++;let g=o.geometry;assert.ok(g.attributes.position.array.every(Number.isFinite));assert.ok(g.attributes.normal.array.every(Number.isFinite));verts+=g.attributes.position.count;tri+=(g.index?g.index.count:g.attributes.position.count)/3});
assert.ok(meshes<60&&tri<50000&&verts>1000);assert.ok(a.root.getObjectByName('JadeWingL'));assert.ok(a.root.getObjectByName('JadeWingR'));assert.ok(a.root.getObjectByName('JadeTail4'));
const m=new T.AnimationMixer(a.root);m.clipAction(a.fly).play();let w=a.root.getObjectByName('JadeWingL'),v=w.rotation.z;m.update(.22);assert.ok(Math.abs(w.rotation.z-v)>.05);assert.equal(b.root.getObjectByName('JadeWingL').rotation.z,0);
a.root.updateMatrixWorld(true);let size=new T.Box3().setFromObject(a.root).getSize(new T.Vector3());assert.ok(size.x>1&&size.y>.4&&size.z>1);console.log({source:D.SOURCE,meshes,verts,tri,size:size.toArray()});

// Actual model forward is -Z, same as the pet follower convention.
for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0],[1,1]]){let yaw=0;for(let i=0;i<120;i++)yaw=D.steer(yaw,dx,dz,1000/60).yaw;const len=Math.hypot(dx,dz);assert.ok((-Math.sin(yaw)*dx-Math.cos(yaw)*dz)/len>.999,'forward axis');}
assert.equal(D.steer(.8,0,0,16).yaw,.8);assert.ok(Math.abs(D.steer(0,0,1,16).yaw)<=.073);assert.ok(!require('node:fs').readFileSync('index.html','utf8').includes('wrapper.rotation.y=Math.PI;root.traverse'));

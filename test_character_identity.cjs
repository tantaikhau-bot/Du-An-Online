const assert=require('node:assert/strict'),T=require('three');
const I=require('./assets/character-identity.js'),C=require('./assets/clip-motion.js'),V=require('./assets/vrm-character.js');
assert.equal(Object.keys(I.designs).length,20);
assert.equal(new Set(V.roster.map(p=>p.source)).size,8);
assert.equal(new Set(V.roster.filter(p=>p.gender==='female').map(p=>p.source)).size,6);
for(const p of V.roster)assert.ok(I.designs[p.id]&&V.sources[p.source]);
assert.equal(C.sampleCurve([{x:0},{x:1}],Math.PI/2).x,.5);
const root=new T.Group(),head=new T.Bone(),chest=new T.Bone(),hips=new T.Bone();
root.add(hips);hips.position.y=.8;hips.add(chest);chest.position.y=.35;chest.add(head);head.position.y=.35;
const a={root,baseScale:1,modelForward:new T.Vector3(0,0,1),vrm:{humanoid:{getRawBoneNode:n=>({head,chest,hips})[n]}}};
for(const p of V.roster){I.apply(T,a,p);assert.ok(a.identityMeshes.length>=2);assert.equal(a.identityType,I.designs[p.id][1]);for(const g of a.identityMeshes){assert.ok(g.parent?.isBone);g.updateWorldMatrix(true,true);assert.ok(g.matrixWorld.elements.every(Number.isFinite))}}
I.clear(a);assert.equal(a.identityMeshes.length,0);
console.log('Twenty identity designs, eight base sources, bone attachment and clip interpolation passed');

const assert=require('node:assert/strict'),T=require('three'),C=require('./assets/fantasy-creatures.js');
assert.equal(C.KINDS.length,5);
const sizes=[],results=[];
for(const kind of C.KINDS){
 const a=C.create(T,kind),b=C.create(T,kind);
 assert.ok(a.fantasy116&&a.paws.length===4&&a.knees.length===4&&a.eyes.length===2);
 assert.notEqual(a.head,b.head);
 let meshes=0,triangles=0,verts=0,firstA,firstB;
 a.root.traverse(o=>{if(!o.isMesh)return;firstA??=o;meshes++;const g=o.geometry,p=g.attributes.position;verts+=p.count;triangles+=g.index.count/3;assert.ok(p.array.every(Number.isFinite));assert.ok(g.attributes.normal.array.every(Number.isFinite));assert.ok(g.attributes.color.array.every(Number.isFinite));assert.ok(o.material.roughness>=.42);});
 b.root.traverse(o=>{if(o.isMesh)firstB??=o});
 assert.equal(firstA.geometry,firstB.geometry);assert.equal(firstA.material,firstB.material);
 assert.ok(meshes<45&&triangles<40000,kind+' '+meshes+' '+triangles);
 a.root.updateMatrixWorld(true);let box=new T.Box3().setFromObject(a.root,true),size=box.getSize(new T.Vector3());
 assert.ok(Math.abs(box.min.y)<.00001,kind+' floor '+box.min.y);
 assert.ok(size.y>.3&&size.y<1.65,kind+' '+size.y);sizes.push(size.toArray().map(v=>v.toFixed(3)).join(','));
 let head=a.head.quaternion.clone(),idleMovement=0,maxReact=0;
 for(let i=0;i<900;i++){let speed=i<240?0:i<480?1.1:i<720?3.5:0;if(i===750)C.react(a);C.animate(a,speed,1000/60,i/60);a.root.updateMatrixWorld(true);assert.ok(a.rig.position.y>=a.rig.userData.floor-1e-8);a.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));if(i<240)idleMovement=Math.max(idleMovement,head.angleTo(a.head.quaternion));if(i>750)maxReact=Math.max(maxReact,a.rig.position.y-a.rig.userData.floor);}
 assert.ok(idleMovement>.05);assert.ok(maxReact>.012);assert.equal(b.clock,0);
 results.push({kind,meshes,triangles,vertices:verts,height:size.y.toFixed(2)});
}
assert.equal(new Set(sizes).size,5);
console.log('Fantasy creatures: unique geometry, shared resources, grounded rest, idle/walk/run/reaction passed',JSON.stringify(results));

// V12.2 movement policy remains independent from visual GLB assets.
{
 const P=require('./assets/fantasy-creatures.js'),a=require('node:assert/strict');
 const free=()=>true,seg=()=>true;
 for(const kind of P.KINDS){
  const state=P.follower(),owner={x:0,z:0};let pos={x:-5,z:0};
  let max=0;
  for(let i=0;i<240;i++){let prev=pos;pos=P.followStep(state,kind,pos,owner,0,1/60,0,'follow',free,seg);max=Math.max(max,pos.speed);a.ok(Math.hypot(prev.x-pos.x,prev.z-pos.z)<.09);}
  a.ok(Math.hypot(pos.x-owner.x,pos.z-owner.z)<2);a.ok(max<=P.followProfiles[kind].run+.001);
  const wait=P.followStep(state,kind,pos,{x:8,z:8},0,.05,4,'wait',free,seg);a.equal(wait.x,pos.x);a.equal(wait.z,pos.z);a.equal(wait.speed,0);
  const blocked=P.followStep(state,kind,pos,{x:8,z:8},0,.05,4,'follow',free,()=>false);a.equal(blocked.mode,'blocked');a.equal(blocked.x,pos.x);
  a.equal(P.safeSpawn(kind,owner,0,()=>false),null);
  a.ok(P.safeSpawn(kind,owner,0,x=>x>0).x>0);
 }
 const s=P.follower(),p={x:0,z:0},owner={x:5,z:0};
 const detour=P.followStep(s,'fox',p,owner,0,.05,3,'follow',free,(_a,b)=>Math.abs(b.z)>.01);
 a.ok(Math.abs(detour.z)>.01&&detour.speed>0);
 console.log('V12.2 five pet profiles, acceleration, wait, obstacle detour and safe recall passed');
}

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

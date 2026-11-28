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

for(let i=0;i<1000;i++){
 const x=(i%41-20)/100,y=1.25+(i%51)/100,z=.1,p=V.travelerHairPoint(x,y,z,0,1.42);
 assert(p.every(Number.isFinite));assert(Math.abs(p[0]-x)<=.033);assert(Math.abs(p[1]-y)<=.010);assert.equal(p[2],z);
 if(y<=1.435)assert.deepEqual(p,[x,y,z]);
}
assert(V.travelerHairPoint(.1,1.65,.1,0,1.42)[0]>.1);
assert(V.travelerHairMesh({material:[{name:'Hair_01'},{name:'Hair_02'}]}));
assert(!V.travelerHairMesh({material:[{name:'Hair_01'},{name:'Face'}]}));
assert(!V.travelerHairMesh({material:null}));
for(const p of V.roster)for(const role of ['skin','hair','cloth','other'])assert.equal(!!V.travelerHairSpring(p.id,role),p.id==='m1'&&role==='hair');
const hairGeometry=new T.BufferGeometry();
hairGeometry.setAttribute('position',new T.Float32BufferAttribute([.1,1.65,.1,-.1,1.65,.1,0,1.60,.1],3));
const hairMesh=new T.Mesh(hairGeometry),hairRecord={mesh:hairMesh,original:hairGeometry,matrix:new T.Matrix4(),back:new T.Matrix4(),hair:true},hairAvatar={travelerRest:{headX:0,headY:1.42,scale:1,records:[hairRecord]}};
V.applyTravelerSculpt(T,hairAvatar,'m1');
const expectedHair=V.travelerHairPoint(...V.travelerSculptPoint(.1,1.65,.1,0,1.42),0,1.42);
assert(Math.abs(hairMesh.geometry.attributes.position.getX(0)-expectedHair[0])<1e-6);
assert.equal(hairAvatar.travelerSculpt.hairMeshes,1);
V.restoreTravelerSculpt(hairAvatar);assert.equal(hairMesh.geometry,hairGeometry);
console.log('Traveler V3 hair shape, isolation and spring checks passed');

const Identity=require('./assets/character-identity.js');
for(let r=0;r<=40;r++)for(let c=0;c<=40;c++){
 const v=r/40,u=c/20-1,p=Identity.travelerMantlePoint(u,v);
 const l=Identity.travelerLapels(-1,c/40,v),q=Identity.travelerLapels(1,c/40,v);
 assert([...p,...l,...q].every(Number.isFinite));
 assert(Math.abs(p[0])<=.27);assert(p[1]>=-.4);assert(p[1]<=0);
 assert(Math.abs(l[0]+q[0])<1e-10);assert.equal(l[1],q[1]);
}
function fakeAvatar(){
 const root=new T.Group(),chest=new T.Bone(),hips=new T.Bone(),head=new T.Bone();
 root.add(hips);hips.position.y=.85;hips.add(chest);chest.position.y=.35;chest.add(head);head.position.y=.23;
 const bones={hips,chest,head};
 return {root,baseScale:1,modelForward:new T.Vector3(0,0,1),vrm:{humanoid:{getRawBoneNode:n=>bones[n]}}};
}
const outfitAvatar=fakeAvatar();
Identity.apply(T,outfitAvatar,V.preset('m1'));
assert.equal(outfitAvatar.identityType,'traveler-mantle');assert.equal(outfitAvatar.identityMeshes.length,4);
assert.equal(outfitAvatar.identityMotion.length,1);assert(outfitAvatar.identityDetail342.additionalMeshes>=12);
const panel=outfitAvatar.identityMotion[0],restPanel=Array.from(panel.cloth.array);
Identity.animate(outfitAvatar,.5,1,{clothPitch:.4,clothRoll:.2,flutter:.2});
assert(panel.cloth.array.every(Number.isFinite));assert.notDeepEqual(Array.from(panel.cloth.array),restPanel);
const oldGroups=outfitAvatar.identityMeshes.slice();
Identity.apply(T,outfitAvatar,V.preset('m3'));
assert.equal(outfitAvatar.identityType,'scarf');assert(oldGroups.every(g=>g.parent===null));
Identity.clear(outfitAvatar);assert.equal(outfitAvatar.identityMeshes.length,0);
console.log('Traveler V4 garment surfaces, animation and cleanup checks passed');

for(const p of V.roster)for(const w of ['sword','great','dual','bow','staff'])assert.equal(V.travelerSwordEnabled(p.id,w),p.id==='m1'&&w==='sword');
const blade=V.travelerSection(V.travelerBladeRows);assert.equal(blade.positions.length,144);assert.equal(blade.indices.length,240);assert(blade.positions.every(Number.isFinite));assert(blade.indices.every(i=>i>=0&&i<48));
const vec=i=>new T.Vector3().fromArray(blade.positions,i*3);
for(let i=0;i<8;i++){const [a,b,c]=blade.indices.slice(i*6,i*6+3).map(vec);const n=b.clone().sub(a).cross(c.clone().sub(a));assert(n.dot(a.clone().setY(0))>0);}
const variant=V.buildTravelerSword(T),swordGroup=new T.Group(),sheathGroup=new T.Group(),stock=new T.Group(),stockSheath=new T.Group(),hidden=new T.Group();
hidden.visible=false;swordGroup.add(stock,hidden,variant.sword);sheathGroup.add(stockSheath,variant.sheath);
V.syncTravelerSword(swordGroup,sheathGroup,variant,true);assert(variant.sword.visible&&variant.sheath.visible&&!stock.visible&&!stockSheath.visible);
const lateGlb=new T.Group();swordGroup.add(lateGlb);V.syncTravelerSword(swordGroup,sheathGroup,variant,true);assert(!lateGlb.visible);
V.syncTravelerSword(swordGroup,sheathGroup,variant,false);assert(!variant.sword.visible&&!variant.sheath.visible&&stock.visible&&stockSheath.visible&&lateGlb.visible&&!hidden.visible);
assert(variant.sword.children.length<=8&&variant.sheath.children.length<=5);
const html=require('node:fs').readFileSync('index.html','utf8');assert(html.includes('WWVRM.buildTravelerSword(T)'));assert(html.includes('!child.userData.travelerVariant'));assert(html.includes('WWVRM.syncTravelerSword(c.weapons303.sword'));
console.log('Traveler V5 weapon mesh, visibility restoration and integration checks passed');

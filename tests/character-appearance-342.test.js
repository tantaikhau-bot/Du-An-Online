// V34.2 non-destructive appearance regression tests.
const assert=require('node:assert/strict'),a=require('../assets/vrm-character.js'),identity=require('../assets/character-identity.js');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
class Color{constructor(v=0xffffff){this.r=(v>>16&255)/255;this.g=(v>>8&255)/255;this.b=(v&255)/255}copy(v){Object.assign(this,v);return this}multiply(v){this.r*=v.r;this.g*=v.g;this.b*=v.b;return this}}
for(const [name,role] of Object.entries({"Face":"skin","Hair_01":"hair","EyeHighlight":"eye","EyeLash":"detail","Body_Shirt":"cloth","Mouth":"detail","unknown":"unknown","靴":"cloth"}))ok(a.materialRole342(name)===role,'material classification');
for(const p of a.roster)for(const role of ['skin','hair','cloth','eye','detail','unknown']){
 const mat={color:new Color(0xa0b0c0),isMeshStandardMaterial:true,roughness:.5,metalness:.15,shadingToonyFactor:.8,outlineWidthFactor:.01,map:{},transparent:true},record={material:mat,base:new Color(0xa0b0c0),role},map=mat.map;
 a.finishMaterial342({Color},record,p);const first=JSON.stringify(mat);
 for(let i=0;i<10;i++){a.finishMaterial342({Color},record,a.roster[(i+3)%20]);a.finishMaterial342({Color},record,p);ok(JSON.stringify(mat)===first,'non cumulative appearance');ok(mat.map===map&&mat.transparent,'authored texture and alpha');}
 if(['eye','detail','unknown'].includes(role))ok(JSON.stringify(mat.color)===JSON.stringify(record.base),'protected material');
}
for(const [id,d] of Object.entries(identity.designs)){const b=identity.badgeProfile342(d[1],Number(id.slice(1)));ok(b.radius>=.02&&b.radius<=.026&&b.sides>=6&&b.sides<=10&&b.metalness<=.5,'bounded accessory');}
let g=0,mat=0;const geometry={dispose(){g++}},material={dispose(){mat++}},group=()=>({removeFromParent(){},traverse(cb){cb({isMesh:true,geometry,material})}});const avatar={identityMeshes:[group(),group()],identityMaterials342:[material]};identity.clear(avatar);ok(g===1&&mat===1&&avatar.identityMeshes.length===0,'deduplicated disposal');
console.log('V34.2 appearance checks passed: '+checks);

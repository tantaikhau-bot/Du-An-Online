const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),a=html.indexOf('function removePeer49('),b=html.indexOf('const bubbleMeshes69=',a);
assert(a>=0&&b>a);let released=0,removed=0,pet=0,vehicle=0,materials=0,tag=0,geo=0,bubbles=0;
const c={WWVRM:{release(){released++}},scene:{remove(){removed++}},disposeRigged117(q){assert(q.removed122);pet++},syncVehicle88(v,k){assert.equal(k,'');vehicle++},clearBubble69(){bubbles++},anime:{headGeometry:{}}};
vm.createContext(c);vm.runInContext(html.slice(a,b),c);
const v={avatar109:{},pet70:{root:{}},p:{remove(){}},sprite109:{material:{map:{dispose(){}},dispose(){}}},materials:[{dispose(){materials++}}],rig:{traverse(fn){fn({isMesh:true,geometry:{type:'LatheGeometry',dispose(){geo++}}})}},tag:{material:{map:{dispose(){}},dispose(){tag++}}}};
c.removePeer49(v);c.removePeer49(v);assert(v.removed109);assert.equal(v.avatar109,null);assert.equal(v.pet70,null);assert.equal(v.sprite109,null);assert.deepEqual([released,removed,pet,vehicle,materials,tag,geo,bubbles],[1,2,1,1,1,1,1,1]);console.log('V35.0.7 peer cleanup is idempotent');

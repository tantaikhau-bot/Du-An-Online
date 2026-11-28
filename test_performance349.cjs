// Exercise the actual hot-path functions from the release, without WebGL.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
function section(start,end){const i=html.indexOf(start),j=html.indexOf(end,i+start.length);assert(i>=0&&j>i);return html.slice(i,j)}
const rocks=[{i:0,on:false,model:{position:{x:2,z:0}},original:'a'},{i:1,on:false,model:{position:{x:3,z:0}},original:'b'},{i:2,on:false,model:{position:{x:40,z:0}},original:'c'}];
let uploads=0,writes=0;const rockContext={effectTier100:0,drawTier305:0,params71:new URLSearchParams(),forestCells71:new Map(),natureRock209:rocks,mobile71:true,zeroNature209:'zero',report59:{nature203:{}},rockInstances45:{setMatrixAt(){writes++},instanceMatrix:{set needsUpdate(v){if(v)uploads++}}}};
vm.createContext(rockContext);vm.runInContext(section('function natureBudget209(','function grassLOD55('),rockContext);
rockContext.natureBudget209(0,0);assert.equal(writes,2);assert.equal(uploads,1);
rockContext.natureBudget209(0,0);assert.equal(writes,2);assert.equal(uploads,1);
rockContext.params71.set('nature','old');rockContext.natureBudget209(0,0);assert.equal(writes,4);assert.equal(uploads,2);assert(rocks.every(q=>!q.on));
let meshes=0,rosterChecks=0;
const peerContext={reducedFX297:{matches:false},onlineUser:{id:'me'},publicWorld68:()=>true,fxOwner298:'me',fxReceived298:1000,incomingFX298:[],remotePlayers:{some(fn){rosterChecks++;return fn({id:'other',stale276:false})}},saveToWorld:e=>({x:e.x,z:e.y}),effectTier100:0,drawTier305:0,fxBudget297:{tier:0},mobile71:true,visibleGround1153:()=>0,scene:{add(){meshes++}},T:{TorusGeometry:class{},MeshBasicMaterial:class{constructor(){this.color={setHex(){}}}},Mesh:class{constructor(g,m){this.material=m;this.position={set(){}};this.rotation={set(){}};this.scale={setScalar(){}}}}}};
vm.createContext(peerContext);vm.runInContext(section('const peerFX298=','// V33.6: three bounded local monster tactics')+'\nthis.state=peerFX298;',peerContext);
peerContext.tickPeerFX298(0,0,1000);assert.equal(meshes,0);assert.equal(peerContext.state.pool,null);
peerContext.incomingFX298=[{seq:'1',uid:'other',kind:'strike',x:1,y:1,heading:0}];
peerContext.tickPeerFX298(0,0,1001);assert.equal(meshes,6);assert.equal(rosterChecks,1);
for(let i=0;i<100;i++)peerContext.tickPeerFX298(0,0,1010+i);
assert.equal(rosterChecks,1);assert.equal(meshes,6);assert.equal(peerContext.state.seen.size,1);
peerContext.tickPeerFX298(0,0,2000);assert(peerContext.state.pool.every(o=>!o.visible));
peerContext.tickPeerFX298(0,0,7000);assert.equal(peerContext.state.seen.size,0);
assert(html.includes('customLook88(s,frameLook349)')&&html.includes('applyLook52(s,frameLook349)')&&html.includes('updateVRM104(dt,gait42,mode61,frameLook349.body)'));
assert(html.includes('const ground349=height(q.x,q.z)')&&html.includes('q.y<ground349+2.6'));
console.log('V34.9 performance regression: batched matrix dirty flag, idle lazy allocation, repeated event deduplication and frame reuse passed');

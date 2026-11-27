/* Offline regression checks. Run: node test_engine235.cjs */
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const policy=require('./assets/game-policy.js');
const check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
function extract(start,end){const i=html.indexOf(start),j=html.indexOf(end,i+start.length);if(i<0||j<0)throw Error('Missing '+start);return html.slice(i,j)}
async function main(){
 let scripts=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(/src=|importmap|type=["']module/.test(m[1])||!m[2].trim())continue;new Function(m[2]);scripts++}
 check(scripts>=16,'inline JavaScript syntax');
 new Function(fs.readFileSync('assets/vrm-character.js','utf8'));check(true,'VRM module syntax');
 const {physicsDelta141,physicsSteps141,mobileStep139,mobileResolution139,trimModels140}=policy;
 let total=0;check(physicsDelta141(900)===100&&physicsSteps141(900,dt=>total+=dt)===4&&total===100,'bounded simulation catch-up');
 let q=mobileStep139({tier:0,quality:2,scale:1,slow:0,good:0},15,110,60,2,0,1,false,'balanced');check(q.tier===2&&q.quality===0&&q.changed,'mobile severe load fallback');
 let r=mobileResolution139(1000,1000,3,1,2,1,false,4096,'balanced');check(r>0&&r*r*1000000<=1100000.01,'mobile pixel budget');
 let disposed=[];let cache=new Map([['a',1],['b',2],['c',3]]);trimModels140(cache,'a',2,v=>disposed.push(v));check(cache.has('a')&&cache.size===2&&disposed[0]===2,'model LRU preserves selected avatar');
 const chat=extract('function receiveNear69(rows)','function publicWorld68()');
 const api=new Function('let nearArrival69=new Map(),nearBySender231=new Map(),nearMessages69=[],nearMuted69=false,now=1000;const Date={now:()=>now};const publicWorld68=()=>true;'+chat+';return {receiveNear69,activeBubble69,time:v=>now=v,mute:v=>nearMuted69=v}')();
 const msg=(id,sender)=>({id,sender,body:'hello',name:'test'});api.receiveNear69([msg(1,'a'),msg(2,'b'),msg(3,'a')]);check(api.activeBubble69('a').id===3&&api.activeBubble69('b').id===2,'nearby chat sender index');api.time(10000);check(api.activeBubble69('a')===null,'nearby chat expiry');api.receiveNear69([msg(4,'a')]);api.mute(true);check(api.activeBubble69('a')===null,'nearby chat mute');
 const visual=extract('function visualTick230(now,t,x,z)','function frame(now)');
 const fx=new Function('let mobile71=true,effectTier100=2,visualLast230=-Infinity,visualX230=Infinity,visualZ230=Infinity,visualTier230=-1,calls=0,report59={};const wishTick170=()=>calls++,fountainTick172=()=>{},blossomTick173=()=>{},dreamTick175=()=>{},magicTick177=()=>{},desertTick179=()=>{};'+visual+';return {visualTick230,count:()=>calls,tier:v=>effectTier100=v}')();
 fx.visualTick230(100,1,0,0);fx.visualTick230(120,1,0,0);check(fx.count()===1,'mobile decorative effects throttle');fx.visualTick230(121,1,2,0);fx.tier(1);fx.visualTick230(122,1,2,0);check(fx.count()===3,'movement and quality changes bypass throttle');
 const forest=extract('function forestRender212(x,z)','function natureBudget209');
 const f=new Function('let quality=1,effectTier100=0,detailPressure212=1,mobile71=false,report59={},forestQueue212=[];const camera={updateMatrixWorld(){}},forestView212={multiplyMatrices(){}},forestFrustum212={setFromProjectionMatrix(){},intersectsBox:()=>true},params71={get:()=>null};const cell={x:0,z:0,model210:{},high212:{},group:{visible:true},lowTriangles212:100,highTriangles212:200};const forestCells71=new Map([[1,cell]]);'+forest+';return {forestRender212,cell,report59,q:v=>quality=v}')();
 f.forestRender212(0,0);check(f.cell.model210.visible&&!f.cell.high212.visible&&f.report59.forestBudget212.highCandidates===0,'forest skips high LOD on medium');f.q(2);f.forestRender212(0,0);check(!f.cell.model210.visible&&f.cell.high212.visible,'forest high LOD within budget');
 const loader=extract('async function fetchModel234(url,loader)','function loadSpirit161(kind)');
 const glb=new ArrayBuffer(20);const dv=new DataView(glb);dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,20,true);
 let raw=glb,declared=20,parsed=0,aborted=false;
 const mocks={fetch:async()=>({ok:true,headers:{get:()=>String(declared)},body:{getReader(){let done=false;return {read:async()=>done?{done:true}:(done=true,{done:false,value:new Uint8Array(raw)}),releaseLock(){}}}}}),AbortController:class{constructor(){this.signal={}}abort(){aborted=true}},setTimeout:()=>1,clearTimeout:()=>{},location:{href:'https://example.test/play'},URL:class{constructor(){this.href='https://example.test/assets/'}}};
 const load=new Function(...Object.keys(mocks),loader+';return fetchModel234')(...Object.values(mocks));const parser={parseAsync:async()=>++parsed};
 await load('/assets/a.glb',parser);check(parsed===1,'valid GLB header reaches parser');
 raw=new ArrayBuffer(20);let failed=false;try{await load('/assets/a.glb',parser)}catch{failed=true}check(failed&&parsed===1,'invalid GLB rejected before parser');
 declared=41*1024*1024;failed=false;try{await load('/assets/a.glb',parser)}catch{failed=true}check(failed,'oversize Content-Length rejected');
 declared=0;raw=new ArrayBuffer(40*1024*1024+1);failed=false;try{await load('/assets/a.glb',parser)}catch{failed=true}check(failed&&aborted,'oversize streamed model aborted');
}
main().catch(e=>{console.error(e);process.exitCode=1});

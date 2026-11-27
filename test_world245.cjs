/* Run from repository root: node test_world245.cjs */
const fs=require('node:fs'),html=fs.readFileSync('index.html','utf8'),policy=require('./assets/game-policy.js');
const extract=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);if(i<0||j<0)throw Error('Missing '+a);return html.slice(i,j)};
const api=new Function(extract('function terrainVertex244(','function makeTerrainTile162(')+extract('function gridHeight1153(','function visibleGround1153(')+extract('function terrainPlan241(','function terrainStream241(')+extract('function architecturePlan242(','function architectureStream242(')+extract('function forestPlan240(','function forestStreamTick240(')+extract('function preloadLead243(','let streamFrame243=')+';return {terrainVertex244,gridHeight1153,terrainPlan241,architecturePlan242,forestPlan240,preloadLead243,streamBudget243}')();
const check=(v,m)=>{if(!v)throw Error(m);console.log('PASS '+m)};
const sample=(x,z)=>Math.sin(x*.17)*2+Math.cos(z*.38)*1.1+x*z*.001;
let samples=0,maxError=0;
for(const density of [1,1.5]){
 const tiles=policy.terrainTiles162(density);
 for(const q of tiles)for(const r of tiles){
  const horizontal=Math.abs(q.cx+q.w/2-(r.cx-r.w/2))<1e-8&&q.cz===r.cz,vertical=Math.abs(q.cz+q.d/2-(r.cz-r.d/2))<1e-8&&q.cx===r.cx;
  if(!horizontal&&!vertical)continue;
  for(let i=0;i<=128;i++){
   const x=horizontal?q.cx+q.w/2:q.cx-q.w/2+q.w*i/128,z=vertical?q.cz+q.d/2:q.cz-q.d/2+q.d*i/128;
   const hi=api.gridHeight1153(x,z,q.cx,q.cz,q.w,q.d,q.nx,q.nz,(a,b)=>api.terrainVertex244(q,a,b,q.nx,q.nz,sample)),lo=api.gridHeight1153(x,z,r.cx,r.cz,r.w,r.d,Math.ceil(r.w/2),Math.ceil(r.d/2),sample);
   maxError=Math.max(maxError,Math.abs(hi-lo));samples++;
  }
 }
}
check(samples>0&&maxError<1e-9,'all terrain shared edges: '+samples+' samples, max delta '+maxError);
for(const mobile of [true,false]){
 const tiles=policy.terrainTiles162(mobile?1:1.5),forest=[],houses=[];
 for(let x=-108;x<=108;x+=24)for(let z=-120;z<=120;z+=24)forest.push({x,z,model210:null});
 for(let i=0;i<12;i++)houses.push({x:(i%4)*15-22,z:Math.floor(i/4)*18-18,model:null});
 let peak=0,builds=0,evictions=0,prior=null;
 for(let i=0;i<900;i++){
  const t=i/38,x=Math.sin(t)*116,z=Math.cos(t*.63)*130,dx=prior?x-prior.x:0,dz=prior?z-prior.z:0;prior={x,z};
  const tier=i%270<90?0:i%270<180?1:2,quality=2-tier,max=mobile?(tier===2?10:18):32;
  const budget=api.streamBudget243(mobile,i,tier===2),lead=api.preloadLead243(dx,dz,16.67,mobile);
  const tp=api.terrainPlan241(tiles,x,z,x,z,mobile?36:78,max,dx,dz,lead),fp=api.forestPlan240(forest,x,z,mobile,tier,quality,dx,dz,lead),ap=api.architecturePlan242(houses,x,z,mobile,tier,quality,dx,dz,false,lead);
  for(const [p,field] of [[tp,'mesh'],[fp,'model210'],[ap,'model']])for(const q of p.drop){q[field]=null;evictions++}
  for(const q of tp.missing.slice(0,mobile?1:2)){if(budget.take('terrain',q===tp.current)){q.mesh={};builds++}}
  for(const q of fp.build){if(budget.take('forest')){q.model210={};builds++}}
  for(const q of ap.missing.slice(0,mobile?1:2)){if(budget.take('architecture')){q.model={};builds++}}
  if(tiles.filter(q=>q.mesh).length>max||forest.filter(q=>q.model210).length>fp.max||houses.filter(q=>q.model).length>ap.max)throw Error('resident cap at '+i);
  if(tp.current&&!tp.current.mesh)throw Error('missing current tile at '+i);
  if(budget.used>(mobile||tier===2?1:3))throw Error('build budget at '+i);
  peak=Math.max(peak,budget.used);
 }
 check(builds>0&&evictions>0,(mobile?'mobile':'desktop')+' 900 moving frames, changing tiers; peak attempts '+peak+', builds '+builds+', evictions '+evictions);
}
const dropCode=extract('function dropForestHigh245(','function dropForestCell240(');
const drop=new Function(dropCode+';return dropForestHigh245')();
let removed=0,disposed=0,shared=0;const cell={high212:{removeFromParent(){removed++},traverse(fn){fn({isInstancedMesh:true,dispose(){disposed++},geometry:{dispose(){shared++}}})}},highTriangles212:100,near212:true,model210:{}};
drop(cell);drop(cell);check(removed===1&&disposed===1&&shared===0&&cell.high212===null&&cell.model210&&cell.highTriangles212===0,'high LOD releases only instance buffers, idempotent');
check(api.architecturePlan242([{x:0,z:0,model:{}}],0,0,true,2,0,0,0,true).drop.length===1,'legacy architecture fallback selection');
console.log('World streaming regression suite passed');

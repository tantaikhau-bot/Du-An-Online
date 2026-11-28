const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),p=require('./assets/game-policy.js');
const html=fs.readFileSync('index.html','utf8');
function extract(name){const line=html.split('\n').find(x=>x.startsWith('function '+name+'('));assert(line);return line;}
let visits=0;const ctx={insideWorld137:p.insideWorld137,heavenFloor190:p.heavenFloor190,staticObstacles:[],walkable4:(x,z)=>{visits++;return p.insideWorld137(x,z)&&!(x>.9&&x<1.1&&Math.abs(z)<.5)}};
vm.createContext(ctx);vm.runInContext(extract('segment4')+'\n'+extract('nearestWalk4'),ctx);
for(const a of [null,{}, {x:NaN,z:0},{x:Infinity,z:0},{x:1e12,z:0}]){visits=0;assert.equal(ctx.segment4(a,{x:0,z:0}),false);assert.equal(ctx.segment4({x:0,z:0},a),false);assert.equal(ctx.nearestWalk4(a),null);assert.equal(visits,0);}
assert(ctx.segment4({x:0,z:0},{x:0,z:2}));assert(!ctx.segment4({x:0,z:0},{x:2,z:0}));const near=ctx.nearestWalk4({x:1,z:0});assert(near&&ctx.walkable4(near.x,near.z));
for(const [id,q] of Object.entries(p.APPROACH3511)){const f=p.FORTRESS3510[id];for(let i=0;i<=40;i++){let z=q.start+(q.end-q.start)*i/40;for(const dx of [-q.width/2,0,q.width/2]){assert(p.approachClear3511(q,f,q.x+dx,z),id+' '+z);if(id==='sky')assert(p.heavenFloor190(q.x+dx,z,.3));}}}
assert(html.includes('if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;cancelRoute72()'));assert(html.includes('heldDirections.clear();if(!b)return false;if(segment4(a,b))'));
console.log('World route finite guards, blocked segment, nearest recovery and 369 fortress approach samples passed');
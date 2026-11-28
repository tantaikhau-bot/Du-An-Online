// Run: node tests/combat-stability-333.cjs
// Source-level regression, no browser or WebGL required.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function extract(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j);}
let scripts=0;
for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(!m[2].trim())continue;
 if(m[1].includes('importmap'))JSON.parse(m[2]);else new Function(m[2]);
 scripts++;
}
const code=extract('function defense322(','function defenseFeedback322(')+extract('function clearCombatTransient333(','function incoming322(')+extract('function attackCombat290(','function combatPose291(');
const factory=new Function('performance',`
let combat290,player={x:490,y:575},target,waypoints,heading=0,jumpHeight42=0,jumpVelocity42=0,jumpPrepAnime=0,equipped303='sword',kit304=['sword',[0,1,4]],kitId304='m1',weapons303={sword:{mult:1}},onlineUser=false,fxSeq298=0;
const refreshKit304=()=>{},combatAvailable292=()=>true,ability303=k=>({range:3,duration:400,hit:150,damage:20,cd:400,name:k}),saveToWorld=()=>({x:0,z:0}),targets295=()=>[{x:0,z:-1,hp:60}],validTarget294=()=>false,targetDistance295=()=>1,segment4=()=>true,inputCombat328=()=>null,comboStep304=()=>({duration:400,hit:150,damage:20}),cancelRoute72=()=>{},cue142=()=>{},defenseFeedback322=()=>{};
${code};
return {reset(){combat290={enabled:true,hp:100,energy:100,cd:{},combo:0,lastCombo:0,mobs:[{attack301:{},evadeUntil330:5}],boss:{attack:{},follow330:true}};target={x:1,y:1};waypoints=[1];jumpHeight42=0;return combat290;},attack:attackCombat290,clear:clearCombatTransient333,react:reaction329,recover:recover329,defense:defense322,getTarget:()=>target,air(h){jumpHeight42=h;}};
`);
const f=factory({now:()=>1000});
let c=f.reset();f.attack();assert.equal(c.move.target.hp,60);assert.equal(f.getTarget().x,490);
c.guardCd322=1400;f.clear(c);assert.equal(c.move,null);assert.equal(c.mobs[0].attack301,null);assert.equal(c.boss.follow330,false);assert.equal(c.airIndex323,-1);assert.equal(c.guardCd322,1400);
c=f.reset();c.airIndex323=2;c.airUntil323=900;f.air(.5);f.attack();assert.equal(c.move,undefined);f.air(0);f.attack();assert(c.move);
let states=0,defenses=0;
for(const side of [-1,1])for(let t=0;t<=2000;t+=25){c=f.reset();c.reaction329={kind:'down',start:0,end:650,side};const v=f.react(c,t);assert(v.progress>=0&&v.progress<=1);f.recover(c,t);assert.equal(f.react(c,t).kind,'recover');assert.equal(f.react(c,t+801),null);states++;}
for(const inside of [false,true])for(const originInside of [false,true])for(const facing of [-1,1])for(let t=-50;t<=700;t+=10){const q=f.defense({damage:28,hitTime:t,guardStart:0,guardEnd:600,dodgeStart:100,dodgeEnd:480,inside,originInside,facing});assert(q.damage>=0&&q.damage<=28);if(!inside)assert.equal(q.damage,0);defenses++;}
console.log(JSON.stringify({scripts,states,defenses,targetAndAerialChecks:4,guardCooldown:true}));

const assert=require('node:assert/strict');
const P=require('./assets/game-policy.js'),V=require('./assets/vrm-character.js');
function cast(extra={}){return {move:{kind:'strike',start:100,impact:240,end:450,...extra},cd:{strike:495},lastCombo:100,buffer310:0}}
let c=cast();assert.equal(P.firstStrikeFrame352(c,130),0);assert.equal(c.move.start,100);
c=cast();assert.equal(P.firstStrikeFrame352(c,800),700);assert.equal(c.move.start,800);assert.equal(c.move.impact,940);assert.equal(c.move.end,1150);assert.equal(c.cd.strike,1195);assert.equal(c.lastCombo,800);assert.equal(P.firstStrikeFrame352(c,900),0);
assert.equal(P.combatTiming340(c.move,800).cancel,false);assert.equal(P.combatTiming340(c.move,940).hit,true);
for(const extra of [{kind:'dodge'},{airborne:true},{air323:1},{counter322:true},{hit:true}]){c=cast(extra);assert.equal(P.firstStrikeFrame352(c,800),0);assert.equal(c.move.start,100)}
c=cast();assert.equal(P.firstStrikeFrame352(c,2000),0);assert.equal(P.combatTiming340(c.move,2000).cancel,true);
for(const gender of ['m','f'])for(let n=1;n<=10;n++)for(const t of [0,1,2,10,NaN]){const id=gender+n;const z=V.idleStance352(0,id,t);assert(z.spread===0&&z.toe===0&&Math.abs(z.lead)===0);const v=V.idleStance352(1,id,t);assert(v.spread>0&&v.spread<=.055&&Math.abs(v.lead)<=.018&&v.toe<=.035)}
console.log('V35.0.2 bounded first-frame timing and all 20 idle stance profiles passed');

for(const weapon of ['sword','great','dual','bow','staff']){
 const f=(p,c=false,q=false)=>V.comboEnvelope353(weapon,p,c,q);
 assert.equal(f(0),0);assert.equal(f(1),0);assert.equal(f(.5),1);
 assert.equal(f(1,false,true),f(0,true,false));
 for(let i=0;i<=100;i++){const p=i/100;for(const chain of [false,true])for(const queue of [false,true]){const v=f(p,chain,queue);assert(Number.isFinite(v)&&v>=0&&v<=1);if(i)assert(Math.abs(v-f(p-.01,chain,queue))<.25)}}
}
assert(V.comboEnvelope353('great',.05)<V.comboEnvelope353('dual',.05));
console.log('V35.0.3 five weapon envelopes and queued combo continuity passed');

for(const kind of ['stone','roof','path']){
 const args=[.5,.6,.4,.7],out={};let prev=P.masonryRelief354(kind,0,...args,out).height;
 for(let i=1;i<=500;i++){const x=P.masonryRelief354(kind,i/1000,...args,out);assert.equal(x,out);assert(x.height>=prev-1e-9&&x.height<=1&&x.light>=.65&&x.light<=1.1);assert(x.height-prev<.05);prev=x.height;}
 assert(prev>.55);
 const invalid=P.masonryRelief354(kind,NaN,NaN,NaN,NaN,NaN);assert(Number.isFinite(invalid.height)&&Number.isFinite(invalid.light));
}
console.log('V35.0.4 bounded continuous masonry relief for stone, roof and path passed');

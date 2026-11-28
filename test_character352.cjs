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

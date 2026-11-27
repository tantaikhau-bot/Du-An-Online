const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
const source=[{id:'a',moving:true,gait109:1,jump:.5,action:'hug',pair275:true,x:490,y:575}];
let n=0;
for(let age=0;age<=12000;age+=100)for(const shared of [false,true])for(const same of [false,true]){const r=R.recovery276(source,10000,10000+age,shared,same);assert.equal(r.length,shared&&same&&age<8000?1:0);if(r.length){assert.equal(r[0].moving,false);assert.equal(r[0].gait109,0);assert.equal(r[0].jump,0);assert.equal(r[0].action,'idle');assert.equal(r[0].pair275,false);assert.equal(r[0].stale276,true);}n++}
assert.equal(source[0].moving,true);assert.equal(R.recovery276(source,0,100,true,true).length,0);assert.equal(R.recovery276(source,1000,900,true,true).length,0);
for(const ticket of [1,2])for(const current of [1,2])for(const uid of ['a','b'])for(const currentUid of ['a','b',null])for(const visible of [false,true])for(const shared of [false,true]){assert.equal(R.accept276(ticket,current,uid,currentUid,visible,shared),ticket===current&&uid===currentUid&&visible&&shared);n++}
for(let f=1;f<=6;f++)for(const retry of [undefined,0,1,10,120])for(const random of [0,.5,1]){const d=R.retry276(f,retry,random);assert(d>=R.retryDelay(f,random)&&d<=60000);n++}
assert.equal(R.retry276(1,120),60000);
console.log('V27.6 recovery checks: '+n);

const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
const base={id:'a',area:0,x:490,y:575,sample_ms:10000,body:'female'};
const row=(id,x,extra={})=>({...base,id,x,...extra});
const raw=[base,row('a',525,{sample_ms:10001}),row('self',490),row('private',490,{area:2}),row('bad',NaN),row('old',490,{sample_ms:1}),row('future',490,{sample_ms:40000}),row('b',560,{heading:Infinity,jump:99,body:'invalid',moving:true,gait109:9,avatar109:'bad'})];
const out=R.roster270(raw,'self',15000,100,30);
assert.equal(out.length,2);assert.equal(out[0].x,525);assert.equal(out[1].heading,0);assert.equal(out[1].jump,2);assert.equal(out[1].gait109,1);assert.equal(out[1].avatar109,'m1');
assert.equal(R.roster270(null,'self',15000,100,30),null);
assert.deepEqual(R.selectPeers270(out,0,0,10,1,new Set()).map(r=>r.id),['a']);
assert.deepEqual(R.selectPeers270(out,0,0,10,1,new Set(['b'])).map(r=>r.id),['b']);
assert.equal(R.selectPeers270(out,0,0,.1,2,new Set()).length,0);
for(let i=0;i<100;i++){let r=R.roster270([row('x',490+i*35,{sample_ms:10000+i})],'self',15000,100,30);assert.equal(r.length,1)}
console.log('V27.0 presence validation, fallback defaults and residency checks passed');

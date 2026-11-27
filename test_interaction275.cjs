const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
let n=0;
for(const mode of ['hand','hug','duet','photo','idle'])for(const d of [0,.3,.5,.8,1.2,1.5,2.5,3,NaN])for(const y of [0,.3,.4])for(const moving of [false,true])for(const jump of [0,.1])for(const vehicle of ['', 'horse']){const ready=R.pairReady275(mode,d,y,moving,false,jump,0,vehicle);if(moving||jump>.05||vehicle||d<.48||d>2.8||!Number.isFinite(d)||y>.32||mode==='idle')assert(!ready);n++}
assert(R.pairReady275('hand',.8,0,false,false,0,0,''));
assert(R.pairReady275('hug',.8,0,false,false,0,0,''));
assert(R.pairReady275('duet',1.3,0,false,false,0,0,''));
assert(R.pairReady275('photo',2.5,0,false,false,0,0,''));
assert(!R.pairReady275('hand',.8,0,false,true,0,0,''));
assert(!R.pairReady275('hand',.8,0,false,false,0,.2,''));
const roster=[{id:'a',friend:1,name:'An'},{id:'b',friend:0,name:'B'}];
const inv=[{id:'a',action:'hand',name:'spoof'},{id:'a',action:'hand'},{id:'b',action:'hug'},{id:'c',action:'photo'},{id:'a',action:'invalid'}];
assert.deepEqual(R.invitations275(inv,roster,new Map(),100),[{id:'a',action:'hand',name:'An'}]);
assert.equal(R.invitations275(inv,roster,new Map([['a:hand',200]]),100).length,0);
assert.equal(R.invitations275(inv,roster,new Map([['a:hand',200]]),200).length,1);
const r=R.roster270([{id:'a',area:0,x:490,y:575,sample_ms:1000,pair275:true}],'self',1100,100,10);assert.equal(r[0].pair275,true);
console.log('V27.5 readiness checks: '+n);

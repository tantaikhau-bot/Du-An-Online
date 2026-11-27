const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
let n=0;
for(let age=0;age<=10000;age+=50)for(const shared of [false,true])for(const owner of ['a','b',''])for(const uid of ['a','b',null]){assert.equal(R.freshness277(10000,10000+age,owner,uid,shared),!shared||!uid||owner!==uid?'clear':age>=8000?'expired':'fresh');n++}
for(let age=0;age<=8000;age+=100)for(const stale of [false,true])for(const friend of [0,1])for(const pair of [false,true])for(const action of ['hug','hand']){assert.equal(R.pairFresh277({stale276:stale,friend,pair275:pair,action},'hug',10000+age,10000),!stale&&friend===1&&pair&&action==='hug'&&age<4000);n++}
assert.equal(R.freshness277(0,100,'a','a',true),'expired');assert.equal(R.pairFresh277(null,'hug',100,0),false);
const p=[{rig:{visible:true},sample134:{delay271:500}},{rig:{visible:false},avatar109:{root:{visible:true}},sample134:{delay271:700}},{rig:{visible:false},vehicle88:{visible:true},stale276:true},{rig:{visible:false}}];
assert.deepEqual(R.peerStats277(p),{count:4,vrm:1,fallback:1,visible:3,missing:1,delayMs:725,stale:1});assert.equal(R.peerStats277([]).count,0);
console.log('V27.7 final regression checks: '+n);

const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
let n=0;
for(const active of [false,true])for(const near of [false,true])for(const urgent of [false,true])for(let rtt=0;rtt<=4000;rtt+=100)for(const rand of [0,.5,1]){const c=R.cadence273(active,near,urgent,rtt,rand);assert(c>=600&&c<=2600);if(urgent)assert(c<=1050);n++;}
assert.equal(R.cadence273(false,false,false,0),2200);
assert.equal(R.cadence273(true,false,false,0),750);
assert(R.cadence273(true,true,false,1500)>R.cadence273(true,true,false,100));
let st={};R.network273(st,100,1000);R.network273(st,300,2000);assert.equal(st.rtt,140);assert.equal(st.responses,2);assert.equal(st.bytes,3000);
console.log('V27.3 network cadence samples: '+n);

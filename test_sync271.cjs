const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
const row=(ms,received,x,gait=.7,heading=0,moving=true)=>({sample_ms:ms,worldMs121:ms+100,received121:received,x:490+x*35,y:575,heading,jump:0,moving,gait109:gait,rtt134:50});
let count=0;
for(const cadence of [250,500,750,1000,1500,2250])for(const jitter of [0,40,100,250]){let state={},history=[];for(let i=0;i<24;i++){const r=row(100000+i*cadence,1000+i*cadence+(i%2)*jitter,i*.4);assert(R.ingest271(state,history,r));assert(state.delay271>=350&&state.delay271<=1700);assert(history.length<=8);const p=R.pose271(state,history,r.received121);assert(Number.isFinite(p.x)&&Number.isFinite(p.heading)&&p.gait>=0&&p.gait<=1);assert(!R.ingest271(state,history,r));count++;}const last=history.at(-1);assert.equal(R.pose271(state,history,last.t+10000).moving,false);assert.equal(R.pose271(state,history,last.t+10000).gait,0);}
let st={},h=[];R.ingest271(st,h,row(10000,1000,0,.3,Math.PI-.1));R.ingest271(st,h,row(10750,1750,1,.9,-Math.PI+.1));let mid=R.pose271(st,h,(h[0].t+h[1].t)/2+st.delay271);assert(Math.abs(mid.x-.5)<.001);assert(Math.abs(mid.gait-.6)<.001);assert(Math.abs(Math.abs(mid.heading)-Math.PI)<.01);
assert(R.ingest271(st,h,row(11500,2500,50)));assert.equal(h.length,1);assert.equal(st.snap271,true);
assert.equal(R.correction271(2,16,true,true),1);assert.equal(R.correction271(13,16,true,false),1);assert(R.correction271(1,16,true,false)>0&&R.correction271(1,16,true,false)<1);assert.equal(R.correction271(1,NaN,true,false),0);
console.log('V27.1 adaptive synchronization samples: '+count);

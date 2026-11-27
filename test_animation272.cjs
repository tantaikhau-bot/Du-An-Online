const assert=require('node:assert/strict'),R=require('./assets/realtime.js');
let st={},h=[];
const row=(ms,recv,action,vehicle,jump,gait=.6)=>({sample_ms:ms,worldMs121:ms+100,received121:recv,x:490,y:575,heading:0,jump,moving:gait>0,gait109:gait,rtt134:50,action,vehicle});
assert(R.ingest271(st,h,row(10000,1000,'wave','',0,0)));assert(R.ingest271(st,h,row(10750,1750,'dance','',.6,0)));assert(R.ingest271(st,h,row(11500,2500,'idle','horse',0,.8)));
const at=(i)=>h[i].t+st.delay271;
assert.equal(R.pose271(st,h,at(0)).action,'wave');assert.equal(R.pose271(st,h,at(1)).action,'dance');assert.equal(R.pose271(st,h,at(2)).vehicle,'horse');assert.equal(R.pose271(st,h,at(2)+10000).action,'idle');
assert(R.pose271(st,h,(h[0].t+h[1].t)/2+st.delay271).velocity>0);
let n=0;for(const dt of [16,33,66,100]){let a={};for(let i=0;i<240;i++){const p={moving:i%60<30,gait:.8,jump:i%60>35&&i%60<45?.5:0,action:'dance',vehicle:i>120?'horse':''};R.motion272(a,p,dt);assert(a.gait>=0&&a.gait<=1&&a.phase>=0&&a.phase<Math.PI*2&&a.land>=0&&a.land<=.18);if(p.vehicle||p.jump>.05)assert.equal(a.action,'idle');n++;}}
let a={};R.motion272(a,{jump:.5},16);R.motion272(a,{jump:0},16);assert.equal(a.land,.18);
const r=R.roster270([{id:'horse',area:0,x:490,y:575,sample_ms:1000,vehicle:'horse'}],'self',1100,100,10);assert.equal(r[0].vehicle,'horse');
console.log('V27.2 motion frames: '+n);

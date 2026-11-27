/* Run: node test_horse253.cjs */
const h=require('node:fs').readFileSync('index.html','utf8'),start=h.indexOf('function horseMotion253('),end=h.indexOf('function poseHorse53(',start);
const step=new Function(h.slice(start,end)+';return horseMotion253')(),check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
let st={weights:{idle:1,walk:0,trot:0,gallop:0},phase:0,idleTime:0,current:'idle'};
for(const [speed,name] of [[0,'idle'],[1.4,'walk'],[3.2,'trot'],[6.1,'gallop']]){
 for(let i=0;i<120;i++){step(st,speed,1/60,0,.4);if(Math.abs(Object.values(st.weights).reduce((a,b)=>a+b,0)-1)>1e-10||Object.values(st.weights).some(v=>v<0)||st.phase<0||st.phase>=1)throw Error('weights/phase')}
 check(st.current===name,'stable '+name+' gait');
}
let old=st.cadence253;step(st,0,1/60,1,-1);check(st.cadence253>0&&st.cadence253<old,'smooth cadence deceleration');
for(let i=0;i<180;i++)step(st,0,1/60,1,0);check(st.current==='idle'&&st.cadence253===0&&st.brake253<.001&&Math.abs(st.turn253)<.001,'settled idle restores breathing despite brake held');
let phase=st.phase;step(st,0,.016,1,0);check(st.phase===phase,'no residual hoof cycle at rest');
let switches=0,last=st.current;for(let i=0;i<240;i++){step(st,2.625+.025*Math.sin(i*.9),1/60,0,0);if(last!==st.current)switches++;last=st.current}check(switches<=3,'gait hysteresis near blend boundary');
for(let i=0;i<120;i++)step(st,4,.033,1,1);check(st.brake253>.95&&st.turn253>.95,'rider controls converge while moving');

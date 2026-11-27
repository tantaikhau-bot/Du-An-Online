/* Run: node test_spirit254.cjs */
const C=require('./assets/fantasy-creatures.js'),check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
for(const kind of ['cat','rabbit','fox','deer','dragon']){
 const st={};for(let i=0;i<90;i++)C.spiritMotion254(st,kind,.8,1/60,true);if(st.gait254!=='walk')throw Error(kind+' walk');
 for(let i=0;i<90;i++)C.spiritMotion254(st,kind,3.8,1/60,true);if(st.gait254!=='run'||st.rate254>1.65)throw Error(kind+' run');
 for(let i=0;i<90;i++)C.spiritMotion254(st,kind,0,1/60,true);if(st.gait254!=='idle'||st.speed254>.01)throw Error(kind+' idle');
}check(true,'five species: walking, running and settling');
let st={};for(let i=0;i<90;i++)C.spiritMotion254(st,'deer',1.5,1/60,true);check(st.gait254==='trot','deer trot');
st={};C.spiritMotion254(st,'cat',NaN,NaN);check(Number.isFinite(st.rate254)&&st.gait254==='idle','invalid input bounded');
const owner={x:0,z:0},target=C.followTarget('cat',owner,0),f=C.follower(),ok=()=>true;
let p={x:target.x+.12,z:target.z};let n=C.followStep(f,'cat',p,owner,0,.016,0,'follow',ok,ok);check(n.speed===0&&f.settled254,'companion settles near owner');
p={x:target.x+.30,z:target.z};n=C.followStep(f,'cat',p,owner,0,.016,0,'follow',ok,ok);check(n.speed===0,'settle hysteresis');
p={x:target.x+.6,z:target.z};n=C.followStep(f,'cat',p,owner,0,.016,0,'follow',ok,ok);check(n.speed>0,'follow resumes outside dead zone');
n=C.followStep(f,'cat',p,owner,0,.016,2,'wait',ok,ok);check(n.speed===0&&n.mode==='wait','wait remains immediate');
n=C.followStep(f,'cat',p,owner,0,.016,2,'follow',ok,()=>false);check(n.speed===0&&n.x===p.x&&n.z===p.z,'blocked segment remains safe');

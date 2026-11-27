/* Run from repository root: node test_animation256.cjs */
const M=require('./assets/smooth-motion.js'),A=require('./assets/arm-motion.js'),V=require('./assets/vrm-character.js'),C=require('./assets/fantasy-creatures.js'),I=require('./assets/foot-ik.js');
const check=(v,msg)=>{if(!v)throw Error(msg);console.log('PASS '+msg)};
let frames=0;
for(const id of Object.keys(M.profiles))for(const dt of [1/30,1/60,1/120]){
 const st=M.newState(),social={},arm={},finger={name:'IndexDistal',curl:0,spread:0},look={},pet={};
 for(let i=0;i<420;i++){
  const block=Math.floor(i/60),mode=['idle','idle','idle','wave','duet','ride','idle'][block],gait=block===1?1:block===2?.62:0;
  const j=block===2&&i%60<30?{height:.4,velocity:2,speed:1.65}:{speed:gait*3.8,turn:Math.sin(i*.1)*3};
  const pose=M.step(st,dt,gait,j,mode,id),weights=M.actionBlend132(social,M.phaseOf(j)?'idle':mode,dt),face=M.expression132(social,mode,dt,st.time);
  const sm=A.armResponse251(arm,pose.armL,pose.elbowL,pose.spread,dt,st.jump);
  const target=V.fingerTargets163(mode,gait,st.jump,st.time,'left').IndexDistal;
  V.fingerResponse251(finger,...target,dt,mode);M.socialLook255(look,Math.sin(i*.1),dt);C.spiritMotion254(pet,'fox',j.speed,dt);
  if(!Object.values(pose).every(Number.isFinite)||!Object.values(face).every(Number.isFinite)||!Object.values(sm).every(Number.isFinite)||!Number.isFinite(finger.curl)||!Number.isFinite(pet.rate254)||!Number.isFinite(look.yaw)||Object.values(weights).reduce((a,b)=>a+b,0)>1.000001||pose.kneeL<0||pose.kneeR>1.12||Math.abs(look.yaw)>.38)throw Error('invalid frame '+id+' '+i);
  frames++;
 }
}
check(frames===25200,'20 profiles x 3 time steps x 420 mixed frames: '+frames);
for(const mode of ['constructor','toString','__proto__','idle']){const f=M.expression132({},mode,.016,1,NaN);if(!Object.values(f).every(Number.isFinite))throw Error('expression input '+mode)}check(true,'invalid expression mode and seed stay finite');
check(I.support252(.12,.9,.8).active&&!I.support252(.5,.9,.8).active,'running support window preserved');

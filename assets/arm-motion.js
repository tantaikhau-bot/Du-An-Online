/* Direction-based arm posing for normalized VRM humanoids. No mesh cloth physics. */
(function(root){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function directions(T,up,out,forward,swing,flex,spread,jump=0){
  const pitch=clamp(swing,-.53-.30*jump,.58+.48*jump),gap=clamp(spread,.14,.34+.30*jump);
  const upper=up.clone().multiplyScalar(-Math.cos(pitch)).addScaledVector(forward,Math.sin(pitch)).addScaledVector(out,gap).normalize();
  const bend=forward.clone().addScaledVector(upper,-forward.dot(upper)).normalize();
  const elbow=clamp(flex,.08,1.20+.15*jump);
  const lower=upper.clone().multiplyScalar(Math.cos(elbow)).addScaledVector(bend,Math.sin(elbow));
  const lateral=lower.dot(out);if(lateral<.075)lower.addScaledVector(out,.075-lateral);
  return {upper,lower:lower.normalize()};
 }
 function aim(T,bone,child,direction){
  const rest=child.position.clone().normalize();if(rest.lengthSq()<.9)return;
  const local=direction.clone().applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert()).normalize();
  bone.quaternion.setFromUnitVectors(rest,local);bone.updateWorldMatrix(true,true);
 }
 // V25.1: smooth scalar targets in body coordinates; turning the avatar does not drag its arms in world space.
 function armResponse251(st,swing,flex,spread,dt,jump=0){
  const k=1-Math.exp(-clamp(Number.isFinite(dt)?dt:0,0,.35)/(jump>.15?.045:.075));
  const target={swing:clamp(swing,-.83,1.06),flex:clamp(flex,.08,1.35),spread:clamp(spread,.14,.64)};
  for(const key of Object.keys(target))st[key]=Number.isFinite(st[key])?st[key]+(target[key]-st[key])*k:target[key];
  return st;
 }
 function apply(a,v,dt=1/60){
  const T=a.T,hum=a.vrm.humanoid,get=n=>hum.getNormalizedBoneNode(n);
  const l=get('leftUpperArm'),r=get('rightUpperArm'),hips=get('hips');if(!l||!r||!hips)return;
  a.root.updateWorldMatrix(true,true);
  const L=l.getWorldPosition(new T.Vector3()),R=r.getWorldPosition(new T.Vector3()),center=L.clone().add(R).multiplyScalar(.5);
  const up=center.clone().sub(hips.getWorldPosition(new T.Vector3())).normalize(),left=L.clone().sub(R).normalize();
  left.addScaledVector(up,-left.dot(up)).normalize();
  const forward=left.clone().cross(up).normalize(),reference=a.modelForward.clone().applyQuaternion(a.root.getWorldQuaternion(new T.Quaternion()));
  if(forward.dot(reference)<0)forward.negate();
  const female=a.motionProfile?.startsWith('f'),run=a.motion.run||0;
  const jump=clamp(a.motion.jump||0,0,1),spread=Math.max(female?.25:.18,v.spread+.055)+run*.035;
  for(const [side,out,swing,flex] of [['left',left,v.armL,v.elbowL],['right',left.clone().negate(),v.armR,v.elbowR]]){
   const u=get(side+'UpperArm'),k=get(side+'LowerArm'),h=get(side+'Hand');if(!u||!k||!h)continue;
   a.armResponse251??={left:{},right:{}};const sm=armResponse251(a.armResponse251[side],-swing,flex,spread,dt,jump);const d=directions(T,up,out,forward,sm.swing,sm.flex,sm.spread,jump);
   aim(T,u,k,d.upper);aim(T,k,h,d.lower);
   h.quaternion.identity();h.updateWorldMatrix(true,true);
  }
 }
 function measure(a){
  const T=a.T,h=a.vrm.humanoid,get=n=>h.getRawBoneNode(n)?.getWorldPosition(new T.Vector3());
  const L=get('leftUpperArm'),R=get('rightUpperArm');if(!L||!R)return [];
  const mid=L.clone().add(R).multiplyScalar(.5),left=L.clone().sub(R).normalize();
  return ['left','right'].map(side=>{
   const A=get(side+'UpperArm'),B=get(side+'LowerArm'),C=get(side+'Hand');if(!A||!B||!C)return null;
   const out=left.clone().multiplyScalar(side==='left'?1:-1);
   return {flex:B.clone().sub(A).angleTo(C.clone().sub(B)),elbowSide:B.clone().sub(mid).dot(out),wristSide:C.clone().sub(mid).dot(out),shoulderSide:A.clone().sub(mid).dot(out)};
  });
 }
 const api={directions,apply,measure,armResponse251};if(typeof module!=='undefined')module.exports=api;else root.WWArms=api;
})(typeof globalThis!=='undefined'?globalThis:this);

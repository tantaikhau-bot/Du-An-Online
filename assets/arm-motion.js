/* Direction-based arm posing for normalized VRM humanoids. No mesh cloth physics. */
(function(root){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function directions(T,up,out,forward,swing,flex,spread){
  const pitch=clamp(swing,-.53,.58),gap=clamp(spread,.14,.34);
  const upper=up.clone().multiplyScalar(-Math.cos(pitch)).addScaledVector(forward,Math.sin(pitch)).addScaledVector(out,gap).normalize();
  const bend=forward.clone().addScaledVector(upper,-forward.dot(upper)).normalize();
  const elbow=clamp(flex,.08,1.20);
  const lower=upper.clone().multiplyScalar(Math.cos(elbow)).addScaledVector(bend,Math.sin(elbow));
  const lateral=lower.dot(out);if(lateral<.075)lower.addScaledVector(out,.075-lateral);
  return {upper,lower:lower.normalize()};
 }
 function aim(T,bone,child,direction){
  const rest=child.position.clone().normalize();if(rest.lengthSq()<.9)return;
  const local=direction.clone().applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert()).normalize();
  bone.quaternion.setFromUnitVectors(rest,local);bone.updateWorldMatrix(true,true);
 }
 function apply(a,v){
  const T=a.T,hum=a.vrm.humanoid,get=n=>hum.getNormalizedBoneNode(n);
  const l=get('leftUpperArm'),r=get('rightUpperArm'),hips=get('hips');if(!l||!r||!hips)return;
  a.root.updateWorldMatrix(true,true);
  const L=l.getWorldPosition(new T.Vector3()),R=r.getWorldPosition(new T.Vector3()),center=L.clone().add(R).multiplyScalar(.5);
  const up=center.clone().sub(hips.getWorldPosition(new T.Vector3())).normalize(),left=L.clone().sub(R).normalize();
  left.addScaledVector(up,-left.dot(up)).normalize();
  const forward=left.clone().cross(up).normalize(),reference=a.modelForward.clone().applyQuaternion(a.root.getWorldQuaternion(new T.Quaternion()));
  if(forward.dot(reference)<0)forward.negate();
  const female=a.motionProfile?.startsWith('f'),run=a.motion.run||0;
  const spread=Math.max(female?.25:.18,v.spread+.055)+run*.035;
  for(const [side,out,swing,flex] of [['left',left,v.armL,v.elbowL],['right',left.clone().negate(),v.armR,v.elbowR]]){
   const u=get(side+'UpperArm'),k=get(side+'LowerArm'),h=get(side+'Hand');if(!u||!k||!h)continue;
   const d=directions(T,up,out,forward,-swing,flex,spread);
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
 const api={directions,apply,measure};if(typeof module!=='undefined')module.exports=api;else root.WWArms=api;
})(typeof globalThis!=='undefined'?globalThis:this);

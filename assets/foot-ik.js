/* Ground contact solver. Original analytic two-bone IK; stance targets are world-space. */
(function(root){
 function solve(T,A,B,C,target){
  const l1=A.distanceTo(B),l2=B.distanceTo(C);
  if(Math.min(l1,l2)<.001)return null;
  const dir=target.clone().sub(A),length=dir.length();if(length<.001)return null;dir.multiplyScalar(1/length);
  const d=Math.max(Math.abs(l1-l2)+.001,Math.min(l1+l2-.001,length)),along=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));
  let pole=B.clone().sub(A);pole.addScaledVector(dir,-pole.dot(dir));if(pole.lengthSq()<.000001){pole=C.clone().sub(B);pole.addScaledVector(dir,-pole.dot(dir));}if(pole.lengthSq()<.000001){pole.set(0,0,-1);pole.addScaledVector(dir,-pole.dot(dir));}if(pole.lengthSq()<.000001)return null;pole.normalize();
  return {knee:A.clone().addScaledVector(dir,along).addScaledVector(pole,h),foot:A.clone().addScaledVector(dir,d)};
 }
 function aim(T,node,current,desired,weight){
  const q=new T.Quaternion().setFromUnitVectors(current.normalize(),desired.normalize()),world=node.getWorldQuaternion(new T.Quaternion()),parent=node.parent.getWorldQuaternion(new T.Quaternion());
  const local=parent.invert().multiply(q.multiply(world));node.quaternion.slerp(local,weight);node.updateWorldMatrix(true,true);
 }
 function apply(T,a,ground,dt,gait,jump,mode){
  a.contacts??={};if(!ground||jump||!['idle','walk','run'].includes(mode)){a.contacts={};return null}
  const hum=a.vrm.humanoid,st=a.motion;let maxError=0,planted=0;
  a.root.updateWorldMatrix(true,true);
  for(const [side,offset] of [['left',0],['right',Math.PI]]){
   const u=hum.getNormalizedBoneNode(side+'UpperLeg'),k=hum.getNormalizedBoneNode(side+'LowerLeg'),f=hum.getNormalizedBoneNode(side+'Foot');if(!u||!k||!f)continue;
   const A=u.getWorldPosition(new T.Vector3()),B=k.getWorldPosition(new T.Vector3()),C=f.getWorldPosition(new T.Vector3()),stance=gait<.10||Math.cos(st.cycle+offset)<=.05;
   let lock=a.contacts[side];if(!stance){delete a.contacts[side];continue}
   const y=ground(C.x,C.z);if(!Number.isFinite(y)||Math.abs(y-C.y)>.7){delete a.contacts[side];continue}
   const sole=a.soleHeight?.[side]||.06;
   if(!lock||Math.hypot(lock.x-C.x,lock.z-C.z)>.38){lock=new T.Vector3(C.x,y+sole,C.z);a.contacts[side]=lock}
   const solved=solve(T,A,B,C,lock);if(!solved)continue;
   const weight=Math.min(1,Math.max(.25,dt*45));
   aim(T,u,B.clone().sub(A),solved.knee.clone().sub(A),weight);
   const nowK=k.getWorldPosition(new T.Vector3()),nowF=f.getWorldPosition(new T.Vector3());
   aim(T,k,nowF.clone().sub(nowK),solved.foot.clone().sub(nowK),weight);
   const out=f.getWorldPosition(new T.Vector3());maxError=Math.max(maxError,out.distanceTo(lock));planted++;
  }
  return {planted,maxError:Math.round(maxError*1000)/1000};
 }
 const api={solve,apply};if(typeof module!=='undefined')module.exports=api;else root.WWFootIK=api;
})(typeof globalThis!=='undefined'?globalThis:this);

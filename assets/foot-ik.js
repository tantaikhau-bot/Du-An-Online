/* Ground contact solver. Original analytic two-bone IK; stance targets are world-space. */
(function(root){
 function solve(T,A,B,C,target,forward=null){
  const l1=A.distanceTo(B),l2=B.distanceTo(C);
  if(Math.min(l1,l2)<.001)return null;
  const dir=target.clone().sub(A),length=dir.length();if(length<.001)return null;dir.multiplyScalar(1/length);
  const d=Math.max(Math.abs(l1-l2)+.001,Math.min(l1+l2-.001,length)),along=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));
  let pole=forward?forward.clone():B.clone().sub(A);pole.addScaledVector(dir,-pole.dot(dir));if(pole.lengthSq()<.000001){pole=C.clone().sub(B);pole.addScaledVector(dir,-pole.dot(dir));}if(pole.lengthSq()<.000001){pole.set(0,0,-1);pole.addScaledVector(dir,-pole.dot(dir));}if(pole.lengthSq()<.000001)return null;pole.normalize();
  return {knee:A.clone().addScaledVector(dir,along).addScaledVector(pole,h),foot:A.clone().addScaledVector(dir,d)};
 }
 // V11: never solve arbitrary world-space quaternion rotations on normalized legs.
 // Only bounded sagittal hinge corrections on near-ground stance; no running locks.
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function reset(a){a.contacts={};a.contactFrame=null}
 // Ankle height is calibrated in the rest pose. Align the lowest sole with terrain
 // after humanoid update; never force a nearly straight knee to reach a target.
 function groundIdle(T,a,ground,dt,gait,jump,mode){
  const allowed=!!ground&&!jump&&mode==='idle'&&gait<.15&&a.motion?.run<.10;
  const target=allowed?clamp(1-gait/.15,0,1):0;
  a.idleGroundWeight=jump||!ground||mode!=='idle'?0:(a.idleGroundWeight||0)+(target-(a.idleGroundWeight||0))*(1-Math.exp(-Math.max(0,dt)/.085));
  if(a.idleGroundWeight<.005||!ground||jump)return null;
  const root=a.root,hum=a.vrm.humanoid;root.updateWorldMatrix(true,true);
  const scale=root.getWorldScale(new T.Vector3()).y/Math.max(.001,a.baseScale||1),errors=[];
  for(const side of ['left','right']){const foot=hum.getRawBoneNode?.(side+'Foot')||hum.getNormalizedBoneNode(side+'Foot');if(!foot)continue;const p=foot.getWorldPosition(new T.Vector3()),y=ground(p.x,p.z),sole=a.soleHeight?.[side];if(Number.isFinite(y)&&Number.isFinite(sole)&&Number.isFinite(p.y))errors.push(y+sole*scale-p.y)}
  if(!errors.length)return null;
  const delta=clamp(Math.max(...errors),-.16,.16)*a.idleGroundWeight;
  if(root.parent){const p=root.getWorldPosition(new T.Vector3());p.y+=delta;root.position.copy(root.parent.worldToLocal(p))}else root.position.y+=delta;
  root.updateWorldMatrix(true,true);
  return {planted:errors.filter(e=>Math.abs(e-delta)<.025).length,maxError:Math.max(...errors.map(e=>Math.abs(e-delta))),offset:delta,weight:a.idleGroundWeight,mode:'grounded-idle'};
 }
 function apply(T,a,ground,dt,gait,jump,mode){
  if(!ground||jump||gait>=.76||a.motion?.run>.18||!['idle','walk','run'].includes(mode)||dt>.085){reset(a);return null}
  const hum=a.vrm.humanoid,st=a.motion,root=a.root;
  root.updateWorldMatrix(true,true);
  const pos=root.getWorldPosition(new T.Vector3()),rot=root.getWorldQuaternion(new T.Quaternion()),previous=a.contactFrame;
  a.contactFrame={pos:pos.clone(),rot:rot.clone()};
  a.contacts??={};
  if(previous&&(previous.pos.distanceTo(pos)>.12||previous.rot.angleTo(rot)>.20)){a.contacts={};return null}
  const w=gait<.10?.42:gait<.42?.22:.10,sign=a.legSign||1;
  let planted=0,maxError=0,maxCorrection=0;
  for(const [side,offset] of [['left',0],['right',Math.PI]]){
   let phase=((st.cycle+offset)/(2*Math.PI)%1+1)%1;
   if(gait>=.10&&phase>.56){delete a.contacts[side];continue}
   const u=hum.getNormalizedBoneNode(side+'UpperLeg'),k=hum.getNormalizedBoneNode(side+'LowerLeg'),f=hum.getNormalizedBoneNode(side+'Foot');
   const raw=hum.getRawBoneNode?.(side+'Foot')||f;
   if(!u||!k||!f||!raw)continue;
   const C=raw.getWorldPosition(new T.Vector3()),y=ground(C.x,C.z),sole=(a.soleHeight?.[side]||.06)*(root.scale.x/(a.baseScale||root.scale.x));
   if(!Number.isFinite(y)||!Number.isFinite(C.y)||Math.abs(y+sole-C.y)>.10){delete a.contacts[side];continue}
   // A planted foot target is vertical only: do not drag a moving foot to old X/Z.
   const delta=clamp(y+sole-C.y,-.035,.035);
   const bend=k.rotation.x*sign;
   // Near straight legs have a singular vertical Jacobian; skip instead of forcing a knee bend.
   let correction=0;
   if(bend>.12&&bend<.96){
    correction=clamp(delta*2.2*w,-.045,.045);
    const next=clamp(bend+correction,0,1.10),change=next-bend;
    u.rotation.x-=sign*change*.5;k.rotation.x=sign*next;
    f.rotation.x=sign*clamp(f.rotation.x*sign-change*.5,-.30,.22);
   }
   a.contacts[side]={y:y+sole};planted++;maxError=Math.max(maxError,Math.abs(y+sole-C.y));maxCorrection=Math.max(maxCorrection,Math.abs(correction));
  }
  return {planted,maxError:Math.round(maxError*1000)/1000,maxCorrection,weight:w,mode:'vertical-only'};
 }
 const api={solve,apply,reset,groundIdle};if(typeof module!=='undefined')module.exports=api;else root.WWFootIK=api;
})(typeof globalThis!=='undefined'?globalThis:this);

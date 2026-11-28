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
 // Sample actual deformed sole geometry, cached once per loaded rig.
 function calibrateSoles(T,a){
  const root=a.root,hum=a.vrm.humanoid;root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);
  const bins={left:new Map(),right:new Map()},feet={};for(const side of ['left','right']){const f=hum.getRawBoneNode?.(side+'Foot')||hum.getNormalizedBoneNode(side+'Foot');if(f)feet[side]=f.getWorldPosition(new T.Vector3())}
  const p=new T.Vector3(),q=new T.Vector3();root.traverseVisible(o=>{if(!o.isMesh||!o.geometry?.attributes?.position||typeof o.getVertexPosition!=='function')return;const n=o.geometry.attributes.position.count;
   for(let i=0;i<n;i++){o.getVertexPosition(i,p);q.copy(p).applyMatrix4(o.matrixWorld);let best=null,dist=Infinity;for(const side of ['left','right']){const f=feet[side];if(!f||q.y>f.y+.025||q.y<f.y-.30)continue;const d=Math.hypot(q.x-f.x,q.z-f.z);if(d<.25&&d<dist){dist=d;best=side}}if(!best)continue;const key=Math.floor(q.x/.022)+':'+Math.floor(q.z/.022),m=bins[best],old=m.get(key);if(!old||q.y<old.y)m.set(key,{mesh:o,index:i,y:q.y});}
  });a.soleSamples={};for(const side of ['left','right']){const all=[...bins[side].values()].sort((x,y)=>x.y-y.y);a.soleSamples[side]=all.filter(x=>x.y<=all[0].y+.065).slice(0,48)}return a.soleSamples;
 }
 function soleContacts(T,a,ground){const root=a.root,hum=a.vrm.humanoid;root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);const scale=root.getWorldScale(new T.Vector3()).y/Math.max(.001,a.baseScale||1),p=new T.Vector3(),rows=[];
  for(const side of ['left','right']){let best=null;for(const v of a.soleSamples?.[side]||[]){v.mesh.getVertexPosition(v.index,p);p.applyMatrix4(v.mesh.matrixWorld);const y=ground(p.x,p.z),error=y-p.y;if(Number.isFinite(error)&&(!best||error>best.error))best={side,error,x:p.x,z:p.z,y,source:'mesh'}}
   if(!best){const foot=hum.getRawBoneNode?.(side+'Foot')||hum.getNormalizedBoneNode(side+'Foot');if(foot){foot.getWorldPosition(p);const y=ground(p.x,p.z),sole=a.soleHeight?.[side];if(Number.isFinite(y)&&Number.isFinite(sole)&&Number.isFinite(p.y))best={side,error:y+sole*scale-p.y,x:p.x,z:p.z,y,source:'ankle'}}}if(best)rows.push(best);
  }return rows;
 }
 // Balance the two visible soles before moving the root. Only bounded sagittal
 // hinge adjustments; keep the existing normalized knee plane and foot pitch.
 function balanceIdle(T,a,ground,rows){
  const hum=a.vrm.humanoid,sign=a.legSign||1;
  if(rows.length!==2||!rows.every(r=>r.source==='mesh'))return rows;
  for(let i=0;i<2;i++){
   const low=rows[0].error>rows[1].error?rows[0]:rows[1],high=rows.find(r=>r.side!==low.side),diff=low.error-high.error;
   if(diff<.008||diff>.16)break;
   const u=hum.getNormalizedBoneNode(low.side+'UpperLeg'),k=hum.getNormalizedBoneNode(low.side+'LowerLeg'),f=hum.getNormalizedBoneNode(low.side+'Foot');
   if(!u||!k||!f||typeof hum.update!=='function')break;
   const get=n=>hum.getRawBoneNode?.(low.side+n)||hum.getNormalizedBoneNode(low.side+n);
   const A=get('UpperLeg').getWorldPosition(new T.Vector3()),B=get('LowerLeg').getWorldPosition(new T.Vector3()),C=get('Foot').getWorldPosition(new T.Vector3());
   const l1=A.distanceTo(B),l2=B.distanceTo(C),len=A.distanceTo(C),bend=k.rotation.x*sign;
   if(Math.min(l1,l2)<.05||bend<0||bend>.55)break;
   const desired=Math.max(Math.abs(l1-l2)+.002,len-diff),cos=clamp((desired*desired-l1*l1-l2*l2)/(2*l1*l2),-1,1);
   const change=clamp(Math.acos(cos)-bend,0,Math.min(.24,.62-bend));
   if(change<.002)break;
   const saved=[u.rotation.x,k.rotation.x,f.rotation.x];
   u.rotation.x-=sign*change*.5;k.rotation.x+=sign*change;f.rotation.x-=sign*change*.5;
   hum.update();const candidate=soleContacts(T,a,ground);
   if(candidate.length===2&&Math.abs(candidate[0].error-candidate[1].error)<diff-.001){rows=candidate;}else{[u.rotation.x,k.rotation.x,f.rotation.x]=saved;hum.update();rows=soleContacts(T,a,ground);break}
  }
  return rows;
 }
 // Align the actual visible soles after the humanoid pose is updated.
 function groundIdle(T,a,ground,dt,gait,jump,mode){
  const allowed=!!ground&&!jump&&mode==='idle'&&gait<.15&&(a.motion?.run||0)<.10;
  const target=allowed?clamp(1-gait/.15,0,1):0;
  a.idleGroundWeight=jump||!ground||mode!=='idle'||gait>=.76?0:(a.idleGroundWeight||0)+(target-(a.idleGroundWeight||0))*(1-Math.exp(-Math.max(0,dt)/.085));
  if(a.idleGroundWeight<.005||!ground||jump){a.idleAnchor1170=null;return null;}
  const root=a.root;let rows=soleContacts(T,a,ground);
  // Lock the support midpoint in world X/Z for settled idle; release on movement/turn/teleport.
  const parent=root.parent,hum=a.vrm.humanoid;
  if(allowed&&gait<.015&&a.idleGroundWeight>.95&&parent&&!(a.motion?.jump>.08)){
   const pos=parent.getWorldPosition(new T.Vector3()),rot=parent.getWorldQuaternion(new T.Quaternion()),feet=['left','right'].map(side=>hum.getRawBoneNode?.(side+'Foot')||hum.getNormalizedBoneNode(side+'Foot')).filter(Boolean);
   if(feet.length===2){const mid=feet[0].getWorldPosition(new T.Vector3()).add(feet[1].getWorldPosition(new T.Vector3())).multiplyScalar(.5);let anchor=a.idleAnchor1170;if(!anchor||anchor.pos.distanceTo(pos)>.018||anchor.rot.angleTo(rot)>.035){anchor=a.idleAnchor1170={pos,rot,mid:mid.clone()}}
    const d=anchor.mid.clone().sub(mid);d.y=0;if(d.length()<.075){const before=root.position.clone(),p=root.getWorldPosition(new T.Vector3()).add(d);root.position.copy(parent.worldToLocal(p));a.idleOffset1170={x:root.position.x-before.x,z:root.position.z-before.z};rows=soleContacts(T,a,ground)}else a.idleAnchor1170=null;
   }
  }else a.idleAnchor1170=null;
  if(allowed&&gait<.035&&a.idleGroundWeight>.92)rows=balanceIdle(T,a,ground,rows);
  if(!rows.length)return null;
  // A small positive clearance avoids visible clipping; use the most penetrating point.
  const clearance=.001,limit=rows.every(r=>r.source==='mesh')?.34:.28;
  const weight=allowed&&gait<.015&&a.idleGroundWeight>.95?1:a.idleGroundWeight;
  const delta=clamp(Math.max(...rows.map(r=>r.error))+clearance,-limit,limit)*weight;
  if(root.parent){const p=root.getWorldPosition(new T.Vector3());p.y+=delta;root.position.copy(root.parent.worldToLocal(p))}else root.position.y+=delta;
  root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);
  const contacts=rows.map(r=>({...r,gap:delta-r.error}));
  return {planted:contacts.filter(r=>Math.abs(r.gap)<.025).length,maxError:Math.max(...contacts.map(r=>Math.abs(r.gap))),offset:delta,weight:a.idleGroundWeight,mode:'grounded-idle',anchorLocked:!!a.idleAnchor1170,source:contacts.every(r=>r.source==='mesh')?'mesh':'ankle-fallback',contacts};
 }
 // Bounded independent stance correction along the character's sagittal plane.
 // Keep lateral motion and knee plane authored; reject targets that become unreachable.
 function stance119(T,a,side,u,k,f,raw,ground,phase,gait){
  if(!a.modelForward||typeof a.vrm.humanoid.update!=='function'||gait<.15||phase>.52)return null;
  const hum=a.vrm.humanoid,root=a.root,forward=a.modelForward.clone().applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));forward.y=0;
  if(forward.lengthSq()<.01)return null;forward.normalize();
  const pos=raw.getWorldPosition(new T.Vector3()),prior=a.contacts[side]?.anchor;
  let anchor=prior||pos.clone();const horizontal=anchor.clone().sub(pos);horizontal.y=0;
  if(horizontal.length()>.20){anchor=pos.clone();return {anchor,corrected:0,error:0}}
  const error=horizontal.dot(forward),y0=pos.y;
  if(Math.abs(error)<.004)return {anchor,corrected:0,error:Math.abs(error)};
  const old=[u.rotation.x,f.rotation.x],eps=.008;
  function set(x){u.rotation.x=old[0]+x;f.rotation.x=old[1]-x;hum.update();root.updateWorldMatrix(true,true);return raw.getWorldPosition(new T.Vector3())}
  const probe=set(eps),slope=probe.clone().sub(pos).dot(forward)/eps;
  let correction=Number.isFinite(slope)&&Math.abs(slope)>.05?clamp(error/slope,-.055,.055)*.65:0;
  // Fade out before toe-off; leave pitch in a safe range and avoid vertical penetration.
  correction*=clamp((.52-phase)/.13,0,1);
  const candidate=set(correction),next=Math.abs(anchor.clone().sub(candidate).dot(forward));
  const floor=ground(candidate.x,candidate.z),oldFloor=ground(pos.x,pos.z);
  if(!Number.isFinite(next)||next>=Math.abs(error)||!Number.isFinite(floor)||!Number.isFinite(oldFloor)||Math.abs((candidate.y-floor)-(y0-oldFloor))>.018||Math.abs(u.rotation.x)>.63||Math.abs(f.rotation.x)>.31){
   set(0);return {anchor,corrected:0,error:Math.abs(error)};
  }
  return {anchor,corrected:Math.abs(correction),error:next};
 }
 // Short running support window: vertical-only, no world-space foot locks.
 function support252(phase,gait,run){const running=gait>=.76||run>.18,limit=running?.28:.56;return {running,active:gait<.10||phase<=limit,weight:running?.065:gait<.10?.42:gait<.42?.22:.10}}
 function apply(T,a,ground,dt,gait,jump,mode){
  if(!ground||jump||!['idle','walk','run'].includes(mode)||dt>.085){reset(a);return null}
  const hum=a.vrm.humanoid,st=a.motion,root=a.root;
  root.updateWorldMatrix(true,true);
  const pos=root.getWorldPosition(new T.Vector3()),rot=root.getWorldQuaternion(new T.Quaternion()),previous=a.contactFrame;
  a.contactFrame={pos:pos.clone(),rot:rot.clone()};
  a.contacts??={};
  if(previous&&(previous.pos.distanceTo(pos)>.12||previous.rot.angleTo(rot)>.20)){a.contacts={};return null}
  const support=support252(0,gait,a.motion?.run||0),w=support.weight,sign=a.legSign||1;
  let planted=0,maxError=0,maxCorrection=0,stanceFeet=0,stanceError=0;
  for(const [side,offset] of [['left',0],['right',Math.PI]]){
   let phase=((st.cycle+offset)/(2*Math.PI)%1+1)%1;
   if(!support252(phase,gait,a.motion?.run||0).active){delete a.contacts[side];continue}
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
    const cap=support.running?.012:.045;correction=clamp(delta*2.2*w,-cap,cap);
    const next=clamp(bend+correction,0,1.10),change=next-bend;
    u.rotation.x-=sign*change*.5;k.rotation.x=sign*next;
    f.rotation.x=sign*clamp(f.rotation.x*sign-change*.5,-.30,.22);
   }
   if(correction){hum.update?.();root.updateWorldMatrix(true,true)}
   const stance=support.running?null:stance119(T,a,side,u,k,f,raw,ground,phase,gait);a.contacts[side]={y:y+sole,...(stance?{anchor:stance.anchor}:{})};if(stance){stanceFeet++;stanceError=Math.max(stanceError,stance.error)}planted++;maxError=Math.max(maxError,Math.abs(y+sole-C.y));maxCorrection=Math.max(maxCorrection,Math.abs(correction));
  }
  return {planted,maxError:Math.round(maxError*1000)/1000,maxCorrection,weight:w,mode:support.running?'running-vertical-support':stanceFeet?'bounded-sagittal-stance':'vertical-only',stanceFeet,stanceError};
 }
 function groundCombat320(T,a,ground,weight,pose){a.idleAnchor1170=null;a.idleGroundWeight=0;let rows=soleContacts(T,a,ground);if(!rows.length)return null;const stable=!pose||pose.kind==='guard'||(pose.kind==='strike'&&pose.progress>.86&&!pose.airborne&&!pose.air323&&pose.combo!==4);if(stable&&rows.length===2&&Math.abs(rows[0].error-rows[1].error)>.012&&Math.abs(rows[0].error-rows[1].error)<.12)rows=balanceIdle(T,a,ground,rows);const root=a.root,delta=clamp(Math.max(...rows.map(r=>r.error))+.001,-.24,.24)*clamp(weight*1.5,0,1);if(!Number.isFinite(delta))return null;if(root.parent){const p=root.getWorldPosition(new T.Vector3());p.y+=delta;root.position.copy(root.parent.worldToLocal(p));}else root.position.y+=delta;root.updateWorldMatrix(true,true);return {mode:'combat-support',balancedRecovery:stable,offset:delta,planted:rows.filter(r=>Math.abs(delta-r.error)<.035).length,maxError:Math.max(...rows.map(r=>Math.abs(delta-r.error)))};}
 const api={groundCombat320,solve,apply,reset,support252,groundIdle,calibrateSoles,soleContacts,stance119};if(typeof module!=='undefined')module.exports=api;else root.WWFootIK=api;
})(typeof globalThis!=='undefined'?globalThis:this);

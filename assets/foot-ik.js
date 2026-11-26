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
  if(a.idleGroundWeight<.005||!ground||jump)return null;
  const root=a.root;let rows=soleContacts(T,a,ground);
  if(allowed&&gait<.035&&a.idleGroundWeight>.92)rows=balanceIdle(T,a,ground,rows);
  if(!rows.length)return null;
  // A small positive clearance avoids visible clipping; use the most penetrating point.
  const clearance=.001,limit=rows.every(r=>r.source==='mesh')?.34:.28;
  const weight=allowed&&gait<.015&&a.idleGroundWeight>.95?1:a.idleGroundWeight;
  const delta=clamp(Math.max(...rows.map(r=>r.error))+clearance,-limit,limit)*weight;
  if(root.parent){const p=root.getWorldPosition(new T.Vector3());p.y+=delta;root.position.copy(root.parent.worldToLocal(p))}else root.position.y+=delta;
  root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);
  const contacts=rows.map(r=>({...r,gap:delta-r.error}));
  return {planted:contacts.filter(r=>Math.abs(r.gap)<.025).length,maxError:Math.max(...contacts.map(r=>Math.abs(r.gap))),offset:delta,weight:a.idleGroundWeight,mode:'grounded-idle',source:contacts.every(r=>r.source==='mesh')?'mesh':'ankle-fallback',contacts};
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
 const api={solve,apply,reset,groundIdle,calibrateSoles,soleContacts};if(typeof module!=='undefined')module.exports=api;else root.WWFootIK=api;
})(typeof globalThis!=='undefined'?globalThis:this);

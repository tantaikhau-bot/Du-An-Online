/* V11.0: authored sagittal gait cycles and distinct avatar motion personalities. */
(function(root){
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const TAU=Math.PI*2;
 // stride, cadence, arm swing, elbow flex, sway, lean, arm spread, bounce
 const rows={
 m1:['Lữ khách',1.00,1.00,.90,.90,.85,1.00,1.00,.95],
 m2:['Kiếm sĩ',1.05,1.08,.98,1.05,.72,1.06,.90,1.00],
 m3:['Phong Vân',.94,1.04,.81,.88,1.03,.88,.85,.89],
 m4:['Hỏa Vũ',1.10,1.10,1.13,1.12,.70,1.16,1.18,1.12],
 m5:['Dạ Hành',1.06,.94,.76,.89,.65,1.09,.85,.76],
 m6:['Băng Kiếm',1.01,.96,.85,1.04,.61,.93,.98,.82],
 m7:['Lâm Vũ',.97,1.02,.95,.84,1.10,.92,1.03,1.05],
 m8:['Thiên Quang',1.08,.91,1.03,.96,.78,.95,1.15,.86],
 m9:['Hắc Phong',1.09,1.05,1.08,1.08,.68,1.18,1.10,.94],
 m10:['Hải Đăng',1.03,.98,.92,1.02,.90,.98,1.06,.91],
 f1:['Nguyệt Hoa',.78,.96,.57,.72,1.12,.70,.57,.72],
 f2:['Lam Ngọc',.89,1.09,.76,.87,.96,.82,.70,.97],
 f3:['Ánh Mai',.81,1.12,.69,.77,1.22,.65,.64,1.02],
 f4:['Tử Vân',.86,.98,.65,.83,1.07,.79,.72,.82],
 f5:['Bạch Linh',.82,.92,.53,.69,1.10,.67,.52,.67],
 f6:['Hồng Liên',.94,1.14,.87,.94,.95,.92,.79,1.13],
 f7:['Thanh Trúc',.80,1.00,.60,.74,1.26,.72,.59,.79],
 f8:['Băng Tâm',.88,.95,.62,.81,.88,.76,.62,.70],
 f9:['Dạ Nguyệt',.85,.91,.56,.86,.92,.84,.55,.65],
 f10:['Kim Vũ',.91,1.06,.80,.91,1.14,.87,.77,.98]};
 const profiles=Object.fromEntries(Object.entries(rows).map(([id,[name,stride,cadence,arms,elbow,sway,lean,spread,bounce]])=>[id,{id,name,stride,cadence,arms,elbow,sway,lean,spread,bounce}]));
 function profile(id){return profiles[id]||profiles.m1}
 function phaseOf(j){if(j?.prep>0)return 'jump_start';if(j?.height>0||j?.velocity>0)return j.velocity>2.5?'jump_takeoff':'jump_air';if(j?.land>0)return 'jump_land';return null}
 function newState(){return {time:0,cycle:0,walk:0,run:0,jump:0,pose:null,state:'idle'}}
 function sample(keys,t){for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){let a=keys[i-1],b=keys[i],k=smooth((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>mix(v,b[j+1],k))}return keys.at(-1).slice(1)}
 // Hip pitch negative=forward, knee flex positive=back, normalized humanoid +Z.
 const WALK=[[0,-.34,.10,-.04],[.12,-.19,.23,-.05],[.38,.14,.12,-.11],[.60,.29,.36,-.23],[.73,.08,.78,-.12],[.88,-.28,.48,.04],[1,-.34,.10,-.04]];
 const RUN=[[0,-.52,.23,.03],[.13,-.27,.43,-.08],[.32,.32,.25,-.20],[.46,.45,.74,-.26],[.64,.02,1.08,-.16],[.83,-.50,.72,.02],[1,-.52,.23,.03]];
 function step(st,dt,gait=0,j={},mode='idle',id='m1'){
  dt=clamp(dt,0,.12);gait=clamp(gait);st.time+=dt;let cfg=profile(id),phase=phaseOf(j);
  const rt=smooth((gait-.66)/.34),wt=smooth(gait/.58)*(1-rt),blend=1-Math.exp(-dt/.12);
  st.walk=mix(st.walk,phase?0:wt,blend);st.run=mix(st.run,phase?0:rt,blend);st.jump=mix(st.jump,phase?1:0,1-Math.exp(-dt/.065));
  const move=clamp(st.walk+st.run),run=st.run/Math.max(.001,move);
  st.cycle=(st.cycle+dt*TAU*mix(1.25,2.05,run)*cfg.cadence*move)%TAU;
  const t=st.time,p=st.cycle,swing=Math.cos(p),counter=Math.sin(p),breath=Math.sin(t*2),shift=Math.sin(t*.85);
  function leg(q){let x=((q/TAU)%1+1)%1,a=sample(WALK,x),b=sample(RUN,x),hip=mix(a[0],b[0],run)*cfg.stride*move,knee=mix(a[1],b[1],run)*move,ankle=mix(a[2],b[2],run)*move;
   return {hip,knee,ankle,arm:-hip*cfg.arms*mix(.90,1.23,run),elbow:.12+mix(.18,.71,run)*cfg.elbow*move+Math.max(0,hip)*.17}}
  let l=leg(p),r=leg(p+Math.PI);
  let v={hipY:(.004*breath+.004*shift)*(1-move)+(.5+.5*Math.cos(p*2))*mix(.012,.035,run)*cfg.bounce*move-.012*run,
   hipX:mix(.012,.065,run)*move*cfg.lean,hipYaw:swing*.045*move,hipRoll:(shift*.012*(1-move)+counter*.025*move)*cfg.sway,
   spineX:mix(.02,.19,run)*move*cfg.lean+breath*.009*(1-move),spineYaw:-swing*.072*move,spineRoll:-counter*.022*move*cfg.sway,
   headX:-.035*run,headY:Math.sin(t*.61)*.09*(1-move),headZ:-shift*.012*(1-move),shoulderY:swing*.025*move,
   armL:l.arm,armR:r.arm,elbowL:l.elbow,elbowR:r.elbow,hipL:l.hip,hipR:r.hip,kneeL:l.knee,kneeR:r.knee,ankleL:l.ankle,ankleR:r.ankle,spread:(.09+.10*run)*cfg.spread};
  if(phase){
   let amount=phase==='jump_start'?smooth(1-(j.prep||0)/.14):phase==='jump_land'?smooth((j.land||0)/.25):0;
   let air=phase==='jump_air',launch=phase==='jump_takeoff',crouch=amount,airFlex=air?.34:launch?.12:0;
   let q={hipY:-.075*crouch,hipX:.055*crouch,hipYaw:0,hipRoll:0,spineX:.16*crouch+.035,spineYaw:0,spineRoll:0,headX:-.06*crouch,headY:0,headZ:0,shoulderY:0,
    armL:(crouch*.36-(air?.30:launch?.48:0))*cfg.arms,armR:(crouch*.36-(air?.26:launch?.43:0))*cfg.arms,elbowL:.18,elbowR:.18,
    hipL:-.35*crouch-airFlex,hipR:-.35*crouch-airFlex*.65,kneeL:.68*crouch+airFlex*1.35,kneeR:.68*crouch+airFlex*.92,ankleL:-.20*crouch-.10*airFlex,ankleR:-.20*crouch-.10*airFlex,spread:.18*cfg.spread};
   for(const k in v)v[k]=mix(v[k],q[k],st.jump);
  }
  // Never let interpolation introduce hyperextension, extreme foot pitch, or thigh inversion.
  for(const k of ['hipL','hipR'])v[k]=clamp(v[k],-.62,.57);
  for(const k of ['kneeL','kneeR'])v[k]=clamp(v[k],0,1.12);
  for(const k of ['ankleL','ankleR'])v[k]=clamp(v[k],-.30,.22);
  if(!st.pose)st.pose={...v};else{let k=1-Math.exp(-dt/.055);for(const key in v)st.pose[key]=mix(st.pose[key],v[key],k)}
  st.state=phase||(mode!=='idle'?mode:st.run>.5?'run':move>.16?'walk':'idle');return st.pose;
 }
 function animalState(previous,speed){return previous==='run'?(speed<1.48?(speed<.10?'idle':'walk'):'run'):previous==='walk'?(speed>1.95?'run':speed<.09?'idle':'walk'):speed>.20?'walk':'idle'}
 function npcLOD(distance,tier=0){if(distance<=(tier===2?9:tier===1?14:20))return {level:0,interval:0};if(distance<=(tier===2?20:32))return {level:1,interval:tier===2?.16:.10};return {level:2,interval:.35}}
 const api={newState,step,phaseOf,npcLOD,profile,profiles,animalState};if(typeof module!=='undefined')module.exports=api;else root.WWMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);

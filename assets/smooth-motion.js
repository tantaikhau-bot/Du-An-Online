/* V11.9: speed-synchronised gait, acceleration and turning, relaxed male motion. */
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
 function newState(){return {time:0,cycle:0,walk:0,run:0,jump:0,pose:null,state:'idle',speed:0,accel:0,turn:0,brake250:0,turnBody250:0,drive250:0}}
 // Periodic Hermite interpolation, with monotone tangents to avoid knee/ankle overshoot.
 function sample(keys,t){
  const n=keys.length-1;
  for(let i=0;i<n;i++)if(t<=keys[i+1][0]){
   const a=keys[i],b=keys[i+1],prev=keys[(i+n-1)%n],next=keys[(i+2)%n],span=b[0]-a[0],u=clamp((t-a[0])/span),u2=u*u,u3=u2*u;
   const pa=i===0?prev[0]-1:prev[0],nb=i+2>=n?next[0]+1:next[0];
   return a.slice(1).map((v,k)=>{
    const j=k+1,w=b[j],d=(w-v)/span,dp=(v-prev[j])/(a[0]-pa),dn=(next[j]-w)/(nb-b[0]);
    const tangent=(x,y)=>x*y>0?2*x*y/(x+y):0;
    const m=tangent(dp,d)*span,r=tangent(d,dn)*span;
    return clamp((2*u3-3*u2+1)*v+(u3-2*u2+u)*m+(-2*u3+3*u2)*w+(u3-u2)*r,Math.min(v,w),Math.max(v,w));
   });
  }return keys[n].slice(1)
 }
 // Hip pitch negative=forward, knee flex positive=back, normalized humanoid +Z.
 const WALK=[[0,-.43,.12,.05],[.13,-.25,.24,-.03],[.36,.15,.10,-.10],[.55,.36,.26,-.24],[.70,.13,.85,-.13],[.86,-.31,.48,.06],[1,-.43,.12,.05]];
 const RUN=[[0,-.57,.25,.06],[.13,-.29,.45,-.09],[.32,.34,.27,-.20],[.47,.49,.78,-.27],[.65,.01,1.10,-.17],[.83,-.54,.70,.03],[1,-.57,.25,.06]];
 // V25.2: early landing compression followed by a longer, smooth recovery.
 function landingEnvelope252(remaining){const p=clamp(1-(Number(remaining)||0)/.34),peak=.24;return p<peak?smooth(p/peak):1-smooth((p-peak)/(1-peak))}
 function step(st,dt,gait=0,j={},mode='idle',id='m1'){
  dt=Number.isFinite(dt)?clamp(dt,0,.35):0;gait=Number.isFinite(gait)?clamp(gait):0;st.time+=dt;let cfg=profile(id),phase=phaseOf(j);
  // V25.0: locomotion follows actual movement when available. Preview and remote fallback retain gait input.
  const grounded= !phase&&['idle','walk','run'].includes(mode),known=grounded&&Number.isFinite(j.speed);
  const raw=known?clamp(j.speed,0,5.5):null;
  const drive=known?gait*smooth(raw/.28):gait;
  st.drive250=mix(st.drive250??drive,drive,1-Math.exp(-dt/(drive>(st.drive250??0)?.075:.105)));
  const effective=grounded?st.drive250:gait,rt=smooth((effective-.66)/.34),wt=smooth(effective/.58)*(1-rt),blend=1-Math.exp(-dt/(effective>.12?.09:.11));
  st.walk=mix(st.walk,phase?0:wt,blend);st.run=mix(st.run,phase?0:rt,blend);st.jump=mix(st.jump,phase?1:0,1-Math.exp(-dt/.065));
  const move=clamp(st.walk+st.run),run=st.run/Math.max(.001,move),male=id.startsWith('m');
  const measured=Number.isFinite(j.speed)?clamp(j.speed,0,5.5):mix(1.65,3.8,run)*move,oldSpeed=st.speed||0;
  st.speed=mix(oldSpeed,measured,1-Math.exp(-dt/.11));st.accel=mix(st.accel||0,clamp((st.speed-oldSpeed)/Math.max(dt,.001),-6,6),1-Math.exp(-dt/.12));st.turn=mix(st.turn||0,clamp(j.turn||0,-3,3),1-Math.exp(-dt/.12));
  const brake=grounded?clamp(-st.accel/5)*clamp((oldSpeed+st.speed)/1.1):0;
  st.brake250=mix(st.brake250||0,brake,1-Math.exp(-dt/(brake>(st.brake250||0)?.075:.16)));
  st.turnBody250=mix(st.turnBody250||0,grounded?clamp(st.turn/3,-1,1)*smooth(st.speed/.45):0,1-Math.exp(-dt/.10));
  const phaseDrive=known?smooth(raw/.18):1;
  st.cycle=(st.cycle+dt*TAU*mix(1.04,1.75,run)*cfg.cadence*move*phaseDrive*clamp(st.speed/Math.max(.35,mix(1.65,3.8,run)*move),.55,1.24))%TAU;
  const t=st.time,p=st.cycle,swing=Math.cos(p),counter=Math.sin(p),breath=Math.sin(t*2.3+.20*Math.sin(t*.73)),shift=Math.sin(t*.68+.32*Math.sin(t*.31)),rest=1-move,idleLean=shift*rest,relax=male?.035:.012,turnLean=clamp(st.turn*.025,-.075,.075)*move,accelLean=clamp(st.accel*.018,-.055,.075)*move;
  function leg(q){let x=((q/TAU)%1+1)%1,a=sample(WALK,x),b=sample(RUN,x),hip=mix(a[0],b[0],run)*cfg.stride*move,knee=mix(a[1],b[1],run)*move,ankle=mix(a[2],b[2],run)*move;
   return {hip,knee,ankle,arm:-hip*cfg.arms*mix(male?1.02:1.17,male?1.20:1.32,run)+Math.sin(q-.65)*.065*move,elbow:.17+mix(.24,.74,run)*cfg.elbow*move+Math.max(0,hip)*.25}}
  let l=leg(p),r=leg(p+Math.PI);
  let v={hipY:(-.018+.003*breath-.004*Math.abs(shift))*rest+(.5+.5*Math.cos(p*2-.4))*mix(.030,.049,run)*cfg.bounce*move-.016*run-.018*st.brake250,hipSide:.030*idleLean*cfg.sway+counter*.014*move,
   hipX:mix(.025,.085,run)*move*cfg.lean+.014*rest+accelLean*.45,hipYaw:swing*.095*move+.044*idleLean,hipRoll:(idleLean*.018+counter*.052*move)*cfg.sway+turnLean*.5,
   spineX:mix(.045,.21,run)*move*cfg.lean+breath*.035*rest+accelLean-.045*st.brake250,spineYaw:-swing*.125*move-.045*idleLean+.045*st.turnBody250,spineRoll:(-counter*.045*move-.040*idleLean)*cfg.sway+turnLean,
   headX:-.045*run+breath*.020*rest+.035*Math.sin(t*.47)*rest,headY:(.13*Math.sin(t*.61)+.04*Math.sin(t*1.37))*rest-swing*.024*move+.085*st.turnBody250,headZ:-idleLean*.041+counter*.015*move-.018*st.turnBody250,shoulderY:swing*.060*move+.025*idleLean+.025*st.turnBody250,
   armL:l.arm+.065*idleLean+.032*breath*rest-relax*rest,armR:r.arm-.055*idleLean-.028*breath*rest+relax*rest,elbowL:l.elbow+.09*rest*(1+shift),elbowR:r.elbow+.075*rest*(1-shift),hipL:l.hip-(.078+.010*shift)*rest,hipR:r.hip-(.078-.010*shift)*rest,kneeL:l.knee+(.156+.020*shift)*rest,kneeR:r.knee+(.156-.020*shift)*rest,ankleL:l.ankle-(.078+.010*shift)*rest,ankleR:r.ankle-(.078-.010*shift)*rest,spread:(.09+.10*run)*cfg.spread};
  if(phase){
   let amount=phase==='jump_start'?smooth(1-(j.prep||0)/.20):phase==='jump_land'?landingEnvelope252(j.land):0;
   let air=phase==='jump_air',launch=phase==='jump_takeoff',crouch=amount,ascend=clamp((j.velocity||0)/4),descend=clamp(-(j.velocity||0)/4),flight=air||launch,airFlex=flight?mix(.08,.39,smooth(1-Math.abs(j.velocity||0)/3.9)):0;
   let q={hipY:-.125*crouch,hipSide:0,hipX:.095*crouch,hipYaw:0,hipRoll:0,spineX:.24*crouch+.035,spineYaw:0,spineRoll:0,headX:-.06*crouch,headY:0,headZ:0,shoulderY:0,
    armL:crouch*.48-(flight?(.27+.65*ascend-.36*descend):0),armR:crouch*.43-(flight?(.20+.57*ascend-.33*descend):0),elbowL:.20+.28*crouch+(flight?.26+.36*ascend+.18*descend:0),elbowR:.20+.25*crouch+(flight?.22+.32*ascend+.20*descend:0),
    hipL:-.46*crouch-airFlex,hipR:-.43*crouch-airFlex*.65,kneeL:.90*crouch+airFlex*1.35,kneeR:.83*crouch+airFlex*.92,ankleL:-.20*crouch-.10*airFlex,ankleR:-.20*crouch-.10*airFlex,spread:flight?.32+.18*ascend+.12*descend:.16+.16*crouch};
   for(const k in v)v[k]=mix(v[k],q[k],st.jump);
  }
  // Never let interpolation introduce hyperextension, extreme foot pitch, or thigh inversion.
  for(const k of ['hipL','hipR'])v[k]=clamp(v[k],-.62,.57);
  for(const k of ['kneeL','kneeR'])v[k]=clamp(v[k],0,1.12);
  for(const k of ['ankleL','ankleR'])v[k]=clamp(v[k],-.30,.22);
  if(!st.pose)st.pose={...v};else{let k=1-Math.exp(-dt/(phase==='jump_land'?.022:.035));for(const key in v)st.pose[key]=mix(st.pose[key],v[key],k)}
  const moving250=st.state==='walk'||st.state==='run'?move>.09:move>.18, running250=st.state==='run'?st.run>.40:st.run>.57;
  st.state=phase||(mode!=='idle'?mode:running250?'run':moving250?'walk':'idle');return st.pose;
 }
 function animalState(previous,speed){return previous==='run'?(speed<1.48?(speed<.10?'idle':'walk'):'run'):previous==='walk'?(speed>1.95?'run':speed<.09?'idle':'walk'):speed>.20?'walk':'idle'}
 function npcLOD(distance,tier=0){if(distance<=(tier===2?9:tier===1?14:20))return {level:0,interval:0};if(distance<=(tier===2?20:32))return {level:1,interval:tier===2?.16:.10};return {level:2,interval:.35}}
 // V13.2: action crossfade and bounded secondary motion, independent of skeleton.
 const ACTIONS132=['sit','ride','dance','duet','wave','bow','cheer','hug','hand','photo','portrait'];
 function actionBlend132(st,mode,dt){
  dt=Number.isFinite(dt)?clamp(dt,0,.35):0;
  const desired=ACTIONS132.includes(mode)?mode:'idle',k=1-Math.exp(-dt/.13);
  st.weights??={};st.clocks255??={};let sum=0;
  for(const id of ACTIONS132){const v=mix(st.weights[id]||0,id===desired?1:0,k);if(v>.0001){st.weights[id]=v;st.clocks255[id]=(st.clocks255[id]||0)+dt;sum+=v}else{delete st.weights[id];delete st.clocks255[id]}}
  if(sum>1)for(const id in st.weights)st.weights[id]/=sum;
  return st.weights;
 }
 // Independent asymmetric blinks and expression weights; no new blendshape assets required.
 function expression132(st,mode,dt,t,seed=0){
  dt=Number.isFinite(dt)?clamp(dt,0,.35):0;t=Number.isFinite(t)?t:0;
  const smiles={happy:.72,smile:.60,wave:.38,cheer:.78,portrait:.38,photo:.50,hug:.52,hand:.36,duet:.46,dance:.40};
  const target={happy:smiles[mode]||0,angry:mode==='angry'?.78:0,surprised:mode==='surprised'?.72:0,relaxed:['idle','sit','ride','bow'].includes(mode)?.18:0};
  st.face??={};const k=1-Math.exp(-dt/.16);
  for(const key of Object.keys(target))st.face[key]=mix(st.face[key]||0,target[key],k);
  const phase=((t+seed*.73+.29*Math.sin(t*.71+seed))%4.9+4.9)%4.9,peak=4.65;
  st.face.blink=phase<peak?smooth(1-(peak-phase)/.085):smooth(1-(phase-peak)/.14);
  return st.face;
 }
 function socialLook255(st,target,dt){
  const k=1-Math.exp(-clamp(Number.isFinite(dt)?dt:0,0,.35)/.14);
  st.yaw=mix(st.yaw||0,clamp(Number.isFinite(target)?target:0,-.38,.38),k);return st.yaw;
 }
 function secondary132(st,dt,gait,turn,wind){
  const k=1-Math.exp(-clamp(dt,0,.35)/.19);st.pitch=mix(st.pitch||0,clamp(gait,0,1)*.6,k);st.roll=mix(st.roll||0,clamp(turn||0,-3,3)*-.16,k);st.wind=mix(st.wind||1,clamp(Number.isFinite(wind)?wind:1,.45,2.8),k);return st;
 }
 const api={newState,step,phaseOf,landingEnvelope252,npcLOD,profile,profiles,animalState,actionBlend132,expression132,socialLook255,secondary132};if(typeof module!=='undefined')module.exports=api;else root.WWMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);

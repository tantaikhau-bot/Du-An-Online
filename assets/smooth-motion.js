/* V11.4: asymmetric living idle, weighted steps and velocity-shaped jump. */
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
 function step(st,dt,gait=0,j={},mode='idle',id='m1'){
  dt=Number.isFinite(dt)?clamp(dt,0,.35):0;gait=Number.isFinite(gait)?clamp(gait):0;st.time+=dt;let cfg=profile(id),phase=phaseOf(j);
  const rt=smooth((gait-.66)/.34),wt=smooth(gait/.58)*(1-rt),blend=1-Math.exp(-dt/(gait>.12?.09:.14));
  st.walk=mix(st.walk,phase?0:wt,blend);st.run=mix(st.run,phase?0:rt,blend);st.jump=mix(st.jump,phase?1:0,1-Math.exp(-dt/.065));
  const move=clamp(st.walk+st.run),run=st.run/Math.max(.001,move);
  st.cycle=(st.cycle+dt*TAU*mix(1.18,1.85,run)*cfg.cadence*move)%TAU;
  const t=st.time,p=st.cycle,swing=Math.cos(p),counter=Math.sin(p),breath=Math.sin(t*2.3+.20*Math.sin(t*.73)),shift=Math.sin(t*.68+.32*Math.sin(t*.31)),rest=1-move,idleLean=shift*rest;
  function leg(q){let x=((q/TAU)%1+1)%1,a=sample(WALK,x),b=sample(RUN,x),hip=mix(a[0],b[0],run)*cfg.stride*move,knee=mix(a[1],b[1],run)*move,ankle=mix(a[2],b[2],run)*move;
   return {hip,knee,ankle,arm:-hip*cfg.arms*mix(1.17,1.32,run)+Math.sin(q-.45)*.045*move,elbow:.14+mix(.20,.74,run)*cfg.elbow*move+Math.max(0,hip)*.22}}
  let l=leg(p),r=leg(p+Math.PI);
  let v={hipY:(.013*breath-.011*Math.abs(shift))*rest+(.5+.5*Math.cos(p*2-.4))*mix(.030,.049,run)*cfg.bounce*move-.016*run,hipSide:.028*idleLean*cfg.sway+counter*.014*move,
   hipX:mix(.025,.085,run)*move*cfg.lean+.014*rest,hipYaw:swing*.095*move+.044*idleLean,hipRoll:(idleLean*.060+counter*.052*move)*cfg.sway,
   spineX:mix(.045,.21,run)*move*cfg.lean+breath*.035*rest,spineYaw:-swing*.125*move-.045*idleLean,spineRoll:(-counter*.045*move-.040*idleLean)*cfg.sway,
   headX:-.045*run+breath*.020*rest+.035*Math.sin(t*.47)*rest,headY:(.18*Math.sin(t*.61)+.05*Math.sin(t*1.37))*rest-swing*.024*move,headZ:-idleLean*.041+counter*.015*move,shoulderY:swing*.060*move+.025*idleLean,
   armL:l.arm+.043*idleLean+.025*breath*rest,armR:r.arm-.032*idleLean-.020*breath*rest,elbowL:l.elbow+.055*rest*(1+shift),elbowR:r.elbow+.045*rest*(1-shift),hipL:l.hip-.038*rest*(1+shift),hipR:r.hip-.038*rest*(1-shift),kneeL:l.knee+.060*rest*(1+shift),kneeR:r.knee+.060*rest*(1-shift),ankleL:l.ankle-.022*rest*(1+shift),ankleR:r.ankle-.022*rest*(1-shift),spread:(.09+.10*run)*cfg.spread};
  if(phase){
   let amount=phase==='jump_start'?smooth(1-(j.prep||0)/.20):phase==='jump_land'?Math.sin(Math.PI*clamp((j.land||0)/.34))**.85:0;
   let air=phase==='jump_air',launch=phase==='jump_takeoff',crouch=amount,airFlex=air?mix(.13,.39,smooth(1-Math.abs(j.velocity||0)/3.9)):launch?.08:0;
   let q={hipY:-.115*crouch,hipSide:0,hipX:.080*crouch,hipYaw:0,hipRoll:0,spineX:.24*crouch+.035,spineYaw:0,spineRoll:0,headX:-.06*crouch,headY:0,headZ:0,shoulderY:0,
    armL:(crouch*.36-(air?.30:launch?.48:0))*cfg.arms,armR:(crouch*.36-(air?.26:launch?.43:0))*cfg.arms,elbowL:.18+.28*crouch+(air?.22:0),elbowR:.18+.28*crouch+(air?.22:0),
    hipL:-.46*crouch-airFlex,hipR:-.43*crouch-airFlex*.65,kneeL:.90*crouch+airFlex*1.35,kneeR:.83*crouch+airFlex*.92,ankleL:-.20*crouch-.10*airFlex,ankleR:-.20*crouch-.10*airFlex,spread:.18*cfg.spread};
   for(const k in v)v[k]=mix(v[k],q[k],st.jump);
  }
  // Never let interpolation introduce hyperextension, extreme foot pitch, or thigh inversion.
  for(const k of ['hipL','hipR'])v[k]=clamp(v[k],-.62,.57);
  for(const k of ['kneeL','kneeR'])v[k]=clamp(v[k],0,1.12);
  for(const k of ['ankleL','ankleR'])v[k]=clamp(v[k],-.30,.22);
  if(!st.pose)st.pose={...v};else{let k=1-Math.exp(-dt/.035);for(const key in v)st.pose[key]=mix(st.pose[key],v[key],k)}
  st.state=phase||(mode!=='idle'?mode:st.run>.5?'run':move>.16?'walk':'idle');return st.pose;
 }
 function animalState(previous,speed){return previous==='run'?(speed<1.48?(speed<.10?'idle':'walk'):'run'):previous==='walk'?(speed>1.95?'run':speed<.09?'idle':'walk'):speed>.20?'walk':'idle'}
 function npcLOD(distance,tier=0){if(distance<=(tier===2?9:tier===1?14:20))return {level:0,interval:0};if(distance<=(tier===2?20:32))return {level:1,interval:tier===2?.16:.10};return {level:2,interval:.35}}
 const api={newState,step,phaseOf,npcLOD,profile,profiles,animalState};if(typeof module!=='undefined')module.exports=api;else root.WWMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);

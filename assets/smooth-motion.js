/* Authored locomotion curves, no imported mocap. All angular values radians. */
(function(root){
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const TAU=Math.PI*2;
 function phaseOf(j){if(j?.prep>0)return 'jump_start';if(j?.height>0||j?.velocity>0)return j.velocity>2.5?'jump_takeoff':'jump_air';if(j?.land>0)return 'jump_land';return null}
 function newState(){return {time:0,cycle:0,walk:0,run:0,jump:0,pose:null,state:'idle'}}
 function step(st,dt,gait=0,j={},mode='idle'){
  dt=clamp(dt,0,.10);gait=clamp(gait);st.time+=dt;
  const runTarget=smooth((gait-.66)/.34),walkTarget=smooth(gait/.58)*(1-runTarget),phase=phaseOf(j),active=!!phase;
  const blend=1-Math.exp(-dt/ .105);st.walk=mix(st.walk,active?0:walkTarget,blend);st.run=mix(st.run,active?0:runTarget,blend);st.jump=mix(st.jump,active?1:0,1-Math.exp(-dt/.045));
  const move=clamp(st.walk+st.run),run=st.run/Math.max(.001,move),cycleRate=mix(1.55,2.55,run);
  st.cycle=(st.cycle+dt*TAU*cycleRate*Math.max(.15,move))%TAU;
  const t=st.time,p=st.cycle,breathe=Math.sin(t*2.15),shift=Math.sin(t*.95),swing=Math.sin(p),counter=Math.cos(p);
  const leg=(q)=>{let s=Math.sin(q),lift=Math.max(0,Math.cos(q));return {hip:s*mix(.46,.82,run)*move,knee:(.10+lift*mix(.68,1.30,run))*move,ankle:(-.14*s-.28*lift)*move,arm:-s*mix(.38,.80,run)*move,elbow:mix(.13,.88,run)*move+Math.max(0,-s)*.28*move}};
  let l=leg(p),r=leg(p+Math.PI);
  let v={hipY:(.008*breathe+.007*shift)*(1-move)+(.5+.5*Math.cos(p*2))*mix(.022,.055,run)*move-.025*run,
   hipX:mix(.025,.13,run)*move,hipYaw:swing*.095*move,hipRoll:shift*.024*(1-move)+counter*.045*move,
   spineX:mix(.025,.20,run)*move+breathe*.014*(1-move),spineYaw:-swing*.12*move,spineRoll:-counter*.035*move-shift*.015*(1-move),
   headX:-.07*run+Math.sin(p*2)*.018*move,headY:Math.sin(t*.63)*.11*(1-move),headZ:-shift*.018*(1-move),
   shoulderY:swing*.04*move,armL:l.arm,armR:r.arm,elbowL:l.elbow+.10,elbowR:r.elbow+.10,
   hipL:l.hip,hipR:r.hip,kneeL:l.knee,kneeR:r.knee,ankleL:l.ankle,ankleR:r.ankle,spread:.13+.08*run};
  if(phase){
   let amount=phase==='jump_start'?smooth(1-(j.prep||0)/.14):phase==='jump_land'?smooth((j.land||0)/.25):phase==='jump_takeoff'?.45:.65;
   const crouch=phase==='jump_start'||phase==='jump_land',air=phase==='jump_air',q={
    hipY:crouch?-.15*amount:0,hipX:crouch?.16*amount:.08,hipYaw:0,hipRoll:0,spineX:crouch?.26*amount:.10,spineYaw:0,spineRoll:0,headX:crouch?-.12*amount:0,headY:0,headZ:0,shoulderY:0,
    armL:crouch?.55*amount:-.55,armR:crouch?.55*amount:-.48,elbowL:.28,elbowR:.28,
    hipL:crouch?-.60*amount:air?-.48:-.15,hipR:crouch?-.60*amount:air?-.22:-.15,kneeL:crouch?1.12*amount:air?.72:.22,kneeR:crouch?1.12*amount:air?.43:.22,ankleL:crouch?-.40*amount:-.10,ankleR:crouch?-.40*amount:-.10,spread:air?.35:.19};
   for(const k in v)v[k]=mix(v[k],q[k],st.jump);
  }
  if(!st.pose)st.pose={...v};else{let k=1-Math.exp(-dt/.045);for(const key in v)st.pose[key]=mix(st.pose[key],v[key],k)}
  st.state=phase||(mode!=='idle'?mode:st.run>.5?'run':move>.16?'walk':'idle');return st.pose;
 }
 function npcLOD(distance,tier=0){if(distance<=(tier===2?9:tier===1?14:20))return {level:0,interval:0};if(distance<=(tier===2?20:32))return {level:1,interval:tier===2?.16:.10};return {level:2,interval:.35}}
 const api={newState,step,phaseOf,npcLOD};if(typeof module!=='undefined')module.exports=api;else root.WWMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);

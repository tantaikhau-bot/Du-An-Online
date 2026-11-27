/* V11.7: skinned VRM avatar pipeline. CC0 VRoid sample models, not original game artwork. */
(function(){
 const sources={male:'Sakurada_Fumiriya',female:'Sendagaya_Shino',male2:'HairSample_Male',female2:'HairSample_Female',female3:'Sendagaya_Shibu',female4:'Vivi'};
 const roster=[
 {id:'m1',gender:'male',name:'Lữ khách',source:'male',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'m2',gender:'male',name:'Kiếm sĩ',source:'male2',hair:0x3c4259,cloth:0x7395d9,height:1.06},
 {id:'m3',gender:'male',name:'Phong Vân',source:'male',hair:0xb8c6e5,cloth:0x80bdad,height:1.03},
 {id:'m4',gender:'male',name:'Hỏa Vũ',source:'male2',hair:0xc37c50,cloth:0xd19b76,height:.97},
 {id:'m5',gender:'male',name:'Dạ Hành',source:'male',hair:0x57556e,cloth:0x717bba,height:1.08},
 {id:'f1',gender:'female',name:'Nguyệt Hoa',source:'female',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'f2',gender:'female',name:'Lam Ngọc',source:'female2',hair:0x7a9bd8,cloth:0x89c4e5,height:1.02},
 {id:'f3',gender:'female',name:'Ánh Mai',source:'female4',hair:0xe9b66c,cloth:0xe4c17c,height:.96},
 {id:'f4',gender:'female',name:'Tử Vân',source:'female3',hair:0xb799da,cloth:0xbaa3d8,height:1.04},
 {id:'f5',gender:'female',name:'Bạch Linh',source:'female',hair:0xd0e0ee,cloth:0x93c4bd,height:1.06},
 {"id":"m6","gender":"male","name":"Băng Kiếm","source":"male2","hair":10337752,"cloth":10012120,"height":1.05},
 {"id":"m7","gender":"male","name":"Lâm Vũ","source":"male","hair":6707015,"cloth":9088629,"height":1.01},
 {"id":"m8","gender":"male","name":"Thiên Quang","source":"male2","hair":14992530,"cloth":14996909,"height":1.09},
 {"id":"m9","gender":"male","name":"Hắc Phong","source":"male","hair":3881288,"cloth":8551569,"height":0.99},
 {"id":"m10","gender":"male","name":"Hải Đăng","source":"male2","hair":8303542,"cloth":8497100,"height":1.04},
 {"id":"f6","gender":"female","name":"Hồng Liên","source":"female2","hair":14385804,"cloth":14261167,"height":0.99},
 {"id":"f7","gender":"female","name":"Thanh Trúc","source":"female4","hair":8101509,"cloth":10148279,"height":1.03},
 {"id":"f8","gender":"female","name":"Băng Tâm","source":"female2","hair":13229286,"cloth":11196399,"height":1.07},
 {"id":"f9","gender":"female","name":"Dạ Nguyệt","source":"female3","hair":5854323,"cloth":9207995,"height":1.01},
 {"id":"f10","gender":"female","name":"Kim Vũ","source":"female2","hair":14992257,"cloth":15126948,"height":0.97}
 ];
 function preset(id,gender='male'){return roster.find(p=>p.id===id)||roster.find(p=>p.gender===gender)||roster[0]}
 function heightFactor(p){return p.height*(p.gender==='female'?.92:1)}
 function applyPreset(T,a,p){
  if(a.applied===p.id)return;
  a.root.scale.setScalar(a.baseScale*heightFactor(p));
  for(const {material,base,role} of a.colors){material.color.copy(base);if(role==='hair')material.color.multiply(new T.Color(p.hair));else if(role==='cloth')material.color.multiply(new T.Color(p.cloth))}
  if(a.vrm&&!a.original&&typeof WWIdentity!=='undefined'){try{a.vrm.humanoid.resetNormalizedPose?.();a.vrm.humanoid.update();WWIdentity.apply(T,a,p)}catch(e){WWIdentity.clear(a);console.warn('Optional wearable fallback',e)}}
  a.applied=p.id;a.motionProfile=p.id;a.lastDiagnostic140=undefined;a.rawDiagnostics140=null;a.action132={};a.secondary132={};if(a.fingers163)for(const side of ['left','right'])for(const f of a.fingers163[side]){f.node.quaternion.copy(f.rest);f.curl=0;f.spread=0}a.idleGroundWeight=0;a.idleAnchor1170=null;a.contacts={};a.contactFrame=null;if(typeof WWMotion!=='undefined')a.motion=WWMotion.newState();
 }
 const remote='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/';
 let lib;
 // Bounded LRU of compressed source bytes. In-flight requests are deduplicated, never cancelled by eviction.
 function createBufferCache140(fetcher,maxBytes,maxEntries){
  const entries=new Map();
  function trim(){let bytes=0,count=0;for(const e of entries.values())if(e.size!==null){bytes+=e.size;count++}
   for(const [key,e] of entries){if(bytes<=maxBytes&&count<=maxEntries)break;if(e.size===null)continue;entries.delete(key);bytes-=e.size;count--}}
  function get(key){let e=entries.get(key);if(e){entries.delete(key);entries.set(key,e);return e.promise}
   e={size:null,promise:null};entries.set(key,e);
   e.promise=Promise.resolve().then(()=>fetcher(key)).then(data=>{e.size=data.byteLength;trim();return data},err=>{if(entries.get(key)===e)entries.delete(key);throw err});return e.promise
  }
  return {get,stats:()=>({entries:entries.size,bytes:[...entries.values()].reduce((n,e)=>n+(e.size||0),0),pending:[...entries.values()].filter(e=>e.size===null).length})}
 }
 const mobile140=typeof window!=='undefined'&&(window.matchMedia('(pointer:coarse)').matches||Math.min(screen.width,screen.height)<700);
 const buffers=createBufferCache140(async kind=>{const r=await fetch('/assets/'+sources[kind]+'.vrm',typeof AbortSignal.timeout==='function'?{signal:AbortSignal.timeout(25000)}:{});if(!r.ok)throw Error('VRM HTTP '+r.status);return r.arrayBuffer()},(mobile140?24:80)*1024*1024,mobile140?3:6);
 function modelBuffer(kind){return buffers.get(kind)}

 async function load(T,kind){try{return await loadBase(T,kind)}catch(e){if(kind==='female3'||kind==='female4'){console.warn('Optional avatar base fallback',kind,e);const a=await loadBase(T,kind==='female3'?'female2':'female');a.fallbackBase=kind;return a}throw e}}
 async function loadBase(T,kind){
  lib??=Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('/assets/three-vrm.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js'))]);
  let modules;try{modules=await lib}catch(e){lib=null;throw e}const [{GLTFLoader},{VRMLoaderPlugin,VRMUtils}]=modules;
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
  let gltf;
  gltf=await loader.parseAsync(await modelBuffer(kind),'/assets/');
  const vrm=gltf.userData.vrm;if(!vrm?.humanoid)throw Error('Invalid VRM');
  VRMUtils.rotateVRM0(vrm);VRMUtils.removeUnnecessaryVertices(vrm.scene);VRMUtils.removeUnnecessaryJoints(vrm.scene);
  vrm.humanoid.update();vrm.scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(vrm.scene,true),size=box.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<.5||size.y>5)throw Error('Invalid avatar scale');
  const root=new T.Group();root.add(vrm.scene);root.rotation.y=Math.PI;root.scale.setScalar(1.68/size.y);vrm.scene.position.y-=box.min.y;
  vrm.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false}});
  const armDown={};for(const side of ['left','right']){const lower=vrm.humanoid.getNormalizedBoneNode(side+'LowerArm');armDown[side]=lower&&Math.abs(lower.position.x)>.01?-Math.sign(lower.position.x):(side==='left'?1:-1)}
  const colors=[],seen=new Set();vrm.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m?.color||seen.has(m))continue;seen.add(m);const n=(m.name||'').toLowerCase();const role=/hair/.test(n)?'hair':/skin|face|body|eye|mouth|teeth|brow|lash/.test(n)?'skin':'cloth';colors.push({material:m,base:m.color.clone(),role})}});
  vrm.humanoid.update();root.updateMatrixWorld(true);
  // VRM0 and VRM1 may have opposite normalized local forward axes. Read toe direction in rest pose.
  let legSign=1;for(const side of ['left','right']){let toe=vrm.humanoid.getNormalizedBoneNode(side+'Toes');if(toe&&Math.abs(toe.position.z)>.015){legSign=Math.sign(toe.position.z);break}}
  let modelForward=new T.Vector3(0,0,1);
  for(const side of ['left','right']){const foot=vrm.humanoid.getRawBoneNode(side+'Foot'),toe=vrm.humanoid.getRawBoneNode(side+'Toes');if(foot&&toe){const d=root.worldToLocal(toe.getWorldPosition(new T.Vector3())).sub(root.worldToLocal(foot.getWorldPosition(new T.Vector3())));d.y=0;if(d.length()>.015){modelForward=d.normalize();break}}}
  const soleHeight=Object.fromEntries(['left','right'].map(side=>{let n=vrm.humanoid.getRawBoneNode(side+'Foot');return [side,n?Math.max(.015,Math.min(.24,n.getWorldPosition(new T.Vector3()).y)):.06]}));
  const a={root,vrm,kind,phase:0,weight:0,elapsed:0,baseScale:root.scale.x,colors,armDown,legSign,modelForward,motionProfile:kind.startsWith('female')?'f1':'m1',motion:WWMotion.newState(),hipsRest:vrm.humanoid.getNormalizedBoneNode('hips')?.position.clone(),springReady:false,T,dispose:()=>VRMUtils.deepDispose(vrm.scene),soleHeight};
  try{WWFootIK.calibrateSoles(T,a)}catch(e){console.warn('Sole calibration fallback',e);a.soleSamples=null}return a;
 }
 // V16.3: normalized VRM finger joints, independent per hand with eased transitions.
 const digits163=['Index','Middle','Ring','Little'];
 function fingerTargets163(mode,gait,jump,time,side,turn=0){
  const clamp=(x,l=0,h=1)=>Math.max(l,Math.min(h,x)),g=clamp(Number(gait)||0),j=clamp(Number(jump)||0),t=Number(time)||0;
  let grip=.24+.17*g+.12*j,spread=.025;
  if(mode==='ride'){grip=.83+.035*Math.sin(t*3+(side==='left'?.4:1.1))+.04*clamp(Math.abs(turn));spread=.008}
  else if(mode==='wave'||mode==='cheer'){grip=mode==='wave'&&side==='left'?.28:.09;spread=.065}
  else if(mode==='hand'||mode==='hug')grip=.40;
  else if(mode==='dance'||mode==='duet')grip=.17+.09*Math.sin(t*3);
  else if(mode==='sit')grip=.22;
  const result={};for(let i=0;i<4;i++){const digit=digits163[i],k=clamp(grip+(i-1.5)*.045);result[digit+'Proximal']=[k*.98,spread*(i-1.5)];result[digit+'Intermediate']=[k*1.25,0];result[digit+'Distal']=[k*.70,0]}
  result.ThumbMetacarpal=[grip*.34,grip*.20];result.ThumbProximal=[grip*.54,0];result.ThumbDistal=[grip*.42,0];return result
 }
 function setupFingers163(a){
  const {T,vrm}=a,h=vrm.humanoid,out={left:[],right:[]};
  for(const side of ['left','right']){
   const get=name=>h.getNormalizedBoneNode(side+name),index=get('IndexProximal'),little=get('LittleProximal'),middle=get('MiddleProximal'),next=get('MiddleIntermediate');
   let palm=new T.Vector3(0,-1,0);
   if(index&&little&&middle&&next){const direction=next.position.clone().normalize(),across=index.position.clone().sub(little.position).normalize(),n=new T.Vector3().crossVectors(direction,across).normalize();if(n.lengthSq()>.5){if(n.dot(palm)<0)n.negate();if(Math.abs(n.dot(palm))>.25)palm.copy(n)}}
   const names=Object.keys(fingerTargets163('idle',0,0,0,side));
   for(const name of names){const node=get(name);if(!node)continue;const follow=name.endsWith('Proximal')?name.replace('Proximal','Intermediate'):name.endsWith('Intermediate')?name.replace('Intermediate','Distal'):name==='ThumbMetacarpal'?'ThumbProximal':name==='ThumbProximal'?'ThumbDistal':null;
    let d=follow&&get(follow)?get(follow).position.clone():node.position.clone();if(name==='ThumbProximal'&&get('ThumbDistal'))d=get('ThumbDistal').position.clone();if(d.lengthSq()<1e-7)d.set(side==='left'?1:-1,0,0);d.normalize();
    let inward=palm.clone();if(name.startsWith('Thumb')&&middle){const across=middle.position.clone().sub(get('ThumbMetacarpal')?.position||new T.Vector3());if(across.lengthSq()>.00001)inward.lerp(across.normalize(),.38)}
    const axis=new T.Vector3().crossVectors(d,inward);if(axis.lengthSq()<1e-6)axis.set(0,0,side==='left'?-1:1);axis.normalize();out[side].push({name,node,axis,spreadAxis:palm.clone(),rest:node.quaternion.clone(),curl:0,spread:0})
   }
  }return out
 }
 function animateFingers163(a,dt,mode,gait,jump,time,turn){
  a.fingers163??=setupFingers163(a);const {T}=a,alpha=1-Math.exp(-Math.max(0,Math.min(.1,dt))* (mode==='ride'?12:8));let count=0,grip=0;const rot=a.fingerQuat163??=new T.Quaternion();
  for(const side of ['left','right']){const target=fingerTargets163(mode,gait,jump,time,side,turn);for(const f of a.fingers163[side]){const [curl,spread]=target[f.name];f.curl+=(curl-f.curl)*alpha;f.spread+=(spread-f.spread)*alpha;f.node.quaternion.copy(f.rest).multiply(rot.setFromAxisAngle(f.spreadAxis,f.spread)).multiply(rot.setFromAxisAngle(f.axis,f.curl));count++;grip+=f.curl}}
  return {joints:count,meanCurl:count?grip/count:0,mode}
 }

 function animate(a,dt,gait,mode='idle',jump=0,detail=0,ground=null){
  const {vrm}=a;if(a.idleOffset1170){a.root.position.x-=a.idleOffset1170.x;a.root.position.z-=a.idleOffset1170.z;a.idleOffset1170=null}dt=Math.min(.35,Math.max(0,dt));a.elapsed+=dt;a.motion??=WWMotion.newState();let j=typeof jump==='object'?jump:{height:jump,velocity:0},v=WWMotion.step(a.motion,dt,gait,j,mode,a.motionProfile),t=a.elapsed;
  a.weight=a.motion.walk+a.motion.run;const settle=mode==='idle'&&!WWMotion.phaseOf(j)?Math.max(0,1-(a.weight+a.motion.jump)*5):0;
  if(settle>0){v={...v};const blend=(x,y)=>x+(y-x)*settle;v.hipSide=blend(v.hipSide,0);v.hipYaw=blend(v.hipYaw,0);v.hipRoll=blend(v.hipRoll,0);v.hipX=blend(v.hipX,.012);v.hipY=blend(v.hipY,-.022);for(const side of ['L','R']){v['hip'+side]=blend(v['hip'+side],-.11);v['knee'+side]=blend(v['knee'+side],.22);v['ankle'+side]=blend(v['ankle'+side],-.11)}}
  function bone(name,x=0,y=0,z=0){let b=vrm.humanoid.getNormalizedBoneNode(name);if(b)b.rotation.set(x,y,z)}
  const left=a.armDown?.left??1,right=a.armDown?.right??-1,sign=a.legSign||1;
  const hips=vrm.humanoid.getNormalizedBoneNode('hips');if(hips&&a.hipsRest){hips.position.copy(a.hipsRest);hips.position.y+=v.hipY;hips.position.x+=v.hipSide||0}
  bone('hips',sign*v.hipX,v.hipYaw,v.hipRoll);bone('spine',sign*v.spineX,v.spineYaw,v.spineRoll);bone('chest',sign*v.spineX*.3,-v.shoulderY,v.spineRoll*.3);
  bone('leftShoulder',0,v.shoulderY,0);bone('rightShoulder',0,-v.shoulderY,0);
  bone('leftUpperArm',sign*v.armL,0,left*(Math.PI/2-v.spread));bone('rightUpperArm',sign*v.armR,0,right*(Math.PI/2-v.spread));
  bone('leftLowerArm',-sign*v.elbowL,0,0);bone('rightLowerArm',-sign*v.elbowR,0,0);
  bone('leftUpperLeg',sign*v.hipL);bone('rightUpperLeg',sign*v.hipR);
  bone('leftLowerLeg',sign*v.kneeL);bone('rightLowerLeg',sign*v.kneeR);bone('leftFoot',sign*v.ankleL);bone('rightFoot',sign*v.ankleR);
  // Distribute head motion over neck and head; counter the chest without snapping.
  const neck=vrm.humanoid.getNormalizedBoneNode('neck');
  if(neck){bone('neck',sign*v.headX*.35,v.headY*.30,v.headZ*.35);bone('head',sign*v.headX*.65,v.headY*.70,v.headZ*.65)}else bone('head',sign*v.headX,v.headY,v.headZ);
  bone('upperChest',sign*v.spineX*.09,-v.shoulderY*.30,v.spineRoll*.18);
  // Locomotion stays on the established arm solver. Blend action targets over its output.
  WWArms.apply(a,v);
  for(const side of ['left','right']){const hand=vrm.humanoid.getNormalizedBoneNode(side+'Hand');if(hand){const jolt=a.motion.jump||0;hand.rotation.z=(side==='left'?1:-1)*(Math.sin(t*1.8)*.045*(1-a.weight)+.08*jolt);hand.rotation.x=-.09*jolt*Math.max(0,Math.min(1,(j.velocity||0)/4));}}
  a.action132??={};const weights=WWMotion.actionBlend132(a.action132,WWMotion.phaseOf(j)?'idle':mode,dt);
  function overlay(name,x,y,z,w){if(!w)return;const b=vrm.humanoid.getNormalizedBoneNode(name);if(b){b.rotation.x+=(x-b.rotation.x)*w;b.rotation.y+=(y-b.rotation.y)*w;b.rotation.z+=(z-b.rotation.z)*w}}
  const sitting=(weights.sit||0)+(weights.ride||0),dancing=(weights.dance||0)+(weights.duet||0);
  if(sitting){for(const side of ['left','right']){overlay(side+'UpperLeg',-sign*1.1,0,0,sitting);overlay(side+'LowerLeg',sign*1.2,0,0,sitting);overlay(side+'UpperArm',-.35,0,(side==='left'?left:right)*1.25,sitting)}}
  // V14.9: independent pelvis, lumbar, chest and head response. Keep contact targets in the mount solver.
  if(j.mountHorse&&mode==='ride'){
   const phase=Number(j.mountPhase)||0,state=j.mountState||'ride_idle',blend=Math.max(0,Math.min(1,j.mountBlend??1)),gait=Math.max(0,Math.min(1,Number(j.mountGait)||0));
   // forward lean, pelvic pitch/roll, lumbar response, chest response, thigh/knee/elbow targets
   const poses={ride_idle:[.025,.025,.012,.025,.015,.66,.86,.72],ride_walk:[.055,.11,.055,.085,.06,.69,.89,.76],ride_trot:[.12,.19,.075,.14,.10,.76,.96,.79],ride_gallop:[.29,.24,.095,.19,.13,.88,1.04,.88],mount_start:[.20,.04,.03,.06,.03,.75,.94,.76],dismount:[.18,.04,.03,.06,.03,.72,.91,.74]};
   const target=poses[state]||poses.ride_idle,sm=a.mountMotion149??={pose:target.slice(),pitch:0,roll:0,breath:0};const alpha=1-Math.exp(-dt*7);
   sm.pose=sm.pose.map((x,i)=>x+(target[i]-x)*alpha);const m=sm.pose;
   const p=Math.sin(phase),p2=Math.sin(phase*2-.35),turn=Math.max(-1,Math.min(1,Number(j.turn)||0));
   const pelvisPitch=p*m[1]*gait,pelvisRoll=Math.cos(phase)*m[2]*gait;
   sm.pitch+=(pelvisPitch-sm.pitch)*(1-Math.exp(-dt*13));sm.roll+=(pelvisRoll-sm.roll)*(1-Math.exp(-dt*11));
   const breath=Math.sin(t*2.1)*.016*(1-gait*.6),lumbar=-sm.pitch*.62+Math.sin(phase-.55)*m[3]*gait,chest=-lumbar*.45+Math.sin(phase*2-.8)*m[4]*gait*.45;
   overlay('hips',sign*(sm.pitch-.025)*blend,Math.sin(phase)*.045*gait,sm.roll*blend,1);
   overlay('spine',sign*(m[0]*blend+lumbar+breath),-turn*.055,-sm.roll*.7+turn*.06,1);
   overlay('chest',sign*(chest+breath*.8),turn*.04,-sm.roll*.25,1);
   overlay('upperChest',-sign*chest*.35,0,sm.roll*.12,1);
   overlay('neck',-sign*(lumbar+chest)*.32,turn*.045,sm.roll*.1,1);
   overlay('head',-sign*(lumbar+chest)*.42,turn*.08,sm.roll*.25,1);
   for(const side of ['left','right']){const lateral=side==='left'?1:-1,down=side==='left'?left:right,shift=Math.sin(phase+lateral*.4)*gait;
    overlay(side+'UpperLeg',-sign*(m[5]+.045*shift)*blend,0,lateral*.65*blend,1);
    overlay(side+'LowerLeg',sign*(m[6]+.065*p2*gait)*blend,0,0,1);
    overlay(side+'UpperArm',-sign*(.50+m[0]*.75+.065*shift)*blend,0,down*(1.30+.045*shift)*blend,1);
    overlay(side+'LowerArm',-sign*(m[7]+.12*p2*gait+breath)*blend,0,0,1);
    overlay(side+'Hand',sign*.045*shift,0,lateral*.035*shift,1);
    overlay(side+'Foot',-sign*(.08+.065*p2*gait),0,0,1)
   }
   if(state==='mount_start'||state==='dismount'){overlay('rightUpperLeg',-sign*(.5+Math.sin(Math.PI*blend)*.85),0,-Math.sin(Math.PI*blend)*.8,1);overlay('spine',sign*(.15+.28*Math.sin(Math.PI*blend)),0,.12*Math.sin(Math.PI*blend),1)}
  }else a.mountMotion149=null;
  if(dancing){overlay('leftUpperArm',Math.sin(t*4)*.4,0,left*.85,dancing);overlay('rightUpperArm',-Math.sin(t*4)*.4,0,right*.85,dancing);overlay('spine',0,Math.sin(t*2)*.15,Math.sin(t*4)*.09,dancing)}
  overlay('rightUpperArm',-.25,0,-right*.25,weights.wave);overlay('rightLowerArm',-.8,0,Math.sin(t*5)*.35,weights.wave);
  overlay('spine',sign*.27,0,0,weights.bow);overlay('head',sign*.12,0,0,weights.bow);
  for(const side of ['left','right']){const down=side==='left'?left:right;
   overlay(side+'UpperArm',-sign*.85,0,down*.45,weights.cheer);overlay(side+'LowerArm',-sign*.65,0,0,weights.cheer);
   overlay(side+'UpperArm',-sign*.70,0,down*1.12,weights.hug);overlay(side+'LowerArm',-sign*.48,0,0,weights.hug);
  }
  overlay('rightUpperArm',-sign*.22,0,right*1.05,weights.hand);
  overlay('rightLowerArm',-sign*.35,0,0,weights.hand);
  overlay('head',-.04,0,.075,(weights.photo||0)+(weights.portrait||0));
  a.secondary132??={};const secondary=WWMotion.secondary132(a.secondary132,dt,a.weight,a.motion.turn,j.wind);
  if(typeof WWIdentity!=='undefined')WWIdentity.animate(a,t,a.weight,secondary);
  const em=vrm.expressionManager,face=WWMotion.expression132(a.action132,mode,dt,t);
  if(em){for(const k of ['happy','angry','surprised','blink'])if(em.getExpression(k))em.setValue(k,face[k])}
  const fingers=animateFingers163(a,dt,mode,a.weight,a.motion.jump,t,j.turn);const airborne=!!(WWMotion.phaseOf(j)||a.motion.jump>.12),offGround=(j.height||0)>.006||(j.velocity||0)>.01;
  if(detail===0&&ground&&!(mode==='idle'&&gait<.15)){vrm.humanoid.update();a.footIK=WWFootIK.apply(a.T,a,ground,dt,gait,airborne,mode)}else{WWFootIK.reset(a);a.footIK=null}
  if(detail===0){for(let remain=dt;remain>0;){let d=Math.min(.033,remain);vrm.update(d);remain-=d}}else{vrm.humanoid.update();vrm.expressionManager?.update();}
  if(detail<=1){const contact=WWFootIK.groundIdle(a.T,a,ground,dt,gait,offGround,mode);if(contact)a.footIK=contact;}
  a.motionState=a.motion.state;a.poseCheck={motionVersion:'16.3',fingers163:fingers,actionWeights:{...weights},secondary:{...secondary},targetHeight:1.68*heightFactor(preset(a.motionProfile)),original:!!a.original,measuredSpeed:a.motion.speed,turn:a.motion.turn,identity:a.identityType||null,fallbackBase:a.fallbackBase||null,cycle:a.motion.cycle,walkWeight:a.motion.walk,runWeight:a.motion.run,profile:a.motionProfile,legSign:sign,hip:[v.hipL,v.hipR],knee:['left','right'].map(side=>(vrm.humanoid.getNormalizedBoneNode(side+'LowerLeg')?.rotation.x||0)*sign),ankle:[v.ankleL,v.ankleR],jumpWeight:a.motion.jump};
  const measure140=!a.diagnosticInterval140||!Number.isFinite(a.lastDiagnostic140)||t-a.lastDiagnostic140>=a.diagnosticInterval140||a.lastMode140!==a.motion.state;const previousRaw140=a.rawDiagnostics140;if(previousRaw140){a.poseCheck.rawArm=previousRaw140.arm;a.poseCheck.rawLeg=previousRaw140.leg}
  if(detail===0&&measure140&&['idle','walk','run'].includes(mode)){a.lastDiagnostic140=t;a.lastMode140=a.motion.state;
   a.root.updateWorldMatrix(true,true);
   const forward=a.modelForward.clone().applyQuaternion(a.root.getWorldQuaternion(new a.T.Quaternion()));
   a.poseCheck.rawArm=WWArms.measure(a);a.poseCheck.rawLeg=['left','right'].map(side=>{
    const get=n=>vrm.humanoid.getRawBoneNode(side+n)?.getWorldPosition(new a.T.Vector3()),A=get('UpperLeg'),B=get('LowerLeg'),C=get('Foot');if(!A||!B||!C)return null;
    const thigh=B.clone().sub(A),shin=C.clone().sub(B),axis=C.clone().sub(A).normalize(),bend=B.clone().sub(A);bend.addScaledVector(axis,-bend.dot(axis));
    return {flex:thigh.angleTo(shin),forward:bend.dot(forward),lateral:bend.clone().addScaledVector(forward,-bend.dot(forward)).length(),thigh:thigh.length(),shin:shin.length()};
   });a.rawDiagnostics140={arm:a.poseCheck.rawArm,leg:a.poseCheck.rawLeg};
  }
  if(measure140&&mode==='idle'&&a.weight<.05&&!WWMotion.phaseOf(j)){vrm.scene.updateMatrixWorld(true);const h=vrm.humanoid.getRawBoneNode('head'),l=vrm.humanoid.getRawBoneNode('leftHand'),r=vrm.humanoid.getRawBoneNode('rightHand'),ls=vrm.humanoid.getRawBoneNode('leftUpperArm'),rs=vrm.humanoid.getRawBoneNode('rightUpperArm');if(h&&l&&r&&ls&&rs){const hy=h.matrixWorld.elements[13];a.handsBelowHead=l.matrixWorld.elements[13]<hy&&r.matrixWorld.elements[13]<hy;a.handsDown=l.matrixWorld.elements[13]<ls.matrixWorld.elements[13]&&r.matrixWorld.elements[13]<rs.matrixWorld.elements[13]}}
 }
 function release(a){if(typeof WWIdentity!=='undefined')WWIdentity.clear(a);a.root.removeFromParent();a.dispose?.();a.contacts={}}
 const api={fingerTargets163,setupFingers163,animateFingers163,load,animate,sources,roster,preset,applyPreset,release,heightFactor,createBufferCache140,bufferStats140:()=>buffers.stats()};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

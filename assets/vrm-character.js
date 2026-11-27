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
 const buffers=createBufferCache140(async kind=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000),limit=40*1024*1024;
  try{const r=await fetch('/assets/'+sources[kind]+'.vrm',{signal:controller.signal});if(!r.ok)throw Error('VRM HTTP '+r.status);
   if(Number(r.headers.get('Content-Length'))>limit)throw Error('VRM size');
   const data=await r.arrayBuffer();if(data.byteLength<20||data.byteLength>limit)throw Error('VRM size');
   const view=new DataView(data);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.byteLength)throw Error('Invalid VRM GLB');return data;
  }finally{clearTimeout(timer)}
 },(mobile140?24:80)*1024*1024,mobile140?3:6);
 function modelBuffer(kind){return buffers.get(kind)}

 async function load(T,kind){try{return await loadBase(T,kind)}catch(e){if(kind==='female3'||kind==='female4'){console.warn('Optional avatar base fallback',kind,e);const a=await loadBase(T,kind==='female3'?'female2':'female');a.fallbackBase=kind;return a}throw e}}
 async function loadBase(T,kind){
  lib??=Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('/assets/three-vrm.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js'))]);
  let modules;try{modules=await lib}catch(e){lib=null;throw e}const [{GLTFLoader},{VRMLoaderPlugin,VRMUtils}]=modules;
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
  let gltf;
  gltf=await loader.parseAsync(await modelBuffer(kind),'/assets/');
  const vrm=gltf.userData.vrm;if(!vrm?.humanoid){if(gltf.scene)VRMUtils.deepDispose(gltf.scene);throw Error('Invalid VRM')}
  VRMUtils.rotateVRM0(vrm);VRMUtils.removeUnnecessaryVertices(vrm.scene);VRMUtils.removeUnnecessaryJoints(vrm.scene);
  vrm.humanoid.update();vrm.scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(vrm.scene,true),size=box.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<.5||size.y>5){VRMUtils.deepDispose(vrm.scene);throw Error('Invalid avatar scale')}
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
  let grip=.15+.16*g+.10*j+.018*Math.sin(t*1.6+(side==='left'?0:.8))*(1-g),spread=.030;
  if(mode==='ride'){grip=.80+.012*Math.sin(t*2+(side==='left'?.4:1.1))+.07*clamp(Math.abs(turn));spread=.009}
  else if(mode==='wave'||mode==='cheer'){grip=mode==='wave'&&side==='left'?.25:.075;spread=mode==='wave'&&side==='left'?.028:.062}
  else if(mode==='hand'||mode==='hug')grip=.40;
  else if(mode==='dance'||mode==='duet')grip=.17+.09*Math.sin(t*3);
  else if(mode==='sit')grip=.22;
  const result={};for(let i=0;i<4;i++){const digit=digits163[i],k=clamp(grip+(i-1.5)*.045);const ride=mode==='ride';result[digit+'Proximal']=[k*(ride?.94:.83),spread*(i-1.5)];result[digit+'Intermediate']=[k*(ride?1.27:1.08),0];result[digit+'Distal']=[k*(ride?.76:.62),0]}
  result.ThumbMetacarpal=[grip*(mode==='ride'?.53:.40),grip*(mode==='ride'?.29:.20)];result.ThumbProximal=[grip*.64,0];result.ThumbDistal=[grip*.47,0];return result
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
 function fingerResponse251(f,curl,spread,dt,mode){
  const seconds=Math.max(0,Math.min(.35,Number.isFinite(dt)?dt:0)),closing=curl>f.curl;
  const rate=(mode==='combatGrip'?22:mode==='ride'?8:6)*(closing?1:.82)*(f.name.endsWith('Distal')?.80:f.name.endsWith('Intermediate')?.91:1);
  f.curl+=(curl-f.curl)*(1-Math.exp(-seconds*rate));f.spread+=(spread-f.spread)*(1-Math.exp(-seconds*5.5));return f;
 }
 // V31.2: grip targets by handle and role, including bow release and support hand.
 function combatGrip312(weapon,side,combat){
  if(!weapon)return null;
  const p=Math.max(0,Math.min(1,Number(combat?.progress)||0)),impact=Math.max(.1,Math.min(.9,combat?.impact??.45)),draw=weapon==='bow'&&side==='right'&&['strike','ultimate'].includes(combat?.kind)&&p<impact;
  if(weapon==='bow'&&side==='right'&&!draw)return null;
  if(side==='left'&&!['bow','dual','great'].includes(weapon))return null;
  const roles={sword:[.82,1.13,.68,.44],dual:[.88,1.17,.73,.46],great:[.72,1.02,.64,.39],staff:[.70,.98,.60,.40],bow:[.71,1.01,.62,.36]};
  const a=draw?[.68,.94,.51,.24]:weapon==='great'&&side==='left'?[.79,1.08,.67,.42]:roles[weapon];if(!a)return null;
  const result={};for(let i=0;i<4;i++){const digit=digits163[i],f=draw&&i===3?.35:draw?1:.96+i*.025;result[digit+'Proximal']=[a[0]*f,.006*(i-1.5)];result[digit+'Intermediate']=[a[1]*f,0];result[digit+'Distal']=[a[2]*f,0]}
  result.ThumbMetacarpal=[a[3],.19];result.ThumbProximal=[a[3]*1.35,0];result.ThumbDistal=[a[3]*.93,0];return result;
 }
 function animateFingers163(a,dt,mode,gait,jump,time,turn,weapon=null,combat=null){
  a.fingers163??=setupFingers163(a);const {T}=a;let count=0,grip=0;const rot=a.fingerQuat163??=new T.Quaternion();
  for(const side of ['left','right']){const grasp=combatGrip312(weapon,side,combat),target=grasp||fingerTargets163(mode,gait,jump,time,side,turn);for(const f of a.fingers163[side]){const [curl,spread]=target[f.name];fingerResponse251(f,curl,spread,dt,grasp?'combatGrip':mode);f.node.quaternion.copy(f.rest).multiply(rot.setFromAxisAngle(f.spreadAxis,f.spread)).multiply(rot.setFromAxisAngle(f.axis,f.curl));count++;grip+=f.curl}}
  return {joints:count,meanCurl:count?grip/count:0,mode}
 }

 function animate(a,dt,gait,mode='idle',jump=0,detail=0,ground=null){
  const {vrm}=a;if(a.idleOffset1170){a.root.position.x-=a.idleOffset1170.x;a.root.position.z-=a.idleOffset1170.z;a.idleOffset1170=null}dt=Number.isFinite(dt)?Math.min(.35,Math.max(0,dt)):0;a.elapsed=(a.elapsed||0)+dt;a.motion??=WWMotion.newState();let j=jump&&typeof jump==='object'?jump:{height:Number.isFinite(jump)?jump:0,velocity:0},v=WWMotion.step(a.motion,dt,gait,j,mode,a.motionProfile),t=a.elapsed;
  a.weight=a.motion.walk+a.motion.run;const settle=mode==='idle'&&!WWMotion.phaseOf(j)?Math.max(0,1-(a.weight+a.motion.jump)*5):0;
  if(settle>0){v={...v};const blend=(x,y)=>x+(y-x)*settle;v.hipSide=blend(v.hipSide,v.hipSide*.22);v.hipYaw=blend(v.hipYaw,v.hipYaw*.35);v.hipRoll=blend(v.hipRoll,v.hipRoll*.30);v.hipX=blend(v.hipX,.012);v.hipY=blend(v.hipY,-.022);for(const side of ['L','R']){v['hip'+side]=blend(v['hip'+side],-.11);v['knee'+side]=blend(v['knee'+side],.22);v['ankle'+side]=blend(v['ankle'+side],-.11)}}
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
  WWArms.apply(a,v,dt);
  // Mild wrist follow-through; riding wrist orientation is still solved by the rein IK.
  a.wrist251??={left:{x:0,y:0,z:0},right:{x:0,y:0,z:0}};
  for(const side of ['left','right']){const hand=vrm.humanoid.getNormalizedBoneNode(side+'Hand');if(hand){const jolt=a.motion.jump||0,sg=side==='left'?1:-1,sm=a.wrist251[side],swing=side==='left'?v.armL:v.armR,walk=Math.min(1,a.weight),k=1-Math.exp(-dt/.075);
   const x=mode==='ride'?0:Math.max(-.13,Math.min(.13,-swing*.13-.09*jolt*Math.max(0,Math.min(1,(j.velocity||0)/4)))),y=mode==='ride'?0:sg*(.035+.035*walk),z=mode==='ride'?0:sg*(Math.sin(t*1.8)*.035*(1-walk)+.06*jolt+.025*walk);
   sm.x+=(x-sm.x)*k;sm.y+=(y-sm.y)*k;sm.z+=(z-sm.z)*k;hand.rotation.set(sm.x,sm.y,sm.z);
  }}
  a.action132??={};const weights=WWMotion.actionBlend132(a.action132,WWMotion.phaseOf(j)?'idle':mode,dt);const socialBlocked256=mode==='ride'||!!WWMotion.phaseOf(j);
  function overlay(name,x,y,z,w){if(!w||!Number.isFinite(w))return;w=Math.max(0,Math.min(1,w));const b=vrm.humanoid.getNormalizedBoneNode(name);if(b){b.rotation.x+=(x-b.rotation.x)*w;b.rotation.y+=(y-b.rotation.y)*w;b.rotation.z+=(z-b.rotation.z)*w}}
  const sitting=WWMotion.phaseOf(j)?0:(weights.sit||0)+(weights.ride||0),dancing=(weights.dance||0)+(weights.duet||0);
  if(sitting){for(const side of ['left','right']){overlay(side+'UpperLeg',-sign*1.1,0,0,sitting);overlay(side+'LowerLeg',sign*1.2,0,0,sitting);overlay(side+'UpperArm',-.35,0,(side==='left'?left:right)*1.25,sitting)}}
  // V14.9: independent pelvis, lumbar, chest and head response. Keep contact targets in the mount solver.
  if(j.mountHorse&&mode==='ride'){
   const phase=Number(j.mountPhase)||0,state=j.mountState||'ride_idle',blend=Math.max(0,Math.min(1,j.mountBlend??1)),gait=Math.max(0,Math.min(1,Number(j.mountGait)||0));
   // forward lean, pelvic pitch/roll, lumbar response, chest response, thigh/knee/elbow targets
   const poses={ride_idle:[.025,.025,.012,.025,.015,.66,.86,.72],ride_walk:[.055,.11,.055,.085,.06,.69,.89,.76],ride_trot:[.12,.19,.075,.14,.10,.76,.96,.79],ride_gallop:[.29,.24,.095,.19,.13,.88,1.04,.88],mount_start:[.20,.04,.03,.06,.03,.75,.94,.76],dismount:[.18,.04,.03,.06,.03,.72,.91,.74]};
   const target=poses[state]||poses.ride_idle,sm=a.mountMotion149??={pose:target.slice(),pitch:0,roll:0,breath:0};const alpha=1-Math.exp(-dt*7);
   sm.pose=sm.pose.map((x,i)=>x+(target[i]-x)*alpha);const m=sm.pose;
   const p=Math.sin(phase),p2=Math.sin(phase*2-.35),turn=Math.max(-1,Math.min(1,Number(j.mountTurn??j.turn)||0)),brake=Math.max(0,Math.min(1,Number(j.mountBrake)||0));
   const pelvisPitch=p*m[1]*gait,pelvisRoll=Math.cos(phase)*m[2]*gait;
   sm.pitch+=(pelvisPitch-sm.pitch)*(1-Math.exp(-dt*13));sm.roll+=(pelvisRoll-sm.roll)*(1-Math.exp(-dt*11));
   const idle=Math.max(0,Math.min(1,Number(j.mountIdle)||0)),scan=(Math.sin(t*.47)*.075+Math.sin(t*.19)*.055)*idle,settle=Math.sin(t*.85)*.018*idle;const breath=Math.sin(t*1.75)*(.016+.018*idle)*(1-gait*.6),lumbar=-sm.pitch*.62+Math.sin(phase-.55)*m[3]*gait,chest=-lumbar*.45+Math.sin(phase*2-.8)*m[4]*gait*.45;
   overlay('hips',sign*(sm.pitch-.025)*blend,Math.sin(phase)*.045*gait,(sm.roll+settle*.4)*blend,1);
   overlay('spine',sign*(m[0]*blend+lumbar+breath-brake*.19),-turn*.12+scan*.20,-sm.roll*.7+turn*.12+settle,1);
   overlay('chest',sign*(chest+breath*.8-brake*.055),turn*.08+scan*.26,-sm.roll*.25+settle*.5,1);
   overlay('upperChest',-sign*chest*.35,0,sm.roll*.12,1);
   overlay('neck',-sign*(lumbar+chest)*.32,turn*.045+scan*.40,sm.roll*.1+settle*.35,1);
   overlay('head',-sign*(lumbar+chest)*.42,turn*.08+scan,sm.roll*.25+settle*.6,1);
   for(const side of ['left','right']){const lateral=side==='left'?1:-1,down=side==='left'?left:right,shift=Math.sin(phase+lateral*.4)*gait+Math.sin(t*1.13+lateral*.5)*.09*idle;
    overlay(side+'UpperLeg',-sign*(m[5]+.045*shift)*blend,0,lateral*.65*blend,1);
    overlay(side+'LowerLeg',sign*(m[6]+.065*p2*gait)*blend,0,0,1);
    overlay(side+'UpperArm',-sign*(.50+m[0]*.75+.065*shift)*blend,0,down*(1.30+.045*shift)*blend,1);
    overlay(side+'LowerArm',-sign*(m[7]+.12*p2*gait+breath)*blend,0,0,1);
    overlay(side+'Hand',sign*(.035*shift-brake*.10),turn*.06,lateral*.035*shift,1);
    overlay(side+'Foot',-sign*(.08+.065*p2*gait),0,0,1)
   }
   if(state==='mount_start'||state==='dismount'){overlay('rightUpperLeg',-sign*(.5+Math.sin(Math.PI*blend)*.85),0,-Math.sin(Math.PI*blend)*.8,1);overlay('spine',sign*(.15+.28*Math.sin(Math.PI*blend)),0,.12*Math.sin(Math.PI*blend),1)}
  }else a.mountMotion149=null;
  if(!socialBlocked256){const clocks=a.action132.clocks255||{},danceTime=(weights.duet||0)>(weights.dance||0)?(clocks.duet||0):(clocks.dance||0),waveTime=clocks.wave||0;
  if(dancing){overlay('leftUpperArm',Math.sin(danceTime*4)*.4,0,left*.85,dancing);overlay('rightUpperArm',-Math.sin(danceTime*4)*.4,0,right*.85,dancing);overlay('spine',0,Math.sin(danceTime*2)*.15,Math.sin(danceTime*4)*.09,dancing)}
  overlay('rightUpperArm',-.25,0,-right*.25,weights.wave);overlay('rightLowerArm',-.8,0,Math.sin(waveTime*5)*.35,weights.wave);
  overlay('spine',sign*.27,0,0,weights.bow);overlay('head',sign*.12,0,0,weights.bow);
  for(const side of ['left','right']){const down=side==='left'?left:right;
   overlay(side+'UpperArm',-sign*.85,0,down*.45,weights.cheer);overlay(side+'LowerArm',-sign*.65,0,0,weights.cheer);
   overlay(side+'UpperArm',-sign*.70,0,down*1.12,weights.hug);overlay(side+'LowerArm',-sign*.48,0,0,weights.hug);
  }
  overlay('rightUpperArm',-sign*.22,0,right*1.05,weights.hand);
  overlay('rightLowerArm',-sign*.35,0,0,weights.hand);
  overlay('head',-.04,0,.075,(weights.photo||0)+(weights.portrait||0));}
  // V29.1: combat overlay on the actual skinned avatar, before humanoid/IK update.
  const combat=j.combat291;
  // V30.7: blend locomotion and combat through a persistent pose filter.
  const names308=['hips','spine','chest','upperChest','neck','head','leftShoulder','rightShoulder','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftHand','rightHand','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot'];
  const filter308=a.combatFilter308??={bones:names308.map(name=>{const node=vrm.humanoid.getNormalizedBoneNode(name);return {node,q:new a.T.Quaternion()}}),weight:0};
  const armed308=!!j.weapon307&&!socialBlocked256&&['idle','walk','run'].includes(mode);
  if(armed308&&!combat){const bow=j.weapon307==='bow',dual=j.weapon307==='dual',great=j.weapon307==='great',hold=.30+.20*(1-Math.min(1,a.weight));overlay('rightLowerArm',-sign*.24,0,0,bow?0:hold);overlay('rightUpperArm',sign*.06,0,right*1.43,bow?0:hold);if(bow||dual||great){overlay('leftLowerArm',-sign*(great?.48:.28),0,0,hold);overlay('leftUpperArm',sign*.04,0,left*1.42,hold)}}
  if(combat&&!socialBlocked256){
   const p=Math.max(0,Math.min(1,combat.progress)),smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},impact=Math.max(.18,Math.min(.82,combat.impact??.45)),w=smooth(p/.13)*smooth((1-p)/.24),sweep=p<impact?smooth((p-impact*.40)/(impact*.60)):1-smooth((p-impact)/(1-impact)),wind=Math.sin(Math.PI*Math.min(1,p/impact)),cast=combat.kind==='fire'||combat.kind==='ice'||combat.kind==='storm';
   if(combat.kind==='strike'&&combat.weapon==='bow'){
    const draw=p<impact?smooth(p/impact):1-smooth((p-impact)/.22),aim=smooth(p/.18);
    overlay('rightUpperArm',-sign*(.62+.28*aim),-.18,right*.55,w);
    overlay('rightLowerArm',-sign*(.38+.75*draw),0,-.22*draw,w);
    overlay('leftUpperArm',-sign*(.45+.38*draw),.28*draw,left*.70,w);
    overlay('leftLowerArm',-sign*(.55+.35*draw),0,0,w);
    overlay('spine',sign*.05*draw,.22*draw,0,w);
   }else if(combat.kind==='strike'&&combat.weapon==='great'){
    const form=(combat.combo|0)%5,windup=p<impact?smooth(p/impact)*(1-smooth((p-impact*.75)/(impact*.25))):0,cut=p<impact?smooth((p-impact*.65)/(impact*.35)):1-smooth((p-impact)/(1-impact));
    overlay('rightUpperArm',-sign*(.72+.70*windup+.33*cut),(form===3?.35:-.28)*windup,right*(.78-(form===4?.38:.25)*cut),w);
    overlay('rightLowerArm',-sign*(.48+.54*windup),0,0,w);
    overlay('leftUpperArm',-sign*(.55+.38*windup),.18*cut,left*.73,w);
    overlay('leftLowerArm',-sign*(.45+.37*windup),0,0,w);
    overlay('spine',sign*(-.12*windup+.20*cut),.34*(windup-cut),0,w);
   }else if(combat.kind==='strike'&&combat.weapon==='staff'){
    overlay('rightUpperArm',-sign*(.45+.55*sweep),-.15,right*.70,w);
    overlay('rightLowerArm',-sign*(.40+.55*wind),0,0,w);
    overlay('leftUpperArm',-sign*(.28+.42*sweep),0,left*.90,w);
    overlay('leftLowerArm',-sign*.48,0,0,w);
    overlay('spine',sign*.09*sweep,.10*sweep,0,w);
   }else if(combat.kind==='strike'&&combat.weapon==='dual'){
    const form=(combat.combo|0)%5,side=form%2?1:-1;
    overlay('rightUpperArm',-sign*(.45+(.45+form*.09)*sweep),side*(.42+form*.045)*sweep,right*(form===3?.92:.74),w);
    overlay('leftUpperArm',-sign*(.45+(.70-form*.06)*wind),-side*.55*sweep,left*(form===2?.95:.74),w);
    overlay('rightLowerArm',-sign*(.35+.48*wind),0,0,w);
    overlay('leftLowerArm',-sign*(.35+.48*sweep),0,0,w);
    overlay('spine',sign*.10*sweep,-side*.24*sweep,0,w);
   }else if(combat.kind==='ultimate'){
    const rise=p<impact?smooth(p/impact):1-smooth((p-impact)/.25),release=p<impact?0:Math.sin(Math.PI*Math.min(1,(p-impact)/(1-impact))),bow=combat.weapon==='bow',staff=combat.weapon==='staff',dual=combat.weapon==='dual',great=combat.weapon==='great';
    overlay('rightShoulder',-sign*.15*rise,0,0,w);overlay('leftShoulder',-sign*.12*rise,0,0,w);
    if(bow){overlay('leftUpperArm',-sign*(.7+.5*rise),.25*rise,left*.65,w);overlay('rightUpperArm',-sign*.8,-.35*rise,right*.65,w);overlay('rightLowerArm',-sign*(.55+.8*rise),0,0,w);overlay('leftLowerArm',-sign*.35,0,0,w);overlay('chest',0,.28*rise,0,w);}
    else if(staff){overlay('rightUpperArm',-sign*(.9+.65*rise),0,right*.8,w);overlay('leftUpperArm',-sign*(.45+.35*release),0,left*.9,w);overlay('rightLowerArm',-sign*.65,0,0,w);}
    else if(dual){overlay('rightUpperArm',-sign*(.5+.7*release),.45*release,right*(.85-.25*rise),w);overlay('leftUpperArm',-sign*(.5+.7*release),-.45*release,left*(.85-.25*rise),w);overlay('rightLowerArm',-sign*.65,0,0,w);overlay('leftLowerArm',-sign*.65,0,0,w);}
    else {
    overlay('rightUpperArm',-sign*(.65+rise*.90+release*.48),-.30*release,right*(.65-.32*rise),w);
    overlay('rightLowerArm',-sign*(.45+rise*.55),0,0,w);
    overlay('leftUpperArm',-sign*(.45+rise*.72),.25*release,left*(.85-.25*rise),w);
    overlay('leftLowerArm',-sign*(.55+rise*.40),0,0,w);
    overlay('spine',sign*(-.12*rise+.24*release),.28*release,0,w);overlay('chest',sign*.10*release,.18*release,0,w);overlay('head',-sign*.14*rise,0,0,w);if(great)overlay('chest',sign*.12*release,.16*rise,0,w);}
   }else if(cast){
    overlay('rightUpperArm',-sign*(.85+sweep*.48),-right*.12,right*.72,w);overlay('rightLowerArm',-sign*(.45+wind*.65),0,0,w);
    overlay('leftUpperArm',-sign*.72,0,left*.85,w);overlay('leftLowerArm',-sign*.55,0,0,w);
    overlay('spine',sign*(-.08+sweep*.17),.16*sweep,0,w);
   }else if(combat.kind==='dodge'){
    overlay('spine',-sign*.24*sweep,0,0,w);overlay('rightUpperArm',sign*.30,0,right*1.15,w);overlay('leftUpperArm',-sign*.35,0,left*1.1,w);
   }else{
    const i=combat.kind==='spin'?4:Math.max(0,Math.min(4,combat.combo|0)),poses=[[.65,.55,.75,.92,.48,.42,.58,.30],[.72,.62,.82,.90,.43,.44,.62,.34],[.42,.84,.36,1.02,.38,.62,.43,.18],[.93,.38,.25,.80,.28,.50,.65,.24],[.90,.60,.95,.87,.50,.55,.72,.45]],v=poses[i];
    const swing=(p<impact*.55?-smooth(p/(impact*.55)):2*smooth((p-impact*.55)/(impact*.45))-1)*(i%2?-1:1);
    overlay('rightUpperArm',-sign*(v[0]+v[1]*sweep),swing*v[2],right*(v[3]-v[4]*sweep),w);
    overlay('rightLowerArm',-sign*(v[5]+v[6]*wind),0,0,w);
    overlay('leftUpperArm',-sign*(i===4?.65:.30),0,left*(i===4?.78:1.04),w);overlay('leftLowerArm',-sign*.40,0,0,w);
    overlay('spine',sign*(i===3?.22:.12)*sweep,-swing*v[7],.055*swing,w);overlay('chest',sign*.08*sweep,-swing*v[7]*.8,0,w);
   }
  }
  // V29.9: anticipation, weight transfer and follow-through across the full body.
  if(combat&&!socialBlocked256&&Number.isFinite(combat.progress)){
   const p=Math.max(0,Math.min(1,combat.progress)),ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},w=ease(p/.14)*ease((1-p)/.23);
   const load=Math.sin(Math.PI*Math.min(1,p/.40)),release=Math.sin(Math.PI*Math.max(0,Math.min(1,(p-.30)/.53)));
   const sword=(combat.kind==='strike'||combat.kind==='spin')&&!['bow','staff'].includes(combat.weapon),dodge=combat.kind==='dodge',ult=combat.kind==='ultimate',dir=(combat.combo|0)%2?-1:1;
   const bend=(dodge?.28:ult?.18:.12)*load+(dodge?.13:.08)*release,twist=sword?dir*(-.18*load+.32*release):0;
   if(hips){hips.position.y-=bend*.13*w;hips.position.x+=twist*.09*w;}
   overlay('hips',sign*.12*load,twist,dir*.045*release,w);
   overlay('leftUpperLeg',-sign*(bend+.07*release),0,.055*load,w);
   overlay('rightUpperLeg',-sign*(bend+.11*load),0,-.055*load,w);
   overlay('leftLowerLeg',sign*bend*1.8,0,0,w);overlay('rightLowerLeg',sign*bend*1.8,0,0,w);
   overlay('leftFoot',-sign*bend*.75,0,0,w);overlay('rightFoot',-sign*bend*.75,0,0,w);
   overlay('neck',-sign*.05*load,-twist*.25,0,w);overlay('upperChest',sign*.09*release,-twist*.5,0,w);
   const wrist=vrm.humanoid.getNormalizedBoneNode('rightHand'),leftWrist=vrm.humanoid.getNormalizedBoneNode('leftHand');if(wrist){wrist.rotation.x+=w*(sword?-.15*load+.20*release:ult?-.14*load:.09*release);wrist.rotation.z+=w*(sword?dir*.16*release:0);}if(leftWrist&&['great','dual','bow'].includes(combat.weapon)){leftWrist.rotation.x+=w*(.08*load-.10*release);leftWrist.rotation.z-=w*dir*.09*release;}
  }
  // Damp bone rotations on entry, release and recovery, rather than snapping to each procedural pose.
  const engaged308=!!combat&&!socialBlocked256,blend308=1-Math.exp(-Math.min(dt,.08)/(engaged308?(combat.weapon==='great'?.075:combat.weapon==='dual'?.038:.055):.085));
  if(engaged308||filter308.weight>.001){filter308.weight=engaged308?1:filter308.weight*(1-blend308);for(const item of filter308.bones){if(!item.node)continue;item.q.slerp(item.node.quaternion,blend308);item.node.quaternion.copy(item.q)}}else for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion);
  if(socialBlocked256){filter308.weight=0;for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion)}
  const look=WWMotion.socialLook255(a.look255??={},mode==='ride'||WWMotion.phaseOf(j)?0:j.lookYaw,dt);
  if(!socialBlocked256&&Math.abs(look)>.001){const n=vrm.humanoid.getNormalizedBoneNode('neck'),hd=vrm.humanoid.getNormalizedBoneNode('head');if(n)n.rotation.y+=look*.35;if(hd)hd.rotation.y+=look*(n?.65:1)}
  a.secondary132??={};const secondary=WWMotion.secondary132(a.secondary132,dt,a.weight,a.motion.turn,j.wind);
  if(typeof WWIdentity!=='undefined')WWIdentity.animate(a,t,a.weight,secondary);
  const em=vrm.expressionManager,seed255=a.expressionSeed255??=Array.from(a.motionProfile||'m1').reduce((n,c)=>n+c.charCodeAt(0),0)%13,face=WWMotion.expression132(a.action132,mode,dt,t,seed255);
  if(combat&&!socialBlocked256){face.angry=Math.max(face.angry||0,.32*Math.sin(Math.PI*Math.max(0,Math.min(1,combat.progress))));face.relaxed=(face.relaxed||0)*.4}if(em){for(const k of ['happy','angry','surprised','blink','relaxed'])if(em.getExpression(k))em.setValue(k,face[k]||0)}
  const fingers=animateFingers163(a,dt,mode,a.weight,a.motion.jump,t,j.mountHorse?Math.max(Math.abs(j.mountTurn||0),j.mountBrake||0):j.turn,mode==='ride'?null:j.weapon307,combat);const airborne=!!(WWMotion.phaseOf(j)||a.motion.jump>.12),offGround=(j.height||0)>.006||(j.velocity||0)>.01;
  if(detail===0&&ground&&!(mode==='idle'&&gait<.15)){vrm.humanoid.update();a.footIK=WWFootIK.apply(a.T,a,ground,dt,gait,airborne,mode)}else{WWFootIK.reset(a);a.footIK=null}
  if(detail===0){for(let remain=dt;remain>0;){let d=Math.min(.033,remain);vrm.update(d);remain-=d}}else{vrm.humanoid.update();vrm.expressionManager?.update();}
  if(detail<=1){const contact=WWFootIK.groundIdle(a.T,a,ground,dt,gait,offGround,mode);if(contact)a.footIK=contact;}
  a.motionState=a.motion.state;a.poseCheck={motionVersion:'25.6',face255:{...face},lookYaw255:look,brake250:a.motion.brake250||0,turnBody250:a.motion.turnBody250||0,drive250:a.motion.drive250||0,fingers163:fingers,actionWeights:{...weights},secondary:{...secondary},targetHeight:1.68*heightFactor(preset(a.motionProfile)),original:!!a.original,measuredSpeed:a.motion.speed,turn:a.motion.turn,identity:a.identityType||null,fallbackBase:a.fallbackBase||null,cycle:a.motion.cycle,walkWeight:a.motion.walk,runWeight:a.motion.run,profile:a.motionProfile,legSign:sign,hip:[v.hipL,v.hipR],knee:['left','right'].map(side=>(vrm.humanoid.getNormalizedBoneNode(side+'LowerLeg')?.rotation.x||0)*sign),ankle:[v.ankleL,v.ankleR],jumpWeight:a.motion.jump};
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
 const api={combatGrip312,fingerTargets163,fingerResponse251,setupFingers163,animateFingers163,load,animate,sources,roster,preset,applyPreset,release,heightFactor,createBufferCache140,bufferStats140:()=>buffers.stats()};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

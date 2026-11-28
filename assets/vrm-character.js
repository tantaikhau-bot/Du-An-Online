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
  a.applied=p.id;a.motionProfile=p.id;a.lastDiagnostic140=undefined;a.rawDiagnostics140=null;a.action132={};a.secondary132={};if(a.spring316?.active)springMotion316(a,{},false);if(a.fingers163)for(const side of ['left','right'])for(const f of a.fingers163[side]){f.node.quaternion.copy(f.rest);f.curl=0;f.spread=0}a.idleGroundWeight=0;a.idleAnchor1170=null;a.contacts={};a.contactFrame=null;if(typeof WWMotion!=='undefined')a.motion=WWMotion.newState();
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

 // V33.5: serialize expensive VRM decoding on mobile; local avatar jumps ahead of optional actors.
 function createLoadQueue335(limit=1,maxPending=12){let active=0,peak=0,seq=0,skipped=0;const pending=[];function pump(){while(active<limit&&pending.length){pending.sort((a,b)=>b.priority-a.priority||a.seq-b.seq);const q=pending.shift();if(q.valid&&!q.valid()){skipped++;q.reject(Error('Avatar request obsolete'));continue;}active++;peak=Math.max(peak,active);Promise.resolve().then(q.run).then(q.resolve,q.reject).finally(()=>{active--;pump();});}}return {enqueue(run,priority=0,valid=null){return new Promise((resolve,reject)=>{if(pending.length>=maxPending){let index=-1;for(let i=0;i<pending.length;i++)if(pending[i].priority<priority&&(index<0||pending[i].priority<pending[index].priority))index=i;if(index<0){reject(Error('Avatar load queue full'));return;}pending.splice(index,1)[0].reject(Error('Avatar request superseded'));skipped++;}pending.push({run,priority,valid,resolve,reject,seq:seq++});pump();});},stats:()=>({active,pending:pending.length,peak,skipped,limit,maxPending})};}
 const loadQueue335=createLoadQueue335(mobile140?1:2,mobile140?6:12);
 function load(T,kind,options={}){return loadQueue335.enqueue(()=>loadWithFallback335(T,kind),options.priority||0,options.valid||null);}
 async function loadWithFallback335(T,kind){try{return await loadBase(T,kind)}catch(e){if(kind==='female3'||kind==='female4'){console.warn('Optional avatar base fallback',kind,e);const a=await loadBase(T,kind==='female3'?'female2':'female');a.fallbackBase=kind;return a}throw e}}
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
  const rate=(mode==='combatGrip'?30:mode==='ride'?8:6)*(closing?1:.82)*(f.name.endsWith('Distal')?.80:f.name.endsWith('Intermediate')?.91:1);
  f.curl+=(curl-f.curl)*(1-Math.exp(-seconds*rate));f.spread+=(spread-f.spread)*(1-Math.exp(-seconds*5.5));return f;
 }
 // V31.2: grip targets by handle and role, including bow release and support hand.
 function combatGrip312(weapon,side,combat,out={}){
  if(!weapon)return null;
  const p=Math.max(0,Math.min(1,Number(combat?.progress)||0)),impact=Math.max(.1,Math.min(.9,combat?.impact??.45)),draw=weapon==='bow'&&side==='right'&&['strike','ultimate'].includes(combat?.kind)&&p<impact;
  const release=weapon==='bow'&&side==='right'&&['strike','ultimate'].includes(combat?.kind)&&p>=impact&&p<impact+.24;if(weapon==='bow'&&side==='right'&&!draw&&!release)return null;
  if(side==='left'&&(!['bow','dual','great'].includes(weapon)||weapon==='great'&&combat&&!['strike','spin','ultimate','guard'].includes(combat.kind)))return null;
  const roles={sword:[.82,1.13,.68,.44],dual:[.88,1.17,.73,.46],great:[.72,1.02,.64,.39],staff:[.70,.98,.60,.40],bow:[.71,1.01,.62,.36]};
  const a=draw||release?[.68,.94,.51,.24]:weapon==='great'&&side==='left'?[.79,1.08,.67,.42]:roles[weapon];if(!a)return null;const clamp=v=>Math.max(0,Math.min(1,v)),squeeze=['strike','spin','ultimate','guard'].includes(combat?.kind)?Math.max(0,1-Math.abs(p-impact)/.24):0,releaseBlend=release?Math.max(.12,1-clamp((p-impact)/.12)) :1,force=(draw? .72+.28*clamp(p/Math.max(.08,impact)):1+.10*squeeze)*releaseBlend;const result=out,set=(k,c,s)=>{const row=result[k]??=[0,0];row[0]=Math.min(1.35,Math.max(0,c));row[1]=s;};for(let i=0;i<4;i++){const digit=digits163[i],f=draw||release?(i===3?.30:1):[.92,.98,1.03,1.06][i];set(digit+'Proximal',a[0]*f*force,.006*(i-1.5));set(digit+'Intermediate',a[1]*f*force,0);set(digit+'Distal',a[2]*f*force,0);}set('ThumbMetacarpal',a[3]*force,.19*releaseBlend);set('ThumbProximal',a[3]*1.35*force,0);set('ThumbDistal',a[3]*.93*force,0);return result;
 }
 function animateFingers163(a,dt,mode,gait,jump,time,turn,weapon=null,combat=null){
  a.fingers163??=setupFingers163(a);const {T}=a;let count=0,grip=0;const rot=a.fingerQuat163??=new T.Quaternion();
  a.gripTargets336??={left:{},right:{}};for(const side of ['left','right']){const grasp=combatGrip312(weapon,side,combat,a.gripTargets336[side]),target=grasp||fingerTargets163(mode,gait,jump,time,side,turn);for(const f of a.fingers163[side]){const [curl,spread]=target[f.name];fingerResponse251(f,curl,spread,dt,grasp?'combatGrip':mode);f.node.quaternion.copy(f.rest).multiply(rot.setFromAxisAngle(f.spreadAxis,f.spread)).multiply(rot.setFromAxisAngle(f.axis,f.curl));count++;grip+=f.curl}}
  return {joints:count,meanCurl:count?grip/count:0,mode}
 }

 // V33.7: preserve authored collider/drag/stiffness; apply bounded world-space inertia to native spring joints.
 function springMotion316(a,secondary,enabled){
  const manager=a.vrm.springBoneManager;if(!manager?.joints)return 0;
  if(!a.spring316){
   const records=[],counts={hair:0,cloth:0,other:0},seen=new Set();
   for(const joint of manager.joints){const s=joint.settings;if(!s||seen.has(s)||!s.gravityDir?.isVector3||!Number.isFinite(s.gravityPower))continue;seen.add(s);
    const n=(joint.bone?.name||joint.node?.name||'').toLowerCase(),role=/hair|bang|pony|fringe|braid|kami|髪/.test(n)?'hair':/skirt|cloth|cape|coat|dress|ribbon|scarf|sleeve|スカート/.test(n)?'cloth':'other';counts[role]++;records.push({s,gravity:s.gravityDir.clone(),power:s.gravityPower,role});}
   a.spring316={records,counts,dir:new a.T.Vector3(),forward:new a.T.Vector3(),right:new a.T.Vector3(),q:new a.T.Quaternion(),active:false};
  }
  const cache=a.spring316;if(!enabled&&!cache.active)return cache.records.length;
  if(enabled){a.root.getWorldQuaternion(cache.q);cache.forward.copy(a.modelForward).applyQuaternion(cache.q);cache.forward.y=0;if(cache.forward.lengthSq()<1e-6)cache.forward.set(0,0,1);else cache.forward.normalize();cache.right.set(-cache.forward.z,0,cache.forward.x);}
  for(const {s,gravity,power,role} of cache.records){
   if(!enabled){s.gravityDir.copy(gravity);s.gravityPower=power;continue;}
   const hair=role==='hair',cloth=role==='cloth',pitch=hair?secondary.hairPitch:secondary.clothPitch,roll=hair?secondary.hairRoll:secondary.clothRoll;
   const gain=hair?.23:cloth?.27:.085,side=hair?.18:cloth?.22:.065,max=hair?.15:cloth?.19:.065;
   cache.dir.copy(cache.forward).multiplyScalar(-(Number.isFinite(pitch)?pitch:0)*gain).addScaledVector(cache.right,(Number.isFinite(roll)?roll:0)*side);cache.dir.y=-(Number.isFinite(secondary.flutter)?secondary.flutter:0)*(cloth?.07:.035);const len=cache.dir.length();if(len>max)cache.dir.multiplyScalar(max/len);
   s.gravityDir.copy(gravity).multiplyScalar(power).add(cache.dir);const magnitude=s.gravityDir.length();if(magnitude>1e-6){s.gravityDir.divideScalar(magnitude);s.gravityPower=Math.min(Math.max(0,power)+max,magnitude);}else{s.gravityDir.copy(gravity);s.gravityPower=power;}
  }
  cache.active=!!enabled;return cache.records.length;
 }
 // Original character-specific movement profiles: reach, turn direction, flourish.
 const danceProfiles320={m1:[1,1,.82],m2:[.80,1,.66],m3:[1.18,-1,1],m4:[.87,-1,.72],m5:[1.13,1,.94],m6:[.93,-1,.86],m7:[.75,1,.70],m8:[.84,1,.77],m9:[1.20,-1,.99],m10:[.72,-1,.79],f1:[.98,-1,.98],f2:[.76,1,.83],f3:[.73,-1,.86],f4:[.79,-1,.92],f5:[1.10,1,.96],f6:[1.16,1,1],f7:[.78,-1,.82],f8:[.85,-1,.75],f9:[1.06,1,.91],f10:[.90,1,.87]};
 // V33.4: authored motion envelopes; profile variations share safe joint limits.
 function dodgePose334(p,forward,side,roll,out={}){const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},t=clamp(p),f=Number.isFinite(forward)?Math.max(-1,Math.min(1,forward)):-1,s=Number.isFinite(side)?Math.max(-1,Math.min(1,side)):0,len=Math.hypot(f,s)||1,tuck=ease(t/.24)*ease((1-t)/.24);out.tuck=tuck;out.angle=roll?Math.PI*2*ease((t-.12)/.76):0;out.axisX=-f/len;out.axisZ=-s/len;out.lean=roll?.15*tuck:.30*tuck;out.drop=(roll?-.22:-.13)*tuck;return out;}
 function actionFootwork320(move,p,profile='m1',out={}){
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},t=clamp(Number(p)||0),hit=Math.max(.18,Math.min(.82,Number(move?.impact)||.45)),form=Math.max(0,Math.min(4,move?.combo|0)),weapon=move?.weapon||'sword',kind=move?.kind,style=danceProfiles320[profile]||danceProfiles320.m1,melee=['sword','great','dual'].includes(weapon),sign=style[1]*(form%2?-1:1);
  let distance=0,lateral=0,turn=0,hop=0,gesture=0;const approach=ease((t-.07)/Math.max(.15,hit-.07)),recover=ease((t-hit)/Math.max(.15,1-hit)),arc=Math.sin(Math.PI*t);
  if(kind==='strike'&&melee){distance=[.34,.40,.63,.48,.51][form]*style[0]*(weapon==='great'?.80:weapon==='dual'?1.10:1);lateral=[.06,-.07,0,.05,.17][form]*style[0]*style[1];turn=form===4?sign*Math.PI*2*ease((t-.12)/.77):0;gesture=style[2]*arc;if(form===3&&!move?.airborne)hop=.33* Math.pow(Math.sin(Math.PI*ease(t)),1.15);}
  else if(kind==='spin'&&melee){distance=.24*style[0];lateral=.14*style[1];turn=sign*Math.PI*2*ease((t-.10)/.83);gesture=style[2]*arc;}
  else if(kind==='dodge'){const f=Number.isFinite(move?.dodgeForward328)?move.dodgeForward328:-1,side=Number.isFinite(move?.dodgeSide328)?move.dodgeSide328:0;distance=1.30*Math.max(-1,Math.min(1,f));lateral=1.30*Math.max(-1,Math.min(1,side));hop=move?.roll334?0:.08*arc;gesture=arc;}
  else if(kind==='strike'){distance=weapon==='bow'?-.13:.12;gesture=style[2]*arc;}
  if(move?.airborne)hop=0;if(move?.air323===2&&melee)turn=sign*Math.PI*2*ease((t-.10)/.82);if(move?.air323===3)turn=0;
  out.forward=distance*(kind==='dodge'?ease(t):approach);out.side=lateral*(kind==='dodge'?ease(t):Math.sin(Math.PI*approach*.5));out.turn=turn;out.hop=Math.max(0,hop);out.gesture=gesture;out.recovery=recover;out.melee=melee?1:0;return out;
 }
 function boundedFootwork320(previous,desired,maxStep=.18,out={}){
  let x=desired.forward-previous.forward,z=desired.side-previous.side;const len=Math.hypot(x,z);if(!Number.isFinite(len)||len<1e-7){out.forward=0;out.side=0;return out;}const k=Math.min(1,maxStep/len);out.forward=x*k;out.side=z*k;return out;
 }
 // V32.1 authored keyframes: upper arm pitch/yaw/down, elbow curl, wrist roll, repeated for each arm.
 const tracks321={
 sword:[[.16,0,1.36,.30,0,.10,0,1.38,.22,0],[.78,-.58,.91,.80,-.38,.38,.18,1.12,.53,.12],[1.08,-.88,.66,1.08,-.48,.62,.35,.85,.67,.18],[1.38,.78,.46,.30,.48,.43,-.30,1.04,.48,-.12],[.86,1.02,.70,.53,.68,.30,-.42,1.12,.40,-.20],[.22,.12,1.24,.36,.10,.15,0,1.35,.30,0]],
 great:[[.22,0,1.34,.48,0,.24,0,1.24,.56,0],[1.05,-.40,.78,1.03,-.18,.82,.22,.70,.97,.16],[1.67,-.34,.48,1.30,-.20,1.25,.16,.52,1.22,.16],[1.34,.35,.58,.44,.24,1.08,-.20,.61,.55,-.18],[.74,.55,.82,.65,.34,.66,-.27,.82,.75,-.18],[.27,.06,1.25,.56,0,.30,0,1.18,.64,0]],
 dual:[[.20,0,1.30,.32,0,.20,0,1.30,.32,0],[.91,-.71,.72,.81,-.40,.64,.58,.78,.68,.35],[1.20,-.67,.58,1.02,-.48,.92,.77,.56,.97,.40],[1.32,.72,.48,.38,.58,1.21,-.67,.53,.39,-.49],[.86,1.01,.72,.58,.58,.99,-.84,.65,.67,-.57],[.25,.10,1.20,.42,.08,.25,-.10,1.20,.42,-.08]],
 bow:[[.18,0,1.32,.32,0,.30,0,1.17,.46,0],[.82,-.16,.73,.64,-.12,.95,.27,.53,.41,.06],[1.00,-.45,.60,1.23,-.14,1.12,.39,.38,.24,.08],[.96,-.53,.67,1.04,.08,1.11,.36,.39,.22,.05],[.60,-.34,.93,.52,.16,.92,.28,.66,.35,.04],[.19,-.02,1.30,.32,0,.32,.02,1.15,.46,0]],
 staff:[[.23,0,1.32,.44,0,.12,0,1.38,.25,0],[.89,-.50,.80,.83,-.28,.55,.37,.80,.64,.14],[1.38,-.28,.55,1.03,-.38,.89,.43,.62,.81,.24],[1.41,.48,.56,.34,.45,1.05,-.37,.64,.40,-.15],[.86,.68,.83,.60,.60,.64,-.44,.83,.49,-.20],[.27,.12,1.22,.44,.08,.18,0,1.31,.30,0]]
 };
 const variations321=[[1,.0,.0,.0],[ -1,.06,.07,.02],[1,-.24,-.10,.09],[-1,.31,-.10,.18],[1,.18,-.05,.24]];
 const times321=[0,.38,.76,1,1.45,2];
 const clips321={};for(const [weapon,base] of Object.entries(tracks321)){clips321[weapon]=variations321.map(([dir,lift,spread,flourish],form)=>base.map((frame,i)=>{const p=frame.slice(),active=i===0||i===5?0:i===1?.65:1,range=weapon==='bow'?.18:weapon==='great'?.65:1;
 for(const k of [0,5])p[k]=Math.max(0,Math.min(1.85,p[k]+lift*active*range*(k===5?.64:1)));
 for(const k of [1,6])p[k]=Math.max(-1.18,Math.min(1.18,p[k]*(weapon==='bow'?1:dir)+(form===2&&i===3?(k===1?.22:-.16)*range:0)));
 for(const k of [2,7])p[k]=Math.max(.30,Math.min(1.45,p[k]+spread*active*range));
 for(const k of [4,9])p[k]=Math.max(-.82,Math.min(.82,p[k]*(weapon==='bow'?1:dir)+(k===4?1:-1)*flourish*active*range*(i===4?1:.55)));
 if(weapon==='dual'&&form===1){for(let k=0;k<5;k++){const tmp=p[k];p[k]=p[k+5];p[k+5]=tmp;}p[1]*=-1;p[6]*=-1;}
 return p;}));}
 function weaponKeyframe321(weapon,form,progress,impact,out=[]){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),p=clamp(Number.isFinite(progress)?progress:0,0,1),h=clamp(Number.isFinite(impact)?impact:.45,.18,.82),t=p<=h?p/h:1+(p-h)/(1-h),clip=(clips321[weapon]||clips321.sword)[clamp(form|0,0,4)];
  let k=0;while(k<4&&t>times321[k+1])k++;const u=clamp((t-times321[k])/(times321[k+1]-times321[k]),0,1),a=u*u*(3-2*u);
  for(let n=0;n<10;n++)out[n]=u===0?clip[k][n]:u===1?clip[k+1][n]:clip[k][n]+(clip[k+1][n]-clip[k][n])*a;
  return out;
 }
 // Authored pose targets: stance width, lead stride, pelvis yaw, lean, knee loading, wrist arc.
 const forms320=[
 [.22,.33,.49,.19,.38,.36], // diagonal cut
 [.25,.31,-.56,.15,.33,.42], // reverse cut
 [.17,.47,.22,.25,.42,.18], // forward thrust
 [.28,.24,-.34,.12,.48,.48], // rising cut
 [.34,.42,.64,.29,.57,.56]  // sweeping finisher
 ];
 function combatBody320(combat,ready=0,out={}){
  const clamp=(x,l=0,h=1)=>Math.max(l,Math.min(h,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const kind=combat?.kind||'ready',weapon=combat?.weapon||'sword',form=clamp((combat?.combo|0),0,4),r=forms320[form],p=clamp(Number(combat?.progress)||0),hit=clamp(Number(combat?.impact)||.45,.18,.82);
  const load=p<hit?smooth(p/(hit*.70))*(1-smooth((p-hit*.70)/(hit*.30))):0,cut=p<hit?smooth((p-hit*.48)/(hit*.52)):1-smooth((p-hit)/(1-hit)),follow=p>=hit?Math.sin(Math.PI*clamp((p-hit)/(1-hit))):0;
  if(['hurt','stagger','down','recover'].includes(kind)){const side=combat.side329||1,fall=kind==='down'?smooth(p):kind==='recover'?1-smooth(p):0,flinch=kind==='hurt'||kind==='stagger'?Math.sin(Math.PI*p)*(kind==='stagger'?1:.55):0,crouch=fall*.44+flinch*.25;return Object.assign(out,{weight:1,width:.19+flinch*.10,leftHip:-.12-crouch,rightHip:-.12-crouch*.65,leftKnee:.15+crouch*1.4,rightKnee:.15+crouch*.95,leftFoot:-.10-crouch*.5,rightFoot:-.10-crouch*.4,hipYaw:side*flinch*.16,hipRoll:side*flinch*.22,hipPitch:-flinch*.24+fall*.12,drop:-crouch*.15,shift:side*flinch*.04,spineYaw:side*flinch*.18,chestYaw:side*flinch*.12,shoulderYaw:0,headYaw:-side*flinch*.14,wrist:0,offhand:0,cut:0,load:0,follow:0});}const active=!!combat,w=active?smooth(p/.10)*smooth((1-p)/.17):0,hold=clamp(ready),stance=Math.max(w,hold*.78);
  const ranged=weapon==='bow'||weapon==='staff',heavy=weapon==='great',dual=weapon==='dual',dodge=kind==='dodge',cast=['fire','ice','storm','ultimate'].includes(kind),spin=kind==='spin';
  const style=danceProfiles320[combat?.profile334]||danceProfiles320.m1,dir=ranged?(weapon==='bow'?-1:1):form%2?-1:1,travel=dodge?.32:cast?.15:spin?.33:r[1]*(ranged?.53:heavy?.80:1)*style[0];
  const turn=(dodge?.1:cast?.25:spin?.70:Math.abs(r[2]))*(ranged?.55:1),twist=dir*(-turn*.65*load+turn*cut+.14*follow);
  const width=(.19+(active?(dodge?.17:cast?.11:r[0])*.58:0))*(heavy?1.14:1),lead=travel*(.30*load+.86*cut+.32*follow),bend=.15+(active?(dodge?.36:cast?.24:r[4])*(.62*load+.82*cut+.28*follow):0);
  const stride=kind==='guard'?.18:dir*lead,shift=dir*(-.035*load+.075*cut+.025*follow);
  out.weight=stance;out.width=width;out.leftHip=-.12+stride;out.rightHip=-.12-stride;out.leftKnee=bend+Math.max(0,-stride)*.54;out.rightKnee=bend+Math.max(0,stride)*.54;
  out.leftFoot=-out.leftKnee*.57;out.rightFoot=-out.rightKnee*.57;out.hipYaw=twist;out.hipRoll=dir*(.09*cut-.06*load);out.hipPitch=.045+(dodge?.24:r[3])*(load*.5+cut*.62);
  out.drop=-.020-(bend-.15)*.12;out.shift=shift;out.spineYaw=-twist*.36;out.chestYaw=twist*.48;out.shoulderYaw=twist*.26;out.headYaw=-twist*.32;
  out.wrist=dir*r[5]*(cut-.40*load)*(.6+follow*.4);out.offhand=(dual?.24:ranged?.08:.30)*dir*(cut-load*.5);out.cut=cut;out.load=load;out.follow=follow;if(dodge){const d=dodgePose334(p,combat.dodgeForward328,combat.dodgeSide328,combat.roll334);out.leftHip=-.12-d.tuck*.70;out.rightHip=-.12-d.tuck*.52;out.leftKnee=.15+d.tuck*.98;out.rightKnee=.15+d.tuck*.85;out.leftFoot=-out.leftKnee*.48;out.rightFoot=-out.rightKnee*.48;out.hipPitch=d.lean;out.hipRoll=-(combat.dodgeSide328||0)*d.tuck*.16;out.drop=d.drop;out.shift=0;}return out;
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
  a.action132??={};const weights=WWMotion.actionBlend132(a.action132,WWMotion.phaseOf(j)?'idle':mode,dt);const socialBlocked256=mode==='ride'||(!!WWMotion.phaseOf(j)&&!(j.combat291?.kind==='strike'&&j.combat291?.airborne));
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
  const filter308=a.combatFilter308??={bones:names308.map(name=>{const node=vrm.humanoid.getNormalizedBoneNode(name);return {node,q:node?node.quaternion.clone():new a.T.Quaternion()}}),weight:0};
  const armed308=!!j.weapon307&&!socialBlocked256&&['idle','walk','run'].includes(mode);
  if(armed308&&!combat){const bow=j.weapon307==='bow',dual=j.weapon307==='dual',great=j.weapon307==='great',hold=.30+.20*(1-Math.min(1,a.weight));overlay('rightLowerArm',-sign*.24,0,0,bow?0:hold);overlay('rightUpperArm',sign*.06,0,right*1.43,bow?0:hold);if(bow||dual||great){overlay('leftLowerArm',-sign*(great?.48:.28),0,0,hold);overlay('leftUpperArm',sign*.04,0,left*1.42,hold)}}
  if(combat&&!socialBlocked256){
   const p=Math.max(0,Math.min(1,combat.progress)),smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},impact=Math.max(.18,Math.min(.82,combat.impact??.45)),w=smooth(p/.13)*smooth((1-p)/.24),sweep=p<impact?smooth((p-impact*.40)/(impact*.60)):1-smooth((p-impact)/(1-impact)),wind=Math.sin(Math.PI*Math.min(1,p/impact)),cast=combat.kind==='fire'||combat.kind==='ice'||combat.kind==='storm';
   if(['hurt','stagger','down','recover'].includes(combat.kind)){const side=combat.side329||1,fall=combat.kind==='down'?smooth(p):combat.kind==='recover'?1-smooth(p):0,flinch=['hurt','stagger'].includes(combat.kind)?Math.sin(Math.PI*p)*(combat.kind==='stagger'?1:.55):0,amount=Math.max(fall,flinch);overlay('rightUpperArm',-sign*(.16+amount*.64),side*.20*flinch,right*(1.35-amount*.50),amount);overlay('leftUpperArm',-sign*(.22+amount*.72),side*.20*flinch,left*(1.35-amount*.55),amount);overlay('rightLowerArm',-sign*(.28+amount*.62),0,0,amount);overlay('leftLowerArm',-sign*(.28+amount*.84),0,0,amount);overlay('head',sign*.20*amount,-side*.12*amount,side*.12*amount,amount);}else if(combat.kind==='strike'||combat.kind==='spin'){
    const form=combat.kind==='spin'?4:combat.combo|0,weapon=combat.weapon||'sword',k=weaponKeyframe321(weapon,form,p,impact,a.keyPose321??=[]),weight=(combat.chain334?.36+.64*smooth(p/.085):smooth(p/.085))*smooth((1-p)/(combat.queued334?.07:.15));
    overlay('rightUpperArm',-sign*k[0],k[1],right*k[2],weight);overlay('rightLowerArm',-sign*k[3],0,0,weight);overlay('rightHand',0,0,k[4],weight);
    overlay('leftUpperArm',-sign*k[5],k[6],left*k[7],weight);overlay('leftLowerArm',-sign*k[8],0,0,weight);overlay('leftHand',0,0,k[9],weight);
    const turn=(form%2?-1:1)*(.16*wind+.28*sweep);overlay('spine',sign*(.07*wind+.10*sweep),turn,turn*.15,weight*.65);overlay('chest',sign*.08*sweep,turn*.60,0,weight*.65);
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
   }else if(combat.kind==='guard'){const g322=smooth(p/.10)*smooth((1-p)/.12);overlay('rightUpperArm',-sign*.85,.30,right*.82,g322);overlay('rightLowerArm',-sign*1.20,0,-.16,g322);overlay('leftUpperArm',-sign*.65,-.22,left*.88,g322);overlay('leftLowerArm',-sign*1.02,0,.12,g322);overlay('rightHand',.10,0,.36,g322);overlay('spine',sign*.15,.10,0,g322);
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
  // V31.9: full-body choreography with asymmetric stance and continuous follow-through.
  const ready320=!socialBlocked256&&armed308&&a.weight<.25?Math.max(0,Math.min(1,j.ready320||0)):0,body320=combatBody320(!socialBlocked256?combat:null,ready320,a.body320??={}),bw320=body320.weight;
  if(bw320>.001){
   const b=body320,w=bw320,dir=(combat?.combo|0)%2?-1:1,step=actionFootwork320(combat,combat?.progress,a.motionProfile,a.dance320??={});
   if(hips){hips.position.y+=b.drop*w;hips.position.x+=b.shift*w;}
   overlay('hips',sign*b.hipPitch,b.hipYaw,b.hipRoll,w);
   const airborneSlash=combat?.kind==='strike'&&(combat.airborne||step.hop>.025);const airStage=combat?.air323||0,airArc=Math.sin(Math.PI*Math.max(0,Math.min(1,combat?.progress||0)));const tuck=airborneSlash?Math.min(.62,(step.hop+(j.height||0))*.58+(airStage===2?.24:airStage===1?.15:0)*airArc):0;overlay('leftUpperLeg',sign*(b.leftHip-tuck),.10*w,b.width,w);
   overlay('rightUpperLeg',sign*(b.rightHip-tuck*.45),-.10*w,-b.width,w);
   overlay('leftLowerLeg',sign*Math.min(1.25,b.leftKnee+tuck*.65),0,0,w);overlay('rightLowerLeg',sign*Math.min(1.25,b.rightKnee+tuck*.8),0,0,w);
   overlay('leftFoot',sign*b.leftFoot,-.08,b.width*-.65,w);overlay('rightFoot',sign*b.rightFoot,.08,b.width*.65,w);
   const additive=(name,x,y,z)=>{const n=vrm.humanoid.getNormalizedBoneNode(name);if(n){n.rotation.x+=x*w;n.rotation.y+=y*w;n.rotation.z+=z*w}};
   additive('spine',sign*b.hipPitch*.35,b.spineYaw,-b.hipRoll*.45);additive('chest',sign*b.cut*.10,b.chestYaw,-b.hipRoll*.28);additive('upperChest',0,b.shoulderYaw,0);
   additive('leftShoulder',-sign*b.load*.10,b.offhand*.42,0);additive('rightShoulder',-sign*b.cut*.12,b.shoulderYaw*.55,0);
   additive('neck',-sign*b.hipPitch*.28,b.headYaw,0);additive('head',0,b.headYaw*.35,0);
   if(combat){const sword=['sword','dual','great'].includes(combat.weapon),contact=combat.contact?b.cut*.10:0;additive('rightHand',-b.load*.12+b.cut*.17,0,sword?b.wrist*.46:0);additive('leftHand',b.follow*.10,0,-b.wrist*.20);
    if(combat.kind==='strike'&&combat.weapon==='sword'){additive('leftUpperArm',-sign*(.16*b.load+.28*b.follow),b.offhand,left*-.16*b.cut);additive('leftLowerArm',-sign*.24*b.follow,0,0);}if(step.melee&&(combat.kind==='strike'||combat.kind==='spin')){additive('rightUpperArm',-sign*.07*step.gesture,dir*.08*step.gesture,0);additive('rightLowerArm',-sign*.05*b.load,0,0);additive('rightHand',sign*.06*step.gesture,0,dir*.07*b.follow);}if(combat.kind==='dodge'){const d=dodgePose334(combat.progress,combat.dodgeForward328,combat.dodgeSide328,combat.roll334,a.dodge334??={});overlay('leftUpperArm',-sign*(.45+.50*d.tuck),.22,left*.85,w);overlay('leftLowerArm',-sign*(.65+.48*d.tuck),0,0,w);overlay('rightUpperArm',-sign*(.40+.40*d.tuck),-.18,right*.80,w);overlay('rightLowerArm',-sign*(.60+.45*d.tuck),0,0,w);}
    if(combat.kind==='dodge'){const d=a.dodge334,side=combat.dodgeSide328||0;additive('spine',sign*.20*d.tuck,0,-side*.12*d.tuck);additive('neck',sign*.18*d.tuck,0,0);}if(airStage){additive('spine',sign*(airStage===3?.32:-.12)*airArc,dir*.18*airArc,0);additive('chest',sign*(airStage===3?.18:-.08)*airArc,dir*.24*airArc,0);additive('rightUpperArm',-sign*(airStage===3?.36:.12)*airArc,0,0);additive('leftUpperArm',-sign*.16*airArc,0,left*.13*airArc);}if(contact){additive('rightLowerArm',-sign*contact,0,0);additive('rightShoulder',sign*contact*.45,0,0);}
   }
  }
  // Damp bone rotations on entry, release and recovery, rather than snapping to each procedural pose.
  const engaged308=(!!combat||bw320>.005)&&!socialBlocked256,blend308=1-Math.exp(-Math.min(dt,.08)/(engaged308?(combat?.weapon==='great'?.060:combat?.weapon==='dual'?.030:.043):.10));
  if(engaged308||filter308.weight>.001){filter308.weight=engaged308?1:filter308.weight*(1-blend308);for(const item of filter308.bones){if(!item.node)continue;item.q.slerp(item.node.quaternion,blend308);item.node.quaternion.copy(item.q)}}else for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion);
  if(socialBlocked256){filter308.weight=0;for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion)}
  const look=WWMotion.socialLook255(a.look255??={},mode==='ride'||WWMotion.phaseOf(j)?0:j.lookYaw,dt);
  if(!socialBlocked256&&Math.abs(look)>.001){const n=vrm.humanoid.getNormalizedBoneNode('neck'),hd=vrm.humanoid.getNormalizedBoneNode('head');if(n)n.rotation.y+=look*.35;if(hd)hd.rotation.y+=look*(n?.65:1)}
  a.secondary132??={};const secondary=j.physics316&&typeof WWMotion.secondary337==='function'?WWMotion.secondary337(a.secondary132,dt,{gait:a.weight,speed:j.speed,turn:j.turn,wind:j.wind,vertical:j.velocity,combat:socialBlocked256?null:combat,reduce:j.reduce316}):j.physics316&&typeof WWMotion.secondary316==='function'?WWMotion.secondary316(a.secondary132,dt,{gait:a.weight,speed:j.speed,turn:j.turn,wind:j.wind,vertical:j.velocity,combat,reduce:j.reduce316}):WWMotion.secondary132(a.secondary132,dt,a.weight,a.motion.turn,j.wind);
  a.physicsTier317=Math.max(detail>0?2:0,j.physicsTier317??0);if(typeof WWIdentity!=='undefined'&&!a.identityFailed317){try{WWIdentity.animate(a,t,a.weight,secondary)}catch(e){a.identityFailed317=true;console.warn('Optional cloth motion disabled',e)}}
  const em=vrm.expressionManager,seed255=a.expressionSeed255??=Array.from(a.motionProfile||'m1').reduce((n,c)=>n+c.charCodeAt(0),0)%13,face=WWMotion.expression132(a.action132,mode,dt,t,seed255);
  if(combat&&!socialBlocked256){face.angry=Math.max(face.angry||0,.32*Math.sin(Math.PI*Math.max(0,Math.min(1,combat.progress))));face.relaxed=(face.relaxed||0)*.4}if(em){for(const k of ['happy','angry','surprised','blink','relaxed'])if(em.getExpression(k))em.setValue(k,face[k]||0)}
  const fingers=animateFingers163(a,dt,mode,a.weight,a.motion.jump,t,j.mountHorse?Math.max(Math.abs(j.mountTurn||0),j.mountBrake||0):j.turn,mode==='ride'?null:j.weapon307,combat);const airborne=!!(WWMotion.phaseOf(j)||a.motion.jump>.12),offGround=['down','recover'].includes(combat?.kind)||!!combat?.roll334||(j.height||0)>.006||(j.velocity||0)>.01||(j.hop320||0)>.012;
  if(detail===0&&ground&&bw320<.05&&!(mode==='idle'&&gait<.15)){vrm.humanoid.update();a.footIK=WWFootIK.apply(a.T,a,ground,dt,gait,airborne,mode)}else{WWFootIK.reset(a);a.footIK=null}
  let springCount316=0;if(!a.springFailed317){try{springCount316=springMotion316(a,secondary,!!j.physics316&&detail===0&&!j.reduce316&&a.physicsTier317<2);}catch(e){a.springFailed317=true;try{springMotion316(a,secondary,false)}catch{}console.warn('Optional spring bias disabled',e)}}
  if(detail===0){for(let remain=dt;remain>0;){let d=Math.min(.033,remain);vrm.update(d);remain-=d}}else{vrm.humanoid.update();vrm.expressionManager?.update();}
  if(detail<=1&&!['down','recover'].includes(combat?.kind)&&!combat?.roll334){const contact=bw320>.05&&!offGround&&ground&&typeof WWFootIK.groundCombat320==='function'?WWFootIK.groundCombat320(a.T,a,ground,bw320):WWFootIK.groundIdle(a.T,a,ground,dt,gait,offGround,mode);if(contact)a.footIK=contact;}
  a.motionState=a.motion.state;a.poseCheck={motionVersion:'33.4',combatBody320:{...body320},face255:{...face},lookYaw255:look,brake250:a.motion.brake250||0,turnBody250:a.motion.turnBody250||0,drive250:a.motion.drive250||0,fingers163:fingers,actionWeights:{...weights},secondary:{...secondary},springCount316,wearables337:{tier:a.physicsTier317,springBias:!!a.spring316?.active,roles:a.spring316?.counts||null,clothPanels:a.identityMotion?.length||0},targetHeight:1.68*heightFactor(preset(a.motionProfile)),original:!!a.original,measuredSpeed:a.motion.speed,turn:a.motion.turn,identity:a.identityType||null,fallbackBase:a.fallbackBase||null,cycle:a.motion.cycle,walkWeight:a.motion.walk,runWeight:a.motion.run,profile:a.motionProfile,legSign:sign,hip:[v.hipL,v.hipR],knee:['left','right'].map(side=>(vrm.humanoid.getNormalizedBoneNode(side+'LowerLeg')?.rotation.x||0)*sign),ankle:[v.ankleL,v.ankleR],jumpWeight:a.motion.jump};
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
 function release(a){if(!a||a.released335)return;a.released335=true;try{if(a.spring316?.active)springMotion316(a,{},false)}catch{}try{if(typeof WWIdentity!=='undefined')WWIdentity.clear(a)}finally{a.root.removeFromParent();try{a.dispose?.()}finally{a.contacts={};a.combatFilter308=null;a.dispose=null;}}}
 const api={createLoadQueue335,loadQueueStats335:()=>loadQueue335.stats(),dodgePose334,weaponKeyframe321,clips321,actionFootwork320,boundedFootwork320,danceProfiles320,combatBody320,combatGrip312,fingerTargets163,fingerResponse251,setupFingers163,animateFingers163,load,animate,sources,roster,preset,applyPreset,release,heightFactor,createBufferCache140,bufferStats140:()=>buffers.stats()};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

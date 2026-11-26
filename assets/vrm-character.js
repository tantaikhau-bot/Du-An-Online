/* V10.7: skinned VRM avatar pipeline. CC0 VRoid sample models, not original game artwork. */
(function(){
 const sources={male:'Sakurada_Fumiriya',female:'Sendagaya_Shino',male2:'HairSample_Male',female2:'HairSample_Female'};
 const roster=[
 {id:'m1',gender:'male',name:'Lữ khách',source:'male',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'m2',gender:'male',name:'Kiếm sĩ',source:'male2',hair:0x3c4259,cloth:0x7395d9,height:1.06},
 {id:'m3',gender:'male',name:'Phong Vân',source:'male',hair:0xb8c6e5,cloth:0x80bdad,height:1.03},
 {id:'m4',gender:'male',name:'Hỏa Vũ',source:'male2',hair:0xc37c50,cloth:0xd19b76,height:.97},
 {id:'m5',gender:'male',name:'Dạ Hành',source:'male',hair:0x57556e,cloth:0x717bba,height:1.08},
 {id:'f1',gender:'female',name:'Nguyệt Hoa',source:'female',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'f2',gender:'female',name:'Lam Ngọc',source:'female2',hair:0x7a9bd8,cloth:0x89c4e5,height:1.02},
 {id:'f3',gender:'female',name:'Ánh Mai',source:'female',hair:0xe9b66c,cloth:0xe4c17c,height:.96},
 {id:'f4',gender:'female',name:'Tử Vân',source:'female2',hair:0xb799da,cloth:0xbaa3d8,height:1.04},
 {id:'f5',gender:'female',name:'Bạch Linh',source:'female',hair:0xd0e0ee,cloth:0x93c4bd,height:1.06},
 {"id":"m6","gender":"male","name":"Băng Kiếm","source":"male2","hair":10337752,"cloth":10012120,"height":1.05},
 {"id":"m7","gender":"male","name":"Lâm Vũ","source":"male","hair":6707015,"cloth":9088629,"height":1.01},
 {"id":"m8","gender":"male","name":"Thiên Quang","source":"male2","hair":14992530,"cloth":14996909,"height":1.09},
 {"id":"m9","gender":"male","name":"Hắc Phong","source":"male","hair":3881288,"cloth":8551569,"height":0.99},
 {"id":"m10","gender":"male","name":"Hải Đăng","source":"male2","hair":8303542,"cloth":8497100,"height":1.04},
 {"id":"f6","gender":"female","name":"Hồng Liên","source":"female2","hair":14385804,"cloth":14261167,"height":0.99},
 {"id":"f7","gender":"female","name":"Thanh Trúc","source":"female","hair":8101509,"cloth":10148279,"height":1.03},
 {"id":"f8","gender":"female","name":"Băng Tâm","source":"female2","hair":13229286,"cloth":11196399,"height":1.07},
 {"id":"f9","gender":"female","name":"Dạ Nguyệt","source":"female","hair":5854323,"cloth":9207995,"height":1.01},
 {"id":"f10","gender":"female","name":"Kim Vũ","source":"female2","hair":14992257,"cloth":15126948,"height":0.97}
 ];
 function preset(id,gender='male'){return roster.find(p=>p.id===id)||roster.find(p=>p.gender===gender)||roster[0]}
 function applyPreset(T,a,p){
  if(a.applied===p.id)return;
  a.root.scale.setScalar(a.baseScale*p.height);
  for(const {material,base,role} of a.colors){material.color.copy(base);if(role==='hair')material.color.multiply(new T.Color(p.hair));else if(role==='cloth')material.color.multiply(new T.Color(p.cloth))}
  a.applied=p.id;
 }
 const remote='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/';
 let lib;const buffers=new Map();async function modelBuffer(kind){if(!buffers.has(kind)){const task=fetch('/assets/'+sources[kind]+'.vrm').then(r=>{if(!r.ok)throw Error('VRM HTTP '+r.status);return r.arrayBuffer()}).catch(e=>{buffers.delete(kind);throw e});buffers.set(kind,task)}return buffers.get(kind)}
 async function load(T,kind){
  lib??=Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('/assets/three-vrm.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js'))]);
  let modules;try{modules=await lib}catch(e){lib=null;throw e}const [{GLTFLoader},{VRMLoaderPlugin,VRMUtils}]=modules;
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
  let gltf;
  gltf=await loader.parseAsync(await modelBuffer(kind),'/assets/');
  const vrm=gltf.userData.vrm;if(!vrm?.humanoid)throw Error('Invalid VRM');
  VRMUtils.rotateVRM0(vrm);VRMUtils.removeUnnecessaryVertices(vrm.scene);VRMUtils.removeUnnecessaryJoints(vrm.scene);
  const box=new T.Box3().setFromObject(vrm.scene),size=box.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<.5||size.y>5)throw Error('Invalid avatar scale');
  const root=new T.Group();root.add(vrm.scene);root.rotation.y=Math.PI;root.scale.setScalar(1.68/size.y);vrm.scene.position.y-=box.min.y;
  vrm.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false}});
  const armDown={};for(const side of ['left','right']){const lower=vrm.humanoid.getNormalizedBoneNode(side+'LowerArm');armDown[side]=lower&&Math.abs(lower.position.x)>.01?-Math.sign(lower.position.x):(side==='left'?1:-1)}
  const colors=[],seen=new Set();vrm.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m?.color||seen.has(m))continue;seen.add(m);const n=(m.name||'').toLowerCase();const role=/hair/.test(n)?'hair':/skin|face|body|eye|mouth|teeth|brow|lash/.test(n)?'skin':'cloth';colors.push({material:m,base:m.color.clone(),role})}});
  return {root,vrm,kind,phase:0,weight:0,elapsed:0,baseScale:root.scale.x,colors,armDown};
 }
 function animate(a,dt,gait,mode='idle',jump=0){
  const {vrm}=a;dt=Math.min(.05,Math.max(0,dt));a.elapsed+=dt;a.phase+=dt*(gait>.8?10:7);a.weight+=(gait-a.weight)*(1-Math.exp(-dt*10));let t=a.phase,s=Math.sin(t)*a.weight;
  function bone(name,x=0,y=0,z=0){let b=vrm.humanoid.getNormalizedBoneNode(name);if(b)b.rotation.set(x,y,z)}
  const left=a.armDown?.left??1,right=a.armDown?.right??-1;
  bone('leftUpperArm',s*.38,0,left*1.40);bone('rightUpperArm',-s*.38,0,right*1.40);
  bone('leftLowerArm',-.12-Math.max(0,s)*.32);bone('rightLowerArm',-.12-Math.max(0,-s)*.32);
  bone('leftUpperLeg',-s*.62+jump*.18);bone('rightUpperLeg',s*.62+jump*.18);
  bone('leftLowerLeg',Math.max(0,s)*.64+jump*.3);bone('rightLowerLeg',Math.max(0,-s)*.64+jump*.3);
  bone('spine',a.weight*.08,Math.sin(t)*.04*a.weight,Math.sin(t*.32)*.015);
  bone('head',Math.sin(t*.25)*.016,Math.sin(t*.21)*.06*(1-a.weight),0);
  if(mode==='sit'||mode==='ride'){bone('leftUpperLeg',-1.1);bone('rightUpperLeg',-1.1);bone('leftLowerLeg',1.2);bone('rightLowerLeg',1.2);bone('leftUpperArm',-.35,0,left*1.25);bone('rightUpperArm',-.35,0,right*1.25)}if(mode==='dance'||mode==='duet'){bone('leftUpperArm',Math.sin(t*2)*.4,0,left*.85);bone('rightUpperArm',-Math.sin(t*2)*.4,0,right*.85);bone('spine',0,Math.sin(t)*.15,Math.sin(t*2)*.09)}if(mode==='wave'){bone('rightUpperArm',-.25,0,-right*.25);bone('rightLowerArm',-.8,0,Math.sin(t*2)*.35)}
  const em=vrm.expressionManager;if(em){for(const k of ['happy','angry','surprised','blink']){let value=k==='blink'?Math.max(0,1-Math.abs((a.elapsed%4.9)-4.65)/.13):k==='happy'&&['happy','smile','wave','cheer','portrait'].includes(mode)?0.75:k===mode?.8:0;if(em.getExpression(k))em.setValue(k,value)}}
  vrm.update(dt);
  if(mode==='idle'&&a.weight<.05){vrm.scene.updateMatrixWorld(true);const h=vrm.humanoid.getRawBoneNode('head'),l=vrm.humanoid.getRawBoneNode('leftHand'),r=vrm.humanoid.getRawBoneNode('rightHand'),ls=vrm.humanoid.getRawBoneNode('leftUpperArm'),rs=vrm.humanoid.getRawBoneNode('rightUpperArm');if(h&&l&&r&&ls&&rs){const hy=h.matrixWorld.elements[13];a.handsBelowHead=l.matrixWorld.elements[13]<hy&&r.matrixWorld.elements[13]<hy;a.handsDown=l.matrixWorld.elements[13]<ls.matrixWorld.elements[13]&&r.matrixWorld.elements[13]<rs.matrixWorld.elements[13]}}
 }
 const api={load,animate,sources,roster,preset,applyPreset};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

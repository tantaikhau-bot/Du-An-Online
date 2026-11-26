/* V10.4: skinned VRM avatar pipeline. CC0 VRoid sample models, not original game artwork. */
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
 {id:'f5',gender:'female',name:'Bạch Linh',source:'female',hair:0xd0e0ee,cloth:0x93c4bd,height:1.06}
 ];
 function preset(id,gender='male'){return roster.find(p=>p.id===id)||roster.find(p=>p.gender===gender)||roster[0]}
 function applyPreset(T,a,p){
  if(a.applied===p.id)return;
  a.root.scale.setScalar(a.baseScale*p.height);
  for(const {material,base,role} of a.colors){material.color.copy(base);if(role==='hair')material.color.multiply(new T.Color(p.hair));else if(role==='cloth')material.color.multiply(new T.Color(p.cloth))}
  a.applied=p.id;
 }
 const remote='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/';
 let lib;
 async function load(T,kind){
  lib??=Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('/assets/three-vrm.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js'))]);
  let modules;try{modules=await lib}catch(e){lib=null;throw e}const [{GLTFLoader},{VRMLoaderPlugin,VRMUtils}]=modules;
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
  let gltf;
  gltf=await loader.loadAsync('/assets/'+sources[kind]+'.vrm');
  const vrm=gltf.userData.vrm;if(!vrm?.humanoid)throw Error('Invalid VRM');
  VRMUtils.rotateVRM0(vrm);VRMUtils.removeUnnecessaryVertices(vrm.scene);VRMUtils.removeUnnecessaryJoints(vrm.scene);
  const box=new T.Box3().setFromObject(vrm.scene),size=box.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<.5||size.y>5)throw Error('Invalid avatar scale');
  const root=new T.Group();root.add(vrm.scene);root.rotation.y=Math.PI;root.scale.setScalar(1.68/size.y);vrm.scene.position.y-=box.min.y;
  vrm.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false}});
  const colors=[],seen=new Set();vrm.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m?.color||seen.has(m))continue;seen.add(m);const n=(m.name||'').toLowerCase();const role=/hair/.test(n)?'hair':/skin|face|body|eye|mouth|teeth|brow|lash/.test(n)?'skin':'cloth';colors.push({material:m,base:m.color.clone(),role})}});
  return {root,vrm,kind,phase:0,weight:0,elapsed:0,baseScale:root.scale.x,colors};
 }
 function animate(a,dt,gait,mode='idle',jump=0){
  const {vrm}=a;dt=Math.min(.05,Math.max(0,dt));a.elapsed+=dt;a.phase+=dt*(gait>.8?10:7);a.weight+=(gait-a.weight)*(1-Math.exp(-dt*10));let t=a.phase,s=Math.sin(t)*a.weight;
  function bone(name,x=0,y=0,z=0){let b=vrm.humanoid.getNormalizedBoneNode(name);if(b)b.rotation.set(x,y,z)}
  bone('leftUpperArm',s*.42,0,-1.18);bone('rightUpperArm',-s*.42,0,1.18);
  bone('leftLowerArm',-.12-Math.max(0,s)*.32);bone('rightLowerArm',-.12-Math.max(0,-s)*.32);
  bone('leftUpperLeg',-s*.62+jump*.18);bone('rightUpperLeg',s*.62+jump*.18);
  bone('leftLowerLeg',Math.max(0,s)*.64+jump*.3);bone('rightLowerLeg',Math.max(0,-s)*.64+jump*.3);
  bone('spine',a.weight*.08,Math.sin(t)*.04*a.weight,Math.sin(t*.32)*.015);
  bone('head',Math.sin(t*.25)*.016,Math.sin(t*.21)*.06*(1-a.weight),0);
  if(mode==='sit'||mode==='ride'){bone('leftUpperLeg',-1.1);bone('rightUpperLeg',-1.1);bone('leftLowerLeg',1.2);bone('rightLowerLeg',1.2);bone('leftUpperArm',-.35,0,-1.15);bone('rightUpperArm',-.35,0,1.15)}if(mode==='dance'||mode==='duet'){bone('leftUpperArm',Math.sin(t*2)*.4,0,-.7);bone('rightUpperArm',-Math.sin(t*2)*.4,0,.7);bone('spine',0,Math.sin(t)*.15,Math.sin(t*2)*.09)}if(mode==='wave'){bone('rightUpperArm',-.25,0,.25);bone('rightLowerArm',-.8,0,Math.sin(t*2)*.35)}
  const em=vrm.expressionManager;if(em){for(const k of ['happy','angry','surprised','blink']){let value=k==='blink'?Math.max(0,1-Math.abs((a.elapsed%4.9)-4.65)/.13):k==='happy'&&['happy','smile','wave','cheer','portrait'].includes(mode)?0.75:k===mode?.8:0;if(em.getExpression(k))em.setValue(k,value)}}
  vrm.update(dt);
 }
 const api={load,animate,sources,roster,preset,applyPreset};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

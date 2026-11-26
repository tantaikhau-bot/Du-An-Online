/* V10.4: skinned VRM avatar pipeline. CC0 VRoid sample models, not original game artwork. */
(function(){
 const sources={male:'Sakurada_Fumiriya',female:'Sendagaya_Shino'};
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
  return {root,vrm,kind,phase:0,weight:0,elapsed:0};
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
  if(mode==='wave'){bone('rightUpperArm',-.25,0,.25);bone('rightLowerArm',-.8,0,Math.sin(t*2)*.35)}
  const em=vrm.expressionManager;if(em){for(const k of ['happy','angry','surprised','blink']){let value=k==='blink'?Math.max(0,1-Math.abs((a.elapsed%4.9)-4.65)/.13):k==='happy'&&['happy','smile','wave','cheer','portrait'].includes(mode)?0.75:k===mode?.8:0;if(em.getExpression(k))em.setValue(k,value)}}
  vrm.update(dt);
 }
 window.WWVRM={load,animate,sources};
})();

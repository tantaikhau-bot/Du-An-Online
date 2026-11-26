/* KayKit CC0 locomotion clips sampled into safe, avatar-scaled movement channels.
 * No source root translation is applied to game movement. */
(function(root){
 let pending,library=null;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
 const names=['Walking_A','Walking_B','Walking_C','Running_A','Running_B'];
 async function ready(T){
  if(library)return library;if(pending)return pending;
  pending=(async()=>{
   const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
   const g=await new GLTFLoader().loadAsync('/assets/locomotion-kaykit.glb');
   const model=g.scene;model.updateMatrixWorld(true);
   const node=n=>model.getObjectByName(n)||model.getObjectByName(n.replace('.',''));
   const get=n=>{let v=node(n);if(!v)throw Error('Missing animation bone '+n);return v.getWorldPosition(new T.Vector3())};
   const left=get('upperleg.l').sub(get('upperleg.r')).normalize(),up=new T.Vector3(0,1,0);
   const forward=get('toes.l').sub(get('foot.l'));forward.y=0;forward.normalize();
   if(forward.lengthSq()<.5)throw Error('Animation forward axis unavailable');
   const pitch=v=>Math.atan2(-v.dot(forward),-v.dot(up));
   const sample=()=>{
    let pose={};for(const [side,k] of [['l','L'],['r','R']]){
     const thigh=get('lowerleg.'+side).sub(get('upperleg.'+side)),shin=get('foot.'+side).sub(get('lowerleg.'+side));
     const arm=get('lowerarm.'+side).sub(get('upperarm.'+side)),fore=get('wrist.'+side).sub(get('lowerarm.'+side));
     pose['hip'+k]=clamp(pitch(thigh),-.62,.57);pose['knee'+k]=clamp(thigh.angleTo(shin),0,1.10);
     pose['arm'+k]=clamp(pitch(arm),-.56,.56);pose['elbow'+k]=clamp(arm.angleTo(fore),.10,1.15);
    }
    return pose;
   };
   const mixer=new T.AnimationMixer(model),out={};
   for(const name of names){const clip=g.animations.find(v=>v.name===name);if(!clip||clip.duration<=0)throw Error('Missing clip '+name);
    const a=mixer.clipAction(clip);a.reset().play();const frames=[];
    for(let i=0;i<64;i++){mixer.setTime(clip.duration*i/64);model.updateMatrixWorld(true);const p=sample();if(!Object.values(p).every(Number.isFinite))throw Error('Invalid motion samples');frames.push(p)}
    a.stop();mixer.uncacheAction(clip);out[name]=frames;
   }
   mixer.stopAllAction();mixer.uncacheRoot(model);library=out;return out;
  })().catch(e=>{console.warn('KayKit movement unavailable; safe fallback',e);setTimeout(()=>{pending=null},30000);return null});
  return pending;
 }
 function sampleCurve(frames,phase){const n=frames.length,x=((phase/(Math.PI*2)%1+1)%1)*n,i=Math.floor(x),t=x-i,a=frames[i],b=frames[(i+1)%n];return Object.fromEntries(Object.keys(a).map(k=>[k,mix(a[k],b[k],t)]))}
 function apply(a,v,j,mode,dt){
  const m=a.motion,move=Math.min(1,m.walk+m.run),run=m.run/Math.max(.001,move),active=library&&['idle','walk','run'].includes(mode)&&!j.prep&&!j.height&&!j.velocity&&!j.land&&m.jump<.10;
  a.clipWeight=mix(a.clipWeight||0,active?move*.70:0,1-Math.exp(-dt/.16));
  if(!library||a.clipWeight<.002){a.clipMotion='procedural';return v}
  const id=a.motionProfile||'m1',cfg=WWMotion.profile(id),i=Number(id.slice(1))||1;
  const walkName=['Walking_A','Walking_B','Walking_C'][(i-1)%3],runName=(id.startsWith('f')||i%2===0)?'Running_B':'Running_A';
  const w=sampleCurve(library[walkName],m.cycle),r=sampleCurve(library[runName],m.cycle),p={...v};
  for(const k of Object.keys(w)){
   let target=mix(w[k],r[k],run),scale=k.startsWith('hip')?cfg.stride:k.startsWith('arm')?cfg.arms:k.startsWith('elbow')?cfg.elbow:1;
   let bounds=k.startsWith('hip')?[-.62,.57]:k.startsWith('arm')?[-.56,.56]:k.startsWith('knee')?[0,1.12]:[.10,1.20];
   p[k]=clamp(mix(v[k],target*scale*move,a.clipWeight),...bounds);
  }
  a.clipMotion=a.clipWeight>.05?(run>.5?runName:walkName):'procedural';return p;
 }
 const api={ready,apply,sampleCurve};if(typeof module!=='undefined')module.exports=api;else root.WWClips=api;
})(typeof globalThis!=='undefined'?globalThis:this);

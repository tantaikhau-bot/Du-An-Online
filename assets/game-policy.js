'use strict';
function clarityStep100(v,rate,p95,cap,mobile,battery){let target=cap|| (mobile?45:60),slow=rate<Math.min(28,target*.78)||p95>Math.max(65,1800/target),severe=rate<Math.min(19,target*.65),good=rate>=Math.min(mobile?40:53,target*.9)&&p95<=Math.max(35,1650/target);let tier=v.tier,scale=v.scale,down=0;
 if(slow){if(tier<2){tier++;down=1}else if(severe||scale>.82){scale=Math.max(battery?.62:mobile?.85:.60,scale*(severe?.86:.94));down=1}}else if(good){let top=battery?1.1:1.35;if(scale<top)scale=Math.min(top,scale+.10);else if(tier>(battery?2:mobile?1:0))tier--}
 return {tier,scale,down,slow,good,severe}}
 function resolution77(w,h,dpr,q,scale,fast,hd,maxBuffer,mobile){
  const budget=fast?700000:hd?3600000:mobile?[2200000,3000000,3800000][q]:[1800000,2600000,3600000][q];
  const base=fast?.9:hd?2.0:mobile?1.55:1.35;
  const floor=fast?.60:mobile?(hd?1.50:1.15):scale<.76?.60:.85;
  const ceiling=fast?1:hd?2.5:mobile?2:2.25;
  return Math.min(Math.max(floor,base*scale),Math.max(1,dpr),ceiling,Math.sqrt(budget/(w*h)),maxBuffer/Math.max(w,h));
 }

// Explicit quality ceilings preserve the existing three internal LOD levels.
const WW_PERF118=Object.freeze({
 battery:Object.freeze({quality:0,tier:2,scale:0.8,cap:30,label:'Tiết kiệm pin'}),
 low:Object.freeze({quality:0,tier:1,scale:1,cap:45,label:'Thấp'}),
 balanced:Object.freeze({quality:1,tier:1,scale:1,cap:0,label:'Cân bằng'}),
 high:Object.freeze({quality:2,tier:0,scale:1,cap:0,label:'Cao'}),
 sharp:Object.freeze({quality:2,tier:0,scale:1.2,cap:0,label:'Ultra / HD'})
});
function perfPreset118(q,saved,memory,cores,mobile){
 if(q.get('perf')==='1')return 'battery';
 if(q.get('hd')==='1')return 'sharp';
 if(q.get('fx')==='basic')return 'balanced';
 const requested=q.get('gfx');
 if(Object.hasOwn(WW_PERF118,requested))return requested;
 if(Object.hasOwn(WW_PERF118,saved))return saved;
 return (Number.isFinite(memory)&&memory<=4)||(mobile&&Number.isFinite(cores)&&cores<=4)?'low':'balanced';
}
function perfWarning118(fps,p95,cap,heap){
 const target=cap||60;
 const framePressure=Number.isFinite(fps)&&fps<target*.65&&Number.isFinite(p95)&&p95>1000/target*1.6;
 const heapPressure=Number.isFinite(heap)&&heap>=.85;
 return {framePressure,heapPressure};
}
// V12.4: preserve map bounds; pick safe points in existing outer regions.
const WW_LANDMARK124=Object.freeze([
 {id:'pine-lookout',n:'Vọng cảnh rừng thông',region:'pine',x:-63,z:-47,desc:'Lối ngắm rừng thông và thung lũng sương.'},
 {id:'ruin-arch',n:'Cổng đá cổ',region:'ruins',x:63,z:-45,desc:'Điểm dừng bên di tích và cổng đá.'},
 {id:'amber-rest',n:'Trạm nghỉ hổ phách',region:'amber',x:-63,z:47,desc:'Góc nghỉ ngắm sắc lá vàng.'},
 {id:'snow-beacon',n:'Đèn dẫn lối tuyết',region:'summit',x:63,z:46,desc:'Điểm ngắm cao nguyên tuyết.'}
].map(Object.freeze));
const WW_WORLD137=Object.freeze({halfX:72,halfZ:88,terrainX:152,terrainZ:184,margin:4});
const WW_EXPANSION137=Object.freeze([
 {id:'north-dunes',n:'Đồng cát phương Bắc',region:'north',x:-22,z:-82,desc:'Dải đất cát phía bắc, ngoài ranh giới bản đồ cũ.'},
 {id:'north-stones',n:'Bãi đá bình minh',region:'north',x:22,z:-82,desc:'Điểm dừng ngắm đường chân trời phía bắc.'},
 {id:'south-prairie',n:'Thảo nguyên phương Nam',region:'south',x:-22,z:82,desc:'Đồng cỏ rộng phía nam, ngoài ranh giới cũ.'},
 {id:'south-crystal',n:'Trạm pha lê phương Nam',region:'south',x:22,z:82,desc:'Điểm ngắm cảnh vùng đồng cỏ mới.'}
].map(Object.freeze));
function insideWorld137(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=WW_WORLD137.halfX&&Math.abs(z)<=WW_WORLD137.halfZ}
function expansionRegion137(z){return z<-76?'north':z>76?'south':null}
function landmarkSite124(spec,walkable,height,biome,excluded=[]){
 for(const radius of [0,1.5,3,4.5,6])for(let i=0;i<(radius?8:1);i++){
  const a=i*Math.PI/4,x=Math.round((spec.x+Math.cos(a)*radius)*2)/2,z=Math.round((spec.z+Math.sin(a)*radius)*2)/2;
  if(Math.abs(x)>69||Math.abs(z)>(['north','south'].includes(spec.region)?85:69)||biome(x,z)!==spec.region||excluded.some(q=>(q.x-x)**2+(q.z-z)**2<16))continue;
  const y=height(x,z);if(!Number.isFinite(y))continue;
  if([[0,0],[1.1,0],[-1.1,0],[0,1.1],[0,-1.1]].every(([dx,dz])=>walkable(x+dx,z+dz)&&Math.abs(height(x+dx,z+dz)-y)<.6))return {...spec,x,z};
 }
 return null;
}
function cellVisible124(dx,dz,range,wasVisible,padding=5){
 if(![dx,dz,range,padding].every(Number.isFinite)||range<0)return false;
 const limit=range+(wasVisible?Math.max(0,padding):0);
 return dx*dx+dz*dz<=limit*limit;
}
function landmarkVisits124(raw){return Array.isArray(raw)?[...new Set(raw.filter(id=>[...WW_LANDMARK124,...WW_EXPANSION137].some(p=>p.id===id)))]:[]}
// Visual presets without an additional render pass.
const WW_LOOK131=Object.freeze({original:Object.freeze({name:'Nguyên bản',exposure:1,ambient:1,sun:1}),cinema:Object.freeze({name:'Điện ảnh',exposure:1.04,ambient:.94,sun:1.09}),clear:Object.freeze({name:'Sáng rõ',exposure:1.10,ambient:1.14,sun:.96})});
function look131(key){return Object.hasOwn(WW_LOOK131,key)?WW_LOOK131[key]:WW_LOOK131.original}
function blendLook131(state,key,dt){const v=look131(key),k=1-Math.exp(-Math.max(0,Math.min(.1,dt||0))*4);for(const name of ['exposure','ambient','sun'])state[name]+=(v[name]-state[name])*k;return state}
function cameraSafe131(previous,limit,dt){
 limit=Number.isFinite(limit)?Math.max(.13,Math.min(1,limit)):1;
 previous=Number.isFinite(previous)?Math.max(.13,Math.min(1,previous)):limit;
 return limit<previous?limit:previous+(limit-previous)*(1-Math.exp(-Math.max(0,Math.min(100,dt||0))/250));
}
function stepSound131(state,distance,moving,run){
 if(!moving){state.distance=0;return false}
 state.distance+=Math.max(0,Math.min(.25,Number.isFinite(distance)?distance:0));
 const stride=run?.85:.58;
 if(state.distance<stride)return false;state.distance%=stride;return true;
}
if(typeof module!=='undefined')module.exports={WW_WORLD137,WW_EXPANSION137,insideWorld137,expansionRegion137,clarityStep100,resolution77,WW_PERF118,perfPreset118,perfWarning118,WW_LANDMARK124,landmarkSite124,cellVisible124,landmarkVisits124,WW_LOOK131,look131,blendLook131,cameraSafe131,stepSound131};

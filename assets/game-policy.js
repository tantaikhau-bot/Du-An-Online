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
function landmarkSite124(spec,walkable,height,biome,excluded=[]){
 for(const radius of [0,1.5,3,4.5,6])for(let i=0;i<(radius?8:1);i++){
  const a=i*Math.PI/4,x=Math.round((spec.x+Math.cos(a)*radius)*2)/2,z=Math.round((spec.z+Math.sin(a)*radius)*2)/2;
  if(Math.abs(x)>69||Math.abs(z)>69||biome(x,z)!==spec.region||excluded.some(q=>(q.x-x)**2+(q.z-z)**2<16))continue;
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
function landmarkVisits124(raw){return Array.isArray(raw)?[...new Set(raw.filter(id=>WW_LANDMARK124.some(p=>p.id===id)))]:[]}
if(typeof module!=='undefined')module.exports={clarityStep100,resolution77,WW_PERF118,perfPreset118,perfWarning118,WW_LANDMARK124,landmarkSite124,cellVisible124,landmarkVisits124};

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
 return mobile||(Number.isFinite(memory)&&memory<=4)?'low':'balanced';
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
const WW_WORLD137=Object.freeze({halfX:120,halfZ:136,terrainX:248,terrainZ:280,margin:4});
const WW_EXPANSION137=Object.freeze([
 {id:'north-dunes',n:'Đồng cát phương Bắc',region:'north',x:-22,z:-82,desc:'Dải đất cát phía bắc, ngoài ranh giới bản đồ cũ.'},
 {id:'north-stones',n:'Bãi đá bình minh',region:'north',x:22,z:-82,desc:'Điểm dừng ngắm đường chân trời phía bắc.'},
 {id:'south-prairie',n:'Thảo nguyên phương Nam',region:'south',x:-22,z:82,desc:'Đồng cỏ rộng phía nam, ngoài ranh giới cũ.'},
 {id:'south-crystal',n:'Trạm pha lê phương Nam',region:'south',x:22,z:82,desc:'Điểm ngắm cảnh vùng đồng cỏ mới.'},
 {id:'north-mist',n:'Rừng sương Bắc',region:'north',x:-55,z:-112,desc:'Rừng sâu trên sườn đồi và lối mòn.'},
 {id:'north-ridge',n:'Đỉnh gió Bắc',region:'north',x:55,z:-112,desc:'Đường chân trời và các dãy núi xa.'},
 {id:'south-meadow',n:'Đồng hoa Nam',region:'south',x:-55,z:112,desc:'Thảo nguyên rộng với cỏ dại và hoa.'},
 {id:'south-view',n:'Đồi ngắm sao',region:'south',x:55,z:112,desc:'Đồi cỏ cao nhìn ra thung lũng.'},
 {id:'west-wood',n:'Rừng cổ thụ',region:'west',x:-104,z:-27,desc:'Những thân cây lớn và bãi đá phủ rêu.'},
 {id:'west-bank',n:'Bờ sông tây',region:'west',x:-104,z:24,desc:'Đồi thoai thoải bên dòng sông.'},
 {id:'east-stone',n:'Đồi đá phương Đông',region:'east',x:104,z:-27,desc:'Dãy đá phong hóa và lối đồi.'},
 {id:'east-grass',n:'Thung lũng Đông',region:'east',x:104,z:24,desc:'Đồng cỏ thoáng và sườn núi xa.'}
].map(Object.freeze));
function insideWorld137(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=WW_WORLD137.halfX&&Math.abs(z)<=WW_WORLD137.halfZ}
function expansionRegion137(z,x=0){return z<-76?'north':z>76?'south':x<-72?'west':x>72?'east':null}
function landmarkSite124(spec,walkable,height,biome,excluded=[]){
 for(const radius of [0,1.5,3,4.5,6])for(let i=0;i<(radius?8:1);i++){
  const a=i*Math.PI/4,x=Math.round((spec.x+Math.cos(a)*radius)*2)/2,z=Math.round((spec.z+Math.sin(a)*radius)*2)/2;
  if(Math.abs(x)>WW_WORLD137.halfX-3||Math.abs(z)>WW_WORLD137.halfZ-3||biome(x,z)!==spec.region||excluded.some(q=>(q.x-x)**2+(q.z-z)**2<16))continue;
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

// V16.2 deterministic hills, natural paths and tile partitioning. Preserve the old centre and river approaches.
function smooth162(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
function frontierHeight162(x,z){const edge=Math.max(Math.abs(x)-66,Math.abs(z)-74),fade=smooth162(0,30,edge),river=smooth162(5,14,Math.abs(z+7.2));const hills=3.5+1.9*Math.sin(x*.067+z*.032)+1.3*Math.cos(z*.084-x*.023)+.72*Math.sin(x*.15-z*.11);const peaks=Math.max(0,Math.sin(x*.038+z*.024)*Math.cos(z*.042-x*.018))*5;return fade*river*Math.max(.15,hills+peaks)}
function trailDistance162(x,z){const edge=Math.max(Math.abs(x)-71,Math.abs(z)-76);if(edge<0)return Infinity;let a=Math.abs(Math.abs(x)-(55+5*Math.sin(z*.045))),b=Math.abs(Math.abs(z)-(27+4*Math.sin(x*.055))),c=Math.abs(Math.abs(x)-96);return Math.min(Math.abs(z)>73?a:Infinity,Math.abs(x)>70?b:Infinity,Math.abs(x)>84&&Math.abs(z)<38?c:Infinity)}
const WW_TILE_X162=Object.freeze([-124,-100,-76,-38,0,38,76,100,124]),WW_TILE_Z162=Object.freeze([-140,-108,-76,-38,0,38,76,108,140]);
function terrainTiles162(density){const out=[];for(let j=0;j<WW_TILE_Z162.length-1;j++)for(let i=0;i<WW_TILE_X162.length-1;i++){const x0=WW_TILE_X162[i],x1=WW_TILE_X162[i+1],z0=WW_TILE_Z162[j],z1=WW_TILE_Z162[j+1],w=x1-x0,d=z1-z0;out.push({cx:(x0+x1)/2,cz:(z0+z1)/2,w,d,nx:Math.round(w*density),nz:Math.round(d*density)})}return out}
function tileAt162(x,z,tiles){return tiles.find(q=>Math.abs(x-q.cx)<=q.w/2+.0001&&Math.abs(z-q.cz)<=q.d/2+.0001)}
function tileVisible162(q,x,z,range){const dx=Math.max(0,Math.abs(x-q.cx)-q.w/2),dz=Math.max(0,Math.abs(z-q.cz)-q.d/2);return dx*dx+dz*dz<=range*range}

// V17.0 world atlas: planned destinations are not active travel targets.
const WW_ATLAS170=Object.freeze([{"id":"wish","n":"Cây Điều Ước","x":4,"z":-3.2,"c":"#f6ce83","icon":"✦","state":"open","desc":"Trái tim thế giới · quảng trường và cây thần."},{"id":"blossom","n":"Rừng Hoa Mộng Ước","x":-88,"z":0,"c":"#f6a7d9","icon":"❀","state":"pilot","desc":"Điểm thử nghiệm rừng hoa, chưa có nhiệm vụ riêng."},{"id":"ice","n":"Vương Quốc Băng Tuyết","x":-75,"z":-106,"c":"#b5e8ff","icon":"❄","state":"planned","desc":"Núi tuyết, cung điện băng."},{"id":"peace","n":"Thảo Nguyên An Lành","x":-28,"z":-28,"c":"#b4e48b","icon":"❧","state":"open","desc":"Đồng hoa và lối đi hiện có."},{"id":"light","n":"Vương Quốc Ánh Sáng","x":87,"z":-86,"c":"#ffe6a0","icon":"☀","state":"planned","desc":"Thành trì trắng vàng và thác nước."},{"id":"dream","n":"Thung Lũng Giấc Mơ","x":94,"z":0,"c":"#c4a1ff","icon":"☾","state":"planned","desc":"Thung lũng tím và tinh thể."},{"id":"magic","n":"Khu Rừng Diệu Kỳ","x":62,"z":82,"c":"#6ce8d4","icon":"✧","state":"planned","desc":"Rừng phát quang và nấm thần."},{"id":"volcano","n":"Núi Lửa Tái Sinh","x":104,"z":112,"c":"#ff9c70","icon":"▲","state":"planned","desc":"Núi lửa và đá dung nham."},{"id":"desert","n":"Sa Mạc Hi Vọng","x":-100,"z":108,"c":"#eec184","icon":"◇","state":"planned","desc":"Cồn cát và đền cổ."},{"id":"sea","n":"Biển Ngàn Ước","x":0,"z":123,"c":"#72d6ff","icon":"≈","state":"planned","desc":"Biển, đảo và hành trình thuyền."},{"id":"heaven","n":"Thiên Thành Điều Ước","x":27,"z":-126,"c":"#f0e5ff","icon":"♛","state":"planned","desc":"Thành phố trên mây, chưa có địa hình bay."}].map(Object.freeze));
function atlasDestination170(id){return WW_ATLAS170.find(q=>q.id===id&&q.state!=='planned')||null}
function atlasMap170(x,z){return {x:330+x*2.28,y:330+z*2.28}}
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
// V13.9: mobile-specific budget; desktop legacy policy remains unchanged.
function mobileCap139(preset,pref){
 if(preset==='battery'||preset==='low')return 30;
 return [30,45,60].includes(pref)?pref:30;
}
function mobileResolution139(w,h,dpr,quality,tier,scale,hd,maxBuffer){
 w=Math.max(1,w);h=Math.max(1,h);
 const budget=tier===2?420000:tier===1?850000:hd?1800000:1250000;
 const base=tier===2?.88:tier===1?1.12:hd?1.65:1.35;
 return Math.min(Math.max(.48,base*Math.max(.50,Math.min(1.25,scale))),Math.max(1,dpr),Math.sqrt(budget/(w*h)),maxBuffer/Math.max(w,h));
}
function mobileStep139(v,fps,p95,cap,ceiling,tierFloor,scaleCeiling,manual=false){
 const severe=fps<cap*.64||p95>100,slow=severe||fps<cap*.86||p95>1000/cap*1.9;
 const good=fps>=cap*.96&&p95<=1000/cap*1.16;
 let q={...v,slow:slow?(v.slow||0)+1:0,good:good?(v.good||0)+1:0,changed:false};
 if(severe||q.slow>=2){
  if(q.tier<2){q.tier=2;if(!manual)q.quality=Math.max(0,q.quality-1)}
  else if(q.quality>0&&!manual)q.quality--;
  else q.scale=Math.max(.50,q.scale*(severe?.78:.90));
  q.changed=q.tier!==v.tier||q.quality!==v.quality||Math.abs(q.scale-v.scale)>.001;q.slow=0;q.good=0;
 }else if(q.good>=12&&!manual){
  if(q.scale<scaleCeiling-.025)q.scale=Math.min(scaleCeiling,q.scale+.06);
  else if(q.tier>tierFloor)q.tier--;
  // Do not automatically increase geometry quality during play.
  q.quality=Math.min(q.quality,ceiling);q.changed=q.tier!==v.tier||q.quality!==v.quality||Math.abs(q.scale-v.scale)>.001;q.good=0;
 }
 return q;
}
function actorBudget139(mobile,tier,quality){
 return mobile?{peerCount:tier===2?5:8,peerRange:tier===2?26:38,peerRig:tier===2?9:18,npcRig:tier===2?10:20,npcCount:tier===2?1:2,load:1,mapMs:tier===2?650:450,heavyMs:tier===2?420:280}:{peerCount:[5,8,12][quality],peerRange:[28,38,48][quality],peerRig:Infinity,npcRig:55,npcCount:6,load:2,mapMs:[400,250,160][quality],heavyMs:[250,160,100][quality]};
}
function trimModels140(cache,keep,limit,dispose){for(const [key,value] of cache){if(cache.size<=limit)break;if(key===keep)continue;cache.delete(key);dispose(value)}return cache.size}
function expiredModel140(last,now,ttl=20000){return Number.isFinite(last)&&Number.isFinite(now)&&now-last>=ttl}
// Bounded simulation catch-up: a stall never causes unbounded movement or work.
function physicsDelta141(elapsed){return Number.isFinite(elapsed)?Math.max(0,Math.min(100,elapsed)):0}
function physicsSteps141(elapsed,step){const dt=physicsDelta141(elapsed);if(!dt)return 0;const n=Math.ceil(dt/25);for(let i=0;i<n;i++)step(dt/n);return n}
function angle141(current,target,dt,tau=75){if(!Number.isFinite(target))return current;if(!Number.isFinite(current))return target;const d=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+d*(1-Math.exp(-physicsDelta141(dt)/tau))}
function orbit141(state,yaw,pitch,zoom,dt,snap=false){
 if(snap||!Number.isFinite(state.yaw)){state.yaw=yaw;state.pitch=pitch;state.zoom=zoom;return state}
 const k=1-Math.exp(-physicsDelta141(dt)/75);
 state.yaw=angle141(state.yaw,yaw,dt);state.pitch+=(pitch-state.pitch)*k;state.zoom+=(zoom-state.zoom)*k;return state
}
function jumpStep141(j,ms,canLaunch){
 const dt=physicsDelta141(ms)/1000;let {prep,height,velocity,land}=j;let remaining=dt,landed=false;land=Math.max(0,land-dt);
 if(prep>0){const used=Math.min(prep,remaining);prep=Math.max(0,prep-used);remaining-=used;if(!prep&&canLaunch)velocity=4}
 if((velocity||height)&&remaining>0){const next=height+velocity*remaining-5.25*remaining*remaining;velocity-=10.5*remaining;if(next<=0){height=0;velocity=0;land=.34;landed=true}else height=next}
 return {prep,height,velocity,land,landed}
}
if(typeof module!=='undefined')module.exports={WW_ATLAS170,atlasDestination170,atlasMap170,smooth162,frontierHeight162,trailDistance162,terrainTiles162,tileAt162,tileVisible162,physicsDelta141,physicsSteps141,angle141,orbit141,jumpStep141,trimModels140,expiredModel140,mobileCap139,mobileResolution139,mobileStep139,actorBudget139,WW_WORLD137,WW_EXPANSION137,insideWorld137,expansionRegion137,clarityStep100,resolution77,WW_PERF118,perfPreset118,perfWarning118,WW_LANDMARK124,landmarkSite124,cellVisible124,landmarkVisits124,WW_LOOK131,look131,blendLook131,cameraSafe131,stepSound131};

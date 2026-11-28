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
 const requested=q.get('gfx');
 if(Object.hasOwn(WW_PERF118,requested))return requested;
 if(q.get('fx')==='basic')return 'low';
 if(Object.hasOwn(WW_PERF118,saved))return saved;
 return mobile?'balanced':(Number.isFinite(memory)&&memory<=4)?'low':'balanced';
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
const WW_ATLAS170=Object.freeze([{"id":"wish","n":"Cây Điều Ước","x":4,"z":-3.2,"c":"#f6ce83","icon":"✦","state":"open","desc":"Trái tim thế giới · quảng trường và cây thần."},{"id":"blossom","n":"Rừng Hoa Mộng Ước","x":-88,"z":0,"c":"#f6a7d9","icon":"❀","state":"open","desc":"Rừng anh đào, hồ Mộng Ước, đường dạo và điểm chụp ảnh."},{"id":"ice","n":"Vương Quốc Băng Tuyết","x":-75,"z":-106,"c":"#b5e8ff","icon":"❄","state":"open","desc":"Dãy núi tuyết, cung điện băng, rừng thông và tinh thể."},{"id":"peace","n":"Thảo Nguyên An Lành","x":-28,"z":-28,"c":"#b4e48b","icon":"❧","state":"open","desc":"Đồng hoa và lối đi hiện có."},{"id":"light","n":"Vương Quốc Ánh Sáng","x":87,"z":-86,"c":"#ffe6a0","icon":"☀","state":"open","desc":"Lâu đài mặt trời, quảng trường, tháp pha lê và thác nước trang trí."},{"id":"dream","n":"Thung Lũng Giấc Mơ","x":94,"z":0,"c":"#c4a1ff","icon":"☾","state":"open","desc":"Rừng tím, tinh thể, nấm phát sáng, tượng trăng và bờ suối ánh sao."},{"id":"magic","n":"Khu Rừng Diệu Kỳ","x":62,"z":82,"c":"#6ce8d4","icon":"✧","state":"open","desc":"Cổ thụ, rễ cây ma thuật, đom đóm, hồ ngọc và cổng hang bí ẩn."},{"id":"volcano","n":"Núi Lửa Tái Sinh","x":104,"z":112,"c":"#ff9c70","icon":"▲","state":"open","desc":"Miệng núi lửa, hồ dung nham, cầu đá và đền lửa cổ."},{"id":"desert","n":"Sa Mạc Hi Vọng","x":-100,"z":108,"c":"#eec184","icon":"◇","state":"open","desc":"Cồn cát vàng, ốc đảo, kim tự tháp và di tích cổ."},{"id":"sea","n":"Biển Ngàn Ước","x":0,"z":123,"c":"#72d6ff","icon":"≈","state":"open","desc":"Bờ biển, bến gỗ, đảo nhỏ, thuyền trang trí và sóng biển."},{"id":"heaven","n":"Thiên Thành Điều Ước","x":27,"z":-126,"c":"#f0e5ff","icon":"♛","state":"open","desc":"Ba đảo nổi, cung điện thiên giới, cầu trên mây và dịch chuyển."}].map(Object.freeze));
const BLOSSOM173=Object.freeze({x:-88,z:9,rx:15,rz:18,pondX:-88,pondZ:13,pondR:4.2,arrivalX:-88,arrivalZ:0});
function blossomWeight173(x,z){const b=BLOSSOM173;return 1-smooth162(.72,1.12,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function blossomPond173(x,z){return Math.hypot(x-BLOSSOM173.pondX,z-BLOSSOM173.pondZ)}
function blossomTrail173(x,z){return Math.min(Math.abs(blossomPond173(x,z)-6),Math.abs(x+88)+(z<0||z>8?10:0))}
function blossomTerrain173(x,z,y,level){let d=blossomPond173(x,z);let basin=level-.75*(1-smooth162(2.8,4.2,d))+.22*smooth162(4.2,5.4,d);return y+(basin-y)*(1-smooth162(4.6,7.5,d))}
function blossomWaterBlocked173(x,z,margin=0){return blossomPond173(x,z)<BLOSSOM173.pondR+margin}
// V17.4: snowy basin and walkable arrival, mountain ridges outside the palace approach.
const ICE174=Object.freeze({x:-80,z:-107,rx:29,rz:27,arrivalX:-75,arrivalZ:-106,palaceX:-75,palaceZ:-119,plateau:7});
function iceWeight174(x,z){const b=ICE174;return 1-smooth162(.70,1.12,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function icePeak174(x,z){let v=0;for(const [px,pz,h,r] of [[-102,-121,12,12],[-105,-92,8,13],[-91,-130,10,9],[-64,-131,7,8]])v+=h*Math.exp(-((x-px)**2+(z-pz)**2)/(r*r));return v}
function iceTerrain174(x,z,y){const b=ICE174,w=iceWeight174(x,z),flat=1-smooth162(7,15,Math.hypot(x-b.palaceX,(z-b.palaceZ)*.72));return y+(b.plateau-y)*w*flat+icePeak174(x,z)*w*(1-flat)}
function iceReserved174(x,z){const b=ICE174;return Math.abs(x-b.arrivalX)<3&&z>-128&&z<-94||Math.abs(x-b.palaceX)<9&&Math.abs(z-b.palaceZ)<7||Math.hypot(x-b.arrivalX,z-b.arrivalZ)<4}
const DREAM175=Object.freeze({x:94,z:9,rx:21,rz:24,arrivalX:94,arrivalZ:0,moonX:105,moonZ:13});
function dreamWeight175(x,z){const b=DREAM175;return 1-smooth162(.68,1.12,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function dreamTerrain175(x,z,y){const w=dreamWeight175(x,z),river=smooth162(5,11,Math.abs(z+7.2));return y+w*river*(.6+.6*Math.sin(x*.16+z*.11)+.5*Math.cos(z*.2-x*.08))}
function dreamReserved175(x,z){const b=DREAM175;return Math.abs(z+7.2)<5||Math.abs(x-96)<2.6||Math.abs(z-13)<2.3&&x>94&&x<105||Math.hypot(x-b.arrivalX,z-b.arrivalZ)<4||Math.hypot(x-b.moonX,z-b.moonZ)<5}
const LIGHT176=Object.freeze({x:87,z:-88,rx:24,rz:25,arrivalX:87,arrivalZ:-86,castleX:87,castleZ:-102,basinX:103,basinZ:-85,basinR:3.4});
function lightWeight176(x,z){const b=LIGHT176;return 1-smooth162(.68,1.12,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function lightTerrain176(x,z,y){const b=LIGHT176,w=lightWeight176(x,z),flat=1-smooth162(9,20,Math.hypot(x-b.castleX,(z-b.castleZ)*.75)),d=Math.hypot(x-b.basinX,z-b.basinZ),basin=1-smooth162(b.basinR,6,d);return y+(6.4-y)*w*flat+(5.2-.70*(1-smooth162(2.7,3.4,d))-y-(6.4-y)*w*flat)*basin}
function lightBlocked176(x,z,m=0){const b=LIGHT176;return Math.hypot(x-b.basinX,z-b.basinZ)<b.basinR+m}
function lightReserved176(x,z){const b=LIGHT176;return Math.abs(x-b.arrivalX)<3.2&&z>-111&&z<-70||Math.abs(x-b.castleX)<10&&Math.abs(z-b.castleZ)<8||Math.hypot(x-b.arrivalX,z-b.arrivalZ)<6.5||Math.hypot(x-b.basinX,z-b.basinZ)<7||Math.abs(z+85)<2.8&&x>87&&x<101}
const MAGIC177=Object.freeze({x:62,z:82,rx:23,rz:25,arrivalX:62,arrivalZ:82,treeX:62,treeZ:94,pondX:47,pondZ:86,pondR:3.6,caveX:74,caveZ:96});
function magicWeight177(x,z){const b=MAGIC177;return 1-smooth162(.66,1.12,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function magicTerrain177(x,z,y){const b=MAGIC177,d=Math.hypot(x-b.pondX,z-b.pondZ),w=magicWeight177(x,z),hill=w*.8*(1+Math.sin(x*.19+z*.13)),blend=1-smooth162(b.pondR,6,d);return (y+hill)*(1-blend)+(9-.65*(1-smooth162(2.5,b.pondR,d)))*blend}
function magicBlocked177(x,z,m=0){return Math.hypot(x-MAGIC177.pondX,z-MAGIC177.pondZ)<MAGIC177.pondR+m}
function magicReserved177(x,z){const b=MAGIC177;return Math.hypot(x-b.arrivalX,z-b.arrivalZ)<4||Math.hypot(x-b.treeX,z-b.treeZ)<7||Math.hypot(x-b.caveX,z-b.caveZ)<5||Math.hypot(x-b.pondX,z-b.pondZ)<6||Math.abs(x-b.arrivalX)<2.2&&z>72&&z<94}
const VOLCANO178=Object.freeze({x:104,z:113,rx:16,rz:20,arrivalX:104,arrivalZ:112,peakX:111,peakZ:129,lavaX:108,lavaZ:119,lavaR:4.5,lavaY:13,bridgeHalf:1.15,templeX:94,templeZ:118});
function volcanoWeight178(x,z){const b=VOLCANO178;return 1-smooth162(.62,1.10,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function volcanoLava178(x,z){return Math.hypot(x-VOLCANO178.lavaX,z-VOLCANO178.lavaZ)}
function volcanoTerrain178(x,z,y){const b=VOLCANO178,w=volcanoWeight178(x,z),d=volcanoLava178(x,z),peak=Math.hypot(x-b.peakX,z-b.peakZ),cone=10*Math.exp(-((peak-3.2)**2)/20)*w,base=y+cone,blend=1-smooth162(b.lavaR,7,d),bank=b.lavaY-.8*(1-smooth162(3.6,b.lavaR,d)),corridor=1-smooth162(b.bridgeHalf,2,Math.abs(z-b.lavaZ)),bed=bank+(b.lavaY+.22-bank)*corridor;return base+(bed-base)*blend}
function volcanoBlocked178(x,z,m=0){const b=VOLCANO178;return volcanoLava178(x,z)<b.lavaR+m&&Math.abs(z-b.lavaZ)>Math.max(.1,b.bridgeHalf-m)}
function volcanoReserved178(x,z){const b=VOLCANO178;return volcanoLava178(x,z)<7||Math.hypot(x-b.arrivalX,z-b.arrivalZ)<4||Math.hypot(x-b.templeX,z-b.templeZ)<4.5||Math.abs(z-b.lavaZ)<2&&x>94&&x<115}
const DESERT179=Object.freeze({x:-100,z:108,rx:19,rz:25,arrivalX:-100,arrivalZ:108,oasisX:-110,oasisZ:101,oasisR:3.5,oasisY:5.5,pyramidX:-99,pyramidZ:124,templeX:-85,templeZ:115});
function desertWeight179(x,z){const b=DESERT179;return 1-smooth162(.62,1.1,Math.hypot((x-b.x)/b.rx,(z-b.z)/b.rz))}
function desertTerrain179(x,z,y){const b=DESERT179,w=desertWeight179(x,z);if(!w)return y;const dune=1.3+.95*Math.sin(x*.24+z*.14)+.65*Math.cos(z*.27-x*.08),flat=1-smooth162(5,11,Math.hypot(x-b.pyramidX,z-b.pyramidZ)),base=y+w*dune,platform=base+(7-base)*flat*w,d=Math.hypot(x-b.oasisX,z-b.oasisZ),blend=1-smooth162(b.oasisR,6,d);return platform+(b.oasisY-.55*(1-smooth162(2.6,b.oasisR,d))-platform)*blend}
function desertBlocked179(x,z,m=0){const b=DESERT179;return Math.hypot(x-b.oasisX,z-b.oasisZ)<b.oasisR+m}
function desertReserved179(x,z){const b=DESERT179;return Math.hypot(x-b.arrivalX,z-b.arrivalZ)<4||Math.hypot(x-b.pyramidX,z-b.pyramidZ)<8||Math.hypot(x-b.templeX,z-b.templeZ)<5||Math.hypot(x-b.oasisX,z-b.oasisZ)<4.4||Math.abs(x-b.arrivalX)<2.3&&z>102&&z<118}
const SEA180=Object.freeze({x:0,z:123,rx:34,rz:24,arrivalX:0,arrivalZ:123,waterY:5,halfX:32,startZ:110,endZ:140,islands:Object.freeze([Object.freeze({x:-19,z:129,r:5}),Object.freeze({x:18,z:130,r:6}),Object.freeze({x:0,z:132,r:4})])});
function seaWeight180(x,z){return (1-smooth162(28,36,Math.abs(x)))*smooth162(105,113,z)}
function seaLand180(x,z){const shore=1-smooth162(111,117,z+1.1*Math.cos(x*.19)),side=smooth162(27,32,Math.abs(x)),pier=(1-smooth162(2.8,4.4,Math.abs(x)))*(1-smooth162(132,136,z));let island=0;for(const q of SEA180.islands)island=Math.max(island,1-smooth162(q.r*.65,q.r+1,Math.hypot(x-q.x,z-q.z)));return Math.max(shore,side,pier,island)}
function seaTerrain180(x,z,y){const w=seaWeight180(x,z);if(!w)return y;const target=3.7+seaLand180(x,z)*2.4;return y+(target-y)*w}
function seaBlocked180(x,z,m=0){if(z<113||Math.abs(x)>32)return false;const safe=(xx,zz)=>seaLand180(xx,zz)>=.70;return !safe(x,z)||m>0&&(!safe(x+m,z)||!safe(x-m,z)||!safe(x,z+m)||!safe(x,z-m))}
function seaReserved180(x,z){return Math.abs(x)<5&&z>108||seaWeight180(x,z)>.2}
const HEAVEN190=Object.freeze({x:27,z:-126,y:28,arrivalX:27,arrivalZ:-126,returnX:0,returnZ:3,islands:Object.freeze([{x:27,z:-126,r:7.8},{x:9,z:-119,r:5.5},{x:44,z:-119,r:5.5}].map(Object.freeze)),links:Object.freeze([[27,-126,9,-119],[27,-126,44,-119]].map(Object.freeze))});
function heavenZone190(x,z){return x>=0&&x<=53&&z<=-108}
function heavenSegment190(x,z,a,b,c,d){let vx=c-a,vz=d-b,k=Math.max(0,Math.min(1,((x-a)*vx+(z-b)*vz)/(vx*vx+vz*vz)));return Math.hypot(x-a-vx*k,z-b-vz*k)}
function heavenFloor190(x,z,m=0){return HEAVEN190.islands.some(q=>Math.hypot(x-q.x,z-q.z)<=q.r-m)||HEAVEN190.links.some(q=>heavenSegment190(x,z,...q)<=1.45-m)}
function heavenBlocked190(x,z,m=0){return heavenZone190(x,z)&&!heavenFloor190(x,z,m)}
function heavenHeight190(x,z,y){return heavenFloor190(x,z)?HEAVEN190.y:y}
// Shared vegetation profiles: geometry is deterministic, no global RNG consumption.
const TREE192=Object.freeze([Object.freeze({height:4.55,width:1.68,lean:.24,branches:7,shape:'oak'}),Object.freeze({height:5.65,width:1.12,lean:.12,branches:7,shape:'conifer'}),Object.freeze({height:4.15,width:1.98,lean:.48,branches:7,shape:'willow'})]);
function treeProfile192(x,z,magic=false){return TREE192[magic?0:Math.abs(Math.round(x*13+z*7))%3]}
function trunkData192(spec,segments=12,rings=9){const v=[],uv=[],idx=[];for(let j=0;j<=rings;j++){const u=j/rings,y=u*spec.height,r=.34*Math.pow(1-u,.76)+.035+(1-u)**9*.19,cx=spec.lean*Math.sin(u*2.3),cz=spec.lean*.35*Math.sin(u*4.2);for(let i=0;i<=segments;i++){let a=(i%segments)*Math.PI*2/segments,rr=r*(1+.09*Math.sin(a*5+u*4)+.05*Math.cos(a*3-u*8));v.push(cx+Math.cos(a)*rr,y,cz+Math.sin(a)*rr);uv.push(i/segments,u*2);if(j<rings&&i<segments){let k=j*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}}}return {v,uv,idx}}
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
 return [30,45,60,90].includes(pref)?pref:60;
}
// V17.1: independent resolution and effects budgets; DPR expressed relative to CSS pixels.
const MOBILE_CLARITY171=Object.freeze({
 battery:Object.freeze({floor:.85,base:1,max:1,budget:650000,scaleFloor:.85,aniso:4}),
 low:Object.freeze({floor:1,base:1,max:1,budget:700000,scaleFloor:1,aniso:4}),
 balanced:Object.freeze({floor:1,base:1.35,max:1.5,budget:1350000,scaleFloor:.85,aniso:4}),
 high:Object.freeze({floor:1,base:1.5,max:1.7,budget:1650000,scaleFloor:.85,aniso:8}),
 sharp:Object.freeze({floor:1.15,base:1.6,max:1.9,budget:2000000,scaleFloor:.85,aniso:8})
});
// V35.0.5: one conservative pixel budget for resolution and diagnostics.
function mobilePixelBudget355(preset,tier,lowMemory=false){
 const p=MOBILE_CLARITY171[preset]||MOBILE_CLARITY171.balanced;
 const tierBudget=tier===2?1000000:tier===1?1650000:2000000;
 return Math.min(p.budget,tierBudget,lowMemory?1000000:2000000);
}
function mobileResolution139(w,h,dpr,quality,tier,scale,hd,maxBuffer,preset=hd?'sharp':'balanced',lowMemory=false){
 if(![w,h,maxBuffer].every(Number.isFinite)||w<1||h<1||maxBuffer<1)return 0;
 const p=MOBILE_CLARITY171[preset]||MOBILE_CLARITY171.balanced;
 const safeScale=Number.isFinite(scale)?scale:1,safeDpr=Number.isFinite(dpr)&&dpr>0?dpr:1;
 const desired=Math.max(p.floor,p.base*Math.max(p.scaleFloor,Math.min(1.2,safeScale)));
 return Math.min(desired,safeDpr,p.max,Math.sqrt(mobilePixelBudget355(preset,tier,lowMemory)/(w*h)),maxBuffer/Math.max(w,h));
}
// Deduplicate concurrent model fetch/parse; failed requests can be retried.
function sharedAsset355(cache,key,load){
 if(cache.has(key))return cache.get(key);
 const pending=Promise.resolve().then(load);
 cache.set(key,pending);
 pending.catch(()=>{if(cache.get(key)===pending)cache.delete(key);});
 return pending;
}
function hudPoint355(x,y,w,h,bw,bh){
 if(![x,y,w,h,bw,bh].every(Number.isFinite)||w<=0||h<=0)return null;
 const mx=Math.min(.5,(Math.max(0,bw)/2+8)/w),my=Math.min(.5,(Math.max(0,bh)/2+8)/h);
 return [Math.max(mx,Math.min(1-mx,x)),Math.max(my,Math.min(1-my,y))];
}
function mobileStep139(v,fps,p95,cap,ceiling,tierFloor,scaleCeiling,manual=false,preset='balanced'){
 const severe=fps<cap*.64||p95>100,slow=severe||fps<cap*.86||p95>1000/cap*1.9;
 const good=fps>=cap*.96&&p95<=1000/cap*1.16;
 let q={...v,slow:slow?(v.slow||0)+1:0,good:good?(v.good||0)+1:0,changed:false};
 if(severe||q.slow>=2){
  if(q.tier<2){q.tier=severe?2:q.tier+1;if(severe&&!manual)q.quality=0}
  else if(q.quality>0&&!manual)q.quality--;
  else if(!manual)q.scale=Math.max((MOBILE_CLARITY171[preset]||MOBILE_CLARITY171.balanced).scaleFloor,q.scale*(severe?.86:.96));
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
 return mobile?{peerCount:tier===2?4:8,peerRange:tier===2?24:38,peerRig:tier===2?7:16,npcRig:tier===2?7:18,npcCount:tier===2?1:2,load:1,mapMs:tier===2?650:450,heavyMs:tier===2?420:280}:{peerCount:[5,8,12][quality],peerRange:[28,38,48][quality],peerRig:Infinity,npcRig:55,npcCount:6,load:2,mapMs:[400,250,160][quality],heavyMs:[250,160,100][quality]};
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
// V34.0: a single timing gate for combat, including interrupted or stale casts.
// Continuous mortar-to-stone bevel: no new geometry or texture channels.
function masonryRelief354(kind,seam,noise,mid,fine,tone,out={}){
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0)),s=clamp(seam),n=clamp(noise),m=clamp(mid),f=clamp(fine),t=clamp(tone);
 const width=(kind==='path'?.025:.039)+n*.012,bevel=kind==='roof'?.045:.032;
 let x=clamp((s-width)/bevel);x=x*x*(3-2*x);
 const low=kind==='path'?.34:.23,high=.55+m*.24+f*.10;
 out.height=low+(high-low)*x;
 out.light=(kind==='path'?.77:.65)+( .85+t*.24-(kind==='path'?.77:.65))*x;
 return out;
}
function firstStrikeFrame352(c,now){
 const m=c.move;if(!m||m.firstFrame352)return 0;m.firstFrame352=true;
 if(m.kind!=='strike'||m.airborne||m.air323||m.counter322||m.hit)return 0;
 if(![m.start,m.impact,m.end,now].every(Number.isFinite)||m.start>m.impact||m.impact>=m.end)return 0;
 const delay=now-m.start;if(delay<=80||delay>1200)return 0;
 m.start+=delay;m.impact+=delay;m.end+=delay;
 if(Number.isFinite(c.cd?.strike))c.cd.strike+=delay;
 if(Number.isFinite(c.lastCombo))c.lastCombo+=delay;
 if(c.buffer310>0)c.buffer310+=delay;
 return delay;
}
function combatTiming340(move,now,paused=false,landingHeight=0,out={}){
 const valid=!!move&&[move.start,move.impact,move.end,now].every(Number.isFinite)&&move.start<=move.impact&&move.impact<move.end&&move.start<=now;
 out.valid=valid;out.cancel=!!move&&(!valid||paused||now>move.end+180);out.progress=valid?Math.max(0,Math.min(1,(now-move.start)/(move.end-move.start))):0;
 out.hit=valid&&!out.cancel&&!move.hit&&now>=move.impact&&(!move.waitLanding327||landingHeight<=.08||now>=move.end-60);
 out.complete=valid&&!out.cancel&&now>=move.end;return out;
}
function combatReset340(c,reason){
 c.move=null;c.buffer310=0;c.airIndex323=-1;c.airUntil323=0;c.combo=0;c.lastCombo=0;c.locked=null;c.nextWind330=0;c.invuln=0;c.shakeUntil=0;
 c.supportActualError336=null;c.supportError312=null;
 if(reason==='kit'||reason==='world'||reason==='hidden'||reason==='recovery')c.reaction329=null;
 c.lastReset340=reason;return c;
}
// V34.3: bounded diagnostics and fault containment for independent frame subsystems.
function createFrameGuard343(report={},limit=16){
 const records=Object.create(null),cap=Math.max(1,Math.min(32,limit|0));
 return {run(key,task,cleanup){
  if(records[key])return false;
  try{task();return true}catch(e){
   if(Object.keys(records).length<cap)records[key]={message:String(e?.message||e).slice(0,180),stack:String(e?.stack||'').slice(0,900)};
   else records.__overflow={message:'Diagnostic limit reached'};
   try{cleanup?.()}catch(clean){if(records[key])records[key].cleanup=String(clean?.message||clean).slice(0,160);}
   report.frameFaults343={...records};return false;
  }
 },failed:key=>!!records[key],count:()=>Object.keys(records).length};
}
function safeComboIndex343(index,length){const n=Number.isSafeInteger(length)&&length>0?length:1;return Number.isSafeInteger(index)?((index%n)+n)%n:0;}
function frameInterval343(now,last){if(!Number.isFinite(now))return 0;if(!Number.isFinite(last)||last<=0)return 16;return Math.max(0,Math.min(2000,now-last));}
function frameSample343(st,ms){if(!Number.isFinite(ms)||ms<0||ms>2000)return st;st.count=(st.count||0)+1;st.mean=Number.isFinite(st.mean)?st.mean*.9+ms*.1:ms;st.max=Math.max(st.max||0,ms);return st;}
// V34.4: deterministic browser compatibility policies; no DOM dependency.
function rendererOptions344(antialias,lowPower){
 const first={antialias:!!antialias,powerPreference:lowPower?'low-power':'high-performance'};
 const options=[first,{antialias:false,powerPreference:'default'},{antialias:false,powerPreference:'low-power'}];
 return options.filter((o,i)=>options.findIndex(v=>v.antialias===o.antialias&&v.powerPreference===o.powerPreference)===i);
}
function createRenderer344(factory,options){
 const failures=[];for(const [index,opt] of options.entries()){try{const renderer=factory(opt);if(!renderer)throw Error('No renderer');return {renderer,index,options:opt,failures};}catch(e){failures.push(String(e?.message||e).slice(0,160));}}
 throw Error('Không khởi tạo được WebGL: '+failures.join(' / ').slice(0,300));
}
function viewport344(w,h,ratio,maxDimension=4096,maxPixels=8000000){
 if(![w,h,ratio,maxDimension,maxPixels].every(Number.isFinite)||w<2||h<2||ratio<=0||maxDimension<2||maxPixels<4)return null;
 return {width:Math.floor(w),height:Math.floor(h),ratio:Math.min(ratio,maxDimension/w,maxDimension/h,Math.sqrt(maxPixels/(w*h)))};
}
function capture344(node,id){try{if(typeof node?.setPointerCapture==='function'){node.setPointerCapture(id);return true;}}catch{}return false;}
function release344(node,id){try{if(id!=null&&node?.hasPointerCapture?.(id))node.releasePointerCapture(id);}catch{}}
function gpuState344(st,event,hidden=false){
 if(event==='lost'){if(st.lost)return 'ignore';st.lost=true;st.losses=(st.losses||0)+1;return 'pause';}
 if(event==='restored'){if(!st.lost)return 'ignore';st.lost=false;return st.losses===1?(hidden?'defer':'resume'):'reload';}
 return 'ignore';
}
if(typeof module!=='undefined')module.exports={mobilePixelBudget355,sharedAsset355,hudPoint355,masonryRelief354,firstStrikeFrame352,rendererOptions344,createRenderer344,viewport344,capture344,release344,gpuState344,createFrameGuard343,safeComboIndex343,frameInterval343,frameSample343,combatTiming340,combatReset340,TREE192,treeProfile192,trunkData192,HEAVEN190,heavenZone190,heavenSegment190,heavenFloor190,heavenBlocked190,heavenHeight190,SEA180,seaWeight180,seaLand180,seaTerrain180,seaBlocked180,seaReserved180,DESERT179,desertWeight179,desertTerrain179,desertBlocked179,desertReserved179,VOLCANO178,volcanoWeight178,volcanoLava178,volcanoTerrain178,volcanoBlocked178,volcanoReserved178,MAGIC177,magicWeight177,magicTerrain177,magicBlocked177,magicReserved177,LIGHT176,lightWeight176,lightTerrain176,lightBlocked176,lightReserved176,DREAM175,dreamWeight175,dreamTerrain175,dreamReserved175,ICE174,iceWeight174,icePeak174,iceTerrain174,iceReserved174,BLOSSOM173,blossomWeight173,blossomPond173,blossomTrail173,blossomTerrain173,blossomWaterBlocked173,MOBILE_CLARITY171,WW_ATLAS170,atlasDestination170,atlasMap170,smooth162,frontierHeight162,trailDistance162,terrainTiles162,tileAt162,tileVisible162,physicsDelta141,physicsSteps141,angle141,orbit141,jumpStep141,trimModels140,expiredModel140,mobileCap139,mobileResolution139,mobileStep139,actorBudget139,WW_WORLD137,WW_EXPANSION137,insideWorld137,expansionRegion137,clarityStep100,resolution77,WW_PERF118,perfPreset118,perfWarning118,WW_LANDMARK124,landmarkSite124,cellVisible124,landmarkVisits124,WW_LOOK131,look131,blendLook131,cameraSafe131,stepSound131};

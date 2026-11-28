/* Original lightweight accessory meshes for WISH WORLD character identities.
 * No body/face sculpting; existing VRM hair/clothing remains intact. */
(function(root){
 const designs={
 m1:['Lữ khách đồng cỏ','satchel',0x567a55,0xd6b47c],m2:['Kiếm sĩ lam bạc','blade',0x3c6191,0xd4e9ee],m3:['Phong Vân · gió và mây','scarf',0x6fabb7,0xdef5f2],m4:['Hỏa Vũ · chiến binh lửa','cape',0x9b392a,0xf4b46a],m5:['Dạ Hành · du hiệp đêm','hood',0x282941,0x8f9acb],
 m6:['Băng Kiếm · kiếm băng','blade',0x679ac1,0xe4f9ff],m7:['Lâm Vũ · kiểm lâm','leaf',0x3f6647,0xc6de8e],m8:['Thiên Quang · ánh sáng','crest',0xe5c78e,0xfff1bc],m9:['Hắc Phong · bóng tối','cape',0x242331,0x8f90b0],m10:['Hải Đăng · người giữ biển','satchel',0x345f85,0xefd294],
 f1:['Nguyệt Hoa · trăng và hoa','moon',0xd3d9f2,0xfff2ca],f2:['Lam Ngọc · ngọc xanh','gem',0x427da6,0xade9fa],f3:['Ánh Mai · hoa mùa xuân','flower',0xf3c36d,0xffefc1],f4:['Tử Vân · mây tím','scarf',0x8274ae,0xe1d2fa],f5:['Bạch Linh · linh quang trắng','crest',0xd2e7ed,0xffffff],
 f6:['Hồng Liên · cánh sen','flower',0xbc5375,0xffbdcf],f7:['Thanh Trúc · trúc xanh','leaf',0x629b78,0xd9f1b9],f8:['Băng Tâm · tinh thể băng','gem',0x9acfe8,0xf1fdff],f9:['Dạ Nguyệt · trăng đêm','moon',0x494464,0xc6c9fc],f10:['Kim Vũ · lông vũ vàng','feather',0xc89a4e,0xffe2a2]
 };
 function clear(a){const gs=new Set(),ms=new Set(a.identityMaterials342||[]);for(const group of a.identityMeshes||[]){group.removeFromParent();group.traverse(o=>{if(o.isMesh){if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)ms.add(m)}})}for(const g of gs)g.dispose();for(const m of ms)m.dispose();a.identityMeshes=[];a.identityMotion=[];a.identityMaterials342=[];a.identityType=null;a.identityDetail342=null}
 // V34.2: low-poly embossed medallion geometry, shared vertex layout, no added textures.
 function badgeProfile342(type,variant=1){
  const sides=['moon','gem','blade'].includes(type)?6:['flower','leaf','feather'].includes(type)?8:10;
  const radius=.021+(Math.max(1,Math.min(10,Number(variant)||1))%3)*.002;
  return {sides,radius,depth:.0035,metalness:['crest','blade','gem','moon'].includes(type)?.48:.28};
 }
 // Traveler V4: shaped mantle and split lapels, not a flat recolor.
 function travelerMantlePoint(u,v,out=[]){
  u=Math.max(-1,Math.min(1,u));v=Math.max(0,Math.min(1,v));
  const w=.205+.052*Math.sin(v*Math.PI*.82)-.041*v,fold=Math.sin(u*12+v*2)*.008*v;
  out[0]=u*w;out[1]=-.38*v-.035*u*u*(1-v)+.045*u*u*v;
  out[2]=-.026-.034*v+.040*u*u+fold;return out;
 }
 function travelerLapels(side,u,v,out=[]){
  const sign=side<0?-1:1;
  out[0]=sign*(.065+.087*(1-v)+(u-.5)*(.068-.033*v));
  out[1]=.10-.255*v-.013*u;
  out[2]=.015+.019*Math.sin(v*Math.PI)+.012*u;return out;
 }
 function apply(T,a,p){
  if(!a.vrm||!a.root?.isObject3D)return;clear(a);
  const d=designs[p.id];if(!d)return;
  const [,type,color,accent]=d,root=a.root,hum=a.vrm.humanoid;const variant=Number(p.id.slice(1))||1;
  const base=1/Math.max(.001,a.baseScale),get=n=>hum.getRawBoneNode(n);
  const head=get('head'),chest=get('upperChest')||get('chest')||get('spine'),hips=get('hips');
  if(!head||!chest||!hips)return;
  // Attach artwork in a model-aligned coordinate frame; bone attachment preserves animation.
  root.updateWorldMatrix(true,true);
  const forward=a.modelForward.clone();forward.y=0;forward.normalize();
  const right=new T.Vector3(0,1,0).cross(forward).normalize();
  const orient=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right,new T.Vector3(0,1,0),forward));
  const fabric=new T.MeshStandardMaterial({color,roughness:.91,metalness:0,side:T.DoubleSide});
  const trim=new T.MeshStandardMaterial({color:accent,roughness:.58,metalness:.18,side:T.DoubleSide});const badge=badgeProfile342(type,variant),metal=new T.MeshStandardMaterial({color:accent,roughness:.43,metalness:badge.metalness});a.identityMaterials342=[fabric,trim,metal];
  function groupAt(bone,x,y,z){const g=new T.Group();g.position.copy(root.worldToLocal(bone.getWorldPosition(new T.Vector3()))).addScaledVector(right,x*base).addScaledVector(new T.Vector3(0,1,0),y*base).addScaledVector(forward,z*base);g.quaternion.copy(orient);g.scale.setScalar(base);root.add(g);g.updateWorldMatrix(true,true);bone.attach(g);a.identityMeshes.push(g);return g}
  function mesh(g,geo,mat,x=0,y=0,z=0){let m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m}
  function shape(g,pts,mat,z=0){let s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(g,new T.ExtrudeGeometry(s,{depth:.006,bevelEnabled:true,bevelThickness:.0015,bevelSize:.002,bevelSegments:1,steps:1}),mat,0,0,z)}
  function line(g,pts,r,mat){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v))),12,r,5,false),mat)}
  if(p.id==='m1'){
   const leather=new T.MeshStandardMaterial({color:0x473326,roughness:.83,metalness:0,side:T.DoubleSide});
   const lining=new T.MeshStandardMaterial({color:0x343e32,roughness:.94,metalness:0,side:T.DoubleSide});
   const thread=new T.MeshStandardMaterial({color:0xa99267,roughness:.86,metalness:0,side:T.DoubleSide});
   a.identityMaterials342.push(leather,lining,thread);
   // Curved shoulder mantle with a real grid, folds, and moving hem.
   const mantle=groupAt(chest,0,.14,-.155),geo=new T.PlaneGeometry(1,1,8,12),pos=geo.attributes.position,point=[];
   for(let r=0;r<=12;r++)for(let c=0;c<=8;c++){travelerMantlePoint(c/4-1,r/12,point);pos.setXYZ(r*9+c,...point);}
   pos.needsUpdate=true;geo.computeVertexNormals();const textile=mesh(mantle,geo,fabric);textile.frustumCulled=false;
   const border=mesh(mantle,new T.BufferGeometry(),thread),bp=new Float32Array(13*4*3),ix=[];
   border.geometry.setAttribute('position',new T.BufferAttribute(bp,3));
   for(let r=0;r<12;r++)for(let side=0;side<2;side++){const n=r*4+side*2;ix.push(n,n+1,n+4,n+1,n+5,n+4);}
   border.geometry.setIndex(ix);border.frustumCulled=false;
   a.identityMotion.push({g:mantle,rest:mantle.quaternion.clone(),amplitude:.065,cloth:pos,geo,base:new Float32Array(pos.array),border:border.geometry,last:-Infinity,phase:.71,traveler:true});
   // Separate curved leather lapels, with inset fabric facing and piped edge.
   const front=groupAt(chest,0,0,.158);
   for(const side of [-1,1]){
    const g=new T.PlaneGeometry(1,1,3,8),p=g.attributes.position;
    for(let r=0;r<=8;r++)for(let c=0;c<=3;c++){travelerLapels(side,c/3,r/8,point);p.setXYZ(r*4+c,...point);}
    p.needsUpdate=true;g.computeVertexNormals();mesh(front,g,leather);
    const edge=[];for(let r=0;r<=8;r++){travelerLapels(side,1,r/8,point);edge.push([point[0],point[1],point[2]+.004]);}line(front,edge,.0024,thread);
   }
   // An elliptical belt with leather thickness, forged buckle and separate keeper.
   const waist=groupAt(hips,0,.075,0);
   const band=mesh(waist,new T.CylinderGeometry(.164,.168,.047,32,1,true),leather);band.scale.z=.79;
   const piping=mesh(waist,new T.TorusGeometry(.165,.003,5,32),thread,0,.020,0);piping.rotation.x=Math.PI/2;piping.scale.y=.79;
   const buckle=mesh(waist,new T.TorusGeometry(.027,.005,6,16),metal,0,0,.137);buckle.scale.set(1.14,.76,1);
   mesh(waist,new T.BoxGeometry(.004,.032,.006),metal,0,0,.142);
   // A rounded, thick travel pouch with separate flap, stitching and clasp.
   const bag=groupAt(hips,.156,.01,-.07);bag.rotateY(.55);
   const pouch=mesh(bag,new T.SphereGeometry(1,12,8),leather,0,-.035,0);pouch.scale.set(.079,.095,.048);
   shape(bag,[[-.073,.035],[.073,.035],[.066,-.020],[0,-.048],[-.066,-.020]],lining,.038);
   line(bag,[[-.065,.025,.046],[-.057,-.018,.046],[0,-.039,.046],[.057,-.018,.046],[.065,.025,.046]],.0022,thread);
   const clasp=mesh(bag,new T.CylinderGeometry(.010,.010,.007,10),metal,0,-.034,.049);clasp.rotation.x=Math.PI/2;
   a.identityType='traveler-mantle';a.identityDetail342={type:'traveler-mantle',variant,additionalMeshes:a.identityMeshes.reduce((sum,g)=>sum+g.children.length,0),clothPanels:1};
   animate(a,0,0,{});return;
  }
  const emblem=groupAt(chest,0,.045,.145);
  shape(emblem,[[0,.043],[.026,.014],[.020,-.027],[0,-.044],[-.020,-.027],[-.026,.014]],trim);
  shape(emblem,[[0,.030],[.014,0],[0,-.026],[-.014,0]],fabric,.009);const medallion=mesh(emblem,new T.CylinderGeometry(badge.radius,badge.radius*.94,badge.depth,badge.sides,1),metal,0,0,.018);medallion.rotation.x=Math.PI/2;medallion.rotation.y=variant*.21;
  if(type==='cape'||type==='scarf'||type==='hood'){
   let g=groupAt(chest,0,.13,-.13),w=type==='cape'?.20:.12,h=type==='cape'?.49:type==='hood'?.24:.31;
   let pts=[[-w,0],[-w*.83,-h*.55],[-w*.63,-h],[0,-h*.86],[w*.63,-h],[w*.83,-h*.55],[w,0]];
   // A small subdivided textile surface, fixed at the shoulders, deformable at the hem.
   const geo=new T.PlaneGeometry(1,1,8,12),pos=geo.attributes.position;for(let row=0;row<=12;row++)for(let col=0;col<=8;col++){const v=row/12,u=col/8*2-1;pos.setXYZ(row*9+col,u*w*(1-.37*v),-h*v*(1-.14*(1-Math.abs(u))*v),-.018*v);}
   pos.needsUpdate=true;geo.computeVertexNormals();const textile=mesh(g,geo,fabric);textile.frustumCulled=false;
   const border=mesh(g,new T.BufferGeometry(),trim);const bp=new Float32Array(13*4*3);border.geometry.setAttribute('position',new T.BufferAttribute(bp,3));const ix=[];for(let row=0;row<12;row++){for(let side=0;side<2;side++){const n=row*4+side*2;ix.push(n,n+1,n+4,n+1,n+5,n+4)}}border.geometry.setIndex(ix);border.frustumCulled=false;
   a.identityMotion.push({g,rest:g.quaternion.clone(),amplitude:type==='cape'?.12:.07,cloth:pos,geo,base:new Float32Array(pos.array),border:border.geometry,last:-Infinity,phase:variant*.71});
   if(type==='scarf'){let g2=groupAt(chest,0,.13,.12);line(g2,[[-.12,.015,0],[-.06,-.01,.04],[.06,-.01,.04],[.12,.015,0]],.025,fabric)}
  }else if(type==='blade'){
   let g=groupAt(chest,0,.16,-.17);g.rotation.z+=(p.id==='m6'?-.34:.34);
   shape(g,[[-.025,.15],[.025,.15],[.035,-.45],[0,-.52],[-.035,-.45]],fabric);
   line(g,[[0,.15,.009],[0,-.47,.009]],.007,trim);
   mesh(g,new T.BoxGeometry(.105,.019,.035),trim,0,.15,0);
   mesh(g,new T.CylinderGeometry(.014,.014,.11,8),fabric,0,.215,0);
  }else if(type==='satchel'){
   let g=groupAt(hips,p.id==='m10'?.08:0,.055,-.15);if(p.id==='m10')g.scale.multiplyScalar(1.15);
   shape(g,[[-.11,.075],[.11,.075],[.10,-.095],[-.10,-.095]],fabric);
   shape(g,[[-.11,.075],[.11,.075],[.095,.015],[0,-.026],[-.095,.015]],trim,.012);
  }else{
   let g=groupAt(head,-.09,.145,.045);if(variant>5){g.scale.multiplyScalar(1.18);g.rotateZ(.25)}
   if(type==='moon'){let pts=[];for(let i=0;i<=16;i++){let t=-1.2+Math.PI*1.8*i/16;pts.push([Math.cos(t)*.058,Math.sin(t)*.058])}for(let i=16;i>=0;i--){let t=-1.2+Math.PI*1.8*i/16;pts.push([.022+Math.cos(t)*.043,Math.sin(t)*.043])}shape(g,pts,trim)}
   else if(type==='flower'){for(let i=0;i<5;i++){let t=i*2*Math.PI/5,m=mesh(g,new T.SphereGeometry(.025,12,8),fabric,Math.sin(t)*.028,Math.cos(t)*.028,0);m.scale.set(.75,1,.28);m.rotation.z=-t}mesh(g,new T.SphereGeometry(.014,10,8),trim,0,0,.013)}
   else if(type==='leaf'||type==='feather'){for(let i=0;i<3;i++){let m=shape(g,[[0,0],[.020,.045],[.010,.10],[-.018,.053]],i===1?trim:fabric);m.rotation.z=(i-1)*.48}}
   else if(type==='gem'){shape(g,[[0,.073],[.039,.015],[.018,-.046],[-.018,-.046],[-.039,.015]],trim);shape(g,[[0,.053],[.025,.012],[0,-.031],[-.025,.012]],fabric,.009)}
   else if(type==='crest'){for(let i=-1;i<=1;i++){let m=shape(g,[[0,0],[.019,.027],[0,.071],[-.019,.027]],trim);m.position.x=i*.027;m.rotation.z=i*-.27}}
  }
  // Each group can reference shared materials; dispose unused ones on next preset.
  a.identityType=type;a.identityDetail342={type,variant,badgeSides:badge.sides,additionalMeshes:1};
 }
 // V33.7: shoulder-pinned fabric, smooth inertia, bounded hem curl and two moving trim edges.
 function fabricPoint337(x,y,z,u,v,t,pitch,roll,flutter,phase=0,out=[]){
  const w=v*v,fold=Math.sin(u*8+phase-v*3)*.009*w, wave=Math.sin(t*6+u*4-v*5+phase)*flutter*.095*w;
  const back=Math.max(.004*v,.025*v+Math.max(0,pitch)*.22*w+wave+fold);
  out[0]=x+roll*.13*w;out[1]=y+Math.min(.08,Math.abs(pitch)*.065+Math.abs(roll)*.025)*w;out[2]=z-back;return out;
 }
 function animate(a,t,gait,secondary={}){
  if(!Number.isFinite(t))return;const f=(x,d=0)=>Number.isFinite(x)?x:d,c=(x,l,h)=>Math.min(h,Math.max(l,x));
  const pitch=c(f(secondary.clothPitch,f(secondary.pitch)),-.75,.75),roll=c(f(secondary.clothRoll,f(secondary.roll)),-.52,.52),flutter=c(f(secondary.flutter),0,.4),tier=c(f(a.physicsTier317),0,2);
  for(const item of a.identityMotion||[]){
   const {g,rest,amplitude,cloth,geo,base,border}=item;g.quaternion.copy(rest);g.rotateX(amplitude*c(pitch*.60+.10,-.15,.60));g.rotateZ(amplitude*roll*.50);
   const interval=tier===2?.133:tier===1||a.diagnosticInterval140?.067:.033;
   if(!cloth||t>=item.last&&t-item.last<interval)continue;item.last=t;const out=item.point337??=[0,0,0];
   for(let i=0;i<cloth.count;i++){const v=Math.floor(i/9)/12,u=(i%9)/4-1;fabricPoint337(base[i*3],base[i*3+1],base[i*3+2],u,v,t,pitch,roll,flutter,item.phase,out);cloth.setXYZ(i,...out);}
   cloth.needsUpdate=true;geo.computeVertexNormals();
   const b=border.attributes.position;for(let row=0;row<=12;row++)for(let side=0;side<2;side++){const k=row*9+(side?8:0);for(let j=0;j<2;j++)b.setXYZ(row*4+side*2+j,cloth.getX(k)+(side?-1:1)*j*.009,cloth.getY(k),cloth.getZ(k)-.002);}
   b.needsUpdate=true;border.computeVertexNormals();
  }
 }
 const api={travelerMantlePoint,travelerLapels,badgeProfile342,designs,apply,clear,animate,fabricPoint337};if(typeof module!=='undefined')module.exports=api;else root.WWIdentity=api;
})(typeof globalThis!=='undefined'?globalThis:this);

/* Original lightweight accessory meshes for WISH WORLD character identities.
 * No body/face sculpting; existing VRM hair/clothing remains intact. */
(function(root){
 const designs={
 m1:['Lữ khách đồng cỏ','satchel',0x567a55,0xd6b47c],m2:['Kiếm sĩ lam bạc','blade',0x3c6191,0xd4e9ee],m3:['Phong Vân · gió và mây','scarf',0x6fabb7,0xdef5f2],m4:['Hỏa Vũ · chiến binh lửa','cape',0x9b392a,0xf4b46a],m5:['Dạ Hành · du hiệp đêm','hood',0x282941,0x8f9acb],
 m6:['Băng Kiếm · kiếm băng','blade',0x679ac1,0xe4f9ff],m7:['Lâm Vũ · kiểm lâm','leaf',0x3f6647,0xc6de8e],m8:['Thiên Quang · ánh sáng','crest',0xe5c78e,0xfff1bc],m9:['Hắc Phong · bóng tối','cape',0x242331,0x8f90b0],m10:['Hải Đăng · người giữ biển','satchel',0x345f85,0xefd294],
 f1:['Nguyệt Hoa · trăng và hoa','moon',0xd3d9f2,0xfff2ca],f2:['Lam Ngọc · ngọc xanh','gem',0x427da6,0xade9fa],f3:['Ánh Mai · hoa mùa xuân','flower',0xf3c36d,0xffefc1],f4:['Tử Vân · mây tím','scarf',0x8274ae,0xe1d2fa],f5:['Bạch Linh · linh quang trắng','crest',0xd2e7ed,0xffffff],
 f6:['Hồng Liên · cánh sen','flower',0xbc5375,0xffbdcf],f7:['Thanh Trúc · trúc xanh','leaf',0x629b78,0xd9f1b9],f8:['Băng Tâm · tinh thể băng','gem',0x9acfe8,0xf1fdff],f9:['Dạ Nguyệt · trăng đêm','moon',0x494464,0xc6c9fc],f10:['Kim Vũ · lông vũ vàng','feather',0xc89a4e,0xffe2a2]
 };
 function clear(a){for(const group of a.identityMeshes||[]){group.removeFromParent();const gs=new Set(),ms=new Set();group.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material)}});for(const g of gs)g.dispose();for(const m of ms)m.dispose()}a.identityMeshes=[];a.identityMotion=[];a.identityType=null}
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
  const trim=new T.MeshStandardMaterial({color:accent,roughness:.62,metalness:.12,side:T.DoubleSide});
  function groupAt(bone,x,y,z){const g=new T.Group();g.position.copy(root.worldToLocal(bone.getWorldPosition(new T.Vector3()))).addScaledVector(right,x*base).addScaledVector(new T.Vector3(0,1,0),y*base).addScaledVector(forward,z*base);g.quaternion.copy(orient);g.scale.setScalar(base);root.add(g);g.updateWorldMatrix(true,true);bone.attach(g);a.identityMeshes.push(g);return g}
  function mesh(g,geo,mat,x=0,y=0,z=0){let m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m}
  function shape(g,pts,mat,z=0){let s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(g,new T.ExtrudeGeometry(s,{depth:.006,bevelEnabled:true,bevelThickness:.0015,bevelSize:.002,bevelSegments:1,steps:1}),mat,0,0,z)}
  function line(g,pts,r,mat){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v))),12,r,5,false),mat)}
  const emblem=groupAt(chest,0,.045,.145);
  shape(emblem,[[0,.043],[.026,.014],[.020,-.027],[0,-.044],[-.020,-.027],[-.026,.014]],trim);
  shape(emblem,[[0,.030],[.014,0],[0,-.026],[-.014,0]],fabric,.009);
  if(type==='cape'||type==='scarf'||type==='hood'){
   let g=groupAt(chest,0,.13,-.13),w=type==='cape'?.20:.12,h=type==='cape'?.49:type==='hood'?.24:.31;
   let pts=[[-w,0],[-w*.83,-h*.55],[-w*.63,-h],[0,-h*.86],[w*.63,-h],[w*.83,-h*.55],[w,0]];
   // A small subdivided textile surface, fixed at the shoulders, deformable at the hem.
   const geo=new T.PlaneGeometry(1,1,8,12),pos=geo.attributes.position;for(let row=0;row<=12;row++)for(let col=0;col<=8;col++){const v=row/12,u=col/8*2-1;pos.setXYZ(row*9+col,u*w*(1-.37*v),-h*v*(1-.14*(1-Math.abs(u))*v),-.018*v);}
   pos.needsUpdate=true;geo.computeVertexNormals();const textile=mesh(g,geo,fabric);textile.frustumCulled=false;
   const border=mesh(g,new T.BufferGeometry(),trim);const bp=new Float32Array(13*2*3);border.geometry.setAttribute('position',new T.BufferAttribute(bp,3));const ix=[];for(let row=0;row<12;row++){const n=row*2;ix.push(n,n+1,n+2,n+1,n+3,n+2)}border.geometry.setIndex(ix);border.frustumCulled=false;
   a.identityMotion.push({g,rest:g.quaternion.clone(),amplitude:type==='cape'?.12:.07,cloth:pos,geo,base:new Float32Array(pos.array),border:border.geometry,last:-Infinity});
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
  a.identityType=type;
 }
 function animate(a,t,gait,secondary={}){const pitch=secondary.pitch||0,roll=secondary.roll||0,wind=secondary.wind??1,flutter=secondary.flutter||0;for(const item of a.identityMotion||[]){const {g,rest,amplitude,cloth,geo,base,border}=item;g.quaternion.copy(rest);g.rotateX(Math.max(0,amplitude*(pitch*.65+.12)));g.rotateZ(amplitude*roll*.55);if(!cloth||t-item.last<(a.diagnosticInterval140?.065:.033))continue;item.last=t;for(let i=0;i<cloth.count;i++){const row=Math.floor(i/9),v=row/12,u=(i%9)/4-1,x=base[i*3],y=base[i*3+1],z=base[i*3+2];const bend=Math.max(.006*v,.02*v+Math.max(0,pitch)*.20*v*v+flutter*.08*v*v*Math.sin(t*7+u*3-v*4));cloth.setXYZ(i,x+roll*.11*v*v,y+Math.abs(pitch)*.045*v*v,z-bend);}cloth.needsUpdate=true;geo.computeVertexNormals();const b=border.attributes.position;for(let row=0;row<=12;row++){const k=row*9;for(let j=0;j<2;j++)b.setXYZ(row*2+j,cloth.getX(k)+j*.009,cloth.getY(k),cloth.getZ(k)-.002);}b.needsUpdate=true;border.computeVertexNormals();}}
 const api={designs,apply,clear,animate};if(typeof module!=='undefined')module.exports=api;else root.WWIdentity=api;
})(typeof globalThis!=='undefined'?globalThis:this);

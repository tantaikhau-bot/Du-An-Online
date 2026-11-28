/* V11.7: skinned VRM avatar pipeline. CC0 VRoid sample models, not original game artwork. */
(function(){
 const sources={male:'Sakurada_Fumiriya',female:'Sendagaya_Shino',male2:'HairSample_Male',female2:'HairSample_Female',female3:'Sendagaya_Shibu',female4:'Vivi'};
 const roster=[
 {id:'m1',gender:'male',name:'Lữ khách',source:'male',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'m2',gender:'male',name:'Kiếm sĩ',source:'male2',hair:0x3c4259,cloth:0x7395d9,height:1.06},
 {id:'m3',gender:'male',name:'Phong Vân',source:'male',hair:0xb8c6e5,cloth:0x80bdad,height:1.03},
 {id:'m4',gender:'male',name:'Hỏa Vũ',source:'male2',hair:0xc37c50,cloth:0xd19b76,height:.97},
 {id:'m5',gender:'male',name:'Dạ Hành',source:'male',hair:0x57556e,cloth:0x717bba,height:1.08},
 {id:'f1',gender:'female',name:'Nguyệt Hoa',source:'female',hair:0xffffff,cloth:0xffffff,height:1},
 {id:'f2',gender:'female',name:'Lam Ngọc',source:'female2',hair:0x7a9bd8,cloth:0x89c4e5,height:1.02},
 {id:'f3',gender:'female',name:'Ánh Mai',source:'female4',hair:0xe9b66c,cloth:0xe4c17c,height:.96},
 {id:'f4',gender:'female',name:'Tử Vân',source:'female3',hair:0xb799da,cloth:0xbaa3d8,height:1.04},
 {id:'f5',gender:'female',name:'Bạch Linh',source:'female',hair:0xd0e0ee,cloth:0x93c4bd,height:1.06},
 {"id":"m6","gender":"male","name":"Băng Kiếm","source":"male2","hair":10337752,"cloth":10012120,"height":1.05},
 {"id":"m7","gender":"male","name":"Lâm Vũ","source":"male","hair":6707015,"cloth":9088629,"height":1.01},
 {"id":"m8","gender":"male","name":"Thiên Quang","source":"male2","hair":14992530,"cloth":14996909,"height":1.09},
 {"id":"m9","gender":"male","name":"Hắc Phong","source":"male","hair":3881288,"cloth":8551569,"height":0.99},
 {"id":"m10","gender":"male","name":"Hải Đăng","source":"male2","hair":8303542,"cloth":8497100,"height":1.04},
 {"id":"f6","gender":"female","name":"Hồng Liên","source":"female2","hair":14385804,"cloth":14261167,"height":0.99},
 {"id":"f7","gender":"female","name":"Thanh Trúc","source":"female4","hair":8101509,"cloth":10148279,"height":1.03},
 {"id":"f8","gender":"female","name":"Băng Tâm","source":"female2","hair":13229286,"cloth":11196399,"height":1.07},
 {"id":"f9","gender":"female","name":"Dạ Nguyệt","source":"female3","hair":5854323,"cloth":9207995,"height":1.01},
 {"id":"f10","gender":"female","name":"Kim Vũ","source":"female2","hair":14992257,"cloth":15126948,"height":0.97}
 ];
 function preset(id,gender='male'){return roster.find(p=>p.id===id)||roster.find(p=>p.gender===gender)||roster[0]}
 function heightFactor(p){return p.height*(p.gender==='female'?.92:1)}
 // V34.2: material-safe portrait finish. Preserve authored maps, alpha, shader and skinning.
 const appearance342=Object.freeze({
 m1:[1.00,.96,.98,.70],m2:[.98,.91,1.02,.63],m3:[1.02,.93,.96,.68],m4:[1.03,.98,.93,.72],m5:[.97,.89,1.01,.61],
 m6:[1.00,.92,1.03,.64],m7:[1.02,.98,.95,.73],m8:[1.03,.96,.93,.67],m9:[.97,.90,.98,.60],m10:[1.01,.95,.98,.71],
 f1:[1.02,.97,1.01,.66],f2:[.99,.96,1.04,.63],f3:[1.03,.99,.94,.71],f4:[1.00,.94,1.03,.65],f5:[1.02,.99,1.04,.62],
 f6:[1.03,.95,.96,.69],f7:[1.01,.98,.94,.72],f8:[1.00,.97,1.04,.61],f9:[.98,.93,1.01,.64],f10:[1.03,.98,.96,.68]
 });
 function materialRole342(name){
  const n=String(name||'').toLowerCase();
  if(/eyelash|lash|eyebrow|brow|まつげ|眉/.test(n))return 'detail';
  if(/eye|iris|瞳|白目|highlight/.test(n))return 'eye';
  if(/mouth|teeth|tooth|tongue|lip|口|歯/.test(n))return 'detail';
  if(/hair|bang|髪/.test(n))return 'hair';
  if(/skin|face|body|肌|顔/.test(n)&&!/cloth|suit|armor|dress|shirt/.test(n))return 'skin';
  if(/cloth|wear|dress|coat|shirt|skirt|pants|shoe|boot|uniform|jacket|armor|costume|fabric|衣装|服|靴/.test(n))return 'cloth';
  return 'unknown';
 }
 function materialPolicy342(role,id){
  const d=appearance342[id]||appearance342.m1;
  return role==='skin'?{rgb:[d[0],d[1]+.025,d[2]],roughness:.82,metalness:0,toon:.94,outline:.72}:role==='hair'?{rgb:[1,1,1],roughness:d[3],metalness:0,toon:.92,outline:.80}:role==='cloth'?{rgb:[1,1,1],roughness:.88,metalness:0,toon:.96,outline:.90}:role==='eye'?{rgb:[1,1,1],roughness:.35,metalness:0,toon:1,outline:1}:{rgb:[1,1,1],roughness:null,metalness:null,toon:1,outline:1};
 }
 // Traveler prototype: preserve the original VRM maps, skinning, expressions and shader.
 // This finish is intentionally limited to m1; source meshes are not modified.
 function travelerFinish(m,original,role,id){
  if(Number.isFinite(original.shadingShiftFactor)){
   const delta=id==='m1'?({skin:.035,hair:.02,cloth:.015}[role]||0):0;
   m.shadingShiftFactor=delta===0?original.shadingShiftFactor:Math.max(-1,Math.min(1,original.shadingShiftFactor+delta));
  }
  if(id!=='m1')return;
  const soften={skin:.80,hair:.88,cloth:.94}[role];
  if(soften!==undefined&&Number.isFinite(m.outlineWidthFactor))m.outlineWidthFactor*=soften;
  if(soften!==undefined&&Number.isFinite(m.shadingToonyFactor))m.shadingToonyFactor*=({skin:.87,hair:.91,cloth:.96}[role]);
  if(m.isMeshStandardMaterial&&Number.isFinite(m.roughness)){
   const target={skin:.72,hair:.58,cloth:.85,eye:.27}[role];
   if(target!==undefined)m.roughness=m.roughness*.55+target*.45;
  }
 }
 function snapshotMaterial342(m){return {roughness:m.roughness,metalness:m.metalness,shadingToonyFactor:m.shadingToonyFactor,outlineWidthFactor:m.outlineWidthFactor,shadingShiftFactor:m.shadingShiftFactor};}
 function finishMaterial342(T,record,p){
  const {material:m,base,role}=record,original=record.original342??=snapshotMaterial342(m),q=materialPolicy342(role,p.id);
  m.color.copy(base);
  if(role==='hair'||role==='cloth')m.color.multiply(new T.Color(role==='hair'?p.hair:p.cloth));
  else if(role==='skin'){m.color.r*=q.rgb[0];m.color.g*=q.rgb[1];m.color.b*=q.rgb[2];}
  if(m.isMeshStandardMaterial&&q.roughness!==null&&Number.isFinite(original.roughness))m.roughness=Math.max(.20,Math.min(1,original.roughness*.35+q.roughness*.65));
  if(m.isMeshStandardMaterial&&q.metalness!==null&&Number.isFinite(original.metalness))m.metalness=Math.min(original.metalness,.08);
  if(Number.isFinite(original.shadingToonyFactor))m.shadingToonyFactor=Math.max(0,Math.min(1,original.shadingToonyFactor*q.toon));
  if(Number.isFinite(original.outlineWidthFactor))m.outlineWidthFactor=original.outlineWidthFactor*q.outline;
  travelerFinish(m,original,role,p.id);
  return m;
 }
 // V35.3.0: independent rest-mesh silhouettes, not root height or material tint.
 const bodyShapes3523=Object.freeze({
 m1:[1,.98,1,1,1,1,1],m2:[1.24,.98,1.11,1.12,1.08,.94,1.10],m3:[.90,.86,.92,.88,.94,1.06,.92],m4:[1.13,1.08,1.15,1.08,1.05,1.04,1.12],m5:[1.15,.87,.94,1.02,1.08,.90,.96],
 m6:[1.07,.91,1.05,.97,.92,.94,1.06],m7:[1.02,1.12,1.18,1.14,1.12,1.08,1.03],m8:[1.20,.92,1.02,1.06,.96,1.02,1.14],m9:[.94,.94,.88,.95,1.02,.92,1.03],m10:[1.12,1.15,1.12,1.06,1.04,1.12,.94],
 f1:[.98,.91,1.06,.98,1.01,1.04,.98],f2:[.89,.85,.96,.92,.92,1.02,1.05],f3:[.95,1.04,1.11,1.05,1.10,1.14,.94],f4:[1.12,.89,1.09,1.02,1.04,.94,1.07],f5:[1.05,.98,1.20,1.14,1.08,1.06,1.03],
 f6:[1.18,1.05,1.13,1.11,1.12,.98,1.12],f7:[.88,.91,.98,.91,.96,1.09,.90],f8:[1.03,.86,1.01,.96,.90,.92,1.09],f9:[1.10,.93,1.16,1.06,1.02,.96,.94],f10:[.96,1.10,1.08,1.10,1.06,1.12,1.08]
 });
 function shapePoint3523(x,y,z,p,out=[]){
  const [shoulder,waist,hip,leg,depth,head,jaw]=p,clamp=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*clamp(t),h=y/1.68;
  const knots=[[0,1],[.25,leg],[.40,leg],[.53,hip],[.65,waist],[.79,shoulder],[.86,jaw],[.97,head],[1.1,head]];let width=1;
  for(let i=1;i<knots.length;i++){const a=knots[i-1],b=knots[i];width=mix(a[1],b[1],(h-a[0])/(b[0]-a[0]));if(h<=b[0])break;}
  const arm=clamp((Math.abs(x)-.29)/.27);width=mix(width,1,arm*.95);const volume=mix(1,depth,clamp((h-.12)/.18)*clamp((.86-h)/.13));
  out[0]=x*width;out[1]=y;out[2]=z*volume;return out;
 }
 function captureShape3523(T,a){
  const root=a.root,inv=root.matrixWorld.clone().invert(),seen=new Set(),records=[];
  a.vrm.scene.traverse(o=>{const g=o.geometry,pos=g?.attributes?.position;if(!o.isMesh||!pos||seen.has(g))return;seen.add(g);const matrix=inv.clone().multiply(o.matrixWorld),back=matrix.clone().invert(),original=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){original[i*3]=pos.getX(i);original[i*3+1]=pos.getY(i);original[i*3+2]=pos.getZ(i)}records.push({g,matrix,back,original});});a.shapeRecords3523=records;
 }
 function applyShape3523(T,a,id){
  const profile=bodyShapes3523[id];if(!profile||!a.shapeRecords3523)return;const v=new T.Vector3(),out=[],scale=a.baseScale;
  for(const r of a.shapeRecords3523){const pos=r.g.attributes.position;for(let i=0;i<pos.count;i++){v.fromArray(r.original,i*3).applyMatrix4(r.matrix).multiplyScalar(scale);shapePoint3523(v.x,v.y,v.z,profile,out);v.fromArray(out).multiplyScalar(1/scale).applyMatrix4(r.back);pos.setXYZ(i,v.x,v.y,v.z)}pos.needsUpdate=true;r.g.computeBoundingBox();r.g.computeBoundingSphere();}
  a.shape3523={id,profile:[...profile],meshes:a.shapeRecords3523.length};
 }
 function stanceSpread3523(leftX,rightX,width){const sign=Number.isFinite(leftX)&&Number.isFinite(rightX)&&Math.abs(leftX-rightX)>.001?Math.sign(leftX-rightX):1;return sign*Math.max(.08,Math.min(.42,Number.isFinite(width)?width:.19));}
 function carry3523(state,now,id,active,valid,deadline=Infinity){
  if(!valid||!['sword','great','dual'].includes(id)){state.id=null;state.amount=0;state.last=now;state.active=-Infinity;return {amount:1,phase:'none'};}
  if(state.id!==id){state.id=id;state.amount=0;state.last=now;state.active=-Infinity;}
  const dt=Math.max(0,Math.min(100,now-state.last));state.last=now;if(active)state.active=now;const want=active||now-state.active<1800;
  const speed=want?Math.min(160,Math.max(35,deadline-now+dt)):380;state.amount=Math.max(0,Math.min(1,state.amount+(want?dt/speed:-dt/speed)));if(active&&now>=deadline)state.amount=1;
  return {amount:state.amount,phase:state.amount<=0?'sheathed':state.amount>=1?'drawn':want?'drawing':'stowing'};
 }
 // Traveler V2: a bounded, reversible rest-space sculpt on the original m1 VRM.
 // No bone scaling; all head surfaces (including eyes and hair) receive the same field.
 function travelerSculptPoint(x,y,z,headX,headY,out=[]){
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  const band=(v,a,b,c,d)=>smooth((v-a)/(b-a))*(1-smooth((v-c)/(d-c)));
  const h=y-headY,dx=x-headX;
  const jaw=band(h,-.035,.015,.055,.105),crown=smooth((h-.065)/.11);
  const shoulders=band(h,-.39,-.30,-.19,-.10),waist=band(h,-.71,-.60,-.48,-.37);
  const core=1-smooth((Math.abs(dx)-.15)/.16);
  out[0]=headX+dx*(1+.045*jaw-.065*crown+core*(.045*shoulders-.055*waist));
  out[1]=y;out[2]=z;return out;
 }
 // Traveler V3: an asymmetric swept crown and narrower temples, anchored at the scalp.
 // Only fully hair-material meshes are eligible; mixed face/hair geometry is left alone.
 // Traveler V5: original tapered steel blade and fitted leather sheath, +Y blade axis.
 const travelerBladeRows=Object.freeze([[.115,.033,.010],[.19,.044,.013],[.48,.039,.011],[.76,.029,.009],[.91,.017,.006],[.98,0,0]].map(Object.freeze));
 function travelerSwordEnabled(id,weapon){return id==='m1'&&weapon==='sword';}
 function travelerSection(rows,inner=false){
  const positions=[],indices=[];
  for(const [y,w,d] of rows)positions.push(-w,y,0,-w*.66,y,d*.72,0,y,d,w*.66,y,d*.72,w,y,0,w*.66,y,-d*.72,0,y,-d,-w*.66,y,-d*.72);
  for(let i=0;i<rows.length-1;i++)for(let j=0;j<8;j++){const a=i*8+j,b=i*8+(j+1)%8;indices.push(a,b,a+8,b,b+8,a+8);}
  if(inner)for(let i=0;i<indices.length;i+=3){const v=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=v;}
  return {positions,indices};
 }
 function buildTravelerSword(T){
  const sword=new T.Group(),sheath=new T.Group();
  const steel=new T.MeshStandardMaterial({color:0xa9b6c2,metalness:.77,roughness:.32}),edge=new T.MeshStandardMaterial({color:0xdbe4e8,metalness:.68,roughness:.24}),bronze=new T.MeshStandardMaterial({color:0xa48754,metalness:.65,roughness:.44}),hide=new T.MeshStandardMaterial({color:0x403126,roughness:.86}),dark=new T.MeshStandardMaterial({color:0x27241f,roughness:.83,side:T.DoubleSide});
  function put(g,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m}
  function section(g,rows,mat,inside=false){const {positions,indices}=travelerSection(rows,inside),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);const flat=geo.toNonIndexed();geo.dispose();flat.computeVertexNormals();return put(g,flat,mat)}
  // Bright bevels and steel ridge are two surfaces, grouped into two draw calls.
  const raw=travelerSection(travelerBladeRows),batches=[[],[]];
  for(let i=0;i<raw.indices.length;i+=6){const side=(i/6)%8,buf=batches[[0,3,4,7].includes(side)?1:0];for(let j=0;j<6;j++){const k=raw.indices[i+j]*3;buf.push(...raw.positions.slice(k,k+3));}}
  for(let i=0;i<2;i++){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(batches[i],3));g.computeVertexNormals();put(sword,g,i?edge:steel);}
  put(sword,new T.CylinderGeometry(.021,.020,.20,12),hide,0,-.003,0);
  // Rounded guard follows the grip axis; no fantasy spikes obstruct the hand.
  const guard=put(sword,new T.CapsuleGeometry(.012,.143,4,8),bronze,0,.111,0);guard.rotation.z=Math.PI/2;
  const collar=put(sword,new T.BoxGeometry(.066,.026,.036),bronze,0,.122,0);
  put(sword,new T.SphereGeometry(.026,10,8),bronze,0,-.118,0).scale.set(1,.68,.9);
  const rings=new T.InstancedMesh(new T.TorusGeometry(.0208,.0017,5,12),bronze,5),matrix=new T.Matrix4(),rot=new T.Matrix4().makeRotationX(Math.PI/2);
  for(let i=0;i<5;i++){matrix.copy(rot).setPosition(0,-.085+i*.041,0);rings.setMatrixAt(i,matrix);}rings.computeBoundingSphere();sword.add(rings);
  // Open throat, tapered octagonal shell and separate metal chape.
  const shell=[[.119,.052,.025],[.20,.052,.025],[.53,.048,.023],[.80,.038,.020],[.99,.022,.015],[1.025,.012,.010]];
  section(sheath,shell,hide);
  section(sheath,[[.119,.047,.020],[.24,.047,.020]],dark,true);
  section(sheath,[[.118,.055,.028],[.157,.055,.028]],bronze);
  section(sheath,[[.927,.030,.021],[.995,.024,.018],[1.034,0,0]],bronze);
  section(sheath,[[.38,.051,.026],[.413,.051,.026]],bronze);
  sword.userData.travelerVariant=true;sheath.userData.travelerVariant=true;
  return {sword,sheath};
 }
 function syncTravelerSword(sword,sheath,variant,enabled){
  if(!sword||!sheath||!variant)return;
  for(const [group,child] of [[sword,variant.sword],[sheath,variant.sheath]]){
   for(const o of group.children){if(o===child)o.visible=enabled;else if(enabled){if(o.userData.travelerVisible===undefined)o.userData.travelerVisible=o.visible;o.visible=false;}else if(o.userData.travelerVisible!==undefined){o.visible=o.userData.travelerVisible;delete o.userData.travelerVisible;}}
  }
 }
 function travelerHairMesh(mesh){
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  return materials.length>0&&materials.every(m=>m&&materialRole342(m.name)==='hair');
 }
 function travelerHairPoint(x,y,z,headX,headY,out=[]){
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  const h=y-headY,dx=x-headX,top=smooth((h-.085)/.13),outer=smooth((Math.abs(dx)-.075)/.065);
  const temple=smooth((h-.015)/.055)*(1-smooth((h-.085)/.095))*outer;
  out[0]=x+.022*top-.045*dx*temple;
  out[1]=y+.009*top*(.55+.45*Math.tanh(dx/.07));
  out[2]=z;return out;
 }
 function travelerHairSpring(id,role){
  return id==='m1'&&role==='hair'?{gain:.19,side:.20,max:.13,flutter:.045}:null;
 }
 function captureTravelerRest(T,a){
  if(a.kind!=='male'||a.original||a.experimentalShape3527)return;
  const head=a.vrm.humanoid.getRawBoneNode('head');if(!head)return;
  a.root.updateMatrixWorld(true);
  const inv=a.root.matrixWorld.clone().invert(),scale=a.baseScale;
  const h=a.root.worldToLocal(head.getWorldPosition(new T.Vector3())).multiplyScalar(scale);
  if(!Number.isFinite(h.x)||!Number.isFinite(h.y)||h.y<1.15||h.y>1.7)return;
  const records=[];let vertices=0;
  a.vrm.scene.traverse(o=>{const g=o.geometry,p=g?.attributes?.position;if(!o.isMesh||!p||p.itemSize!==3)return;
   vertices+=p.count*(1+(g.morphAttributes?.position?.length||0));
   const matrix=inv.clone().multiply(o.matrixWorld);records.push({mesh:o,original:g,matrix,back:matrix.clone().invert(),hair:travelerHairMesh(o)});
  });
  if(vertices>2200000||!records.length)return;
  a.travelerRest={headX:h.x,headY:h.y,records,scale};
 }
 function restoreTravelerSculpt(a){
  for(const r of a.travelerRest?.records||[]){if(!r.sculpted)continue;r.mesh.geometry=r.original;r.sculpted.dispose();r.sculpted=null;}
  a.travelerSculpt=null;
 }
 function applyTravelerSculpt(T,a,id){
  if(id!=='m1'){restoreTravelerSculpt(a);return;}
  const rest=a.travelerRest;if(!rest||a.travelerSculpt)return;
  const {headX,headY,scale}=rest,v=new T.Vector3(),base=new T.Vector3(),warpedBase=new T.Vector3(),out=[],outBase=[];
  const warp=(p,m,b,out,hair)=>{p.applyMatrix4(m).multiplyScalar(scale);travelerSculptPoint(p.x,p.y,p.z,headX,headY,out);if(hair)travelerHairPoint(out[0],out[1],out[2],headX,headY,out);return p.fromArray(out).multiplyScalar(1/scale).applyMatrix4(b)};
  try{
   for(const r of rest.records){
    const source=r.original,src=source.attributes.position;
    // Skip geometry entirely below the waist deformation band, including shoes and most leg meshes.
    if(!source.boundingBox)source.computeBoundingBox();const bounds=source.boundingBox?.clone().applyMatrix4(r.matrix);
    if(bounds&&bounds.max.y*scale<headY-.72)continue;
    const g=source.clone(),dst=g.attributes.position;
    r.sculpted=g;
    // Transform absolute targets and relative morph deltas coherently.
    for(let i=0;i<src.count;i++){
     base.fromBufferAttribute(src,i);v.copy(base);warp(v,r.matrix,r.back,outBase,r.hair);dst.setXYZ(i,v.x,v.y,v.z);warpedBase.copy(v);
     for(let j=0;j<(source.morphAttributes.position?.length||0);j++){
      const old=source.morphAttributes.position[j],next=g.morphAttributes.position[j];
      v.fromBufferAttribute(old,i);if(source.morphTargetsRelative)v.add(base);warp(v,r.matrix,r.back,out,r.hair);
      if(source.morphTargetsRelative)v.sub(warpedBase);
      next.setXYZ(i,v.x,v.y,v.z);
     }
    }
    dst.needsUpdate=true;for(const m of g.morphAttributes.position||[])m.needsUpdate=true;
    // Retain authored normals/tangents and skin attributes; small sculpt avoids hard seam regeneration.
    g.computeBoundingBox();g.computeBoundingSphere();r.mesh.geometry=g;
   }
   a.travelerSculpt={id,meshes:rest.records.filter(r=>r.sculpted).length,hairMeshes:rest.records.filter(r=>r.hair&&r.sculpted).length,mode:'reversible-rest-sculpt'};
  }catch(e){restoreTravelerSculpt(a);console.warn('Traveler sculpt fallback',e);}
 }
 function applyPreset(T,a,p){
  if(a.applied===p.id)return;
  a.root.scale.setScalar(a.baseScale*heightFactor(p));if(a.experimentalShape3527)applyShape3523(T,a,p.id);else applyTravelerSculpt(T,a,p.id);
  const roles342={};for(const record of a.colors){finishMaterial342(T,record,p);roles342[record.role]=(roles342[record.role]||0)+1;}a.appearance342={preset:p.id,roles:roles342,base:a.kind,geometry:a.original?'original-skinned-mesh':a.experimentalShape3527?'rest-mesh-silhouette':'authored-vrm-mesh',shape:a.shape3523||null,travelerSculpt:a.travelerSculpt||null,finish:'authored-shader'};
  if(a.vrm&&!a.original&&typeof WWIdentity!=='undefined'){try{a.vrm.humanoid.resetNormalizedPose?.();a.vrm.humanoid.update();WWIdentity.apply(T,a,p)}catch(e){WWIdentity.clear(a);console.warn('Optional wearable fallback',e)}}
  a.applied=p.id;a.motionProfile=p.id;a.lastDiagnostic140=undefined;a.rawDiagnostics140=null;a.action132={};a.secondary132={};a.combatFilter308=null;a.flowTransition3526=null;a.support3525=null;a.stanceVectors3525=null;a.kinetic341=null;a.idleCombat341=null;if(a.spring316?.active)springMotion316(a,{},false);if(a.fingers163)for(const side of ['left','right'])for(const f of a.fingers163[side]){f.node.quaternion.copy(f.rest);f.curl=0;f.spread=0}a.idleGroundWeight=0;a.idleAnchor1170=null;a.contacts={};a.contactFrame=null;if(typeof WWMotion!=='undefined')a.motion=WWMotion.newState();
 }
 const remote='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/';
 let lib;
 // Bounded LRU of compressed source bytes. In-flight requests are deduplicated, never cancelled by eviction.
 function createBufferCache140(fetcher,maxBytes,maxEntries){
  const entries=new Map();
  function trim(){let bytes=0,count=0;for(const e of entries.values())if(e.size!==null){bytes+=e.size;count++}
   for(const [key,e] of entries){if(bytes<=maxBytes&&count<=maxEntries)break;if(e.size===null)continue;entries.delete(key);bytes-=e.size;count--}}
  function get(key){let e=entries.get(key);if(e){entries.delete(key);entries.set(key,e);return e.promise}
   e={size:null,promise:null};entries.set(key,e);
   e.promise=Promise.resolve().then(()=>fetcher(key)).then(data=>{e.size=data.byteLength;trim();return data},err=>{if(entries.get(key)===e)entries.delete(key);throw err});return e.promise
  }
  return {get,stats:()=>({entries:entries.size,bytes:[...entries.values()].reduce((n,e)=>n+(e.size||0),0),pending:[...entries.values()].filter(e=>e.size===null).length})}
 }
 const mobile140=typeof window!=='undefined'&&(window.matchMedia('(pointer:coarse)').matches||Math.min(screen.width,screen.height)<700);
 const buffers=createBufferCache140(async kind=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000),limit=40*1024*1024;
  try{const r=await fetch('/assets/'+sources[kind]+'.vrm',{signal:controller.signal});if(!r.ok)throw Error('VRM HTTP '+r.status);
   if(Number(r.headers.get('Content-Length'))>limit)throw Error('VRM size');
   const data=await r.arrayBuffer();if(data.byteLength<20||data.byteLength>limit)throw Error('VRM size');
   const view=new DataView(data);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.byteLength)throw Error('Invalid VRM GLB');return data;
  }finally{clearTimeout(timer)}
 },(mobile140?24:80)*1024*1024,mobile140?3:6);
 function modelBuffer(kind){return buffers.get(kind)}

 // V33.5: serialize expensive VRM decoding on mobile; local avatar jumps ahead of optional actors.
 function createLoadQueue335(limit=1,maxPending=12){let active=0,peak=0,seq=0,skipped=0;const pending=[];function pump(){while(active<limit&&pending.length){pending.sort((a,b)=>b.priority-a.priority||a.seq-b.seq);const q=pending.shift();if(q.valid&&!q.valid()){skipped++;q.reject(Error('Avatar request obsolete'));continue;}active++;peak=Math.max(peak,active);Promise.resolve().then(q.run).then(q.resolve,q.reject).finally(()=>{active--;pump();});}}return {enqueue(run,priority=0,valid=null){return new Promise((resolve,reject)=>{if(pending.length>=maxPending){let index=-1;for(let i=0;i<pending.length;i++)if(pending[i].priority<priority&&(index<0||pending[i].priority<pending[index].priority))index=i;if(index<0){reject(Error('Avatar load queue full'));return;}pending.splice(index,1)[0].reject(Error('Avatar request superseded'));skipped++;}pending.push({run,priority,valid,resolve,reject,seq:seq++});pump();});},stats:()=>({active,pending:pending.length,peak,skipped,limit,maxPending})};}
 const loadQueue335=createLoadQueue335(mobile140?1:2,mobile140?6:12),playerQueue3527=createLoadQueue335(1,3);
 function modelKey3524(p,original=false){return original?'original-'+p.id:p.source;}
 function load(T,kind,options={}){return (options.priority>=3?playerQueue3527:loadQueue335).enqueue(async()=>{if(kind.startsWith('original-')){const p=roster.find(q=>q.id===kind.slice(9));if(!p||typeof WWOriginal==='undefined')throw Error('Original model unavailable');const a=WWOriginal.build(T,p);try{WWFootIK.calibrateSoles(T,a)}catch{}return a}return loadWithFallback335(T,kind,options)},options.priority||0,options.valid||null);}
 function fallbackSources3527(kind){const list=kind.startsWith('female')?['female','female2','female3','female4']:['male','male2'];return Object.hasOwn(sources,kind)?[kind,...list.filter(x=>x!==kind)]:[];}
 async function loadWithFallback335(T,kind,options={}){let last;const candidates=fallbackSources3527(kind).slice(0,options.priority>=3?3:2);for(const source of candidates){if(options.valid&&!options.valid())throw Error('Avatar request obsolete');try{const a=await loadBase(T,source,!!options.experimentalShape);if(source!==kind)a.fallbackBase=kind;return a}catch(e){last=e;console.warn('VRM source unavailable',source,String(e?.message||e));}}throw last||Error('Unknown VRM source');}
 async function loadBase(T,kind,experimentalShape=false){
  lib??=Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('/assets/three-vrm.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js'))]);
  let modules;try{modules=await lib}catch(e){lib=null;throw e}const [{GLTFLoader},{VRMLoaderPlugin,VRMUtils}]=modules;
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
  let gltf;
  gltf=await loader.parseAsync(await modelBuffer(kind),'/assets/');
  const vrm=gltf.userData.vrm;if(!vrm?.humanoid){if(gltf.scene)VRMUtils.deepDispose(gltf.scene);throw Error('Invalid VRM')}
  VRMUtils.rotateVRM0(vrm);VRMUtils.removeUnnecessaryVertices(vrm.scene);VRMUtils.removeUnnecessaryJoints(vrm.scene);
  vrm.humanoid.update();vrm.scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(vrm.scene,true),size=box.getSize(new T.Vector3());if(!Number.isFinite(size.y)||size.y<.5||size.y>5){VRMUtils.deepDispose(vrm.scene);throw Error('Invalid avatar scale')}
  const root=new T.Group();root.add(vrm.scene);root.rotation.y=Math.PI;root.scale.setScalar(1.68/size.y);vrm.scene.position.y-=box.min.y;
  vrm.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false}});
  const armDown={};for(const side of ['left','right']){const lower=vrm.humanoid.getNormalizedBoneNode(side+'LowerArm');armDown[side]=lower&&Math.abs(lower.position.x)>.01?-Math.sign(lower.position.x):(side==='left'?1:-1)}
  const colors=[],seen=new Set();vrm.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m?.color||seen.has(m))continue;seen.add(m);const role=materialRole342(m.name);colors.push({material:m,base:m.color.clone(),role,original342:snapshotMaterial342(m)})}});
  vrm.humanoid.update();root.updateMatrixWorld(true);
  // VRM0 and VRM1 may have opposite normalized local forward axes. Read toe direction in rest pose.
  let legSign=1;for(const side of ['left','right']){let toe=vrm.humanoid.getNormalizedBoneNode(side+'Toes');if(toe&&Math.abs(toe.position.z)>.015){legSign=Math.sign(toe.position.z);break}}
  let modelForward=new T.Vector3(0,0,1);
  for(const side of ['left','right']){const foot=vrm.humanoid.getRawBoneNode(side+'Foot'),toe=vrm.humanoid.getRawBoneNode(side+'Toes');if(foot&&toe){const d=root.worldToLocal(toe.getWorldPosition(new T.Vector3())).sub(root.worldToLocal(foot.getWorldPosition(new T.Vector3())));d.y=0;if(d.length()>.015){modelForward=d.normalize();break}}}
  const soleHeight=Object.fromEntries(['left','right'].map(side=>{let n=vrm.humanoid.getRawBoneNode(side+'Foot');return [side,n?Math.max(.015,Math.min(.24,n.getWorldPosition(new T.Vector3()).y)):.06]}));
  const a={root,vrm,kind,phase:0,weight:0,elapsed:0,baseScale:root.scale.x,colors,armDown,legSign,modelForward,motionProfile:kind.startsWith('female')?'f1':'m1',motion:WWMotion.newState(),hipsRest:vrm.humanoid.getNormalizedBoneNode('hips')?.position.clone(),springReady:false,T,dispose:()=>VRMUtils.deepDispose(vrm.scene),soleHeight};
  a.experimentalShape3527=experimentalShape;if(experimentalShape)captureShape3523(T,a);else {try{captureTravelerRest(T,a)}catch(e){console.warn('Traveler rest capture fallback',e)}}try{WWFootIK.calibrateSoles(T,a)}catch(e){console.warn('Sole calibration fallback',e);a.soleSamples=null}return a;
 }
 // V16.3: normalized VRM finger joints, independent per hand with eased transitions.
 const digits163=['Index','Middle','Ring','Little'];
 function fingerTargets163(mode,gait,jump,time,side,turn=0,result={}){
  const clamp=(x,l=0,h=1)=>Math.max(l,Math.min(h,x)),g=clamp(Number(gait)||0),j=clamp(Number(jump)||0),t=Number(time)||0;
  let grip=.15+.16*g+.10*j+.018*Math.sin(t*1.6+(side==='left'?0:.8))*(1-g),spread=.030;
  if(mode==='ride'){grip=.80+.012*Math.sin(t*2+(side==='left'?.4:1.1))+.07*clamp(Math.abs(turn));spread=.009}
  else if(mode==='wave'||mode==='cheer'){grip=mode==='wave'&&side==='left'?.25:.075;spread=mode==='wave'&&side==='left'?.028:.062}
  else if(mode==='hand'||mode==='hug')grip=.40;
  else if(mode==='dance'||mode==='duet')grip=.17+.09*Math.sin(t*3);
  else if(mode==='sit')grip=.22;
  const set=(key,c,s)=>{const row=result[key]??=[0,0];row[0]=c;row[1]=s;};for(let i=0;i<4;i++){const digit=digits163[i],k=clamp(grip+(i-1.5)*.045);const ride=mode==='ride';set(digit+'Proximal',k*(ride?.94:.83),spread*(i-1.5));set(digit+'Intermediate',k*(ride?1.27:1.08),0);set(digit+'Distal',k*(ride?.76:.62),0)}
  set('ThumbMetacarpal',grip*(mode==='ride'?.53:.40),grip*(mode==='ride'?.29:.20));set('ThumbProximal',grip*.64,0);set('ThumbDistal',grip*.47,0);return result
 }
 function setupFingers163(a){
  const {T,vrm}=a,h=vrm.humanoid,out={left:[],right:[]};
  for(const side of ['left','right']){
   const get=name=>h.getNormalizedBoneNode(side+name),index=get('IndexProximal'),little=get('LittleProximal'),middle=get('MiddleProximal'),next=get('MiddleIntermediate');
   let palm=new T.Vector3(0,-1,0);
   if(index&&little&&middle&&next){const direction=next.position.clone().normalize(),across=index.position.clone().sub(little.position).normalize(),n=new T.Vector3().crossVectors(direction,across).normalize();if(n.lengthSq()>.5){if(n.dot(palm)<0)n.negate();if(Math.abs(n.dot(palm))>.25)palm.copy(n)}}
   const names=Object.keys(fingerTargets163('idle',0,0,0,side));
   for(const name of names){const node=get(name);if(!node)continue;const follow=name.endsWith('Proximal')?name.replace('Proximal','Intermediate'):name.endsWith('Intermediate')?name.replace('Intermediate','Distal'):name==='ThumbMetacarpal'?'ThumbProximal':name==='ThumbProximal'?'ThumbDistal':null;
    let d=follow&&get(follow)?get(follow).position.clone():node.position.clone();if(name==='ThumbProximal'&&get('ThumbDistal'))d=get('ThumbDistal').position.clone();if(d.lengthSq()<1e-7)d.set(side==='left'?1:-1,0,0);d.normalize();
    let inward=palm.clone();if(name.startsWith('Thumb')&&middle){const across=middle.position.clone().sub(get('ThumbMetacarpal')?.position||new T.Vector3());if(across.lengthSq()>.00001)inward.lerp(across.normalize(),.38)}
    const axis=new T.Vector3().crossVectors(d,inward);if(axis.lengthSq()<1e-6)axis.set(0,0,side==='left'?-1:1);axis.normalize();out[side].push({name,node,axis,spreadAxis:palm.clone(),rest:node.quaternion.clone(),curl:0,spread:0})
   }
  }return out
 }
 function fingerResponse251(f,curl,spread,dt,mode){
  const seconds=Math.max(0,Math.min(.35,Number.isFinite(dt)?dt:0));f.curl=Number.isFinite(f.curl)?f.curl:0;f.spread=Number.isFinite(f.spread)?f.spread:0;
  curl=Number.isFinite(curl)?Math.max(0,Math.min(1.35,curl)):f.curl;spread=Number.isFinite(spread)?Math.max(-.25,Math.min(.25,spread)):f.spread;
  const closing=curl>f.curl,distal=f.name.endsWith('Distal'),middle=f.name.endsWith('Intermediate'),rate=(mode==='combatGrip'?30:mode==='ride'?9:7)*(closing?1:.82)*(distal?.72:middle?.87:1);
  f.curl+=(curl-f.curl)*(1-Math.exp(-seconds*rate));f.spread+=(spread-f.spread)*(1-Math.exp(-seconds*(mode==='combatGrip'?18:6)));return f;
 }
 // V31.2: grip targets by handle and role, including bow release and support hand.
 function combatGrip312(weapon,side,combat,out={}){
  if(!weapon)return null;
  const p=Math.max(0,Math.min(1,Number(combat?.progress)||0)),impact=Math.max(.1,Math.min(.9,combat?.impact??.45)),draw=weapon==='bow'&&side==='right'&&['strike','ultimate'].includes(combat?.kind)&&p<impact;
  const release=weapon==='bow'&&side==='right'&&['strike','ultimate'].includes(combat?.kind)&&p>=impact&&p<impact+.24;if(weapon==='bow'&&side==='right'&&!draw&&!release)return null;
  if(side==='left'&&(!['bow','dual','great'].includes(weapon)||weapon==='great'&&combat&&!['strike','spin','ultimate','guard'].includes(combat.kind)))return null;
  const roles={sword:[.82,1.13,.68,.44],dual:[.88,1.17,.73,.46],great:[.72,1.02,.64,.39],staff:[.70,.98,.60,.40],bow:[.71,1.01,.62,.36]};
  const a=draw||release?[.68,.94,.51,.24]:weapon==='great'&&side==='left'?[.79,1.08,.67,.42]:roles[weapon];if(!a)return null;const clamp=v=>Math.max(0,Math.min(1,v)),squeeze=['strike','spin','ultimate','guard'].includes(combat?.kind)?Math.max(0,1-Math.abs(p-impact)/.24):0,releaseBlend=release?Math.max(.12,1-clamp((p-impact)/.12)) :1,force=(draw? .72+.28*clamp(p/Math.max(.08,impact)):1+.10*squeeze)*releaseBlend;const result=out,set=(k,c,s)=>{const row=result[k]??=[0,0];row[0]=Math.min(1.35,Math.max(0,c));row[1]=s;};for(let i=0;i<4;i++){const digit=digits163[i],f=draw||release?(i===3?.30:1):[.92,.98,1.03,1.06][i];set(digit+'Proximal',a[0]*f*force,.006*(i-1.5));set(digit+'Intermediate',a[1]*f*force,0);set(digit+'Distal',a[2]*f*force,0);}set('ThumbMetacarpal',a[3]*force,.19*releaseBlend);set('ThumbProximal',a[3]*1.35*force,0);set('ThumbDistal',a[3]*.93*force,0);return result;
 }
 function animateFingers163(a,dt,mode,gait,jump,time,turn,weapon=null,combat=null){
  a.fingers163??=setupFingers163(a);const {T}=a;let count=0,grip=0;const rot=a.fingerQuat163??=new T.Quaternion();
  a.gripTargets336??={left:{},right:{}};a.relaxedTargets3512??={left:{},right:{}};for(const side of ['left','right']){const grasp=combatGrip312(weapon,side,combat,a.gripTargets336[side]),target=grasp||fingerTargets163(mode,gait,jump,time,side,turn,a.relaxedTargets3512[side]);for(const f of a.fingers163[side]){const [curl,spread]=target[f.name];fingerResponse251(f,curl,spread,dt,grasp?'combatGrip':mode);f.node.quaternion.copy(f.rest).multiply(rot.setFromAxisAngle(f.spreadAxis,f.spread)).multiply(rot.setFromAxisAngle(f.axis,f.curl));count++;grip+=f.curl}}
  return {joints:count,meanCurl:count?grip/count:0,mode}
 }

 // V33.7: preserve authored collider/drag/stiffness; apply bounded world-space inertia to native spring joints.
 function springMotion316(a,secondary,enabled){
  const manager=a.vrm.springBoneManager;if(!manager?.joints)return 0;
  if(!a.spring316){
   const records=[],counts={hair:0,cloth:0,other:0},seen=new Set();
   for(const joint of manager.joints){const s=joint.settings;if(!s||seen.has(s)||!s.gravityDir?.isVector3||!Number.isFinite(s.gravityPower))continue;seen.add(s);
    const n=(joint.bone?.name||joint.node?.name||'').toLowerCase(),role=/hair|bang|pony|fringe|braid|kami|髪/.test(n)?'hair':/skirt|cloth|cape|coat|dress|ribbon|scarf|sleeve|スカート/.test(n)?'cloth':'other';counts[role]++;records.push({s,gravity:s.gravityDir.clone(),power:s.gravityPower,role});}
   a.spring316={records,counts,dir:new a.T.Vector3(),forward:new a.T.Vector3(),right:new a.T.Vector3(),q:new a.T.Quaternion(),active:false};
  }
  const cache=a.spring316;if(!enabled&&!cache.active)return cache.records.length;
  if(enabled){a.root.getWorldQuaternion(cache.q);cache.forward.copy(a.modelForward).applyQuaternion(cache.q);cache.forward.y=0;if(cache.forward.lengthSq()<1e-6)cache.forward.set(0,0,1);else cache.forward.normalize();cache.right.set(-cache.forward.z,0,cache.forward.x);}
  for(const {s,gravity,power,role} of cache.records){
   if(!enabled){s.gravityDir.copy(gravity);s.gravityPower=power;continue;}
   const hair=role==='hair',cloth=role==='cloth',pitch=hair?secondary.hairPitch:secondary.clothPitch,roll=hair?secondary.hairRoll:secondary.clothRoll;
   const custom=travelerHairSpring(a.motionProfile,role),gain=custom?.gain??(hair?.23:cloth?.27:.085),side=custom?.side??(hair?.18:cloth?.22:.065),max=custom?.max??(hair?.15:cloth?.19:.065);
   cache.dir.copy(cache.forward).multiplyScalar(-(Number.isFinite(pitch)?pitch:0)*gain).addScaledVector(cache.right,(Number.isFinite(roll)?roll:0)*side);cache.dir.y=-(Number.isFinite(secondary.flutter)?secondary.flutter:0)*(custom?.flutter??(cloth?.07:.035));const len=cache.dir.length();if(len>max)cache.dir.multiplyScalar(max/len);
   s.gravityDir.copy(gravity).multiplyScalar(power).add(cache.dir);const magnitude=s.gravityDir.length();if(magnitude>1e-6){s.gravityDir.divideScalar(magnitude);s.gravityPower=Math.min(Math.max(0,power)+max,magnitude);}else{s.gravityDir.copy(gravity);s.gravityPower=power;}
  }
  cache.active=!!enabled;return cache.records.length;
 }
 // Original character-specific movement profiles: reach, turn direction, flourish.
 const danceProfiles320={m1:[1,1,.82],m2:[.80,1,.66],m3:[1.18,-1,1],m4:[.87,-1,.72],m5:[1.13,1,.94],m6:[.93,-1,.86],m7:[.75,1,.70],m8:[.84,1,.77],m9:[1.20,-1,.99],m10:[.72,-1,.79],f1:[.98,-1,.98],f2:[.76,1,.83],f3:[.73,-1,.86],f4:[.79,-1,.92],f5:[1.10,1,.96],f6:[1.16,1,1],f7:[.78,-1,.82],f8:[.85,-1,.75],f9:[1.06,1,.91],f10:[.90,1,.87]};
 // V33.4: authored motion envelopes; profile variations share safe joint limits.
 function dodgePose334(p,forward,side,roll,out={}){const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},t=clamp(p),f=Number.isFinite(forward)?Math.max(-1,Math.min(1,forward)):-1,s=Number.isFinite(side)?Math.max(-1,Math.min(1,side)):0,len=Math.hypot(f,s)||1,tuck=ease(t/.24)*ease((1-t)/.24);out.tuck=tuck;out.angle=roll?Math.PI*2*ease((t-.12)/.76):0;out.axisX=-f/len;out.axisZ=-s/len;out.lean=roll?.15*tuck:.30*tuck;out.drop=(roll?-.22:-.13)*tuck;return out;}
 function actionFootwork320(move,p,profile='m1',out={}){
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},t=clamp(Number(p)||0),hit=Math.max(.18,Math.min(.82,Number(move?.impact)||.45)),form=Math.max(0,Math.min(4,move?.combo|0)),weapon=move?.weapon||'sword',kind=move?.kind,style=danceProfiles320[profile]||danceProfiles320.m1,melee=['sword','great','dual'].includes(weapon),sign=style[1]*(form%2?-1:1);
  let distance=0,lateral=0,turn=0,hop=0,gesture=0;const approach=ease((t-.07)/Math.max(.15,hit-.07)),recover=ease((t-hit)/Math.max(.15,1-hit)),arc=Math.sin(Math.PI*t);
  if(kind==='strike'&&melee){distance=[.34,.40,.63,.48,.51][form]*style[0]*(weapon==='great'?.80:weapon==='dual'?1.10:1);lateral=[.06,-.07,0,.05,.17][form]*style[0]*style[1];turn=form===4?sign*Math.PI*2*ease((t-.12)/.77):0;gesture=style[2]*arc;if(form===3&&!move?.airborne)hop=.33* Math.pow(Math.sin(Math.PI*ease(t)),1.15);}
  else if(kind==='spin'&&melee){distance=.24*style[0];lateral=.14*style[1];turn=sign*Math.PI*2*ease((t-.10)/.83);gesture=style[2]*arc;}
  else if(kind==='dodge'){const f=Number.isFinite(move?.dodgeForward328)?move.dodgeForward328:-1,side=Number.isFinite(move?.dodgeSide328)?move.dodgeSide328:0;distance=1.30*Math.max(-1,Math.min(1,f));lateral=1.30*Math.max(-1,Math.min(1,side));hop=move?.roll334?0:.08*arc;gesture=arc;}
  else if(kind==='strike'){distance=weapon==='bow'?-.13:.12;gesture=style[2]*arc;}
  if(move?.airborne)hop=0;if(move?.air323===2&&melee)turn=sign*Math.PI*2*ease((t-.10)/.82);if(move?.air323===3)turn=0;
  out.forward=distance*(kind==='dodge'?ease(t):approach);out.side=lateral*(kind==='dodge'?ease(t):Math.sin(Math.PI*approach*.5));out.turn=turn;out.hop=Math.max(0,hop);out.gesture=gesture;out.recovery=recover;out.melee=melee?1:0;return out;
 }
 function boundedFootwork320(previous,desired,maxStep=.18,out={}){
  let x=desired.forward-previous.forward,z=desired.side-previous.side;const len=Math.hypot(x,z);if(!Number.isFinite(len)||len<1e-7){out.forward=0;out.side=0;return out;}const k=Math.min(1,maxStep/len);out.forward=x*k;out.side=z*k;return out;
 }
 // V32.1 authored keyframes: upper arm pitch/yaw/down, elbow curl, wrist roll, repeated for each arm.
 const tracks321={
 sword:[[.16,0,1.36,.30,0,.10,0,1.38,.22,0],[.78,-.58,.91,.80,-.38,.38,.18,1.12,.53,.12],[1.08,-.88,.66,1.08,-.48,.62,.35,.85,.67,.18],[1.38,.78,.46,.30,.48,.43,-.30,1.04,.48,-.12],[.86,1.02,.70,.53,.68,.30,-.42,1.12,.40,-.20],[.22,.12,1.24,.36,.10,.15,0,1.35,.30,0]],
 great:[[.22,0,1.34,.48,0,.24,0,1.24,.56,0],[1.05,-.40,.78,1.03,-.18,.82,.22,.70,.97,.16],[1.67,-.34,.48,1.30,-.20,1.25,.16,.52,1.22,.16],[1.34,.35,.58,.44,.24,1.08,-.20,.61,.55,-.18],[.74,.55,.82,.65,.34,.66,-.27,.82,.75,-.18],[.27,.06,1.25,.56,0,.30,0,1.18,.64,0]],
 dual:[[.20,0,1.30,.32,0,.20,0,1.30,.32,0],[.91,-.71,.72,.81,-.40,.64,.58,.78,.68,.35],[1.20,-.67,.58,1.02,-.48,.92,.77,.56,.97,.40],[1.32,.72,.48,.38,.58,1.21,-.67,.53,.39,-.49],[.86,1.01,.72,.58,.58,.99,-.84,.65,.67,-.57],[.25,.10,1.20,.42,.08,.25,-.10,1.20,.42,-.08]],
 bow:[[.18,0,1.32,.32,0,.30,0,1.17,.46,0],[.82,-.16,.73,.64,-.12,.95,.27,.53,.41,.06],[1.00,-.45,.60,1.23,-.14,1.12,.39,.38,.24,.08],[.96,-.53,.67,1.04,.08,1.11,.36,.39,.22,.05],[.60,-.34,.93,.52,.16,.92,.28,.66,.35,.04],[.19,-.02,1.30,.32,0,.32,.02,1.15,.46,0]],
 staff:[[.23,0,1.32,.44,0,.12,0,1.38,.25,0],[.89,-.50,.80,.83,-.28,.55,.37,.80,.64,.14],[1.38,-.28,.55,1.03,-.38,.89,.43,.62,.81,.24],[1.41,.48,.56,.34,.45,1.05,-.37,.64,.40,-.15],[.86,.68,.83,.60,.60,.64,-.44,.83,.49,-.20],[.27,.12,1.22,.44,.08,.18,0,1.31,.30,0]]
 };
 const variations321=[[1,.0,.0,.0],[ -1,.06,.07,.02],[1,-.24,-.10,.09],[-1,.31,-.10,.18],[1,.18,-.05,.24]];
 const times321=[0,.38,.76,1,1.45,2];
 const clips321={};for(const [weapon,base] of Object.entries(tracks321)){clips321[weapon]=variations321.map(([dir,lift,spread,flourish],form)=>base.map((frame,i)=>{const p=frame.slice(),active=i===0||i===5?0:i===1?.65:1,range=weapon==='bow'?.18:weapon==='great'?.65:1;
 for(const k of [0,5])p[k]=Math.max(0,Math.min(1.85,p[k]+lift*active*range*(k===5?.64:1)));
 for(const k of [1,6])p[k]=Math.max(-1.18,Math.min(1.18,p[k]*(weapon==='bow'?1:dir)+(form===2&&i===3?(k===1?.22:-.16)*range:0)));
 for(const k of [2,7])p[k]=Math.max(.30,Math.min(1.45,p[k]+spread*active*range));
 for(const k of [4,9])p[k]=Math.max(-.82,Math.min(.82,p[k]*(weapon==='bow'?1:dir)+(k===4?1:-1)*flourish*active*range*(i===4?1:.55)));
 if(weapon==='dual'&&form===1){for(let k=0;k<5;k++){const tmp=p[k];p[k]=p[k+5];p[k+5]=tmp;}p[1]*=-1;p[6]*=-1;}
 return p;}));}
 // V33.9: monotonic cubic interpolation preserves impact keys without stopping at every intermediate key.
 function smoothKey339(clip,k,n,u){
  const t0=times321[k],t1=times321[k+1],h=t1-t0,a=clip[k][n],b=clip[k+1][n],d=(b-a)/h;
  const slope=(left,right)=>left*right<=0?0:2*left*right/(left+right);
  const m0=k>0?slope((a-clip[k-1][n])/(t0-times321[k-1]),d):0;
  const m1=k+2<clip.length?slope(d,(clip[k+2][n]-b)/(times321[k+2]-t1)):0;
  const u2=u*u,u3=u2*u,v=(2*u3-3*u2+1)*a+(u3-2*u2+u)*h*m0+(-2*u3+3*u2)*b+(u3-u2)*h*m1;
  return Math.max(Math.min(a,b),Math.min(Math.max(a,b),v));
 }
 function blendRate339(dt,weapon,kind,p,impact,leg=false){
  const seconds=Math.max(0,Math.min(.10,Number.isFinite(dt)?dt:0)),t=Math.max(0,Math.min(1,Number.isFinite(p)?p:0)),hit=Math.max(.18,Math.min(.82,Number.isFinite(impact)?impact:.45));
  const action=!!kind,near=action?Math.max(0,1-Math.abs(t-hit)/.18):0;
  let tau=action?(weapon==='great'?.058:weapon==='dual'?.033:.043):.095;
  if(leg)tau*=1.15*(1-.18*near);else tau*=1-.52*near;
  if(['hurt','stagger','down'].includes(kind))tau=.030;
  return 1-Math.exp(-seconds/tau);
 }
 // Traveler V6: five separately authored arm tracks, in the existing normalized VRM convention.
 // right pitch/yaw/drop/elbow/wrist; left pitch/yaw/drop/elbow/wrist.
 const travelerReady=[.30,-.12,1.15,.56,-.08,.22,.13,1.27,.40,.08];
 const travelerTracks=[
 [travelerReady,[.66,-.49,.94,.78,-.25,.30,.23,1.10,.48,.10],[1.04,-.81,.62,1.08,-.42,.53,.36,.87,.65,.20],[1.22,.63,.54,.37,.36,.34,-.30,1.03,.56,-.10],[.80,.87,.78,.60,.43,.43,-.38,1.05,.52,-.12],travelerReady],
 [travelerReady,[.65,.56,.90,.77,.24,.42,-.32,1.05,.55,-.12],[1.00,.90,.67,1.04,.40,.56,-.45,.82,.69,-.20],[1.13,-.72,.57,.40,-.42,.39,.27,1.05,.56,.12],[.78,-.86,.76,.62,-.48,.31,.37,1.12,.46,.16],travelerReady],
 [travelerReady,[.51,-.24,1.03,.82,-.12,.39,.33,1.03,.54,.16],[.83,-.33,.74,1.10,-.17,.55,.46,.83,.71,.20],[1.43,.10,.53,.20,.10,.48,-.27,.95,.56,-.12],[.95,.14,.78,.52,.12,.35,-.21,1.07,.47,-.08],travelerReady],
 [travelerReady,[.95,-.25,.72,.83,-.12,.65,.26,.91,.65,.10],[1.73,-.35,.43,1.13,-.25,.92,.32,.68,.87,.17],[1.34,.21,.53,.35,.25,.46,-.35,.95,.57,-.12],[.69,.44,.84,.59,.34,.34,-.19,1.10,.46,-.08],travelerReady],
 [travelerReady,[.71,-.68,.83,.77,-.35,.42,.41,.95,.63,.12],[1.10,-1.04,.52,1.03,-.60,.66,.51,.74,.81,.21],[1.40,.95,.42,.30,.57,.77,-.57,.72,.65,-.24],[.89,1.01,.64,.56,.62,.49,-.43,.94,.54,-.16],travelerReady]
 ];
 function travelerArmPose(form,progress,impact,out=[]){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),h=Math.max(.18,Math.min(.82,Number.isFinite(impact)?impact:.45)),t=p<=h?p/h:1+(p-h)/(1-h),clip=travelerTracks[Math.max(0,Math.min(4,form|0))];
  let k=0;while(k<4&&t>times321[k+1])k++;
  const u=Math.max(0,Math.min(1,(t-times321[k])/(times321[k+1]-times321[k])));
  for(let n=0;n<10;n++)out[n]=u===0?clip[k][n]:u===1?clip[k+1][n]:smoothKey339(clip,k,n,u);
  return out;
 }
 function travelerBodyPose(id,combat,weapon,ready,b){
  if(id!=='m1'||weapon!=='sword'||(combat&&!['strike','spin','guard'].includes(combat.kind)))return b;
  const hold=Math.max(0,Math.min(1,ready||0)),p=Math.max(0,Math.min(1,Number.isFinite(combat?.progress)?combat.progress:0)),hit=Math.max(.18,Math.min(.82,Number.isFinite(combat?.impact)?combat.impact:.45)),env=combat?ease3526(p/.10)*ease3526((1-p)/.18):0;
  const form=combat?.kind==='spin'?4:Math.max(0,Math.min(4,combat?.combo|0)),dir=form%2?-1:1,load=p<hit?Math.sin(Math.PI*ease3526(p/hit))*env:0,release=p>=hit?Math.sin(Math.PI*ease3526((p-hit)/(1-hit)))*env:0,cut=(p<hit?ease3526((p-hit*.55)/(hit*.45)):1-ease3526((p-hit)/(1-hit)))*env;
  const w=Math.max(env,hold*.78),guard=combat?.kind==='guard',grounded=!combat?.airborne&&!combat?.air323;
  if(w<=0)return b;
  b.width=Math.min(.39,Math.max(b.width,.20+.075*w+(guard?.04:0)));
  if(grounded){
   const lead=guard?.13:[.18,.20,.30,.15,.22][form],transfer=dir*(cut*.85+release*.35-load*.40);
   b.leftHip=Math.max(-.63,Math.min(.40,b.leftHip+dir*lead*(cut-load*.40)*.34));
   b.rightHip=Math.max(-.63,Math.min(.40,b.rightHip-dir*lead*(cut-load*.40)*.34));
   b.leftKnee=Math.max(.16,Math.min(1.12,b.leftKnee+.08*w+.10*transfer));
   b.rightKnee=Math.max(.16,Math.min(1.12,b.rightKnee+.08*w-.10*transfer));
   b.leftFoot=-b.leftKnee*.54;b.rightFoot=-b.rightKnee*.54;
   b.drop=Math.max(-.13,b.drop-.016*w-.021*load);
   b.shift=Math.max(-.10,Math.min(.10,b.shift+dir*(.018*cut-.013*load)));
  }
  if(!guard){b.hipYaw+=dir*(-.065*load+.095*cut);b.chestYaw+=dir*(.06*cut+.08*release);b.spineYaw-=dir*.035*load;b.headYaw-=dir*.035*cut;}
  else{b.leftHip+=.07*w;b.rightHip-=.07*w;b.hipPitch+=.035*w;}
  return b;
 }
 function travelerStanceMin(id,weapon,weight){return id==='m1'&&weapon==='sword'?.115*Math.min(1,weight*2):.08*Math.min(1,weight*2);}
 function weaponKeyframe321(weapon,form,progress,impact,out=[]){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),p=clamp(Number.isFinite(progress)?progress:0,0,1),h=clamp(Number.isFinite(impact)?impact:.45,.18,.82),t=p<=h?p/h:1+(p-h)/(1-h),clip=(clips321[weapon]||clips321.sword)[clamp(form|0,0,4)];
  let k=0;while(k<4&&t>times321[k+1])k++;const u=clamp((t-times321[k])/(times321[k+1]-times321[k]),0,1),a=u*u*(3-2*u);
  for(let n=0;n<10;n++)out[n]=u===0?clip[k][n]:u===1?clip[k+1][n]:smoothKey339(clip,k,n,u);
  return out;
 }
 // Authored pose targets: stance width, lead stride, pelvis yaw, lean, knee loading, wrist arc.
 const forms320=[
 [.22,.33,.49,.19,.38,.36], // diagonal cut
 [.25,.31,-.56,.15,.33,.42], // reverse cut
 [.17,.47,.22,.25,.42,.18], // forward thrust
 [.28,.24,-.34,.12,.48,.48], // rising cut
 [.34,.42,.64,.29,.57,.56]  // sweeping finisher
 ];
 // V33.8: signature choreography shared by pose, camera and bounded visual pool.
 // [motif, direction, lift, twist, stance, flourish, spread, focus]
 const ultimate338=Object.freeze({
 m1:['orbit',1,.72,.58,.26,.65,2.4,.44],m2:['cleave',1,.36,.42,.68,.30,2.9,.62],m3:['vortex',-1,.66,1.12,.35,.88,2.1,.38],m4:['phoenix',1,.92,.67,.48,.92,2.8,.56],m5:['cross',-1,.42,1.03,.48,.64,1.8,.36],
 m6:['crescent',1,.55,.66,.42,.53,2.5,.50],m7:['volley',-1,.78,.30,.28,.35,3.1,.57],m8:['judgment',1,.64,.50,.74,.44,3.2,.72],m9:['vortex',1,.48,1.24,.54,.94,2.7,.48],m10:['tide',1,.40,.62,.39,.78,3,.42],
 f1:['crescent',-1,.82,.58,.22,.81,2.6,.43],f2:['prism',1,.92,.24,.28,.47,2.4,.56],f3:['bloom',1,.72,.40,.20,.84,2.5,.40],f4:['thunder',-1,.83,.52,.38,.61,2.7,.68],f5:['orbit',-1,.95,.44,.18,.76,2.1,.34],
 f6:['phoenix',-1,.76,.86,.46,.95,2.5,.51],f7:['volley',1,.63,.42,.25,.62,2.8,.45],f8:['prism',-1,.68,.37,.52,.38,3.2,.64],f9:['cross',1,.62,.93,.33,.87,2.9,.53],f10:['bloom',-1,.88,.36,.31,.72,3.3,.59]
 });
 function ultimateFrame338(id,p,impact,out={}){
  const d=ultimate338[id]||ultimate338.m1,c=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=c(x);return x*x*(3-2*x)};
  p=c(Number.isFinite(p)?p:0);impact=Math.max(.18,Math.min(.82,Number.isFinite(impact)?impact:.5));
  const pre=c(p/impact),post=c((p-impact)/(1-impact)),charge=ease(pre),release=ease(post),env=ease(p/.11)*ease((1-p)/.19);
  out.motif=d[0];out.dir=d[1];out.charge=charge;out.release=release;out.envelope=env;out.load=Math.sin(Math.PI*pre)*env;out.cut=(p<impact?ease((pre-.44)/.56):1-release)*env;out.follow=Math.sin(Math.PI*post)*env;out.lift=d[2]*charge*(1-release)*env;out.twist=d[1]*d[3]*(out.cut-.55*out.load+.30*out.follow);out.stance=d[4]*env;out.flourish=d[5]*out.follow;out.spread=d[6];out.focus=d[7]*env;return out;
 }
 function ultimatePath338(id,i,n,p,impact,yaw,out={}){
  const f=ultimateFrame338(id,p,impact,out),d=ultimate338[id]||ultimate338.m1,c=x=>Math.max(0,Math.min(1,x)),q=f.charge,r=f.release,angle=2*Math.PI*i/Math.max(1,n),a=angle+d[1]*(p*3.2+d[3]*q),s=d[6];let x=0,z=0,y=1,tilt=0,scale=1,alpha=(.18+.72*q)*(1-r),asset='blade';
  switch(d[0]){
   case 'orbit':{const rad=s*(.22+.35*q+.48*r);x=Math.cos(a)*rad;z=Math.sin(a)*rad;y=1.2+d[2]*Math.sin(a)*.5+q*.8;tilt=1.12;break;}
   case 'cleave':case 'judgment':{const rad=s*(.28+.52*q);x=Math.cos(angle)*rad;z=Math.sin(angle)*rad;y=Math.max(.22,1+q*(d[0]==='judgment'?5.1:3.8)-r*6);tilt=Math.PI;scale=1.2+d[4]*.45;break;}
   case 'vortex':{const rad=s*(.2+.48*q+.55*r);x=Math.cos(a+d[1]*r*3)*rad;z=Math.sin(a+d[1]*r*3)*rad;y=.65+(i%3)*.38+Math.sin(a)*.28;tilt=1.45;scale=.9;break;}
   case 'phoenix':{const rad=s*(.2+.38*q+.68*r);x=Math.sin(angle)*rad;z=Math.cos(angle)*rad*.7;y=.8+q*.85+Math.sin(Math.PI*r)*2.1+Math.abs(Math.sin(angle))*.5;asset='orb';scale=.7+q*.55;break;}
   case 'cross':{const lane=(i%2?1:-1),rad=s*(.30+.44*q+.32*r);x=lane*rad;z=(i/Math.max(1,n-1)-.5)*s*1.2;y=1.1+q*.5+(i%2)*.55;tilt=lane*1.1;break;}
   case 'crescent':{const arc=-1.35+2.7*i/Math.max(1,n-1)+d[1]*r*1.3,rad=s*(.32+.5*q+.4*r);x=Math.sin(arc)*rad;z=-Math.cos(arc)*rad;y=1.1+.65*Math.cos(arc)+q*.5;tilt=.9;break;}
   case 'volley':{const lane=(i/Math.max(1,n-1)-.5);x=lane*s*1.2;z=-s*(.25+.65*q+.4*r);y=Math.max(.3,1+q*3.6-r*4.5);asset='arrow';tilt=1.2;scale=1.25;break;}
   case 'tide':{const rad=s*(.18+.48*q+.62*r);x=Math.cos(a)*rad;z=Math.sin(a)*rad;y=.45+Math.sin(angle*2-r*4)*.28+q*.65;asset='orb';scale=1.15;break;}
   case 'prism':{const rad=s*(.25+.52*q+.2*r);x=Math.cos(angle)*rad;z=Math.sin(angle)*rad;y=.5+q*(1.6+(i%2)*.8)-r*.5;asset='ice';scale=.85+q*.65;break;}
   case 'bloom':{const rad=s*(.18+.45*q+.55*r)*(1+.13*Math.cos(angle*3));x=Math.cos(a)*rad;z=Math.sin(a)*rad;y=.5+q*.9+Math.sin(Math.PI*r)*1.2;asset='arrow';tilt=.75;scale=.9;break;}
   case 'thunder':{const rad=s*(.22+.48*q);x=Math.cos(a)*rad;z=Math.sin(a)*rad;y=Math.max(.3,.8+q*4.8-r*5.2);asset='ice';scale=.8;break;}
  }
  yaw=Number.isFinite(yaw)?yaw:0;out.x=x*Math.cos(yaw)+z*Math.sin(yaw);out.z=-x*Math.sin(yaw)+z*Math.cos(yaw);out.y=Math.max(.15,y);out.angle=a+yaw;out.tilt=tilt;out.scale=scale;out.alpha=c(alpha);out.asset=asset;return out;
 }
 function combatBody320(combat,ready=0,out={}){
  const clamp=(x,l=0,h=1)=>Math.max(l,Math.min(h,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const kind=combat?.kind||'ready',weapon=combat?.weapon||'sword',form=clamp((combat?.combo|0),0,4),r=forms320[form],p=clamp(Number(combat?.progress)||0),hit=clamp(Number(combat?.impact)||.45,.18,.82);
  const load=p<hit?smooth(p/(hit*.70))*(1-smooth((p-hit*.70)/(hit*.30))):0,cut=p<hit?smooth((p-hit*.48)/(hit*.52)):1-smooth((p-hit)/(1-hit)),follow=p>=hit?Math.sin(Math.PI*clamp((p-hit)/(1-hit))):0;
  if(['hurt','stagger','down','recover'].includes(kind)){out.ultimate338=null;const side=combat.side329||1,fall=kind==='down'?smooth(p):kind==='recover'?1-smooth(p):0,flinch=kind==='hurt'||kind==='stagger'?Math.sin(Math.PI*p)*(kind==='stagger'?1:.55):0,crouch=fall*.44+flinch*.25;return Object.assign(out,{weight:1,width:.19+flinch*.10,leftHip:-.12-crouch,rightHip:-.12-crouch*.65,leftKnee:.15+crouch*1.4,rightKnee:.15+crouch*.95,leftFoot:-.10-crouch*.5,rightFoot:-.10-crouch*.4,hipYaw:side*flinch*.16,hipRoll:side*flinch*.22,hipPitch:-flinch*.24+fall*.12,drop:-crouch*.15,shift:side*flinch*.04,spineYaw:side*flinch*.18,chestYaw:side*flinch*.12,shoulderYaw:0,headYaw:-side*flinch*.14,wrist:0,offhand:0,cut:0,load:0,follow:0});}const active=!!combat,w=active?smooth(p/.10)*smooth((1-p)/.17):0,hold=clamp(ready),stance=Math.max(w,hold*.78);
  const ranged=weapon==='bow'||weapon==='staff',heavy=weapon==='great',dual=weapon==='dual',dodge=kind==='dodge',cast=['fire','ice','storm','ultimate'].includes(kind),spin=kind==='spin';
  const style=danceProfiles320[combat?.profile334]||danceProfiles320.m1,dir=ranged?(weapon==='bow'?-1:1):form%2?-1:1,travel=dodge?.32:cast?.15:spin?.33:r[1]*(ranged?.53:heavy?.80:1)*style[0];
  const turn=(dodge?.1:cast?.25:spin?.70:Math.abs(r[2]))*(ranged?.55:1),twist=dir*(-turn*.65*load+turn*cut+.14*follow);
  const width=(.19+(active?(dodge?.17:cast?.11:r[0])*.58:0))*(heavy?1.14:1),lead=travel*(.30*load+.86*cut+.32*follow),bend=.15+(active?(dodge?.36:cast?.24:r[4])*(.62*load+.82*cut+.28*follow):0);
  const stride=kind==='guard'?.18:dir*lead,shift=dir*(-.035*load+.075*cut+.025*follow);
  out.weight=stance;out.width=width;out.leftHip=-.12+stride;out.rightHip=-.12-stride;out.leftKnee=bend+Math.max(0,-stride)*.54;out.rightKnee=bend+Math.max(0,stride)*.54;
  // A staggered weight transfer: bend the loaded leg and let the trailing heel release.
  if(active&&!dodge&&!cast){const transfer=clamp(cut+.34*follow,0,1),bias=dir*(transfer-load*.65);out.leftKnee=clamp(out.leftKnee+bias*.12,.12,1.18);out.rightKnee=clamp(out.rightKnee-bias*.12,.12,1.18);}
  out.leftFoot=-out.leftKnee*.57;out.rightFoot=-out.rightKnee*.57;out.hipYaw=twist;out.hipRoll=dir*(.09*cut-.06*load);out.hipPitch=.045+(dodge?.24:r[3])*(load*.5+cut*.62);
  out.drop=-.020-(bend-.15)*.12;out.shift=shift;out.spineYaw=-twist*.36;out.chestYaw=twist*.48;out.shoulderYaw=twist*.26;out.headYaw=-twist*.32;
  out.wrist=dir*r[5]*(cut-.40*load)*(.6+follow*.4);out.offhand=(dual?.24:ranged?.08:.30)*dir*(cut-load*.5);out.cut=cut;out.load=load;out.follow=follow;if(kind==='ultimate'){const f=ultimateFrame338(combat.profile334,p,hit,out.ultimate338??={});out.width+=f.stance*.12;out.hipYaw=f.twist*.56;out.spineYaw=-f.twist*.22;out.chestYaw=f.twist*.48;out.shoulderYaw=f.twist*.24;out.headYaw=-f.twist*.18;out.hipPitch=.04+f.stance*.20*f.load-f.lift*.14+f.cut*.13;out.drop=-.02-f.stance*.09*f.load;out.shift=f.dir*(f.cut-f.load)*.035;out.leftHip+=f.dir*f.stance*.12*f.cut;out.rightHip-=f.dir*f.stance*.12*f.cut;out.leftKnee+=f.stance*.20*f.load;out.rightKnee+=f.stance*.16*f.load;out.leftFoot=-out.leftKnee*.57;out.rightFoot=-out.rightKnee*.57;}else out.ultimate338=null;if(dodge){const d=dodgePose334(p,combat.dodgeForward328,combat.dodgeSide328,combat.roll334);out.leftHip=-.12-d.tuck*.70;out.rightHip=-.12-d.tuck*.52;out.leftKnee=.15+d.tuck*.98;out.rightKnee=.15+d.tuck*.85;out.leftFoot=-out.leftKnee*.48;out.rightFoot=-out.rightKnee*.48;out.hipPitch=d.lean;out.hipRoll=-(combat.dodgeSide328||0)*d.tuck*.16;out.drop=d.drop;out.shift=0;}return out;
 }
 // V34.1: kinetic chain with anticipatory pelvis, delayed shoulders and settling wrists.
 // reach, anticipation, follow-through, stance, breathing; each character has a distinct profile.
 const expression341=Object.freeze({
 m1:[.85,.76,.75,.72,.72],m2:[.68,.94,.52,.94,.54],m3:[1.04,.60,1.04,.68,.79],m4:[.92,.88,.87,.88,.63],m5:[.96,.52,.92,.62,.43],
 m6:[.78,.81,.72,.76,.52],m7:[.73,.72,.68,.62,.83],m8:[.70,1,.58,1,.58],m9:[1.06,.83,1.10,.86,.49],m10:[.82,.79,.88,.74,.81],
 f1:[.92,.63,.99,.54,.90],f2:[.80,.85,.84,.66,.73],f3:[.77,.56,.92,.51,1],f4:[.86,.76,.94,.63,.77],f5:[.88,.57,1.06,.49,.86],
 f6:[1.09,.73,1.09,.78,.84],f7:[.79,.62,.82,.56,.94],f8:[.73,.93,.68,.81,.59],f9:[1,.66,1.02,.65,.68],f10:[.83,.72,.95,.61,.89]
 });
 function kineticFrame341(id,combat,out={}){
  const d=expression341[id]||expression341.m1,clamp=(v,l=0,h=1)=>Math.max(l,Math.min(h,v)),finite=(v,f=0)=>Number.isFinite(v)?v:f,ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  const kind=combat?.kind,weapon=combat?.weapon||'sword',form=clamp(combat?.combo|0,0,4),p=clamp(finite(combat?.progress)),h=clamp(finite(combat?.impact,.45),.18,.82),dir=(form%2?-1:1)*(danceProfiles320[id]||danceProfiles320.m1)[1];
  const enabled=['strike','spin','ultimate','fire','ice','storm'].includes(kind),ranged=weapon==='bow'||weapon==='staff',heavy=weapon==='great',dual=weapon==='dual',env=enabled?ease(p/.09)*ease((1-p)/.19):0;
  const local=(offset)=>clamp((p+offset)/h),advance=local(.055),late=local(-.035),post=clamp((p-h)/(1-h));
  const load=Math.sin(Math.PI*advance)*env,release=(p<h?ease((advance-.46)/.54):1-ease(post))*env,shoulder=(p<h?ease((late-.42)/.58):1-ease(post))*env,follow=Math.sin(Math.PI*post)*env;
  const factor=heavy?.83:dual?1.08:ranged?.58:1,turn=dir*factor*d[0]*(-.18*load+.25*release+.12*follow);
  out.env=env;out.pelvis=turn;out.chest=turn*.62+dir*.07*shoulder;out.neck=-turn*.48;out.load=load;out.release=release;out.follow=follow;out.shift=dir*d[3]*(.016*release-.014*load);
  out.knee=clamp(d[3]*(.10*load+.075*release),0,.22);out.heel=clamp(d[4]*.12*follow,0,.16);out.shoulder=clamp(d[1]*(.10*load+.14*shoulder),0,.25);out.wrist=dir*d[2]*factor*.15*follow;out.offhand=d[2]*factor*.19*follow;out.dir=dir;out.ranged=ranged;return out;
 }
 // Keep a chained attack's recovery connected to the next wind-up, without changing hit timing.
 function comboEnvelope353(weapon,progress,chained=false,queued=false){
  const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0)),ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  const p=clamp(progress),wind=weapon==='great'?.115:weapon==='dual'?.065:.09,recovery=weapon==='great'?.20:weapon==='dual'?.12:.16;
  const entry=chained?.32+.68*ease(p/wind):ease(p/wind);
  const exit=queued? .32+.68*ease((1-p)/recovery):ease((1-p)/recovery);
  return entry*exit;
 }
 // V35.3.0: phase-driven secondary motion and bounded transitions between actual displayed poses.
 function ease3526(x){x=Math.max(0,Math.min(1,Number.isFinite(x)?x:0));return x*x*(3-2*x);}
 function flow3526(weapon,form,p,impact,id='m1',out={}){
  p=Math.max(0,Math.min(1,Number.isFinite(p)?p:0));const hit=Math.max(.18,Math.min(.82,Number.isFinite(impact)?impact:.45)),style=expression341[id]||expression341.m1,melee=['sword','great','dual'].includes(weapon),i=Math.max(0,Math.min(4,form|0)),dir=i%2?-1:1,heavy=weapon==='great',dual=weapon==='dual';
  const pre=p<hit?Math.sin(Math.PI*ease3526(p/hit)):0,post=p>hit?Math.sin(Math.PI*ease3526((p-hit)/(1-hit))):0,env=ease3526(p/.10)*ease3526((1-p)/.17),f=melee?env*(heavy?.65:dual?1.12:1):0;
  out.shoulder=f*style[0]*(.085*pre+.10*post);out.elbow=f*style[1]*(.065*pre-.055*post);out.wrist=f*style[2]*dir*(.06*pre+.16*post);out.offhand=f*(dual?.075:.16)*style[2]*post;out.torso=f*dir*(.06*pre+.11*post);out.head=-out.torso*.40;return out;
 }
 function transition3526(state,pose,dt,blocked=false){
  const eligible=!blocked&&pose&&['strike','spin','guard','fire','ice','storm','ultimate','dodge'].includes(pose.kind),key=eligible?(pose.kind+':'+(pose.sequence3526??pose.combo??0)+':'+pose.weapon):null;
  if(!eligible){state.key=null;state.age=0;return {capture:false,weight:0};}
  const capture=state.key!==key; if(capture){state.key=key;state.age=0;}
  state.age=(state.age||0)+Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
  const duration=pose.kind==='dodge'?.045:pose.weapon==='great'?.105:pose.weapon==='dual'?.065:.085;
  const p=Math.max(0,Math.min(1,Number.isFinite(pose.progress)?pose.progress:0)),hit=Math.max(.18,Math.min(.82,Number.isFinite(pose.impact)?pose.impact:.45));
  return {capture,weight:(1-ease3526(state.age/duration))*(1-ease3526(p/(hit*.65)))};
 }
 function sheathPath3526(amount,bladeLength,out={}){const a=Math.max(0,Math.min(1,Number.isFinite(amount)?amount:0)),len=Math.max(.1,Math.min(1.6,Number.isFinite(bladeLength)?bladeLength:1));out.hand=ease3526(a);out.axial=Math.sin(Math.PI*a)*len*.30;out.reach=Math.sin(Math.PI*a)*.85;return out;}
 function readyWeight359(armed,moving,ready){return armed&&Number.isFinite(moving)&&moving<.25?Math.max(0,Math.min(1,Number.isFinite(ready)?ready:0)):0;}
 function idleStance352(weight,id,t){const w=Math.max(0,Math.min(1,Number.isFinite(weight)?weight:0)),d=expression341[id]||expression341.m1,phase=Number.isFinite(t)?t:0;return {spread:.055*w,toe:.035*w,lead:.018*w*Math.sin(phase*.72+d[3])};}
 function idleCombat341(id,weapon,t,weight,out={}){
  const d=expression341[id]||expression341.m1,t0=Number.isFinite(t)?t:0,w=Math.max(0,Math.min(1,Number.isFinite(weight)?weight:0)),seed=id?.charCodeAt?.(0)||109,phase=t0*.9+seed*.19+(parseInt(id?.slice(1),10)||1)*.71;
  const breath=Math.sin(t0*2.15+phase*.17)*d[4]*w,shift=Math.sin(phase)*d[3]*w,heavy=weapon==='great',ranged=weapon==='bow'||weapon==='staff';
  out.breath=breath*.028;out.shift=shift*.014;out.roll=shift*.025;out.width=(heavy?.28:ranged?.20:.23)*w;out.knee=(heavy?.22:.17)*w;out.lead=shift*.035;return out;
 }
 function animate(a,dt,gait,mode='idle',jump=0,detail=0,ground=null){
  const {vrm}=a;if(a.idleOffset1170){a.root.position.x-=a.idleOffset1170.x;a.root.position.z-=a.idleOffset1170.z;a.idleOffset1170=null}dt=Number.isFinite(dt)?Math.min(.35,Math.max(0,dt)):0;a.elapsed=(a.elapsed||0)+dt;a.motion??=WWMotion.newState();let j=jump&&typeof jump==='object'?jump:{height:Number.isFinite(jump)?jump:0,velocity:0},v=WWMotion.step(a.motion,dt,gait,j,mode,a.motionProfile),t=a.elapsed;
  a.weight=a.motion.walk+a.motion.run;const settle=mode==='idle'&&!WWMotion.phaseOf(j)?Math.max(0,1-(a.weight+a.motion.jump)*5):0;
  if(settle>0){v={...v};const blend=(x,y)=>x+(y-x)*settle;v.hipSide=blend(v.hipSide,v.hipSide*.22);v.hipYaw=blend(v.hipYaw,v.hipYaw*.35);v.hipRoll=blend(v.hipRoll,v.hipRoll*.30);v.hipX=blend(v.hipX,.012);v.hipY=blend(v.hipY,-.022);for(const side of ['L','R']){v['hip'+side]=blend(v['hip'+side],-.11);v['knee'+side]=blend(v['knee'+side],.22);v['ankle'+side]=blend(v['ankle'+side],-.11)}}
  function bone(name,x=0,y=0,z=0){let b=vrm.humanoid.getNormalizedBoneNode(name);if(b)b.rotation.set(x,y,z)}
  const left=a.armDown?.left??1,right=a.armDown?.right??-1,sign=a.legSign||1;
  const hips=vrm.humanoid.getNormalizedBoneNode('hips');if(hips&&a.hipsRest){hips.position.copy(a.hipsRest);hips.position.y+=v.hipY;hips.position.x+=v.hipSide||0}
  bone('hips',sign*v.hipX,v.hipYaw,v.hipRoll);bone('spine',sign*v.spineX,v.spineYaw,v.spineRoll);bone('chest',sign*v.spineX*.3,-v.shoulderY,v.spineRoll*.3);
  bone('leftShoulder',0,v.shoulderY,0);bone('rightShoulder',0,-v.shoulderY,0);
  bone('leftUpperArm',sign*v.armL,0,left*(Math.PI/2-v.spread));bone('rightUpperArm',sign*v.armR,0,right*(Math.PI/2-v.spread));
  bone('leftLowerArm',-sign*v.elbowL,0,0);bone('rightLowerArm',-sign*v.elbowR,0,0);
  // Relax the standing silhouette slightly; locomotion and action overlays retain their authored targets.
  const relaxed352=idleStance352(settle,a.motionProfile,t),legL3523=vrm.humanoid.getNormalizedBoneNode('leftUpperLeg'),legR3523=vrm.humanoid.getNormalizedBoneNode('rightUpperLeg'),legDir3523=Math.sign(stanceSpread3523(legL3523?.position.x,legR3523?.position.x,.2));
  bone('leftUpperLeg',sign*(v.hipL+relaxed352.lead),relaxed352.toe,legDir3523*relaxed352.spread);bone('rightUpperLeg',sign*(v.hipR-relaxed352.lead),-relaxed352.toe,-legDir3523*relaxed352.spread);
  bone('leftLowerLeg',sign*v.kneeL);bone('rightLowerLeg',sign*v.kneeR);bone('leftFoot',sign*v.ankleL);bone('rightFoot',sign*v.ankleR);
  // Distribute head motion over neck and head; counter the chest without snapping.
  const neck=vrm.humanoid.getNormalizedBoneNode('neck');
  if(neck){bone('neck',sign*v.headX*.35,v.headY*.30,v.headZ*.35);bone('head',sign*v.headX*.65,v.headY*.70,v.headZ*.65)}else bone('head',sign*v.headX,v.headY,v.headZ);
  bone('upperChest',sign*v.spineX*.09,-v.shoulderY*.30,v.spineRoll*.18);
  // Locomotion stays on the established arm solver. Blend action targets over its output.
  WWArms.apply(a,v,dt);
  // Mild wrist follow-through; riding wrist orientation is still solved by the rein IK.
  a.wrist251??={left:{x:0,y:0,z:0},right:{x:0,y:0,z:0}};
  for(const side of ['left','right']){const hand=vrm.humanoid.getNormalizedBoneNode(side+'Hand');if(hand){const jolt=a.motion.jump||0,sg=side==='left'?1:-1,sm=a.wrist251[side],swing=side==='left'?v.armL:v.armR,walk=Math.min(1,a.weight),k=1-Math.exp(-dt/.075);
   const x=mode==='ride'?0:Math.max(-.13,Math.min(.13,-swing*.13-.09*jolt*Math.max(0,Math.min(1,(j.velocity||0)/4)))),y=mode==='ride'?0:sg*(.035+.035*walk),z=mode==='ride'?0:sg*(Math.sin(t*1.8)*.035*(1-walk)+.06*jolt+.025*walk);
   sm.x+=(x-sm.x)*k;sm.y+=(y-sm.y)*k;sm.z+=(z-sm.z)*k;hand.rotation.set(sm.x,sm.y,sm.z);
  }}
  a.action132??={};const weights=WWMotion.actionBlend132(a.action132,WWMotion.phaseOf(j)?'idle':mode,dt);const socialBlocked256=mode==='ride'||(!!WWMotion.phaseOf(j)&&!(j.combat291?.kind==='strike'&&j.combat291?.airborne));
  function overlay(name,x,y,z,w){if(!w||!Number.isFinite(w))return;w=Math.max(0,Math.min(1,w));const b=vrm.humanoid.getNormalizedBoneNode(name);if(b){b.rotation.x+=(x-b.rotation.x)*w;b.rotation.y+=(y-b.rotation.y)*w;b.rotation.z+=(z-b.rotation.z)*w}}
  const sitting=WWMotion.phaseOf(j)?0:(weights.sit||0)+(weights.ride||0),dancing=(weights.dance||0)+(weights.duet||0);
  if(sitting){for(const side of ['left','right']){overlay(side+'UpperLeg',-sign*1.1,0,0,sitting);overlay(side+'LowerLeg',sign*1.2,0,0,sitting);overlay(side+'UpperArm',-.35,0,(side==='left'?left:right)*1.25,sitting)}}
  // V14.9: independent pelvis, lumbar, chest and head response. Keep contact targets in the mount solver.
  if(j.mountHorse&&mode==='ride'){
   const phase=Number(j.mountPhase)||0,state=j.mountState||'ride_idle',blend=Math.max(0,Math.min(1,j.mountBlend??1)),gait=Math.max(0,Math.min(1,Number(j.mountGait)||0));
   // forward lean, pelvic pitch/roll, lumbar response, chest response, thigh/knee/elbow targets
   const poses={ride_idle:[.025,.025,.012,.025,.015,.66,.86,.72],ride_walk:[.055,.11,.055,.085,.06,.69,.89,.76],ride_trot:[.12,.19,.075,.14,.10,.76,.96,.79],ride_gallop:[.29,.24,.095,.19,.13,.88,1.04,.88],mount_start:[.20,.04,.03,.06,.03,.75,.94,.76],dismount:[.18,.04,.03,.06,.03,.72,.91,.74]};
   const target=poses[state]||poses.ride_idle,sm=a.mountMotion149??={pose:target.slice(),pitch:0,roll:0,breath:0};const alpha=1-Math.exp(-dt*7);
   sm.pose=sm.pose.map((x,i)=>x+(target[i]-x)*alpha);const m=sm.pose;
   const p=Math.sin(phase),p2=Math.sin(phase*2-.35),turn=Math.max(-1,Math.min(1,Number(j.mountTurn??j.turn)||0)),brake=Math.max(0,Math.min(1,Number(j.mountBrake)||0));
   const pelvisPitch=p*m[1]*gait,pelvisRoll=Math.cos(phase)*m[2]*gait;
   sm.pitch+=(pelvisPitch-sm.pitch)*(1-Math.exp(-dt*13));sm.roll+=(pelvisRoll-sm.roll)*(1-Math.exp(-dt*11));
   const idle=Math.max(0,Math.min(1,Number(j.mountIdle)||0)),scan=(Math.sin(t*.47)*.075+Math.sin(t*.19)*.055)*idle,settle=Math.sin(t*.85)*.018*idle;const breath=Math.sin(t*1.75)*(.016+.018*idle)*(1-gait*.6),lumbar=-sm.pitch*.62+Math.sin(phase-.55)*m[3]*gait,chest=-lumbar*.45+Math.sin(phase*2-.8)*m[4]*gait*.45;
   overlay('hips',sign*(sm.pitch-.025)*blend,Math.sin(phase)*.045*gait,(sm.roll+settle*.4)*blend,1);
   overlay('spine',sign*(m[0]*blend+lumbar+breath-brake*.19),-turn*.12+scan*.20,-sm.roll*.7+turn*.12+settle,1);
   overlay('chest',sign*(chest+breath*.8-brake*.055),turn*.08+scan*.26,-sm.roll*.25+settle*.5,1);
   overlay('upperChest',-sign*chest*.35,0,sm.roll*.12,1);
   overlay('neck',-sign*(lumbar+chest)*.32,turn*.045+scan*.40,sm.roll*.1+settle*.35,1);
   overlay('head',-sign*(lumbar+chest)*.42,turn*.08+scan,sm.roll*.25+settle*.6,1);
   for(const side of ['left','right']){const lateral=side==='left'?1:-1,down=side==='left'?left:right,shift=Math.sin(phase+lateral*.4)*gait+Math.sin(t*1.13+lateral*.5)*.09*idle;
    overlay(side+'UpperLeg',-sign*(m[5]+.045*shift)*blend,0,lateral*.65*blend,1);
    overlay(side+'LowerLeg',sign*(m[6]+.065*p2*gait)*blend,0,0,1);
    overlay(side+'UpperArm',-sign*(.50+m[0]*.75+.065*shift)*blend,0,down*(1.30+.045*shift)*blend,1);
    overlay(side+'LowerArm',-sign*(m[7]+.12*p2*gait+breath)*blend,0,0,1);
    overlay(side+'Hand',sign*(.035*shift-brake*.10),turn*.06,lateral*.035*shift,1);
    overlay(side+'Foot',-sign*(.08+.065*p2*gait),0,0,1)
   }
   if(state==='mount_start'||state==='dismount'){overlay('rightUpperLeg',-sign*(.5+Math.sin(Math.PI*blend)*.85),0,-Math.sin(Math.PI*blend)*.8,1);overlay('spine',sign*(.15+.28*Math.sin(Math.PI*blend)),0,.12*Math.sin(Math.PI*blend),1)}
  }else a.mountMotion149=null;
  if(!socialBlocked256){const clocks=a.action132.clocks255||{},danceTime=(weights.duet||0)>(weights.dance||0)?(clocks.duet||0):(clocks.dance||0),waveTime=clocks.wave||0;
  if(dancing){overlay('leftUpperArm',Math.sin(danceTime*4)*.4,0,left*.85,dancing);overlay('rightUpperArm',-Math.sin(danceTime*4)*.4,0,right*.85,dancing);overlay('spine',0,Math.sin(danceTime*2)*.15,Math.sin(danceTime*4)*.09,dancing)}
  overlay('rightUpperArm',-.25,0,-right*.25,weights.wave);overlay('rightLowerArm',-.8,0,Math.sin(waveTime*5)*.35,weights.wave);
  overlay('spine',sign*.27,0,0,weights.bow);overlay('head',sign*.12,0,0,weights.bow);
  for(const side of ['left','right']){const down=side==='left'?left:right;
   overlay(side+'UpperArm',-sign*.85,0,down*.45,weights.cheer);overlay(side+'LowerArm',-sign*.65,0,0,weights.cheer);
   overlay(side+'UpperArm',-sign*.70,0,down*1.12,weights.hug);overlay(side+'LowerArm',-sign*.48,0,0,weights.hug);
  }
  overlay('rightUpperArm',-sign*.22,0,right*1.05,weights.hand);
  overlay('rightLowerArm',-sign*.35,0,0,weights.hand);
  overlay('head',-.04,0,.075,(weights.photo||0)+(weights.portrait||0));}
  // V29.1: combat overlay on the actual skinned avatar, before humanoid/IK update.
  const combat=j.combat291;
  // V30.7: blend locomotion and combat through a persistent pose filter.
  const names308=['hips','spine','chest','upperChest','neck','head','leftShoulder','rightShoulder','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftHand','rightHand','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot'];
  const filter308=a.combatFilter308??={bones:names308.map(name=>{const node=vrm.humanoid.getNormalizedBoneNode(name);return {node,leg:/Leg|Foot/.test(name),q:node?node.quaternion.clone():new a.T.Quaternion()}}),weight:0};
  const armed308=!!j.weapon307&&(j.draw3523?.amount??1)>.65&&!socialBlocked256&&['idle','walk','run'].includes(mode);
  if(armed308&&!combat){const bow=j.weapon307==='bow',dual=j.weapon307==='dual',great=j.weapon307==='great',hold=.30+.20*(1-Math.min(1,a.weight));overlay('rightLowerArm',-sign*.24,0,0,bow?0:hold);overlay('rightUpperArm',sign*.06,0,right*1.43,bow?0:hold);if(bow||dual||great){overlay('leftLowerArm',-sign*(great?.48:.28),0,0,hold);overlay('leftUpperArm',sign*.04,0,left*1.42,hold)}}
  if(combat&&!socialBlocked256){
   const p=Math.max(0,Math.min(1,combat.progress)),smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},impact=Math.max(.18,Math.min(.82,combat.impact??.45)),w=smooth(p/.13)*smooth((1-p)/.24),sweep=p<impact?smooth((p-impact*.40)/(impact*.60)):1-smooth((p-impact)/(1-impact)),wind=Math.sin(Math.PI*Math.min(1,p/impact)),cast=combat.kind==='fire'||combat.kind==='ice'||combat.kind==='storm';
   if(['hurt','stagger','down','recover'].includes(combat.kind)){const side=combat.side329||1,fall=combat.kind==='down'?smooth(p):combat.kind==='recover'?1-smooth(p):0,flinch=['hurt','stagger'].includes(combat.kind)?Math.sin(Math.PI*p)*(combat.kind==='stagger'?1:.55):0,amount=Math.max(fall,flinch);overlay('rightUpperArm',-sign*(.16+amount*.64),side*.20*flinch,right*(1.35-amount*.50),amount);overlay('leftUpperArm',-sign*(.22+amount*.72),side*.20*flinch,left*(1.35-amount*.55),amount);overlay('rightLowerArm',-sign*(.28+amount*.62),0,0,amount);overlay('leftLowerArm',-sign*(.28+amount*.84),0,0,amount);overlay('head',sign*.20*amount,-side*.12*amount,side*.12*amount,amount);}else if(combat.kind==='strike'||combat.kind==='spin'){
    const form=combat.kind==='spin'?4:combat.combo|0,weapon=combat.weapon||'sword',k=travelerSwordEnabled(a.motionProfile,weapon)?travelerArmPose(form,p,impact,a.keyPose321??=[]):weaponKeyframe321(weapon,form,p,impact,a.keyPose321??=[]),weight=comboEnvelope353(weapon,p,combat.chain334,combat.queued334);
    overlay('rightUpperArm',-sign*k[0],k[1],right*k[2],weight);overlay('rightLowerArm',-sign*k[3],0,0,weight);overlay('rightHand',0,0,k[4],weight);
    overlay('leftUpperArm',-sign*k[5],k[6],left*k[7],weight);overlay('leftLowerArm',-sign*k[8],0,0,weight);overlay('leftHand',0,0,k[9],weight);
    const turn=(form%2?-1:1)*(.16*wind+.28*sweep);overlay('spine',sign*(.07*wind+.10*sweep),turn,turn*.15,weight*.65);overlay('chest',sign*.08*sweep,turn*.60,0,weight*.65);
    const flow=flow3526(weapon,form,p,impact,a.motionProfile,a.flow3526??={});const add=(name,x,y,z)=>{const node=vrm.humanoid.getNormalizedBoneNode(name);if(node){node.rotation.x+=x;node.rotation.y+=y;node.rotation.z+=z;}};add('rightShoulder',-sign*flow.shoulder,0,right*flow.shoulder*.25);add('rightLowerArm',-sign*flow.elbow,0,0);add('rightHand',0,flow.wrist*.30,flow.wrist);add('leftShoulder',-sign*flow.offhand*.35,0,left*flow.offhand*.30);add('leftLowerArm',-sign*flow.offhand*.50,0,0);add('chest',0,flow.torso,0);add('neck',0,flow.head,0);
   }else if(combat.kind==='ultimate'){
    const rise=p<impact?smooth(p/impact):1-smooth((p-impact)/.25),release=p<impact?0:Math.sin(Math.PI*Math.min(1,(p-impact)/(1-impact))),bow=combat.weapon==='bow',staff=combat.weapon==='staff',dual=combat.weapon==='dual',great=combat.weapon==='great';
    overlay('rightShoulder',-sign*.15*rise,0,0,w);overlay('leftShoulder',-sign*.12*rise,0,0,w);
    if(bow){overlay('leftUpperArm',-sign*(.7+.5*rise),.25*rise,left*.65,w);overlay('rightUpperArm',-sign*.8,-.35*rise,right*.65,w);overlay('rightLowerArm',-sign*(.55+.8*rise),0,0,w);overlay('leftLowerArm',-sign*.35,0,0,w);overlay('chest',0,.28*rise,0,w);}
    else if(staff){overlay('rightUpperArm',-sign*(.9+.65*rise),0,right*.8,w);overlay('leftUpperArm',-sign*(.45+.35*release),0,left*.9,w);overlay('rightLowerArm',-sign*.65,0,0,w);}
    else if(dual){overlay('rightUpperArm',-sign*(.5+.7*release),.45*release,right*(.85-.25*rise),w);overlay('leftUpperArm',-sign*(.5+.7*release),-.45*release,left*(.85-.25*rise),w);overlay('rightLowerArm',-sign*.65,0,0,w);overlay('leftLowerArm',-sign*.65,0,0,w);}
    else {
    overlay('rightUpperArm',-sign*(.65+rise*.90+release*.48),-.30*release,right*(.65-.32*rise),w);
    overlay('rightLowerArm',-sign*(.45+rise*.55),0,0,w);
    overlay('leftUpperArm',-sign*(.45+rise*.72),.25*release,left*(.85-.25*rise),w);
    overlay('leftLowerArm',-sign*(.55+rise*.40),0,0,w);
    overlay('spine',sign*(-.12*rise+.24*release),.28*release,0,w);overlay('chest',sign*.10*release,.18*release,0,w);overlay('head',-sign*.14*rise,0,0,w);if(great)overlay('chest',sign*.12*release,.16*rise,0,w);}
    const u=ultimateFrame338(a.motionProfile,p,impact,a.ultimateFrame338??={});const add=(name,x,y,z)=>{const n=vrm.humanoid.getNormalizedBoneNode(name);if(n){n.rotation.x+=x*u.envelope;n.rotation.y+=y*u.envelope;n.rotation.z+=z*u.envelope;}};
    add('rightUpperArm',-sign*(u.lift*.40-u.cut*.24),u.twist*.22,u.dir*u.flourish*.18);add('leftUpperArm',-sign*u.lift*.22,-u.twist*.20,-u.dir*u.flourish*.18);add('rightLowerArm',-sign*u.load*.18,0,0);add('chest',sign*(u.cut*.13-u.lift*.10),u.twist*.25,0);add('head',-sign*u.lift*.10,-u.twist*.10,0);
   }else if(cast){
    overlay('rightUpperArm',-sign*(.85+sweep*.48),-right*.12,right*.72,w);overlay('rightLowerArm',-sign*(.45+wind*.65),0,0,w);
    overlay('leftUpperArm',-sign*.72,0,left*.85,w);overlay('leftLowerArm',-sign*.55,0,0,w);
    overlay('spine',sign*(-.08+sweep*.17),.16*sweep,0,w);
   }else if(combat.kind==='guard'){const g322=smooth(p/.10)*smooth((1-p)/.12);overlay('rightUpperArm',-sign*.85,.30,right*.82,g322);overlay('rightLowerArm',-sign*1.20,0,-.16,g322);overlay('leftUpperArm',-sign*.65,-.22,left*.88,g322);overlay('leftLowerArm',-sign*1.02,0,.12,g322);overlay('rightHand',.10,0,.36,g322);overlay('spine',sign*.15,.10,0,g322);
   }else if(combat.kind==='dodge'){
    overlay('spine',-sign*.24*sweep,0,0,w);overlay('rightUpperArm',sign*.30,0,right*1.15,w);overlay('leftUpperArm',-sign*.35,0,left*1.1,w);
   }else{
    const i=combat.kind==='spin'?4:Math.max(0,Math.min(4,combat.combo|0)),poses=[[.65,.55,.75,.92,.48,.42,.58,.30],[.72,.62,.82,.90,.43,.44,.62,.34],[.42,.84,.36,1.02,.38,.62,.43,.18],[.93,.38,.25,.80,.28,.50,.65,.24],[.90,.60,.95,.87,.50,.55,.72,.45]],v=poses[i];
    const swing=(p<impact*.55?-smooth(p/(impact*.55)):2*smooth((p-impact*.55)/(impact*.45))-1)*(i%2?-1:1);
    overlay('rightUpperArm',-sign*(v[0]+v[1]*sweep),swing*v[2],right*(v[3]-v[4]*sweep),w);
    overlay('rightLowerArm',-sign*(v[5]+v[6]*wind),0,0,w);
    overlay('leftUpperArm',-sign*(i===4?.65:.30),0,left*(i===4?.78:1.04),w);overlay('leftLowerArm',-sign*.40,0,0,w);
    overlay('spine',sign*(i===3?.22:.12)*sweep,-swing*v[7],.055*swing,w);overlay('chest',sign*.08*sweep,-swing*v[7]*.8,0,w);
   }
  }
  // V31.9: full-body choreography with asymmetric stance and continuous follow-through.
  const ready320=readyWeight359(!socialBlocked256&&armed308,a.weight,j.ready320),body320=combatBody320(!socialBlocked256?combat:null,ready320,a.body320??={}),bw320=body320.weight; if(!socialBlocked256)travelerBodyPose(a.motionProfile,combat,combat?.weapon||j.weapon307,ready320,body320);
  if(bw320>.001){
   const b=body320,w=bw320,dir=(combat?.combo|0)%2?-1:1,step=actionFootwork320(combat,combat?.progress,a.motionProfile,a.dance320??={});
   if(hips){hips.position.y+=b.drop*w;hips.position.x+=b.shift*w;}
   overlay('hips',sign*b.hipPitch,b.hipYaw,b.hipRoll,w);
   const airborneSlash=combat?.kind==='strike'&&(combat.airborne||step.hop>.025);const airStage=combat?.air323||0,airArc=Math.sin(Math.PI*Math.max(0,Math.min(1,combat?.progress||0)));const tuck=airborneSlash?Math.min(.62,(step.hop+(j.height||0))*.58+(airStage===2?.24:airStage===1?.15:0)*airArc):0;overlay('leftUpperLeg',sign*(b.leftHip-tuck),.10*w,legDir3523*(b.width+.045),w);
   overlay('rightUpperLeg',sign*(b.rightHip-tuck*.45),-.10*w,-legDir3523*(b.width+.045),w);
   overlay('leftLowerLeg',sign*Math.min(1.25,b.leftKnee+tuck*.65),0,0,w);overlay('rightLowerLeg',sign*Math.min(1.25,b.rightKnee+tuck*.8),0,0,w);
   overlay('leftFoot',sign*b.leftFoot,-.08,-legDir3523*b.width*.65,w);overlay('rightFoot',sign*b.rightFoot,.08,legDir3523*b.width*.65,w);
   const additive=(name,x,y,z)=>{const n=vrm.humanoid.getNormalizedBoneNode(name);if(n){n.rotation.x+=x*w;n.rotation.y+=y*w;n.rotation.z+=z*w}};
   additive('spine',sign*b.hipPitch*.35,b.spineYaw,-b.hipRoll*.45);additive('chest',sign*b.cut*.10,b.chestYaw,-b.hipRoll*.28);additive('upperChest',0,b.shoulderYaw,0);
   additive('leftShoulder',-sign*b.load*.10,b.offhand*.42,0);additive('rightShoulder',-sign*b.cut*.12,b.shoulderYaw*.55,0);
   additive('neck',-sign*b.hipPitch*.28,b.headYaw,0);additive('head',0,b.headYaw*.35,0);
   if(combat){const sword=['sword','dual','great'].includes(combat.weapon),contact=combat.contact?b.cut*.10:0;additive('rightHand',-b.load*.12+b.cut*.17,0,sword?b.wrist*.46:0);additive('leftHand',b.follow*.10,0,-b.wrist*.20);
    if(combat.kind==='strike'&&combat.weapon==='sword'){additive('leftUpperArm',-sign*(.16*b.load+.28*b.follow),b.offhand,left*-.16*b.cut);additive('leftLowerArm',-sign*.24*b.follow,0,0);}if(step.melee&&(combat.kind==='strike'||combat.kind==='spin')){additive('rightUpperArm',-sign*.07*step.gesture,dir*.08*step.gesture,0);additive('rightLowerArm',-sign*.05*b.load,0,0);additive('rightHand',sign*.06*step.gesture,0,dir*.07*b.follow);}if(combat.kind==='dodge'){const d=dodgePose334(combat.progress,combat.dodgeForward328,combat.dodgeSide328,combat.roll334,a.dodge334??={});overlay('leftUpperArm',-sign*(.45+.50*d.tuck),.22,left*.85,w);overlay('leftLowerArm',-sign*(.65+.48*d.tuck),0,0,w);overlay('rightUpperArm',-sign*(.40+.40*d.tuck),-.18,right*.80,w);overlay('rightLowerArm',-sign*(.60+.45*d.tuck),0,0,w);}
    if(combat.kind==='dodge'){const d=a.dodge334,side=combat.dodgeSide328||0;additive('spine',sign*.20*d.tuck,0,-side*.12*d.tuck);additive('neck',sign*.18*d.tuck,0,0);}if(airStage){additive('spine',sign*(airStage===3?.32:-.12)*airArc,dir*.18*airArc,0);additive('chest',sign*(airStage===3?.18:-.08)*airArc,dir*.24*airArc,0);additive('rightUpperArm',-sign*(airStage===3?.36:.12)*airArc,0,0);additive('leftUpperArm',-sign*.16*airArc,0,left*.13*airArc);}if(contact){additive('rightLowerArm',-sign*contact,0,0);additive('rightShoulder',sign*contact*.45,0,0);}
   }
  }
  // Layer before quaternion damping and IK: never modify world-space root movement.
  if(!socialBlocked256&&detail===0){
   const k=kineticFrame341(a.motionProfile,combat,a.kinetic341??={});
   const add341=(name,x,y,z)=>{const n=vrm.humanoid.getNormalizedBoneNode(name);if(n){n.rotation.x+=x;n.rotation.y+=y;n.rotation.z+=z;}};
   if(k.env>.001){
    if(hips)hips.position.x+=k.shift;
    add341('hips',sign*k.load*.045,k.pelvis,k.shift*.8);add341('spine',sign*(k.release*.04-k.load*.055),-k.pelvis*.32,0);add341('chest',sign*k.release*.035,k.chest,0);add341('upperChest',0,k.chest*.22,0);add341('neck',-sign*k.release*.035,k.neck,0);
    if(!combat.airborne&&!combat.air323&&combat.kind!=='ultimate'){const lead=k.dir>0?'left':'right',trail=lead==='left'?'right':'left';add341(lead+'LowerLeg',sign*k.knee,0,0);add341(trail+'Foot',-sign*k.heel,0,0);}
    add341('rightShoulder',-sign*k.shoulder,0,right*k.shoulder*.20);add341('leftShoulder',-sign*k.shoulder*.65,0,left*k.shoulder*.20);
    if(!k.ranged){add341('rightHand',0,0,k.wrist);if(combat.weapon==='dual')add341('leftHand',0,0,-k.wrist*.85);else if(combat.weapon==='sword'){add341('leftUpperArm',-sign*k.offhand,0,left*-.12*k.follow);add341('leftLowerArm',-sign*k.offhand*.7,0,0);}}
   }else if(!combat&&armed308&&mode==='idle'){
    const f=idleCombat341(a.motionProfile,j.weapon307,t,Math.max(0,1-a.weight*4),a.idleCombat341??={});
    if(hips)hips.position.x+=f.shift;add341('spine',sign*f.breath,0,f.roll);add341('chest',sign*f.breath*.65,0,-f.roll*.5);add341('neck',-sign*f.breath*.4,0,0);add341('leftUpperLeg',sign*f.lead,0,legDir3523*f.width*.18);add341('rightUpperLeg',-sign*f.lead,0,-legDir3523*f.width*.18);
   }
  }
  // Damp bone rotations on entry, release and recovery, rather than snapping to each procedural pose.
  if(!socialBlocked256&&['drawing','stowing'].includes(j.draw3523?.phase)){const t=j.draw3523.amount,weight=Math.sin(Math.PI*t)*.72;overlay('rightUpperArm',-sign*(.30+.55*t),-.35*(1-t),right*(1.20-.42*t),weight);overlay('rightLowerArm',-sign*(.70+.25*t),0,0,weight);if(j.weapon307==='dual'){overlay('leftUpperArm',-sign*(.30+.55*t),.35*(1-t),left*(1.20-.42*t),weight);overlay('leftLowerArm',-sign*(.70+.25*t),0,0,weight)}}
  const support3525=typeof WWFootIK.supportPhase3525==='function'?WWFootIK.supportPhase3525(combat,ready320,a.support3525??={}):null;
  if(!socialBlocked256&&support3525?.active&&bw320>.05){const q=support3525,w=bw320,bias=q.bias*w;if(hips){hips.position.x+=legDir3523*bias*.025;hips.position.y-=Math.abs(bias)*.012;}const add=(name,x,y,z)=>{const n=vrm.humanoid.getNormalizedBoneNode(name);if(n){n.rotation.x+=x;n.rotation.y+=y;n.rotation.z+=z;}};add('leftLowerLeg',sign*bias*.10,0,0);add('rightLowerLeg',-sign*bias*.10,0,0);add('leftFoot',-sign*bias*.055,0,0);add('rightFoot',sign*bias*.055,0,0);add('spine',sign*q.load*w*-.025,0,-bias*.025);add('chest',sign*q.transfer*w*.035,0,bias*.018);}
  const engaged308=(!!combat||bw320>.005||['drawing','stowing'].includes(j.draw3523?.phase))&&!socialBlocked256,blend308=1-Math.exp(-Math.min(dt,.08)/(engaged308?(combat?.weapon==='great'?.060:combat?.weapon==='dual'?.030:.043):.10));
  const transition=transition3526(a.flowTransition3526??={},combat,dt,socialBlocked256);
  if(engaged308||filter308.weight>.001){filter308.weight=engaged308?1:filter308.weight*(1-blend308);for(const item of filter308.bones){if(!item.node)continue;if(transition.capture&&!item.leg)(item.from3526??=new a.T.Quaternion()).copy(item.q);if(transition.weight>0&&item.from3526&&!item.leg)item.node.quaternion.slerp(item.from3526,transition.weight);item.q.slerp(item.node.quaternion,blendRate339(dt,combat?.weapon,combat?.kind,combat?.progress,combat?.impact,item.leg));item.node.quaternion.copy(item.q)}}else for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion);
  if(socialBlocked256){filter308.weight=0;for(const item of filter308.bones)if(item.node)item.q.copy(item.node.quaternion)}
  if(!socialBlocked256&&bw320>.08&&!combat?.airborne&&!combat?.air323&&!combat?.roll334&&!['down','recover','dodge'].includes(combat?.kind)&&legL3523&&legR3523){const minimum=travelerStanceMin(a.motionProfile,combat?.weapon||j.weapon307,bw320);for(const [node,dir] of [[legL3523,legDir3523],[legR3523,-legDir3523]]){node.rotation.z=dir*Math.max(minimum,Math.min(.48,node.rotation.z*dir));const item=filter308.bones.find(q=>q.node===node);if(item)item.q.copy(node.quaternion);}}
  let stance3525=null;
  if(detail===0&&ground&&!socialBlocked256&&bw320>.08&&!combat?.airborne&&!combat?.air323&&!combat?.roll334&&!(j.height>.006)&&!(j.hop320>.012)&&(!combat||support3525?.active)&&typeof WWFootIK.enforceStance3525==='function'){stance3525=WWFootIK.enforceStance3525(a.T,a,bw320);if(stance3525?.corrected)for(const item of filter308.bones)if(item.node===legL3523||item.node===legR3523)item.q.copy(item.node.quaternion);}
  const look=WWMotion.socialLook255(a.look255??={},mode==='ride'||WWMotion.phaseOf(j)?0:j.lookYaw,dt);
  if(!socialBlocked256&&Math.abs(look)>.001){const n=vrm.humanoid.getNormalizedBoneNode('neck'),hd=vrm.humanoid.getNormalizedBoneNode('head');if(n)n.rotation.y+=look*.35;if(hd)hd.rotation.y+=look*(n?.65:1)}
  a.secondary132??={};const secondary=j.physics316&&typeof WWMotion.secondary337==='function'?WWMotion.secondary337(a.secondary132,dt,{gait:a.weight,speed:j.speed,turn:j.turn,wind:j.wind,vertical:j.velocity,combat:socialBlocked256?null:combat,reduce:j.reduce316}):j.physics316&&typeof WWMotion.secondary316==='function'?WWMotion.secondary316(a.secondary132,dt,{gait:a.weight,speed:j.speed,turn:j.turn,wind:j.wind,vertical:j.velocity,combat,reduce:j.reduce316}):WWMotion.secondary132(a.secondary132,dt,a.weight,a.motion.turn,j.wind);
  a.physicsTier317=Math.max(detail>0?2:0,j.physicsTier317??0);if(typeof WWIdentity!=='undefined'&&!a.identityFailed317){try{WWIdentity.animate(a,t,a.weight,secondary)}catch(e){a.identityFailed317=true;console.warn('Optional cloth motion disabled',e)}}
  const em=vrm.expressionManager,seed255=a.expressionSeed255??=Array.from(a.motionProfile||'m1').reduce((n,c)=>n+c.charCodeAt(0),0)%13,face=WWMotion.expression132(a.action132,mode,dt,t,seed255);
  if(combat&&!socialBlocked256){face.angry=Math.max(face.angry||0,.32*Math.sin(Math.PI*Math.max(0,Math.min(1,combat.progress))));face.relaxed=(face.relaxed||0)*.4}if(em){for(const k of ['happy','angry','surprised','blink','relaxed'])if(em.getExpression(k))em.setValue(k,face[k]||0)}
  const fingers=animateFingers163(a,dt,mode,a.weight,a.motion.jump,t,j.mountHorse?Math.max(Math.abs(j.mountTurn||0),j.mountBrake||0):j.turn,mode==='ride'||(j.draw3523?.phase==='sheathed'&&!combat)?null:j.weapon307,combat);const airborne=!!(WWMotion.phaseOf(j)||a.motion.jump>.12),offGround=['down','recover'].includes(combat?.kind)||!!combat?.roll334||(j.height||0)>.006||(j.velocity||0)>.01||(j.hop320||0)>.012;
  if(detail===0&&ground&&bw320<.05&&!(mode==='idle'&&gait<.15)){vrm.humanoid.update();a.footIK=WWFootIK.apply(a.T,a,ground,dt,gait,airborne,mode)}else{WWFootIK.reset(a);a.footIK=null}
  let springCount316=0;if(!a.springFailed317){try{springCount316=springMotion316(a,secondary,!!j.physics316&&detail===0&&!j.reduce316&&a.physicsTier317<2);}catch(e){a.springFailed317=true;try{springMotion316(a,secondary,false)}catch{}console.warn('Optional spring bias disabled',e)}}
  if(detail===0){for(let remain=dt;remain>0;){let d=Math.min(.033,remain);vrm.update(d);remain-=d}}else{vrm.humanoid.update();vrm.expressionManager?.update();}
  if(detail<=1&&!['down','recover'].includes(combat?.kind)&&!combat?.roll334){const contact=bw320>.05&&!offGround&&ground&&typeof WWFootIK.groundCombat320==='function'?WWFootIK.groundCombat320(a.T,a,ground,bw320,combat):WWFootIK.groundIdle(a.T,a,ground,dt,gait,offGround,mode);if(contact)a.footIK=contact;}
  a.motionState=a.motion.state;a.poseCheck={motionVersion:'35.3.0',flow3526:{transition:transition.weight,phase:a.flow3526||null},stance3525,support3525:support3525?{...support3525}:null,appearance342:a.appearance342||null,kinetic341:detail===0?{...a.kinetic341}:null,combatBody320:{...body320},face255:{...face},lookYaw255:look,brake250:a.motion.brake250||0,turnBody250:a.motion.turnBody250||0,drive250:a.motion.drive250||0,fingers163:fingers,actionWeights:{...weights},secondary:{...secondary},springCount316,wearables337:{tier:a.physicsTier317,springBias:!!a.spring316?.active,roles:a.spring316?.counts||null,clothPanels:a.identityMotion?.length||0},targetHeight:1.68*heightFactor(preset(a.motionProfile)),original:!!a.original,measuredSpeed:a.motion.speed,turn:a.motion.turn,identity:a.identityType||null,fallbackBase:a.fallbackBase||null,cycle:a.motion.cycle,walkWeight:a.motion.walk,runWeight:a.motion.run,profile:a.motionProfile,legSign:sign,hip:[v.hipL,v.hipR],knee:['left','right'].map(side=>(vrm.humanoid.getNormalizedBoneNode(side+'LowerLeg')?.rotation.x||0)*sign),ankle:[v.ankleL,v.ankleR],jumpWeight:a.motion.jump};
  const measure140=!a.diagnosticInterval140||!Number.isFinite(a.lastDiagnostic140)||t-a.lastDiagnostic140>=a.diagnosticInterval140||a.lastMode140!==a.motion.state;const previousRaw140=a.rawDiagnostics140;if(previousRaw140){a.poseCheck.rawArm=previousRaw140.arm;a.poseCheck.rawLeg=previousRaw140.leg}
  if(detail===0&&measure140&&['idle','walk','run'].includes(mode)){a.lastDiagnostic140=t;a.lastMode140=a.motion.state;
   a.root.updateWorldMatrix(true,true);
   const forward=a.modelForward.clone().applyQuaternion(a.root.getWorldQuaternion(new a.T.Quaternion()));
   a.poseCheck.rawArm=WWArms.measure(a);a.poseCheck.rawLeg=['left','right'].map(side=>{
    const get=n=>vrm.humanoid.getRawBoneNode(side+n)?.getWorldPosition(new a.T.Vector3()),A=get('UpperLeg'),B=get('LowerLeg'),C=get('Foot');if(!A||!B||!C)return null;
    const thigh=B.clone().sub(A),shin=C.clone().sub(B),axis=C.clone().sub(A).normalize(),bend=B.clone().sub(A);bend.addScaledVector(axis,-bend.dot(axis));
    return {flex:thigh.angleTo(shin),forward:bend.dot(forward),lateral:bend.clone().addScaledVector(forward,-bend.dot(forward)).length(),thigh:thigh.length(),shin:shin.length()};
   });a.rawDiagnostics140={arm:a.poseCheck.rawArm,leg:a.poseCheck.rawLeg};
  }
  if(measure140&&mode==='idle'&&a.weight<.05&&!WWMotion.phaseOf(j)){vrm.scene.updateMatrixWorld(true);const h=vrm.humanoid.getRawBoneNode('head'),l=vrm.humanoid.getRawBoneNode('leftHand'),r=vrm.humanoid.getRawBoneNode('rightHand'),ls=vrm.humanoid.getRawBoneNode('leftUpperArm'),rs=vrm.humanoid.getRawBoneNode('rightUpperArm');if(h&&l&&r&&ls&&rs){const hy=h.matrixWorld.elements[13];a.handsBelowHead=l.matrixWorld.elements[13]<hy&&r.matrixWorld.elements[13]<hy;a.handsDown=l.matrixWorld.elements[13]<ls.matrixWorld.elements[13]&&r.matrixWorld.elements[13]<rs.matrixWorld.elements[13]}}
 }
 function release(a){if(!a||a.released335)return;a.released335=true;restoreTravelerSculpt(a);try{if(a.spring316?.active)springMotion316(a,{},false)}catch{}try{if(typeof WWIdentity!=='undefined')WWIdentity.clear(a)}finally{a.root.removeFromParent();try{a.dispose?.()}finally{a.contacts={};a.combatFilter308=null;a.dispose=null;}}}
 const api={travelerArmPose,travelerBodyPose,travelerStanceMin,travelerBladeRows,travelerSwordEnabled,travelerSection,buildTravelerSword,syncTravelerSword,travelerHairPoint,travelerHairMesh,travelerHairSpring,travelerSculptPoint,applyTravelerSculpt,restoreTravelerSculpt,captureTravelerRest,travelerFinish,fallbackSources3527,flow3526,transition3526,sheathPath3526,modelKey3524,bodyShapes3523,shapePoint3523,stanceSpread3523,carry3523,readyWeight359,comboEnvelope353,idleStance352,appearance342,materialRole342,materialPolicy342,snapshotMaterial342,finishMaterial342,expression341,kineticFrame341,idleCombat341,smoothKey339,blendRate339,ultimate338,ultimateFrame338,ultimatePath338,createLoadQueue335,loadQueueStats335:()=>({...loadQueue335.stats(),player:playerQueue3527.stats()}),dodgePose334,weaponKeyframe321,clips321,actionFootwork320,boundedFootwork320,danceProfiles320,combatBody320,combatGrip312,fingerTargets163,fingerResponse251,setupFingers163,animateFingers163,load,animate,sources,roster,preset,applyPreset,release,heightFactor,createBufferCache140,bufferStats140:()=>buffers.stats()};if(typeof module!=='undefined')module.exports=api;else window.WWVRM=api;
})();

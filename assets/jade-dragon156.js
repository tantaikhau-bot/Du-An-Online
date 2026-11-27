/* Wish World original Jade Dragon pilot — authored parametric mesh, no imported assets.
   Independent articulated model; not a hand-sculpted production GLB. */
(function(global){
'use strict';
const SOURCE='wish-world-jade-wyrmling-157';
function create(T){
 const root=new T.Group();root.name='JadeWyrmling157';root.userData.source=SOURCE;
 const jade=new T.Color(0x296f75),sky=new T.Color(0x72bfb0),deep=new T.Color(0x183c60),gold=new T.Color(0xc49855),ivory=new T.Color(0xf1dfb6),violet=new T.Color(0x584780);
 const n=128,b=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=y/16, u=x/16+(Math.floor(v)%2)*.5,dx=u-Math.floor(u)-.5,dy=v-Math.floor(v)-.48,r=Math.min(1,Math.hypot(dx*1.5,dy*1.4)),q=Math.round(95+62*Math.cos(r*Math.PI*.5)+14*Math.sin(v*6.283));let k=4*(y*n+x);b.set([q,q,q,255],k)}
 const tex=new T.DataTexture(b,n,n,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
 const skin=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.72,bumpMap:tex,bumpScale:.018});
 const smooth=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.68});
 const membrane=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.69,side:T.DoubleSide});
 const iris=new T.MeshStandardMaterial({color:0xf1c650,roughness:.31});
 const pupil=new T.MeshStandardMaterial({color:0x10172b,roughness:.22});
 const glint=new T.MeshBasicMaterial({color:0xffffff});
 const gem=new T.MeshStandardMaterial({color:0x7df6e9,emissive:0x168c9d,emissiveIntensity:.46,roughness:.27});
 const shadow=new T.MeshStandardMaterial({color:0x23404c,roughness:.86});
 const sphere=new T.SphereGeometry(1,18,12);
 function group(name,p,x=0,y=0,z=0){let g=new T.Group();g.name=name;g.position.set(x,y,z);p.add(g);return g}
 function mesh(p,g,m){let o=new T.Mesh(g,m);p.add(o);return o}
 function eyePart(p,x,y,z,sx,sy,sz,m){let o=mesh(p,sphere,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}
 // Elliptical cross sections along smooth authored curves, with continuous vertex palette and UV.
 function loft(p,sections,colA,colB,material=skin,rings=24,sides=24){
  const curve=new T.CatmullRomCurve3(sections.map(s=>new T.Vector3(...s.slice(0,3))),false,'centripetal');
  const pts=[],uv=[],colors=[],idx=[],c=new T.Color();let prevT=null,prevU=null;const vertical=new T.Vector3(0,1,0);
  for(let i=0;i<=rings;i++){let t=i/rings,f=t*(sections.length-1),j=Math.min(sections.length-2,Math.floor(f)),a=f-j;let s0=sections[j],s1=sections[j+1],rx=Math.max(.001,T.MathUtils.lerp(s0[3],s1[3],a)),ry=Math.max(.001,T.MathUtils.lerp(s0[4],s1[4],a));let v=curve.getPoint(t),tan=curve.getTangent(t).normalize(),u=prevU?prevU.clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(prevT,tan)):new T.Vector3().crossVectors(vertical,tan).normalize();if(u.lengthSq()<.1)u.set(1,0,0);u.addScaledVector(tan,-u.dot(tan)).normalize();const w=new T.Vector3().crossVectors(tan,u).normalize();prevT=tan.clone();prevU=u.clone();
   for(let k=0;k<=sides;k++){let ang=k/sides*Math.PI*2,cos=Math.cos(ang),sin=Math.sin(ang);let pos=v.clone().addScaledVector(u,rx*cos).addScaledVector(w,ry*sin);pts.push(pos.x,pos.y,pos.z);uv.push(k/sides*3,t*4);c.copy(colA).lerp(colB,T.MathUtils.clamp(.5+sin*.48,0,1));colors.push(c.r,c.g,c.b)}
  }
  for(let i=0;i<rings;i++)for(let k=0;k<sides;k++){let a=i*(sides+1)+k,d=a+sides+1;idx.push(a,a+1,d,a+1,d+1,d)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();return mesh(p,g,material)
 }
 const torso=group('JadeTorso',root);
 loft(torso,[[0,.52,-.48,.015,.02],[0,.46,-.34,.155,.175],[0,.41,-.08,.19,.197],[0,.39,.26,.169,.15],[0,.40,.51,.105,.093],[0,.41,.60,.004,.004]],jade,deep);
 loft(torso,[[0,.33,-.40,.004,.003],[0,.28,-.28,.105,.031],[0,.23,-.04,.122,.045],[0,.25,.22,.10,.031],[0,.31,.42,.003,.003]],ivory,gold,smooth,18,20);
 const neck=group('JadeNeck',torso,0,.49,-.31);
 loft(neck,[[0,-.09,.12,.12,.12],[0,.05,.01,.145,.14],[0,.23,-.08,.12,.115],[0,.34,-.14,.11,.11],[0,.39,-.15,.006,.006]],jade,sky);
 const head=group('JadeHead',neck,0,.30,-.12);
 // Face is a separate sculpted-profile surface, with a rounded brow and narrowing snout.
 loft(head,[[0,-.018,-.48,.008,.012],[0,-.006,-.415,.072,.047],[0,.015,-.31,.091,.067],[0,.052,-.20,.13,.09],[0,.09,-.055,.169,.137],[0,.083,.105,.14,.115],[0,.06,.19,.006,.006]],jade,sky,skin,32,32);
 loft(head,[[0,-.062,-.456,.003,.003],[0,-.067,-.39,.065,.021],[0,-.075,-.27,.09,.028],[0,-.079,-.10,.118,.035],[0,-.04,.07,.004,.004]],ivory,gold,smooth,18,24);
 for(const sign of [-1,1]){
  const e=group(sign<0?'JadeEyeL':'JadeEyeR',head,sign*.126,.095,-.128);e.rotation.y=-sign*.90;e.rotation.z=sign*.10;
  eyePart(e,0,0,.006,.061,.039,.025,shadow);eyePart(e,0,.001,-.013,.049,.029,.019,iris);eyePart(e,.005,0,-.030,.010,.023,.007,pupil);eyePart(e,-.012,.012,-.034,.008,.006,.004,glint);
  // Swept upper brow, lower cheek and a dark mouth seam are part of the silhouette.
  loft(head,[[sign*.076,.103,-.235,.010,.008],[sign*.126,.146,-.167,.025,.021],[sign*.168,.141,-.095,.029,.022],[sign*.151,.112,.005,.008,.008]],deep,jade,skin,16,14);
  loft(head,[[sign*.065,-.055,-.409,.004,.004],[sign*.088,-.061,-.30,.006,.005],[sign*.115,-.054,-.20,.007,.005],[sign*.14,-.025,-.10,.003,.003]],deep,deep,smooth,14,8);
  eyePart(head,sign*.058,.025,-.402,.012,.008,.012,shadow);
  loft(head,[[sign*.115,.17,.035,.044,.039],[sign*.17,.25,.11,.033,.030],[sign*.21,.33,.22,.022,.019],[sign*.19,.38,.34,.002,.002]],gold,ivory,smooth,16,16);
  loft(head,[[sign*.145,.012,.026,.056,.043],[sign*.235,.08,.108,.052,.028],[sign*.32,.15,.20,.024,.012],[sign*.36,.19,.24,.002,.002]],deep,sky,smooth,12,16);
 }
 for(let i=0;i<4;i++)loft(head,[[0,.20-i*.022,.01+i*.05,.045,.031],[0,.31-i*.025,.065+i*.06,.034,.02],[0,.36-i*.033,.13+i*.07,.001,.001]],deep,sky,smooth,10,12);
 const ornament=mesh(head,new T.OctahedronGeometry(.030),gem);ornament.position.set(0,.185,-.12);ornament.scale.set(.68,1.25,.57);
 // Four articulated legs, each with an organic profile and three tapered claws.
 for(let i=0;i<4;i++){let sg=i%2?1:-1,front=i<2,p=group('JadeLeg'+i,torso,sg*(front?.142:.165),front?.38:.32,front?-.22:.26);
  loft(p,[[0,.05,0,.082,.075],[sg*.06,-.06,0,.09,.075],[sg*.06,-.17,.045,.058,.055],[sg*.015,-.23,-.035,.057,.07],[0,-.24,-.12,.008,.009]],jade,sky,skin,16,16);
  for(let k=-1;k<=1;k++)loft(p,[[sg*.015+k*.033,-.222,-.075,.019,.015],[sg*.015+k*.033,-.24,-.13,.015,.012],[sg*.015+k*.033,-.24,-.17,.001,.001]],gold,ivory,smooth,8,8);
 }
 let parent=torso;
 for(let i=0;i<5;i++){let r=.11*Math.pow(.73,i),p=group('JadeTail'+i,parent,0,i===0?.39:0,i===0?.43:.19);loft(p,[[0,0,-.035,r*.92,r*.9],[0,.014,.075,r,r*.88],[0,.024,.16,r*.76,r*.68],[0,.0,.225,r*.70,r*.65]],jade,deep,skin,12,14);parent=p}
 loft(parent,[[0,0,.13,.039,.025],[0,.07,.23,.078,.035],[0,.16,.34,.002,.002]],deep,sky,smooth,14,16);
 // Curved membrane patches with three radiating finger struts; separate wing joints.
 for(const sg of [-1,1]){
  const wing=group(sg<0?'JadeWingL':'JadeWingR',torso,sg*.16,.55,.055);
  const hub=[0,0,0],knuckle=[sg*.39,.37,-.15],tips=[[sg*.97,.57,.025],[sg*.85,.31,.50],[sg*.48,.13,.68],[sg*.05,-.10,.38]];
  function fan(a,b,c){const ps=[],cs=[],ix=[],clr=new T.Color(),N=14,A=new T.Vector3(...a),B=new T.Vector3(...b),C=new T.Vector3(...c);
   for(let i=0;i<=N;i++){let u=i/N;for(let j=0;j<=N;j++){let v=j/N,edge=B.clone().lerp(C,v),scallop=Math.sin(Math.PI*v)*.19;edge.lerp(A,scallop);let q=A.clone().lerp(edge,u);q.y-=Math.sin(Math.PI*u)*Math.sin(Math.PI*v)*.065;ps.push(q.x,q.y,q.z);clr.copy(violet).lerp(sky,.13+.30*(1-u)+.18*Math.sin(Math.PI*v));cs.push(clr.r,clr.g,clr.b)}}
   for(let i=0;i<N;i++)for(let j=0;j<N;j++){let a=i*(N+1)+j,b=a+N+1;ix.push(a,b,a+1,b,b+1,a+1)}
   let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('color',new T.Float32BufferAttribute(cs,3));g.setIndex(ix);g.computeVertexNormals();mesh(wing,g,membrane)
  }
  fan(knuckle,tips[0],tips[1]);fan(knuckle,tips[1],tips[2]);fan(knuckle,tips[2],tips[3]);fan(knuckle,tips[3],hub);
  loft(wing,[[...hub,.062,.055],[sg*.21,.17,-.035,.044,.037],[...knuckle,.032,.028]],jade,sky,skin,14,14);
  for(let i=0;i<tips.length;i++){const a=tips[i];loft(wing,[[...knuckle,.032,.028],[sg*(Math.abs(a[0])+.43)*.5,(a[1]+.31)*.5+.035,(a[2]-.10)*.5,.019,.014],[...a,.002,.002]],deep,sky,smooth,14,12)}
 }
 const crest=mesh(torso,new T.OctahedronGeometry(.07),gem);crest.position.set(0,.49,-.409);crest.scale.set(.78,1.15,.65);
 function clip(name,duration,amp){const tracks=[],times=[0,duration*.25,duration*.5,duration*.75,duration];
  function track(node,axis,base,amplitude,phase=0){tracks.push(new T.NumberKeyframeTrack(node+'.rotation['+axis+']',times,times.map((t,i)=>base+amplitude*Math.sin(i*Math.PI/2+phase))))}
  track('JadeWingL','z',-.28,amp);track('JadeWingR','z',.28,-amp);track('JadeWingL','y',0,.16,1);track('JadeWingR','y',0,-.16,1);
  track('JadeHead','x',0,.08,.6);track('JadeHead','y',0,.09,1.1);track('JadeNeck','x',0,.045,1);
  for(let i=0;i<5;i++){track('JadeTail'+i,'y',0,.10+i*.025,-i*.45);track('JadeTail'+i,'x',0,.06,-i*.35)}
  for(let i=0;i<4;i++)track('JadeLeg'+i,'x',name==='fly'?-.36:-.17,.06,i*Math.PI/2);
  return new T.AnimationClip(name,duration,tracks)
 }
 // Batch fixed parts per articulated joint and material to reduce mobile draw calls.
 const joints=[];root.traverse(o=>{if(o.isGroup)joints.push(o)});
 for(const joint of joints){const buckets=new Map();for(const o of joint.children){if(!o.isMesh||!o.material.vertexColors)continue;let b=buckets.get(o.material)||[];b.push(o);buckets.set(o.material,b)}
  for(const [mat,parts] of buckets){if(parts.length<2)continue;const pos=[],norm=[],color=[],uv=[],indices=[];let offset=0;
   for(const o of parts){o.updateMatrix();let g=o.geometry.clone().applyMatrix4(o.matrix),a=g.attributes;for(let i=0;i<a.position.count;i++){pos.push(a.position.getX(i),a.position.getY(i),a.position.getZ(i));norm.push(a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i));color.push(a.color.getX(i),a.color.getY(i),a.color.getZ(i));uv.push(a.uv?.getX(i)||0,a.uv?.getY(i)||0)}if(g.index)for(let i=0;i<g.index.count;i++)indices.push(offset+g.index.getX(i));else for(let i=0;i<a.position.count;i++)indices.push(offset+i);offset+=a.position.count;g.dispose();o.geometry.dispose();joint.remove(o)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setAttribute('color',new T.Float32BufferAttribute(color,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);mesh(joint,g,mat)
  }
 }
 root.updateMatrixWorld(true);return {root,idle:clip('idle',1.65,.42),fly:clip('fly',.95,.62)}
}
function steer(yaw,dx,dz,dt){if(!Number.isFinite(yaw))yaw=0;if(!Number.isFinite(dx)||!Number.isFinite(dz)||Math.hypot(dx,dz)<.0001||!(dt>0))return {yaw,turn:0};const target=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));const secs=Math.min(.10,dt/1000),turn=Math.max(-4.5*secs,Math.min(4.5*secs,delta*(1-Math.exp(-secs*12))));return {yaw:yaw+turn,turn:turn/Math.max(.001,secs)}}
const api={create,SOURCE,steer};if(typeof module!=='undefined'&&module.exports)module.exports=api;else global.WWJade156=api;
})(typeof globalThis!=='undefined'?globalThis:this);

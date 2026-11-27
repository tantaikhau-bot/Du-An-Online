/* Wish World original Jade Dragon pilot — authored parametric mesh, no imported assets.
   Independent articulated model; not a hand-sculpted production GLB. */
(function(global){
'use strict';
const SOURCE='wish-world-original-jade-156';
function create(T){
 const root=new T.Group();root.name='JadeOriginal156';root.userData.source=SOURCE;
 const jade=new T.Color(0x338e91),sky=new T.Color(0x81d8cc),deep=new T.Color(0x274c7c),gold=new T.Color(0xe5bb70),ivory=new T.Color(0xf8e8c5),violet=new T.Color(0x745fba);
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
  const pts=[],uv=[],colors=[],idx=[],c=new T.Color(),up=new T.Vector3(0,1,0),alt=new T.Vector3(1,0,0);
  for(let i=0;i<=rings;i++){let t=i/rings,f=t*(sections.length-1),j=Math.min(sections.length-2,Math.floor(f)),a=f-j;let s0=sections[j],s1=sections[j+1],rx=Math.max(.001,T.MathUtils.lerp(s0[3],s1[3],a)),ry=Math.max(.001,T.MathUtils.lerp(s0[4],s1[4],a));let v=curve.getPoint(t),tan=curve.getTangent(t).normalize(),u=new T.Vector3().crossVectors(Math.abs(tan.dot(up))>.94?alt:up,tan).normalize(),w=new T.Vector3().crossVectors(tan,u).normalize();
   for(let k=0;k<=sides;k++){let ang=k/sides*Math.PI*2,cos=Math.cos(ang),sin=Math.sin(ang);let pos=v.clone().addScaledVector(u,rx*cos).addScaledVector(w,ry*sin);pts.push(pos.x,pos.y,pos.z);uv.push(k/sides*3,t*4);c.copy(colA).lerp(colB,T.MathUtils.clamp(.5+sin*.48,0,1));colors.push(c.r,c.g,c.b)}
  }
  for(let i=0;i<rings;i++)for(let k=0;k<sides;k++){let a=i*(sides+1)+k,d=a+sides+1;idx.push(a,a+1,d,a+1,d+1,d)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();return mesh(p,g,material)
 }
 const torso=group('JadeTorso',root);
 loft(torso,[[0,.52,-.45,.015,.02],[0,.46,-.31,.17,.20],[0,.40,-.03,.235,.255],[0,.36,.26,.20,.18],[0,.39,.48,.125,.11],[0,.40,.56,.004,.004]],jade,deep);
 loft(torso,[[0,.32,-.40,.004,.003],[0,.25,-.28,.112,.04],[0,.18,-.04,.148,.051],[0,.20,.22,.13,.035],[0,.26,.42,.003,.003]],ivory,gold,smooth,18,20);
 const neck=group('JadeNeck',torso,0,.49,-.31);
 loft(neck,[[0,-.09,.12,.12,.12],[0,.05,.01,.145,.14],[0,.23,-.08,.12,.115],[0,.34,-.14,.11,.11],[0,.39,-.15,.006,.006]],jade,sky);
 const head=group('JadeHead',neck,0,.30,-.12);
 // Face is a separate sculpted-profile surface, with a rounded brow and narrowing snout.
 loft(head,[[0,-.015,-.38,.018,.020],[0,.00,-.32,.115,.073],[0,.025,-.22,.167,.11],[0,.085,-.06,.218,.184],[0,.09,.12,.18,.15],[0,.065,.21,.008,.009]],jade,sky,skin,32,32);
 loft(head,[[0,-.066,-.365,.004,.004],[0,-.076,-.30,.10,.034],[0,-.085,-.16,.14,.046],[0,-.079,.02,.11,.05],[0,-.035,.10,.005,.005]],ivory,gold,smooth,18,24);
 for(const sign of [-1,1]){
  const e=group(sign<0?'JadeEyeL':'JadeEyeR',head,sign*.157,.111,-.142);e.rotation.y=sign*.66;
  eyePart(e,0,0,0,.087,.101,.034,shadow);eyePart(e,0,.002,-.025,.073,.086,.034,iris);eyePart(e,0,-.002,-.05,.028,.069,.014,pupil);eyePart(e,-.018,.034,-.061,.017,.021,.009,glint);eyePart(e,.015,-.027,-.062,.007,.008,.004,glint);
  eyePart(head,sign*.07,.034,-.319,.021,.011,.017,shadow);
  loft(head,[[sign*.13,.20,.035,.055,.047],[sign*.19,.30,.07,.041,.034],[sign*.23,.41,.13,.023,.025],[sign*.20,.48,.18,.003,.003]],gold,ivory,smooth,16,16);
  loft(head,[[sign*.145,.012,.026,.056,.043],[sign*.235,.08,.108,.052,.028],[sign*.32,.15,.20,.024,.012],[sign*.36,.19,.24,.002,.002]],deep,sky,smooth,12,16);
 }
 for(let i=0;i<4;i++)loft(head,[[0,.20-i*.022,.01+i*.05,.045,.031],[0,.31-i*.025,.065+i*.06,.034,.02],[0,.36-i*.033,.13+i*.07,.001,.001]],deep,sky,smooth,10,12);
 const ornament=mesh(head,new T.OctahedronGeometry(.048),gem);ornament.position.set(0,.21,-.165);ornament.scale.set(.68,1.25,.57);
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
  const hub=[0,0,0],knuckle=[sg*.43,.31,-.10],tips=[[sg*1.02,.44,.06],[sg*.88,.18,.43],[sg*.51,.01,.55],[sg*.08,-.04,.33]];
  function patch(a,b,c,d){const ps=[],cs=[],ix=[],clr=new T.Color(),N=12;
   for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){let u=i/N,v=j/N,A=new T.Vector3(...a).lerp(new T.Vector3(...b),u),B=new T.Vector3(...c).lerp(new T.Vector3(...d),u),q=A.lerp(B,v);q.y-=.055*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);ps.push(q.x,q.y,q.z);clr.copy(violet).lerp(sky,.16+.56*v);cs.push(clr.r,clr.g,clr.b)}
   for(let i=0;i<N;i++)for(let j=0;j<N;j++){let a=i*(N+1)+j,b=a+N+1;ix.push(a,b,a+1,b,b+1,a+1)}
   let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('color',new T.Float32BufferAttribute(cs,3));g.setIndex(ix);g.computeVertexNormals();mesh(wing,g,membrane)
  }
  patch(hub,knuckle,tips[3],tips[2]);patch(knuckle,tips[0],tips[2],tips[1]);patch(knuckle,tips[1],tips[2],tips[2]);
  loft(wing,[[...hub,.062,.055],[sg*.21,.17,-.035,.044,.037],[...knuckle,.032,.028]],jade,sky,skin,14,14);
  for(let i=0;i<tips.length;i++){const a=tips[i];loft(wing,[[...knuckle,.032,.028],[sg*(Math.abs(a[0])+.43)*.5,(a[1]+.31)*.5+.035,(a[2]-.10)*.5,.019,.014],[...a,.002,.002]],deep,sky,smooth,14,12)}
 }
 const crest=mesh(torso,new T.OctahedronGeometry(.07),gem);crest.position.set(0,.49,-.409);crest.scale.set(.78,1.15,.65);
 function clip(name,duration,amp){const tracks=[],times=[0,duration*.25,duration*.5,duration*.75,duration];
  function track(node,axis,base,amplitude,phase=0){tracks.push(new T.NumberKeyframeTrack(node+'.rotation['+axis+']',times,times.map((t,i)=>base+amplitude*Math.sin(i*Math.PI/2+phase))))}
  track('JadeWingL','z',-.12,amp);track('JadeWingR','z',.12,-amp);track('JadeWingL','y',0,.16,1);track('JadeWingR','y',0,-.16,1);
  track('JadeHead','x',0,.08,.6);track('JadeHead','y',0,.09,1.1);track('JadeNeck','x',0,.045,1);
  for(let i=0;i<5;i++){track('JadeTail'+i,'y',0,.10+i*.025,-i*.45);track('JadeTail'+i,'x',0,.06,-i*.35)}
  for(let i=0;i<4;i++)track('JadeLeg'+i,'x',name==='fly'?.28:.10,.10,i*Math.PI/2);
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
 root.updateMatrixWorld(true);return {root,idle:clip('idle',1.55,.35),fly:clip('fly',.83,.65)}
}
const api={create,SOURCE};if(typeof module!=='undefined'&&module.exports)module.exports=api;else global.WWJade156=api;
})(typeof globalThis!=='undefined'?globalThis:this);

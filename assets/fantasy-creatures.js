/* WISH WORLD V11.6 — Fantasy creature assets.
 * Five independent authored shape recipes, reusable articulated mesh templates.
 * Original stylized geometry, no network model dependency. MIT-style project code.
 * Forward -Z, floor Y=0. Root is gameplay position, visual rig is separate. */
(function(global){
 const KINDS=['rabbit','fox','cat','deer','dragon'];
 const palettes={
  rabbit:{coat:0xe8d8c2,shade:0xbba594,cream:0xfff0d9,inner:0xd89c9d,iris:0x9e6844,accent:0x657c4b},
  fox:{coat:0xc96d37,shade:0x713922,cream:0xf7e6c7,inner:0xa05e50,iris:0xd7a14a,accent:0x813e43},
  cat:{coat:0xb1a69c,shade:0x6c605d,cream:0xf5e6d8,inner:0xc78f9b,iris:0x8aa568,accent:0x81639e},
  deer:{coat:0xb88558,shade:0x74523b,cream:0xf3e2c2,inner:0xc68e83,iris:0x694630,accent:0x718749},
  dragon:{coat:0xa99dcf,shade:0x72618f,cream:0xf2dcbf,inner:0xd99cae,iris:0x61a8b4,accent:0xc3a16a}
 };
 const cache=new WeakMap(),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
 function resources(T){let r=cache.get(T);if(r)return r;
  function bump(scales){let n=64,bytes=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let u=x/n,v=y/n;let a=scales?Math.sin((u*8+Math.floor(v*12)%2*.5)*Math.PI*2)*Math.sin(v*12*Math.PI*2):Math.sin((u*22+.26*Math.sin(v*6.283))*Math.PI*2)*.65+Math.sin((u*13-v*3)*6.283)*.22;let k=Math.round(128+40*a),i=4*(y*n+x);bytes.set([k,k,k,255],i)}let t=new T.DataTexture(bytes,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t}
  const mat=(rough,bumpMap=null,bumpScale=0)=>new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:rough,metalness:0,bumpMap,bumpScale,envMapIntensity:.25,side:T.DoubleSide});
  r={sphere:new T.SphereGeometry(1,16,12),small:new T.SphereGeometry(1,10,8),materials:{fur:mat(.96,bump(false),.012),scale:mat(.86,bump(true),.014),plain:mat(.91),eye:mat(.42),wing:mat(.91)},templates:new Map()};cache.set(T,r);return r}
 function asset(T,kind){const r=resources(T),p=palettes[kind];if(!p)throw Error('Unknown creature '+kind);const root=new T.Group();root.name=kind;
  const rig=new T.Group();rig.name='rig';root.add(rig);
  const body=new T.Group();body.name='body';rig.add(body);
  const group=(parent,name,x=0,y=0,z=0)=>{let o=new T.Group();o.name=name;o.position.set(x,y,z);parent.add(o);return o};
  const layers=new Map(),tmp=new T.Vector3(),normal=new T.Vector3(),col=new T.Color(),Q=new T.Quaternion(),M=new T.Matrix4(),NM=new T.Matrix3();
  const type=kind==='dragon'?'scale':'fur';
  function append(parent,geo,color,material,position,scale,rotation=[0,0,0]){
   let id=parent.uuid+material,a=layers.get(id);if(!a){a={parent,material,P:[],N:[],C:[],U:[],I:[]};layers.set(id,a)}
   Q.setFromEuler(new T.Euler(...rotation));M.compose(new T.Vector3(...position),Q,new T.Vector3(...scale));NM.getNormalMatrix(M);const pos=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,start=a.P.length/3;col.set(color);
   for(let i=0;i<pos.count;i++){tmp.fromBufferAttribute(pos,i).applyMatrix4(M);normal.fromBufferAttribute(n,i).applyMatrix3(NM).normalize();a.P.push(tmp.x,tmp.y,tmp.z);a.N.push(normal.x,normal.y,normal.z);a.U.push(uv?uv.getX(i):0,uv?uv.getY(i):0);
    const noise=material==='fur'||material==='scale'? .94+.05*Math.sin(tmp.x*43+tmp.z*27+tmp.y*53)*Math.sin(tmp.z*65-tmp.y*31)+.025*normal.y:1;
    a.C.push(clamp(col.r*noise),clamp(col.g*noise),clamp(col.b*noise));}
   if(geo.index)for(let i=0;i<geo.index.count;i++)a.I.push(start+geo.index.getX(i));else for(let i=0;i<pos.count;i++)a.I.push(start+i);
  }
  function ell(parent,x,y,z,rx,ry,rz,c,mat=type,rot=[0,0,0],tiny=false){append(parent,tiny?r.small:r.sphere,c,mat,[x,y,z],[rx,ry,rz],rot)}
  function tube(parent,pts,radii,c,mat=type,N=10){
   const P=[],U=[],I=[];for(let j=0;j<pts.length;j++){const a=new T.Vector3(...pts[j]),prev=new T.Vector3(...pts[Math.max(0,j-1)]),next=new T.Vector3(...pts[Math.min(pts.length-1,j+1)]),t=next.sub(prev).normalize();let axis=new T.Vector3(0,1,0);if(Math.abs(axis.dot(t))>.9)axis.set(1,0,0);const u=axis.cross(t).normalize(),v=t.clone().cross(u).normalize();let rad=Array.isArray(radii[j])?radii[j]:[radii[j],radii[j]];
    for(let i=0;i<=N;i++){let q=i/N*6.2831853,pt=a.clone().addScaledVector(u,Math.cos(q)*rad[0]).addScaledVector(v,Math.sin(q)*rad[1]);P.push(...pt.toArray());U.push(i/N,j/(pts.length-1));if(j&&i<N){let k=j*(N+1)+i,h=k-N-1;I.push(h,k,h+1,k,k+1,h+1)}}}
   let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();append(parent,g,c,mat,[0,0,0],[1,1,1]);g.dispose();
  }
  function blade(parent,a,b,width,c,mat=type){let A=new T.Vector3(...a),B=new T.Vector3(...b),D=B.clone().sub(A),m=A.clone().lerp(B,.4),rot=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),D.clone().normalize()));ell(parent,...m.toArray(),width,D.length()*.66,width*.65,c,mat,rot.toArray().slice(0,3),true)}
  const dims={rabbit:[.27,.19,.24,.47,-.18,.155,.148,.128],fox:[.43,.155,.34,.57,-.32,.145,.145,.16],cat:[.37,.16,.27,.49,-.24,.164,.157,.145],deer:[.69,.17,.36,.99,-.30,.125,.145,.15],dragon:[.38,.20,.27,.54,-.23,.182,.17,.166]}[kind];
  const [h,w,len,hy,hz,hx,hh,hd]=dims,head=group(rig,'head',0,hy,hz),tail=group(rig,'tail',0,h,len*.83);
  const paws=[],knees=[],ears=[],eyes=[],wings=[],wingTips=[];
  // Each species has its own body proportions and silhouette.
  ell(body,0,h,0,w,h*.40,len,p.coat);
  if(kind==='rabbit'){ell(body,0,.24,.075,.202,.205,.247,p.coat);ell(body,0,.27,-.095,.169,.176,.164,p.coat);ell(body,0,.23,-.161,.116,.127,.102,p.cream)}
  if(kind==='fox'){ell(body,0,.44,-.19,.16,.19,.21,p.coat);ell(body,0,.37,-.24,.117,.15,.15,p.cream);for(let sg of [-1,1])for(let j=0;j<4;j++)blade(body,[sg*.085,.47,-.25+j*.045],[sg*.16,.32,-.25+j*.06],.046,j%2?p.coat:p.cream)}
  if(kind==='cat'){ell(body,0,.37,-.14,.155,.17,.211,p.coat);ell(body,0,.34,.15,.161,.16,.17,p.coat);ell(body,0,.30,-.19,.100,.12,.105,p.cream);for(let sg of [-1,1])for(let i=0;i<4;i++)ell(body,sg*.148,.40,.12-i*.07,.014,.065,.025,p.shade,type,[.2,0,sg*.25],true)}
  if(kind==='deer'){tube(body,[[0,.62,-.19],[0,.75,-.25],[0,.87,-.30],[0,.99,-.30]],[.125,.12,.091,.075],p.coat);ell(body,0,.72,-.25,.09,.18,.11,p.cream);for(let sg of [-1,1])for(let i=0;i<9;i++){let z=-.04+(i%5)*.073,y=.73+Math.floor(i/5)*.071,x=sg*w*Math.sqrt(Math.max(.1,1-((y-h)/(.276))**2-(z/len)**2));ell(body,x,y,z,.012,.021,.034,p.cream,'plain',[0,0,sg*.13],true)}}
  if(kind==='dragon'){ell(body,0,.34,-.12,.17,.20,.19,p.cream);for(let i=0;i<5;i++)ell(body,0,.22+i*.046,-.264+Math.abs(i-2)*.008,.112+i*.009,.018,.015,0xd8bfa7,'plain',[],true);for(let i=0;i<5;i++)blade(body,[0,.51,.02+i*.071],[0,.64-i*.016,.055+i*.075],.045,p.shade,'scale')}
  ell(head,0,0,0,hx,hh,hd,p.coat);
  let muzzle=group(head,'muzzle',0,-hh*.35,-hd*.75),nose=group(muzzle,'nose',0,.02,kind==='fox'?-.151:-.066);
  if(kind==='fox'){tube(muzzle,[[0,0,.025],[0,-.01,-.035],[0,0,-.10],[0,.01,-.145]],[[.085,.073],[.09,.063],[.055,.044],[.034,.027]],p.cream);for(let sg of [-1,1])for(let j=0;j<3;j++)blade(head,[sg*.10,-.02,.00],[sg*(.19-j*.012),-.07-j*.027,.07+j*.025],.042,p.cream)}
  else if(kind==='deer'){ell(muzzle,0,0,-.035,.085,.065,.12,p.cream);nose.position.z=-.13}
  else if(kind==='dragon'){ell(muzzle,0,-.005,-.038,.126,.078,.114,p.cream);nose.position.z=-.11;for(let sg of [-1,1])ell(muzzle,sg*.044,.04,-.10,.012,.008,.014,p.shade,'plain',[],true)}
  else {for(let sg of [-1,1])ell(muzzle,sg*.041,0,-.023,.059,.047,.052,p.cream);ell(muzzle,0,-.036,-.021,.055,.027,.045,p.cream)}
  if(kind!=='dragon')ell(nose,0,0,0,kind==='fox'?.035:.027,.021,.022,kind==='rabbit'||kind==='cat'?0xa86b6b:0x382a2a,'eye',[],true);
  if(kind==='rabbit'){ell(muzzle,0,-.038,-.056,.021,.006,.006,0x987b73,'plain',[],true)}
  for(let sg of [-1,1]){
   const e=group(head,sg<0?'eyeL':'eyeR',sg*hx*.67,hh*.16,-hd*.66);e.rotation.y=sg*-.72;eyes.push(e);let ex=kind==='cat'||kind==='dragon'?.038:kind==='rabbit'?.033:.030,ey=ex*(kind==='fox'?.78:1.07);
   ell(e,0,0,0,ex*1.17,ey*1.17,.012,p.shade,'plain');ell(e,0,0,-.009,ex,ey,.012,0x332b31,'eye');ell(e,0,-.001,-.017,ex*.82,ey*.89,.007,p.iris,'eye');ell(e,0,-.002,-.022,ex*(kind==='cat'?.40:.67),ey*.83,.004,0x211f29,'eye');ell(e,-.008,.010,-.026,.006,.007,.002,0xfff7e9,'plain',[],true);
   let ear=group(head,sg<0?'earL':'earR',sg*hx*.70,hh*.72,.025);ears.push(ear);
   if(kind==='rabbit'){tube(ear,[[0,0,0],[sg*.016,.075,0],[sg*.034,.185,.02],[sg*.049,.262,.035],[sg*.053,.29,.038]],[[.035,.025],[.052,.028],[.051,.021],[.024,.012],[.004,.004]],p.coat);ell(ear,sg*.032,.14,-.024,.031,.109,.012,p.inner,'plain',[.09,0,-sg*.16]);}
   else if(kind==='deer'){ell(ear,sg*.057,.05,0,.10,.047,.027,p.coat,type,[0,0,sg*.45]);ell(ear,sg*.062,.051,-.021,.076,.027,.009,p.inner,'plain',[0,0,sg*.45]);const horn=group(head,'antler'+sg,sg*.064,hh*.80,.036);tube(horn,[[0,0,0],[sg*.035,.10,0],[sg*.07,.20,.02],[sg*.085,.28,.04]],[.022,.018,.012,.004],0xa48259,'plain');for(let j=0;j<2;j++)tube(horn,[[sg*.035*(j+1),.10+j*.09,.02],[sg*(.10+j*.04),.16+j*.11,.015],[sg*(.13+j*.05),.21+j*.10,.01]],[.014,.009,.003],0xa48259,'plain')}
   else if(kind==='dragon'){tube(ear,[[0,0,0],[sg*.045,.07,.02],[sg*.10,.08,.06]],[.047,.038,.006],p.coat,'scale');tube(head,[[sg*.085,.11,.04],[sg*.105,.20,.095],[sg*.12,.25,.15]],[.035,.025,.004],0xe9d5a4,'plain')}
   else {tube(ear,[[0,0,0],[sg*.025,.074,.006],[sg*.041,kind==='fox'?.17:.135,.015]],[[.069,.042],[.048,.028],[.003,.004]],p.shade);tube(ear,[[0,.013,-.026],[sg*.025,.073,-.021],[sg*.039,kind==='fox'?.143:.11,.006]],[[.042,.012],[.028,.009],[.003,.003]],p.inner,'plain')}
   if(kind==='cat'||kind==='rabbit'||kind==='fox'){for(let i=0;i<2;i++)tube(muzzle,[[sg*.068,-.015,-.07],[sg*.128,-.013-i*.025,-.075],[sg*.185,-.008-i*.033,-.067]],[.0025,.0019,.0008],p.cream,'plain',5)}
   if(kind==='cat')for(let i=0;i<2;i++)ell(head,sg*(.11+i*.018),.025+i*.036,-.079,.028,.010,.025,p.shade,type,[0,sg*.45,sg*.45],true);
  }
  // Articulated fore and hind legs, not one rigid straight cylinder.
  for(let sg of [-1,1])for(let back of [-1,1]){
   const L=kind==='deer'?.61:kind==='rabbit'?.20:kind==='dragon'?.25:kind==='fox'?.34:.28;
   const hip=group(rig,'leg'+paws.length,sg*w*.72,L+.035,back*len*.69),knee=group(hip,'knee',0,-L*.52,back===1?.024:0);paws.push(hip);knees.push(knee);
   const rad=kind==='deer'?.046:kind==='rabbit'&&back===1?.093:kind==='dragon'?.075:.059;
   ell(hip,0,-L*.10,back===1?.023:0,rad*1.18,L*.46,rad*1.12,p.coat);
   tube(hip,[[0,L*.07,0],[0,-L*.15,0],[0,-L*.35,0],[0,-L*.58,back===1?.024:0]],[rad,rad*.89,rad*.73,rad*.60],p.coat);
   ell(knee,0,.005,0,rad*.61,Math.max(.025,L*.13),rad*.61,kind==='fox'?p.shade:p.coat);tube(knee,[[0,.015,0],[0,-L*.26,0],[0,-L*.48,0]],[rad*.61,rad*.53,rad*.48],kind==='fox'?p.shade:p.coat);
   ell(knee,0,-L*.48,-rad*.47,rad*.84,.035,rad*(kind==='rabbit'&&back===1?1.65:1.15),kind==='deer'?0x47342e:kind==='fox'?p.shade:p.cream,'plain');
  }
  if(kind==='fox'){tube(tail,[[0,0,0],[0,.025,.14],[0,.06,.29],[0,.12,.43],[0,.20,.56],[0,.23,.65]],[.055,.115,.15,.14,.093,.005],p.coat);tube(tail,[[0,.09,.38],[0,.14,.47],[0,.20,.56],[0,.23,.65]],[.142,.126,.093,.005],p.cream);for(let j=0;j<4;j++)blade(tail,[.07*Math.sin(j*2),.1,.27+j*.05],[.11*Math.sin(j*2),.15,.42+j*.055],.04,p.coat)}
  if(kind==='cat'){tube(tail,[[0,0,0],[0,.06,.15],[0,.16,.26],[0,.32,.30],[0,.42,.25],[0,.45,.18]],[.052,.071,.083,.078,.055,.008],p.coat);for(let j=0;j<3;j++)ell(tail,0,.1+j*.10,.22+j*.035,.077,.022,.067,p.shade,type,[.4,0,0],true)}
  if(kind==='rabbit'){ell(tail,0,.025,.06,.108,.10,.105,p.cream);for(let j=0;j<4;j++)ell(tail,Math.sin(j*1.57)*.048,.04+Math.cos(j*1.57)*.038,.09,.064,.065,.065,p.cream,type,[],true)}
  if(kind==='deer'){ell(tail,0,.035,.073,.066,.046,.103,p.cream,type,[.42,0,0]);ell(tail,0,.066,.075,.060,.036,.089,p.coat)}
  if(kind==='dragon'){tube(tail,[[0,0,0],[0,.01,.17],[0,.06,.34],[0,.13,.46],[0,.22,.56]],[.105,.087,.059,.039,.009],p.coat,'scale');blade(tail,[0,.15,.43],[0,.29,.61],.07,p.accent,'plain');
   for(let sg of [-1,1]){let wing=group(rig,'wing'+sg,sg*.14,.48,.02),tip=group(wing,'tip',sg*.28,.15,.12);wings.push(wing);wingTips.push(tip);
    const points=[[0,0,0],[sg*.28,.15,.12],[sg*.48,.20,.22],[sg*.43,-.08,.37],[sg*.29,-.035,.28],[sg*.20,-.13,.25],[sg*.09,-.03,.14]],indices=[0,1,4,0,4,5,0,5,6,1,2,3,1,3,4];let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(v=>[Math.abs(v[0])*2,v[2]*2]),2));g.setIndex(indices);g.computeVertexNormals();append(wing,g,p.inner,'wing',[0,0,0],[1,1,1]);g.dispose();for(let i of [2,3,5])tube(wing,[points[0],points[1],points[i]],[.025,.017,.005],p.shade,'plain');ell(tip,0,0,0,.024,.024,.024,p.accent,'plain',[],true);}
  }
  // Modest fantasy details: collars, flower clasp and pendant. No excessive draw calls.
  const adorn=group(body,'adorn',0,h+.035,-len*.62);
  if(kind==='cat'||kind==='dragon'){ell(adorn,0,.03,-.012,w*.70,.018,.10,p.accent,'plain',[.15,0,0]);ell(adorn,0,-.015,-.101,.025,.029,.011,0xd4b57a,'plain',[],true)}
  if(kind==='cat'){for(let j=0;j<5;j++){let a=j*6.283/5;ell(adorn,Math.cos(a)*.019,Math.sin(a)*.019,-.111,.015,.012,.008,0xffedcf,'plain',[0,0,a],true)}ell(adorn,0,0,-.12,.010,.011,.008,0xd3aa62,'plain',[],true)}
  if(kind==='dragon'){blade(adorn,[0,-.015,-.13],[0,-.10,-.14],.038,0x9d6bc0,'plain')}
  for(let a of layers.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.P,3));g.setAttribute('normal',new T.Float32BufferAttribute(a.N,3));g.setAttribute('color',new T.Float32BufferAttribute(a.C,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.U,2));g.setIndex(a.I);g.computeBoundingSphere();const m=new T.Mesh(g,r.materials[a.material]);m.castShadow=false;m.receiveShadow=false;a.parent.add(m)}
  root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(root,true);rig.position.y=-bounds.min.y;rig.userData.floor=rig.position.y;root.userData.kind=kind;root.visible=false;return root;
 }
 function bind(root){const find=n=>root.getObjectByName(n),kind=root.userData.kind;return {kind,root,rig:find('rig'),body:find('body'),head:find('head'),tail:find('tail'),paws:[0,1,2,3].map(i=>find('leg'+i)),knees:[0,1,2,3].map(i=>find('leg'+i).getObjectByName('knee')),eyes:['eyeL','eyeR'].map(find),ears:['earL','earR'].map(find),wings:[-1,1].map(i=>find('wing'+i)).filter(Boolean),nose:find('nose'),muzzle:find('muzzle'),fantasy116:true,clock:0,weight:0,phase:0,reaction:0}}
 function create(T,kind){const r=resources(T);if(!r.templates.has(kind))r.templates.set(kind,asset(T,kind));return bind(r.templates.get(kind).clone(true))}
 function react(a){if(a?.fantasy116)a.reaction=1}
 function animate(a,speed,dt,time){dt=clamp(dt/1000,0,.1);speed=Number.isFinite(speed)?clamp(speed,0,5):0;a.clock+=dt;let t=a.clock+(Number.isFinite(time)?Math.sin(time*.1)*.05:0),kind=a.kind;
  a.weight=mix(a.weight,clamp(speed/1.05),1-Math.exp(-dt*8));let w=a.weight,idle=1-w,run=clamp((speed-1.4)/1.8);
  a.phase=(a.phase+dt*(kind==='rabbit'?4.8+speed*4.1:kind==='deer'?2.5+speed*3.1:3.2+speed*3.6))%6.2831853;let p=a.phase,hop=Math.max(0,Math.sin(p)),breath=Math.sin(t*(kind==='deer'?2.1:3)),r=a.reaction||0;a.reaction=Math.max(0,r-dt*.95);let joy=Math.sin(r*Math.PI),lift=kind==='rabbit'?hop*.11*w:.008*Math.sin(p*2)*w;
  a.body.scale.set(1+.014*breath*idle,1+.021*breath*idle,1+.012*breath*idle);
  a.head.rotation.set(idle*(.045*Math.sin(t*1.1))+.035*Math.sin(p)*w-joy*.16,idle*.15*Math.sin(t*.73),idle*.05*Math.sin(t*.9));
  a.tail.rotation.set(.08*Math.sin(p)*w+.05*joy,.15*Math.sin(t*(kind==='cat'?2.1:1.6))*(.45+w)+.22*joy*Math.sin(t*10),.06*Math.sin(t*1.3));
  let blink=Math.max(0,1-Math.abs((t%4.7)-4.45)/.12);for(const e of a.eyes)e.scale.y=1-.94*blink;
  for(let i=0;i<2;i++){let sg=i?1:-1,e=a.ears[i];e.rotation.x=.06*Math.sin(t*2.7+i)*idle+.14*Math.sin(p+i)*w-.13*joy;e.rotation.z=sg*(kind==='rabbit'?.08:.025)+.05*Math.sin(t*1.7+i)*idle}
  const lick=kind==='cat'?Math.max(0,Math.sin((t%12-8)*Math.PI/2))*(t%12>8&&t%12<10?1:0)*idle:0;
  for(let i=0;i<4;i++){let rear=i%2===1,phase=kind==='rabbit'?(rear?.25:Math.PI):(i===0||i===3?0:Math.PI),cycle=Math.sin(p+phase),swing=(kind==='deer'?.36:kind==='rabbit'?.62:.43)+run*.22;
   a.paws[i].rotation.x=cycle*swing*w+(kind==='cat'&&i===0?-.8*lick:0);a.knees[i].rotation.x=Math.max(0,-cycle)*(.35+run*.25)*w*(rear?-1:1)+(kind==='cat'&&i===0?.65*lick:0)}
  if(kind==='rabbit'){a.nose.scale.set(1+.09*Math.sin(t*15)*idle,1+.11*Math.sin(t*13)*idle,1);a.head.rotation.x+=.035*Math.sin(t*9)*idle;a.tail.rotation.x+=hop*.17*w}
  if(kind==='fox'){a.head.rotation.z+=.11*Math.sin(t*.6)*idle;a.tail.rotation.y+=.15*Math.sin(t*.9)}
  if(kind==='cat'){a.head.rotation.x+=lick*.36;a.head.rotation.z-=lick*.16;a.tail.rotation.y+=.24*Math.sin(t*1.5)*idle}
  if(kind==='deer'){a.head.rotation.x+=.15*Math.max(0,Math.sin(t*.36))*idle;a.ears[0].rotation.y=.16*Math.sin(t*1.8);a.ears[1].rotation.y=.14*Math.sin(t*1.8+1)}
  if(kind==='dragon'){for(let i=0;i<a.wings.length;i++){let sg=i?1:-1;a.wings[i].rotation.z=sg*(.13*Math.sin(t*2.4)+w*.19*Math.sin(p)+joy*.55);a.wings[i].rotation.y=sg*(.11*idle+.12*Math.sin(t*1.8))}a.head.rotation.x+=.05*Math.sin(t*1.3)}
  // Body stays grounded at rest; bounded lift for hopping/reaction only.
  a.rig.position.y=(a.rig.userData.floor||0)+Math.max(0,lift)+joy*(kind==='rabbit'||kind==='dragon'?.07:.025);return 0;
 }
 // V12.2: controller independent of geometry and rendering. Distances are world units.
 const followProfiles={rabbit:{walk:1.6,run:4.3,gap:1.05},fox:{walk:1.9,run:4.8,gap:1.25},cat:{walk:1.65,run:4.2,gap:1.05},deer:{walk:2.0,run:5.0,gap:1.5},dragon:{walk:1.8,run:4.6,gap:1.35}};
 function follower(){return {speed:0,side:1,idle:0,mode:'idle',blocked:0}}
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function followTarget(kind,owner,heading,side=1){
  const gap=(followProfiles[kind]||followProfiles.fox).gap;
  return {x:owner.x-Math.cos(heading)*gap*side+Math.sin(heading)*.65,z:owner.z-Math.sin(heading)*gap*side+Math.cos(heading)*.65};
 }
 function safeSpawn(kind,owner,heading,walkable){
  for(const side of [1,-1]){const p=followTarget(kind,owner,heading,side);if(walkable(p.x,p.z))return p;}
  for(const radius of [1,1.6,2.2])for(let i=0;i<8;i++){const a=heading+i*Math.PI/4,p={x:owner.x+Math.cos(a)*radius,z:owner.z+Math.sin(a)*radius};if(walkable(p.x,p.z))return p;}
  return walkable(owner.x,owner.z)?{...owner}:null;
 }
 function followStep(state,kind,pos,owner,heading,dt,ownerSpeed,command,walkable,segment){
  dt=Number.isFinite(dt)?clamp(dt,0,.05):0;const cfg=followProfiles[kind]||followProfiles.fox;
  const stop=command==='wait',gap=dist(pos,owner);
  state.idle=ownerSpeed<.12?state.idle+dt:0;
  let target=followTarget(kind,owner,heading);
  if(!walkable(target.x,target.z)){const other=followTarget(kind,owner,heading,-1);target=walkable(other.x,other.z)?other:{...owner};}
  const len=dist(pos,target),want=stop||len<.22?0:Math.min(gap>2.5||ownerSpeed>2.4?cfg.run:cfg.walk,len*2.8+Math.max(0,ownerSpeed)*.6);
  state.speed=mix(state.speed||0,want,1-Math.exp(-dt/(want>state.speed?.23:.14)));
  if(stop||len<.10||!dt){state.speed=stop?0:state.speed;state.mode=stop?'wait':'idle';return {...pos,speed:0,mode:state.mode};}
  const step=Math.min(len,state.speed*dt),a=Math.atan2(target.z-pos.z,target.x-pos.x);
  // Check direct segment, then a bounded detour; never snap through a wall.
  const offsets=[0,state.side*.65,-state.side*.65,state.side*1.15,-state.side*1.15];
  for(const offset of offsets){
   const candidate={x:pos.x+Math.cos(a+offset)*step,z:pos.z+Math.sin(a+offset)*step};
   if(!walkable(candidate.x,candidate.z)||!segment(pos,candidate))continue;
   if(offset)state.side=Math.sign(offset);state.blocked=0;
   const actual=dist(pos,candidate)/dt;state.mode=actual>.2?(actual>2?'run':'walk'):'idle';
   return {...candidate,speed:actual,mode:state.mode};
  }
  state.blocked+=dt;state.speed*=Math.exp(-dt*8);state.mode='blocked';return {...pos,speed:0,mode:state.mode};
 }
 const api={KINDS,create,bind,animate,react,followProfiles,follower,followTarget,safeSpawn,followStep};if(typeof module!=='undefined')module.exports=api;else global.WWCreatures=api;
})(typeof globalThis!=='undefined'?globalThis:this);

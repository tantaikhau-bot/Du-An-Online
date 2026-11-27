/* WISH WORLD V15.0 — Fantasy creature assets.
 * Five independent authored shape recipes, reusable articulated mesh templates.
 * Original stylized geometry, no network model dependency. MIT-style project code.
 * Forward -Z, floor Y=0. Root is gameplay position, visual rig is separate. */
(function(global){
 const KINDS=['rabbit','fox','cat','deer','dragon'];
 const palettes={
  rabbit:{coat:0xece3de,shade:0xbab0c6,cream:0xfff6ed,inner:0xe4a4b4,iris:0x8155a5,accent:0x9b87ce},
  fox:{coat:0xe88a48,shade:0x81412e,cream:0xffecd2,inner:0xba766c,iris:0xffc569,accent:0xc7964e},
  cat:{coat:0xa4b5c2,shade:0x536b83,cream:0xf4eee5,inner:0xd3a3b6,iris:0x62c8c2,accent:0x607ac4},
  deer:{coat:0xc5a071,shade:0x795b48,cream:0xffefd0,inner:0xc68e83,iris:0x6a8b69,accent:0x6caa81},
  dragon:{coat:0x79b3c3,shade:0x3d6d98,cream:0xf7dfae,inner:0x9989ca,iris:0xe5c260,accent:0x78d2dc}
 };
 const cache=new WeakMap(),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
 function resources(T){let r=cache.get(T);if(r)return r;
  // Small shared procedural hand-painted-style maps. No per-frame texture generation.
  function surface(scales){const n=128,bytes=new Uint8Array(n*n*4),tone=new Uint8Array(n*n*4);
   for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n;
    const wave=Math.sin((u*18+.32*Math.sin(v*12.566))*6.2831853),fine=Math.sin((u*37+.16*Math.sin(v*25.13))*6.2831853);
    const sx=(u*12+(Math.floor(v*16)%2)*.5)%1,sy=(v*16)%1;
    const scale=Math.max(0,1-Math.hypot((sx-.5)*1.45,(sy-.42)*1.15)*1.7),grain=Math.sin((u*53+v*29)*6.2831853)*Math.sin((u*17-v*61)*6.2831853);
    const relief=scales?scale*.8+grain*.06:wave*.36+fine*.20+grain*.12;
    const lum=scales?(.73+.24*scale+.035*grain):(.89+.055*wave+.027*fine+.025*grain);
    const k=Math.max(0,Math.min(255,Math.round(128+relief*75))),a=Math.max(0,Math.min(255,Math.round(lum*255))),i=(y*n+x)*4;bytes.set([k,k,k,255],i);tone.set([a,a,a,255],i)}
   const tex=data=>{const t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t};
   return {bump:tex(bytes),map:tex(tone)}
  }
  const fur=surface(false),scales=surface(true);
  const mat=(rough,reflect=0.15,maps=null,strength=0)=>new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:rough,metalness:0,clearcoat:0,ior:1.33,specularIntensity:reflect,envMapIntensity:.09,map:maps?.map||null,bumpMap:maps?.bump||null,bumpScale:strength,side:T.DoubleSide});
  r={sphere:new T.SphereGeometry(1,20,16),small:new T.SphereGeometry(1,12,10),materials:{fur:mat(1,.08,fur,.021),scale:mat(.91,.16,scales,.016),plain:mat(.97,.09),eye:mat(.50,.35),wing:mat(.97,.08)},templates:new Map()};cache.set(T,r);return r}
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
    const surface=material==='fur'||material==='scale',grain=Math.sin(tmp.x*43+tmp.z*27+tmp.y*53)*Math.sin(tmp.z*65-tmp.y*31),gradient=surface?(.81+.13*normal.y+.10*Math.sin(tmp.z*6+tmp.y*3)+.045*grain):1;
    const warm=surface?Math.max(0,normal.y)*.025:0;a.C.push(clamp(col.r*gradient+warm),clamp(col.g*gradient+warm*.65),clamp(col.b*gradient+warm*.28));}
   if(geo.index)for(let i=0;i<geo.index.count;i++)a.I.push(start+geo.index.getX(i));else for(let i=0;i<pos.count;i++)a.I.push(start+i);
  }
  function ell(parent,x,y,z,rx,ry,rz,c,mat=type,rot=[0,0,0],tiny=false){append(parent,tiny?r.small:r.sphere,c,mat,[x,y,z],[rx,ry,rz],rot)}
  function tube(parent,pts,radii,c,mat=type,N=10){
   const P=[],U=[],I=[];for(let j=0;j<pts.length;j++){const a=new T.Vector3(...pts[j]),prev=new T.Vector3(...pts[Math.max(0,j-1)]),next=new T.Vector3(...pts[Math.min(pts.length-1,j+1)]),t=next.sub(prev).normalize();let axis=new T.Vector3(0,1,0);if(Math.abs(axis.dot(t))>.9)axis.set(1,0,0);const u=axis.cross(t).normalize(),v=t.clone().cross(u).normalize();let rad=Array.isArray(radii[j])?radii[j]:[radii[j],radii[j]];
    for(let i=0;i<=N;i++){let q=i/N*6.2831853,pt=a.clone().addScaledVector(u,Math.cos(q)*rad[0]).addScaledVector(v,Math.sin(q)*rad[1]);P.push(...pt.toArray());U.push(i/N,j/(pts.length-1));if(j&&i<N){let k=j*(N+1)+i,h=k-N-1;I.push(h,k,h+1,k,k+1,h+1)}}}
   let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();append(parent,g,c,mat,[0,0,0],[1,1,1]);g.dispose();
  }
  function blade(parent,a,b,width,c,mat=type){let A=new T.Vector3(...a),B=new T.Vector3(...b),D=B.clone().sub(A),m=A.clone().lerp(B,.4),rot=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),D.clone().normalize()));ell(parent,...m.toArray(),width,D.length()*.66,width*.65,c,mat,rot.toArray().slice(0,3),true)}
  const dims={rabbit:[.28,.21,.25,.49,-.19,.195,.18,.155],fox:[.45,.145,.39,.60,-.36,.14,.135,.17],cat:[.38,.145,.32,.51,-.27,.16,.143,.145],deer:[.77,.16,.41,1.12,-.34,.118,.14,.17],dragon:[.43,.21,.33,.64,-.29,.205,.18,.19]}[kind];
  const [h,w,len,hy,hz,hx,hh,hd]=dims,head=group(rig,'head',0,hy,hz),tail=group(rig,'tail',0,h,len*.83);
  const paws=[],knees=[],ears=[],eyes=[],wings=[],wingTips=[];
  // Each species has its own body proportions and silhouette.
  // Continuous tapered torso profile; distinct chest, belly and rump.
  const bodyProfile={rabbit:[.65,.91,1,.94,.59],fox:[.62,1,.76,.95,.55],cat:[.56,.92,.73,.98,.52],deer:[.56,1,.72,.90,.48],dragon:[.68,.98,1,.87,.49]}[kind];
  const ys=[h*.92,h,h*.99,h*.98,h*.96],zs=[-len,-len*.63,0,len*.63,len];
  tube(body,zs.map((z,i)=>[0,ys[i],z]),bodyProfile.map((v,i)=>[w*v,h*.39*v]),p.coat,type,24);
  ell(body,0,h*.92,-len,w*.65,h*.23,len*.22,p.coat);
  ell(body,0,h*.96,len,w*.59,h*.25,len*.20,p.coat);
  if(kind==='rabbit'){ell(body,0,.24,.075,.22,.215,.255,p.coat);ell(body,0,.27,-.095,.18,.18,.174,p.coat);for(let sg of [-1,1])ell(body,sg*.145,.21,.17,.12,.145,.16,p.coat);ell(body,0,.23,-.161,.116,.127,.102,p.cream)}
  if(kind==='fox'){ell(body,0,.44,-.19,.15,.18,.23,p.coat);ell(body,0,.44,.24,.145,.16,.17,p.coat);ell(body,0,.37,-.24,.117,.15,.15,p.cream);for(let sg of [-1,1])for(let j=0;j<4;j++)blade(body,[sg*.085,.47,-.25+j*.045],[sg*.16,.32,-.25+j*.06],.046,j%2?p.coat:p.cream)}
  if(kind==='cat'){ell(body,0,.38,-.14,.14,.15,.24,p.coat);ell(body,0,.36,.18,.145,.16,.21,p.coat);ell(body,0,.30,-.19,.100,.12,.105,p.cream);for(let sg of [-1,1])for(let i=0;i<4;i++)ell(body,sg*.148,.40,.12-i*.07,.014,.065,.025,p.shade,type,[.2,0,sg*.25],true)}
  if(kind==='deer'){tube(body,[[0,.71,-.22],[0,.86,-.28],[0,1.00,-.34],[0,1.12,-.34]],[.12,.105,.083,.066],p.coat);ell(body,0,.83,-.28,.085,.22,.10,p.cream);for(let sg of [-1,1])for(let i=0;i<9;i++){let z=-.04+(i%5)*.073,y=.73+Math.floor(i/5)*.071,x=sg*w*Math.sqrt(Math.max(.1,1-((y-h)/(.276))**2-(z/len)**2));ell(body,x,y,z,.012,.021,.034,p.cream,'plain',[0,0,sg*.13],true)}}
  if(kind==='dragon'){ell(body,0,.40,-.14,.18,.23,.21,p.cream);for(let i=0;i<6;i++)blade(body,[0,.55,.02+i*.065],[0,.73-i*.014,.05+i*.07],.06,p.shade,'scale');for(let sg of [-1,1])for(let i=0;i<5;i++)blade(body,[sg*.13,.43,.08+i*.038],[sg*.21,.49,.11+i*.045],.028,p.shade,'scale');for(let i=0;i<5;i++)ell(body,0,.22+i*.046,-.264+Math.abs(i-2)*.008,.112+i*.009,.018,.015,0xd8bfa7,'plain',[],true);for(let i=0;i<5;i++)blade(body,[0,.51,.02+i*.071],[0,.64-i*.016,.055+i*.075],.045,p.shade,'scale')}
  ell(head,0,0,0,hx,hh,hd,p.coat);
  if(kind!=='dragon'){for(let sg of [-1,1]){const fluffy=kind==='fox'?1.2:kind==='rabbit'?1.05:kind==='cat'?.85:.55;for(let i=0;i<4;i++){let y=-hh*.30+i*.024,z=.035+i*.014,x=sg*hx*.76;blade(head,[x,y,z],[sg*(hx+.026*fluffy),y-.045*fluffy,z+.048*fluffy],.024*fluffy,i%2?p.coat:p.cream)}}}
  else{for(let sg of [-1,1])for(let i=0;i<3;i++){blade(head,[sg*.14,.045+i*.032,.035],[sg*(.20+i*.015),.02+i*.04,.105],.038-i*.006,p.shade,'scale')}}
  let muzzle=group(head,'muzzle',0,-hh*.35,-hd*.75),nose=group(muzzle,'nose',0,.02,kind==='fox'?-.151:-.066);
  if(kind==='fox'){tube(muzzle,[[0,0,.025],[0,-.01,-.035],[0,0,-.10],[0,.01,-.145]],[[.085,.073],[.09,.063],[.055,.044],[.034,.027]],p.cream);for(let sg of [-1,1])for(let j=0;j<3;j++)blade(head,[sg*.10,-.02,.00],[sg*(.19-j*.012),-.07-j*.027,.07+j*.025],.042,p.cream)}
  else if(kind==='deer'){ell(muzzle,0,0,-.035,.085,.065,.12,p.cream);nose.position.z=-.13}
  else if(kind==='dragon'){ell(muzzle,0,-.005,-.038,.126,.078,.114,p.cream);nose.position.z=-.11;for(let sg of [-1,1])ell(muzzle,sg*.044,.04,-.10,.012,.008,.014,p.shade,'plain',[],true)}
  else {for(let sg of [-1,1])ell(muzzle,sg*.041,0,-.023,.059,.047,.052,p.cream);ell(muzzle,0,-.036,-.021,.055,.027,.045,p.cream)}
  if(kind!=='dragon')ell(nose,0,0,0,kind==='fox'?.035:.027,.021,.022,kind==='rabbit'||kind==='cat'?0xa86b6b:0x382a2a,'eye',[],true);
  if(kind==='rabbit'){ell(muzzle,0,-.038,-.056,.021,.006,.006,0x987b73,'plain',[],true);for(let sg of [-1,1])ell(head,sg*.095,-.058,-.088,.034,.025,.016,0xe8b9c1,'plain',[0,sg*.4,0],true)}
  for(let sg of [-1,1]){
   const e=group(head,sg<0?'eyeL':'eyeR',sg*hx*.67,hh*.16,-hd*.66);e.rotation.y=sg*-.72;eyes.push(e);let ex=kind==='cat'||kind==='dragon'?.045:kind==='rabbit'?.047:.036,ey=ex*(kind==='fox'?.78:1.07);
   ell(e,0,0,0,ex*1.17,ey*1.17,.012,p.shade,'plain');ell(e,0,0,-.009,ex,ey,.012,0x332b31,'eye');ell(e,0,-.001,-.017,ex*.82,ey*.89,.007,p.iris,'eye');ell(e,0,-.002,-.022,ex*(kind==='cat'?.40:.67),ey*.83,.004,0x211f29,'eye');ell(e,-.008,.010,-.026,.006,.007,.002,0xfff7e9,'plain',[],true);
   let ear=group(head,sg<0?'earL':'earR',sg*hx*.70,hh*.72,.025);ears.push(ear);
   if(kind==='rabbit'){tube(ear,[[0,0,0],[sg*.016,.075,0],[sg*.044,.22,.02],[sg*.067,.33,.035],[sg*.078,.365,.045]],[[.035,.025],[.052,.028],[.051,.021],[.024,.012],[.004,.004]],p.coat);ell(ear,sg*.039,.18,-.024,.031,.146,.012,p.inner,'plain',[.09,0,-sg*.16]);}
   else if(kind==='deer'){ell(ear,sg*.057,.05,0,.10,.047,.027,p.coat,type,[0,0,sg*.45]);ell(ear,sg*.062,.051,-.021,.076,.027,.009,p.inner,'plain',[0,0,sg*.45]);const horn=group(head,'antler'+sg,sg*.064,hh*.80,.036);tube(horn,[[0,0,0],[sg*.035,.10,0],[sg*.07,.20,.02],[sg*.10,.36,.04]],[.022,.018,.012,.004],0xa48259,'plain');for(let j=0;j<2;j++)tube(horn,[[sg*.035*(j+1),.10+j*.09,.02],[sg*(.10+j*.04),.16+j*.11,.015],[sg*(.16+j*.06),.25+j*.13,.01]],[.014,.009,.003],0xa48259,'plain')}
   else if(kind==='dragon'){tube(ear,[[0,0,0],[sg*.045,.07,.02],[sg*.10,.08,.06]],[.047,.038,.006],p.coat,'scale');tube(head,[[sg*.085,.11,.04],[sg*.105,.20,.095],[sg*.145,.32,.19]],[.035,.025,.004],0xe9d5a4,'plain')}
   else {tube(ear,[[0,0,0],[sg*.025,.074,.006],[sg*.041,kind==='fox'?.17:.135,.015]],[[.069,.042],[.048,.028],[.003,.004]],p.shade);tube(ear,[[0,.013,-.026],[sg*.025,.073,-.021],[sg*.039,kind==='fox'?.143:.11,.006]],[[.042,.012],[.028,.009],[.003,.003]],p.inner,'plain')}
   if(kind==='cat'||kind==='rabbit'||kind==='fox'){for(let i=0;i<2;i++)tube(muzzle,[[sg*.068,-.015,-.07],[sg*.128,-.013-i*.025,-.075],[sg*.185,-.008-i*.033,-.067]],[.0025,.0019,.0008],p.cream,'plain',5)}
   if(kind==='cat')for(let i=0;i<2;i++)ell(head,sg*(.11+i*.018),.025+i*.036,-.079,.028,.010,.025,p.shade,type,[0,sg*.45,sg*.45],true);
  }
  // Tapered clumps break the round silhouette of fur; grouped in existing geometry batches.
  if(kind==='fox'||kind==='rabbit'||kind==='cat'){for(let sg of [-1,1])for(let i=0;i<5;i++){const z=-len*.58+i*.055,y=h+.075-i*.014;blade(body,[sg*w*.68,y,z],[sg*w*.99,y-.055,z+.09],kind==='fox'?.038:.026,i%2?p.coat:p.shade)}}
  // Distinct silhouette motifs: broad moon tufts, flame ruff, feline ear tufts, leaf antlers, dragon cheek fins.
  for(const sg of [-1,1]){
   if(kind==='rabbit'){for(let i=0;i<3;i++)blade(head,[sg*.13,-.03+i*.035,.03],[sg*(.23-i*.018),-.09+i*.04,.09],.033,p.cream)}
   if(kind==='fox'){for(let i=0;i<5;i++)blade(body,[sg*.09,h+.10,-.26+i*.038],[sg*(.19+i*.007),h-.09,-.19+i*.05],.045,i<3?p.cream:p.coat)}
   if(kind==='cat'){blade(head,[sg*.12,.12,.035],[sg*.17,.22,.06],.025,p.shade);for(let i=0;i<3;i++)blade(head,[sg*.115,-.06+i*.025,.035],[sg*.18,-.09+i*.022,.10],.025,p.coat)}
   if(kind==='deer'){for(let i=0;i<3;i++){let y=.21+i*.045;blade(head,[sg*.10,y,.025],[sg*(.19+i*.021),y+.09,.07],.020,p.accent,'plain')}}
   if(kind==='dragon'){for(let i=0;i<4;i++)blade(head,[sg*.135,.025+i*.032,.025],[sg*(.25-i*.012),.045+i*.038,.10],.04-i*.005,p.shade,'scale')}
  }
  // Articulated fore and hind legs, not one rigid straight cylinder.
  for(let sg of [-1,1])for(let back of [-1,1]){
   const L=kind==='deer'?.70:kind==='rabbit'?.21:kind==='dragon'?.32:kind==='fox'?.36:.29;
   const hip=group(rig,'leg'+paws.length,sg*w*.72,L+.035,back*len*.69),knee=group(hip,'knee',0,-L*.52,back===1?.024:0);paws.push(hip);knees.push(knee);
   const rad=kind==='deer'?.038:kind==='rabbit'&&back===1?.115:kind==='dragon'?.084:.055;
   ell(hip,0,-L*.10,back===1?.023:0,rad*1.18,L*.46,rad*1.12,p.coat);
   tube(hip,[[0,L*.07,0],[0,-L*.15,0],[0,-L*.35,0],[0,-L*.58,back===1?.024:0]],[rad,rad*.89,rad*.73,rad*.60],p.coat);
   ell(knee,0,.005,0,rad*.61,Math.max(.025,L*.13),rad*.61,kind==='fox'?p.shade:p.coat);tube(knee,[[0,.015,0],[0,-L*.26,0],[0,-L*.48,0]],[rad*.61,rad*.53,rad*.48],kind==='fox'?p.shade:p.coat);
   ell(knee,0,-L*.48,-rad*.47,rad*.84,.035,rad*(kind==='rabbit'&&back===1?1.65:1.15),kind==='deer'?0x47342e:kind==='fox'?p.shade:p.cream,'plain');
  }
  if(kind==='fox'){tube(tail,[[0,0,0],[0,.025,.14],[0,.06,.29],[0,.14,.46],[0,.25,.64],[0,.29,.76]],[.065,.145,.19,.18,.12,.005],p.coat);tube(tail,[[0,.13,.44],[0,.18,.55],[0,.25,.64],[0,.29,.76]],[.18,.153,.12,.005],p.cream);for(let j=0;j<4;j++)blade(tail,[.07*Math.sin(j*2),.1,.27+j*.05],[.11*Math.sin(j*2),.15,.42+j*.055],.04,p.coat)}
  if(kind==='cat'){tube(tail,[[0,0,0],[0,.06,.15],[0,.16,.26],[0,.32,.34],[0,.49,.32],[0,.56,.20]],[.045,.06,.07,.063,.045,.008],p.coat);for(let j=0;j<3;j++)ell(tail,0,.1+j*.10,.22+j*.035,.077,.022,.067,p.shade,type,[.4,0,0],true)}
  if(kind==='rabbit'){ell(tail,0,.025,.06,.108,.10,.105,p.cream);for(let j=0;j<4;j++)ell(tail,Math.sin(j*1.57)*.048,.04+Math.cos(j*1.57)*.038,.09,.064,.065,.065,p.cream,type,[],true)}
  if(kind==='deer'){ell(tail,0,.035,.073,.066,.046,.103,p.cream,type,[.42,0,0]);ell(tail,0,.066,.075,.060,.036,.089,p.coat)}
  if(kind==='dragon'){tube(tail,[[0,0,0],[0,.01,.17],[0,.06,.34],[0,.15,.55],[0,.31,.75]],[.105,.087,.059,.039,.009],p.coat,'scale');blade(tail,[0,.24,.64],[0,.40,.80],.085,p.accent,'plain');
   for(let sg of [-1,1]){let wing=group(rig,'wing'+sg,sg*.14,.48,.02),tip=group(wing,'tip',sg*.28,.15,.12);wings.push(wing);wingTips.push(tip);
    const points=[[0,0,0],[sg*.28,.15,.12],[sg*.68,.30,.24],[sg*.61,-.06,.47],[sg*.40,-.025,.36],[sg*.25,-.17,.31],[sg*.09,-.03,.14]],indices=[0,1,4,0,4,5,0,5,6,1,2,3,1,3,4];let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(v=>[Math.abs(v[0])*2,v[2]*2]),2));g.setIndex(indices);g.computeVertexNormals();append(wing,g,p.inner,'wing',[0,0,0],[1,1,1]);g.dispose();for(let i of [2,3,5])tube(wing,[points[0],points[1],points[i]],[.025,.017,.005],p.shade,'plain');ell(tip,0,0,0,.024,.024,.024,p.accent,'plain',[],true);}
  }
  // Modest fantasy details: collars, flower clasp and pendant. No excessive draw calls.
  const adorn=group(body,'adorn',0,h+.035,-len*.62);
  if(kind==='cat'||kind==='dragon'){ell(adorn,0,.03,-.012,w*.70,.018,.10,p.accent,'plain',[.15,0,0]);ell(adorn,0,-.015,-.101,.025,.029,.011,0xd4b57a,'plain',[],true)}
  if(kind==='cat'){for(let j=0;j<5;j++){let a=j*6.283/5;ell(adorn,Math.cos(a)*.019,Math.sin(a)*.019,-.111,.015,.012,.008,0xffedcf,'plain',[0,0,a],true)}ell(adorn,0,0,-.12,.010,.011,.008,0xd3aa62,'plain',[],true)}
  if(kind==='dragon'){blade(adorn,[0,-.015,-.13],[0,-.10,-.14],.038,0x80d8d5,'plain');blade(head,[0,.11,-.12],[0,.065,-.18],.026,0xe7cb81,'plain')}
  if(kind==='rabbit'){blade(adorn,[0,.06,-.09],[0,-.025,-.12],.025,0xb9a1df,'plain')}
  if(kind==='fox'){blade(head,[0,.11,-.12],[0,.047,-.16],.021,0xffe6b2,'plain')}
  if(kind==='deer'){for(let sg of [-1,1]){blade(adorn,[sg*.015,.03,-.09],[sg*.076,.085,-.10],.026,0x73ad81,'plain');ell(adorn,sg*.055,.065,-.112,.017,.014,.012,0xe7cb81,'plain',[],true)}}
  // Small decorative gems, not whole-body emission.
  const jewelColor={rabbit:0xd9c5ff,fox:0xffbb66,cat:0x9be5ff,deer:0xa6e2ac,dragon:0x74d9f2}[kind];
  blade(head,[0,hh*.62,-hd*.82],[0,hh*.14,-hd*1.04],.025,jewelColor,'plain');
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
  if(kind==='rabbit'){const spring=Math.sin(p);a.body.scale.y*=1+.095*spring*w;a.body.scale.z*=1-.055*spring*w}
  if(kind==='fox'){a.body.rotation.y=.05*Math.sin(p)*w;a.tail.rotation.y+=.15*Math.sin(p-.8)*w}
  if(kind==='cat'){a.body.rotation.z=.055*Math.sin(p)*w;a.head.rotation.y+=.08*Math.sin(t*1.45)*idle}
  if(kind==='deer'){a.body.rotation.x=.035*Math.sin(p)*w}
  if(kind==='dragon'){a.body.rotation.x=.045*Math.sin(p)*w;for(let i=0;i<a.wings.length;i++){let sg=i?1:-1;a.wings[i].rotation.z=sg*(.13*Math.sin(t*2.4)+w*.19*Math.sin(p)+joy*.55);a.wings[i].rotation.y=sg*(.11*idle+.12*Math.sin(t*1.8))}a.head.rotation.x+=.05*Math.sin(t*1.3)}
  // Body stays grounded at rest; bounded lift for hopping/reaction only.
  a.rig.position.y=(a.rig.userData.floor||0)+Math.max(0,lift)+joy*(kind==='rabbit'||kind==='dragon'?.07:.025);return 0;
 }
 // V15.0: one local companion, one GPU point batch, no dynamic lights.
 const ELEMENTS150=Object.freeze({rabbit:{name:'Nguyệt quang',color:0xd6b5ff,shape:0},fox:{name:'Hỏa linh',color:0xffa34b,shape:1},cat:{name:'Tinh vân',color:0x8edaff,shape:2},deer:{name:'Mộc linh',color:0x9be28c,shape:3},dragon:{name:'Lôi ngọc',color:0x7be9ef,shape:4}});
 function createVFX150(T,root,kind){
  const cfg=ELEMENTS150[kind],capacity=32,g=new T.BufferGeometry(),p=new Float32Array(capacity*3),size=new Float32Array(capacity),alpha=new Float32Array(capacity);
  for(const [k,v,n] of [['position',p,3],['aSize',size,1],['aAlpha',alpha,1]])g.setAttribute(k,new T.BufferAttribute(v,n).setUsage(T.DynamicDrawUsage));
  g.setDrawRange(0,0);
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.NormalBlending,uniforms:{uColor:{value:new T.Color(cfg.color)},uShape:{value:cfg.shape},uHeight:{value:720}},vertexShader:`
   attribute float aSize;attribute float aAlpha;varying float vAlpha;
   uniform float uHeight;
   void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uHeight/max(1.0,-mv.z),2.0,44.0);vAlpha=aAlpha;}
  `,fragmentShader:`
   uniform vec3 uColor;uniform float uShape;varying float vAlpha;
   void main(){vec2 p=gl_PointCoord*2.0-1.0;float d=length(p),shape=0.0;
    if(uShape<0.5){shape=1.0-smoothstep(.20,.85,abs(p.x)+abs(p.y));}
    else if(uShape<1.5){shape=1.0-smoothstep(.16,.85,length(vec2(p.x*1.5,p.y+.23)));shape*=smoothstep(-1.,-.35,p.y);}
    else if(uShape<2.5){shape=max((1.0-smoothstep(.055,.19,abs(p.x)))*(1.0-smoothstep(.1,.9,abs(p.y))),(1.0-smoothstep(.055,.19,abs(p.y)))*(1.0-smoothstep(.1,.9,abs(p.x))));}
    else if(uShape<3.5){vec2 q=vec2((p.x+p.y)*.707,(p.y-p.x)*.707);shape=1.0-smoothstep(.32,.91,length(vec2(q.x*2.0,q.y))); }
    else {float bolt=abs(p.x-.18*sin(p.y*7.));shape=(1.0-smoothstep(.08,.25,bolt))*(1.0-smoothstep(.4,.98,abs(p.y)));}
    float glow=exp(-d*d*5.0)*.22;float a=(shape*.85+glow)*vAlpha;if(a<.02)discard;gl_FragColor=vec4(mix(uColor,vec3(1.),shape*.38),a);}
  `});
  const points=new T.Points(g,m);points.name='elemental-vfx150';points.frustumCulled=false;root.add(points);return {points,g,p,size,alpha,m,clock:0,burst:0,acc:0,kind,capacity}
 }
 function updateVFX150(T,a,dt,speed,tier,height,trigger=false){
  if(!a?.root||!ELEMENTS150[a.kind])return 0;
  if(tier>=2){if(a.vfx150){a.vfx150.points.visible=false;a.vfx150.burst=0}return 0}
  const f=a.vfx150??=createVFX150(T,a.root,a.kind);f.points.visible=true;dt=clamp(dt/1000,0,.1);f.clock+=dt;f.acc+=dt;if(trigger)f.burst=1.35;f.burst=Math.max(0,f.burst-dt);
  if(f.acc<1/30&&!trigger)return f.g.drawRange.count;f.acc=0;const burst=f.burst/1.35,n=Math.min(f.capacity,(tier===0?16:8)+(burst>0?(tier===0?16:8):0)),moving=clamp(speed/2),t=f.clock,kind=a.kind;
  f.m.uniforms.uHeight.value=Math.max(240,Math.min(1440,height||720));
  for(let i=0;i<n;i++){const isBurst=i>=(tier===0?16:8),seed=(i*.61803398875)%1,life=isBurst?1-burst:(t*(kind==='fox'?1.1:.55)+seed)%1,angle=i*2.399963+t*(kind==='cat'?1.4:.7),radius=isBurst?.18+life*.95:.24+seed*.23;
   let x=Math.cos(angle)*radius,y=.10+life*.65,z=Math.sin(angle)*radius;
   if(kind==='rabbit'){y=.2+life*.85;x*=.85;z+=moving*life*.22}
   if(kind==='fox'){y=.10+life*.65;z=.25+life*(.45+moving*.5);x*=.62}
   if(kind==='cat'){y=.23+.32*Math.sin(angle*.7)+life*.20;z+=moving*.16}
   if(kind==='deer'){y=.32+life*.95;x*=1.05;z+=moving*.2}
   if(kind==='dragon'){y=.40+life*.55;x*=1.5;z+=.15+moving*.28}
   if(isBurst){x=Math.cos(angle)*radius;z=Math.sin(angle)*radius;y=.12+life*.85}
   const fade=isBurst?Math.sin(Math.PI*life):Math.sin(Math.PI*life)*(.44+moving*.21);
   f.p.set([x,y,z],i*3);f.size[i]=(kind==='deer'?.11:kind==='dragon'?.12:.085)*(1+.3*seed)*(isBurst?1.3:1);f.alpha[i]=fade;
  }
  f.g.setDrawRange(0,n);for(const k of ['position','aSize','aAlpha'])f.g.attributes[k].needsUpdate=true;return n
 }
 // V12.2: controller independent of geometry and rendering. Distances are world units.
 const followProfiles={rabbit:{walk:1.6,run:4.3,gap:1.05},fox:{walk:1.9,run:4.8,gap:1.25},cat:{walk:1.65,run:4.2,gap:1.05},deer:{walk:2.0,run:5.0,gap:1.5},dragon:{walk:1.8,run:4.6,gap:1.35}};
 function follower(){return {speed:0,side:1,idle:0,mode:'idle',blocked:0}}
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function followTarget(kind,owner,heading,side=1){
  const gap=(followProfiles[kind]||followProfiles.fox).gap;
  // Avatar forward is (-sin(heading), -cos(heading)); offset behind and to one side.
  return {x:owner.x+Math.sin(heading)*gap+Math.cos(heading)*.65*side,z:owner.z+Math.cos(heading)*gap-Math.sin(heading)*.65*side};
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
 // V13.5: optional cosmetic wellbeing; no starvation, reward multiplier, or loss of pets.
 const careRates135=Object.freeze({rabbit:5,fox:4,cat:3.5,deer:4.5,dragon:3});
 function careState135(raw,kind,now=Date.now()){
  raw=raw&&typeof raw==='object'?raw:{};
  const validTime=Number.isFinite(now)&&now>=0?now:0;
  const last=Number.isFinite(raw.updated)&&raw.updated>=0&&raw.updated<=validTime?raw.updated:validTime;
  const hours=Math.min(12,(validTime-last)/3600000),number=(k,d)=>Number.isFinite(raw[k])?clamp(raw[k],0,100):d;
  const mark=k=>Number.isFinite(raw[k])&&raw[k]>=0&&raw[k]<=validTime?raw[k]:0;
  return {fullness:Math.max(30,number('fullness',85)-hours*(careRates135[kind]||4)),energy:Math.min(100,number('energy',90)+hours*6),mood:Math.max(40,number('mood',80)-hours*2),updated:validTime,touchAt:mark('touchAt'),restAt:mark('restAt')};
 }
 function careAction135(raw,kind,action,now=Date.now()){
  const v=careState135(raw,kind,now);
  if(action==='feed'){v.fullness=Math.min(100,v.fullness+28);v.mood=Math.min(100,v.mood+8)}
  else if(action==='touch'&&(!v.touchAt||now-v.touchAt>=60000)){v.mood=Math.min(100,v.mood+12);v.touchAt=now}
  else if(action==='rest'&&(!v.restAt||now-v.restAt>=120000)){v.energy=Math.min(100,v.energy+24);v.restAt=now}
  return v;
 }
 function careTravel135(raw,kind,seconds,now=Date.now()){
  const v=careState135(raw,kind,now);v.energy=Math.max(35,v.energy-clamp(Number.isFinite(seconds)?seconds:0,0,60)*.09);return v;
 }
 const api={KINDS,ELEMENTS150,updateVFX150,create,bind,animate,react,followProfiles,follower,followTarget,safeSpawn,followStep,careState135,careAction135,careTravel135};if(typeof module!=='undefined')module.exports=api;else global.WWCreatures=api;
})(typeof globalThis!=='undefined'?globalThis:this);

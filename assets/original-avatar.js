/* WISH WORLD V11.5 — original procedural, skinned fantasy avatar workshop.
 * Original mesh geometry, no external avatar downloads. Stylized, not photorealistic.
 * All presets share a humanoid skeleton but have independently specified proportions,
 * facial geometry, hair silhouettes and garment profiles. */
(function(global){
 const designs={
 m1:[.98,1.00,1.00,1.02,.95,0,0,0x466b61,0x4a3025,0xc9a06b],
 m2:[1.13,.94,1.06,.91,1.05,1,1,0x425b86,0x252e43,0xc4d9e9],
 m3:[.91,1.08,.93,1.05,.96,2,2,0x6b9baf,0x7c8b9c,0xd8ede5],
 m4:[1.17,.96,1.10,1.04,1.08,3,3,0x8e392e,0x713322,0xe6ad6e],
 m5:[1.05,1.06,.99,.96,.97,4,4,0x3a3c51,0x231e37,0x9698b6],
 m6:[1.09,1.03,1.03,.90,1.10,5,1,0x61859f,0xc7d9e2,0xd2edf2],
 m7:[1.00,.96,.94,1.08,.91,6,5,0x426344,0x53442d,0xbacb84],
 m8:[1.08,1.12,1.05,1.01,1.00,7,6,0xbaa16e,0xc9ad68,0xffe6b2],
 m9:[1.15,.98,1.08,.87,1.11,8,3,0x33303e,0x24222c,0x8a849d],
 m10:[.94,1.04,.98,1.12,1.03,9,7,0x3d6a80,0x38505e,0xe1c98d],
 f1:[.89,1.00,.92,1.06,.98,10,8,0x929bc9,0x30324d,0xffe5be],
 f2:[.93,.95,.96,1.02,1.05,11,9,0x467f9e,0x456480,0xc0e9f3],
 f3:[.84,1.10,.92,1.14,.91,12,10,0xd7ab61,0xa76d45,0xf7e7b2],
 f4:[.96,1.06,.96,.96,1.04,13,11,0x796599,0x4e3b70,0xd8c3ed],
 f5:[.91,1.12,.91,.97,1.08,14,12,0xb3c9c9,0xd5e1df,0xf9f6e9],
 f6:[1.00,.97,1.02,1.09,1.01,15,13,0xb0536b,0x7b3c53,0xffbec9],
 f7:[.86,1.04,.90,1.04,.94,16,14,0x5e8867,0x324f3c,0xd0dfa6],
 f8:[.95,1.09,.95,.94,1.06,17,15,0x88b7ce,0xb9d9e5,0xe7faff],
 f9:[.92,1.02,.98,.89,1.10,18,16,0x42445f,0x28273b,0xb6bce7],
 f10:[.88,.94,.95,1.11,.96,19,17,0xc19449,0xa87a36,0xffe3a0]
 };
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function build(T,p){
  const d=designs[p.id]||designs.m1,[width,headH,depth,headW,chin,hairStyle,garment,clothColor,hairColor,accent]=d;
  const female=p.gender==='female',root=new T.Group(),nodes={},all=[];
  const skin=new T.MeshStandardMaterial({color:female?0xe6b697:0xd9a584,roughness:.88,side:T.DoubleSide});
  const cloth=new T.MeshStandardMaterial({color:clothColor,roughness:.96,metalness:0,side:T.DoubleSide});
  const dark=new T.MeshStandardMaterial({color:new T.Color(clothColor).multiplyScalar(.46),roughness:.92,side:T.DoubleSide});
  const trim=new T.MeshStandardMaterial({color:accent,roughness:.76,metalness:.04,side:T.DoubleSide});
  const hair=new T.MeshStandardMaterial({color:hairColor,roughness:.89});
  const eyesMat=new T.MeshStandardMaterial({color:0x282e3b,roughness:.65});
  const white=new T.MeshStandardMaterial({color:0xf1e8da,roughness:.83});
  const lip=new T.MeshStandardMaterial({color:0xa95e58,roughness:.9});
  function b(name,parent,x,y,z){const n=new T.Bone();n.name=name;n.position.set(x,y,z);(parent||root).add(n);nodes[name]=n;all.push(n);return n}
  const hips=b('hips',null,0,.82,0),spine=b('spine',hips,0,.14,0),chest=b('chest',spine,0,.18,0),upperChest=b('upperChest',chest,0,.08,0),neck=b('neck',upperChest,0,.105,0),head=b('head',neck,0,.085,0);
  const shoulderWidth=(female?.168:.195)*width;
  for(const [side,sign] of [['left',1],['right',-1]]){
   let sh=b(side+'Shoulder',upperChest,sign*shoulderWidth*.65,.02,0);
   let arm=b(side+'UpperArm',sh,sign*shoulderWidth*.40,0,0),elbow=b(side+'LowerArm',arm,sign*.245,0,0),hand=b(side+'Hand',elbow,sign*.205,0,0);
   let leg=b(side+'UpperLeg',hips,sign*.092*width,-.025,0),knee=b(side+'LowerLeg',leg,0,-.355,0),foot=b(side+'Foot',knee,0,-.345,0);b(side+'Toes',foot,0,-.045,.115);
  }
  function mesh(parent,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
  function ell(parent,mat,x,y,z,sx,sy,sz){let m=mesh(parent,new T.SphereGeometry(1,16,12),mat,x,y,z);m.scale.set(sx,sy,sz);return m}
  function panel(parent,mat,pts,z){const sh=new T.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();return mesh(parent,new T.ExtrudeGeometry(sh,{depth:.007,bevelEnabled:false}),mat,0,0,z)}
  root.updateMatrixWorld(true);const skeleton=new T.Skeleton(all);
  // Smooth weighted rings across shoulders, elbows and knees. No rigid gaps at joints.
  function tube(rings,axis,mat){
   const P=[],UV=[],I=[],W=[],idx=[],N=14;
   for(let k=0;k<rings.length;k++){
    const [x,y,z,r1,r2,a,c,w]=rings[k],ia=all.indexOf(a),ib=all.indexOf(c||a);
    for(let i=0;i<=N;i++){let u=i/N,ang=2*Math.PI*u,co=Math.cos(ang),si=Math.sin(ang);
     P.push(x+(axis==='x'?0:co*r1),y+(axis==='x'?co*r1:0),z+si*r2);
     UV.push(u,k/(rings.length-1));I.push(ia,ib,0,0);W.push(1-w,w,0,0);
     if(k&&i<N){let j=k*(N+1)+i,prev=j-N-1;idx.push(prev,prev+1,j,j,prev+1,j+1)}
    }
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(I,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(W,4));g.setIndex(idx);g.computeVertexNormals();
   const m=new T.SkinnedMesh(g,mat);m.frustumCulled=false;root.add(m);m.bind(skeleton);return m
  }
  const waist=(female?.112:.135)*width,top=(female?.17:.19)*width;
  tube([[0,.77,0,waist*.94,.09*depth,hips,hips,0],[0,.86,0,waist,.095*depth,hips,spine,.12],[0,.98,0,waist*.92,.10*depth,spine,hips,.18],[0,1.12,0,top,.115*depth,chest,spine,.18],[0,1.22,0,top*.93,.103*depth,upperChest,chest,.20],[0,1.31,0,.066,.055,upperChest,neck,.18]],'y',cloth);
  ell(neck,skin,0,.03,0,.055,.085,.052);
  for(const [side,sg] of [['left',1],['right',-1]]){
   const u=nodes[side+'UpperArm'],e=nodes[side+'LowerArm'],h=nodes[side+'Hand'],l=nodes[side+'UpperLeg'],k=nodes[side+'LowerLeg'],f=nodes[side+'Foot'];
   const at=n=>n.getWorldPosition(new T.Vector3());
   let A=at(u),B=at(e),C=at(h),R=(female?.058:.068)*width;
   let ar=(x,r,b1,b2,w)=>[x,A.y,A.z,r,r*.90,b1,b2,w];
   tube([ar(A.x-sg*.025,R*.82,u,u,0),ar(A.x+sg*.07,R,u,u,0),ar(B.x-sg*.055,R*.78,u,e,.13),ar(B.x,R*.69,u,e,.5),ar(B.x+sg*.065,R*.68,e,u,.12),ar(C.x-sg*.035,R*.51,e,e,0),ar(C.x,R*.47,e,e,0)],'x',garment%3===0?skin:cloth);
   ell(h,skin,sg*.052,0,.005,.074,.035,.040);
   let L=at(l),K=at(k),F=at(f),r=(female?.075:.087)*width;
   let lr=(y,rad,b1,b2,w)=>[L.x,y,0,rad,rad*.95,b1,b2,w];
   tube([lr(L.y+.04,r,l,l,0),lr(L.y-.11,r,l,l,0),lr(K.y+.065,r*.73,l,k,.12),lr(K.y,r*.66,l,k,.5),lr(K.y-.075,r*.68,k,l,.1),lr(F.y+.075,r*.54,k,k,0),lr(F.y,r*.49,k,k,0)],'y',dark);
   ell(f,dark,0,-.042,.058,.071*width,.060,.13);ell(f,trim,0,-.079,.055,.073*width,.016,.13);
   if(garment%4===1||garment%4===3)ell(u,trim,sg*.045,.012,0,R*1.45,R*1.2,R*1.22);
  }
  // Independent geometry: cheek/jaw proportions and eye placement vary by identity.
  ell(head,skin,0,.035,0,.119*headW,.157*headH,.108*depth);
  ell(head,skin,0,-.038,.018,.094*headW*chin,.099*headH,.093*depth);
  ell(head,skin,0,-.005,.102*depth,.019,.031,.032);
  let eyeGroups=[];
  for(const sg of [-1,1]){
   ell(head,skin,sg*.119*headW,-.006,-.004,.021,.039,.021);
   const eye=new T.Group();eye.position.set(sg*.048*headW,.027*headH,.097*depth);head.add(eye);eyeGroups.push(eye);
   ell(eye,white,0,0,0,.029*(female?1.10:1),.015*(female?1.16:.88),.013);
   ell(eye,eyesMat,0,0,.010,.012,.014*(female?1.12:.88),.006);
   ell(eye,white,-.004,.005,.016,.0035,.0035,.002);
   let brow=ell(head,hair,sg*.048*headW,.058*headH,.101*depth,.030,.008,.008);brow.rotation.z=sg*(hairStyle%3-.8)*.14;
  }
  const mouth=ell(head,lip,0,-.058*headH,.103*depth,.025,.005,.006);
  // Hair is sculpted from separate curved masses with 20 distinct arrangements.
  let cap=mesh(head,new T.SphereGeometry(1,20,14,0,Math.PI*2,0,Math.PI*.63),hair,0,.055,0);cap.scale.set(.127*headW,.145*headH,.119*depth);
  const hairParts=[];
  for(let i=0;i<5+(hairStyle%4);i++){let q=i/(4+hairStyle%4),xx=(q-.5)*.205*headW;
   const strand=ell(head,hair,xx,.105*headH-(hairStyle%3)*.014,.075*depth,.038+(hairStyle%3)*.006,.073+(i%3)*.022,.042);
   strand.rotation.z=(q-.5)*(hairStyle%2?1.15:-.65)+.16;strand.rotation.x=.27+(hairStyle%4)*.08;
  }
  if(hairStyle%5===0||hairStyle%5===3||hairStyle>=13){for(const sg of [-1,1]){let g=new T.Group();g.position.set(sg*.099*headW,.03,-.025);head.add(g);let n=hairStyle>=13?.20+.018*(hairStyle%4):.095;ell(g,hair,0,-n*.54,-.024,.047,n,.060);hairParts.push({g,sg});}}
  if(hairStyle%4===1||hairStyle%4===2){let bun=ell(head,hair,0,.12,-.103,.072,.073+(hairStyle%3)*.025,.078);bun.rotation.x=.2}
  if(hairStyle%4===3){for(let i=0;i<4;i++){let spike=mesh(head,new T.ConeGeometry(.042,.12,9),hair,(i-1.5)*.043,.177-(i%2)*.014,-.025);spike.rotation.z=(i-1.5)*-.20}}
  // Garment profiles: asymmetrical coat fronts, short tunics, belts and collars.
  const outer=garment%3,coat=garment%6;
  const fw=waist*(1.05+(garment%4)*.06),hem=.13+.035*(garment%5);
  for(let sg of [-1,1]){
   panel(hips,cloth,[[sg*.018,.07],[sg*fw,.07],[sg*(fw+.035+outer*.012),-hem],[sg*.028,-hem+.025*(coat%2)]],.101*depth);
   panel(chest,trim,[[sg*.02,.10],[sg*top*.72,.15],[sg*top*.50,.075],[sg*.048,-.085]],.119*depth);
  }
  let belt=mesh(hips,new T.CylinderGeometry(fw,fw,.040,20),dark,0,.052,0);belt.scale.z=.79;panel(hips,trim,[[-.03,.072],[.03,.072],[.03,.034],[-.03,.034]],.116*depth);
  if(garment%3===1||garment%3===2){let cape=panel(upperChest,cloth,[[-top,.04],[top,.04],[top*.86,-.32-.05*(coat%3)],[0,-.39],[-top*.75,-.31]],-.128*depth);cape.rotation.y=Math.PI;hairParts.push({g:cape,sg:1,small:true})}
  if(garment%4===2||female){let deco=mesh(head,new T.TorusGeometry(.025+.004*(garment%3),.006,6,12),trim,-.096*headW,.115,.07);deco.rotation.z=.3}
  let expression={blink:0,happy:0};
  const expressionManager={getExpression:k=>k==='blink'||k==='happy'?{}:null,setValue:(k,v)=>expression[k]=v,update(){for(const e of eyeGroups)e.scale.y=clamp(1-(expression.blink||0)*.94,.06,1);mouth.scale.y=.005+(expression.happy||0)*.012;}};
  const humanoid={getNormalizedBoneNode:n=>nodes[n]||null,getRawBoneNode:n=>nodes[n]||null,update(){root.updateMatrixWorld(true)},resetNormalizedPose(){for(const n of all)n.quaternion.identity();hips.position.set(0,.82,0)}};
  let clock=0;const vrm={scene:root,humanoid,expressionManager,update(dt){clock+=dt;for(const q of hairParts){q.g.rotation.x=Math.sin(clock*3.7+q.sg)* (q.small?.035:.065);if(!q.small)q.g.rotation.z=q.sg*Math.sin(clock*2.8)*.05}expressionManager.update();root.updateMatrixWorld(true)}};
  root.rotation.y=Math.PI;root.updateMatrixWorld(true);
  return {root,vrm,kind:'original-'+p.id,original:true,baseScale:1,colors:[],armDown:{left:-1,right:1},legSign:1,modelForward:new T.Vector3(0,0,1),motionProfile:p.id,motion:WWMotion.newState(),elapsed:0,weight:0,hipsRest:hips.position.clone(),soleHeight:{left:.10,right:.10},T,dispose(){const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material)});for(const g of gs)g.dispose();for(const m of ms)m.dispose();skeleton.dispose?.()}};
 }
 const api={designs,build};if(typeof module!=='undefined')module.exports=api;else global.WWOriginal=api;
})(typeof globalThis!=='undefined'?globalThis:this);

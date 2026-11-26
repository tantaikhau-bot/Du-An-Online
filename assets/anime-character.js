/* Original anime-fantasy character styling. No third-party character assets. */
(function(root){
 function expression(mode,time,gait=0){
  const blinkPhase=((time+0.7)%4.9),blink=Math.min(1,Math.abs(blinkPhase-4.65)/.12);
  const happy=['smile','wave','photo','portrait','hug','duet','cheer','happy'].includes(mode);
  const angry=mode==='angry',surprised=mode==='surprised'||mode==='cheer';
  return {eye:Math.max(.10,blink)*(surprised?1.13:angry?.82:happy?.91:1),brow:angry?-.25:surprised?.18:happy?.10:0,mouth:surprised?.014:happy?.009:angry?.004:.005,smile:happy?.10:angry?-.10:0,sway:Math.sin(time*1.65)*.022*(1-gait),breath:Math.sin(time*2.35)*.005};
 }
 function makeStyle(T){
  const ramp=new T.DataTexture(new Uint8Array([70,145,215,255]),4,1,T.RedFormat);ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;
  const toon=(color)=>new T.MeshToonMaterial({color,gradientMap:ramp,emissive:0x19131b,emissiveIntensity:.12});
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
  let g=ctx.createLinearGradient(0,0,0,128);g.addColorStop(0,'#303344');g.addColorStop(.43,'#9296a4');g.addColorStop(.85,'#f2efeb');g.addColorStop(1,'#a9a9ad');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const irisMap=new T.CanvasTexture(canvas);irisMap.colorSpace=T.SRGBColorSpace;
  const iris=(color)=>new T.MeshBasicMaterial({color,map:irisMap,side:T.DoubleSide});
  const ink=new T.MeshBasicMaterial({color:0x292331}),white=new T.MeshBasicMaterial({color:0xfff4e8}),glint=new T.MeshBasicMaterial({color:0xffffff});
  const headGeometry=new T.LatheGeometry([[0,-.167],[.044,-.161],[.082,-.139],[.109,-.108],[.129,-.061],[.143,-.008],[.145,.048],[.136,.102],[.106,.145],[.063,.168],[0,.177]].map(p=>new T.Vector2(...p)),32);
  const pos=headGeometry.attributes.position;for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);if(z<0){let r=Math.hypot(x,z);if(r>.0001)z=-Math.pow(Math.abs(z)/r,.53)*r*.89;}else z*=.93;pos.setXYZ(i,x,y,z)}headGeometry.computeVertexNormals();
  const irisGeo=new T.CircleGeometry(1,24);
  const outline=new T.MeshBasicMaterial({color:0x594353,side:T.BackSide});
  return {toon,iris,ink,white,glint,headGeometry,irisGeo,outline};
 }
 const api={expression,makeStyle};if(typeof module!=='undefined')module.exports=api;else root.WWAnime=api;
})(typeof globalThis!=='undefined'?globalThis:this);

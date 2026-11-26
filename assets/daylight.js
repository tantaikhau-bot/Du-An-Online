/* V11.7: continuous 24h lighting over the existing 420-second game day. */
(function(root){
 const duration=420,clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t;
 // hour, horizon, top, sun tint, ambient, direct, environment, exposure, night, glow
 const keys=[
 [0,0x172d49,0x101e39,0x9dbbee,.40,.16,.18,.94,1,.03],
 [4.5,0x263b56,0x1c3150,0xa9c5ef,.43,.19,.20,.95,.95,.05],
 [6,0xf4bd9b,0x687ea5,0xffc29a,.70,1.05,.40,.98,.10,.75],
 [8,0xbfd8df,0x6398c4,0xffead4,.95,2.05,.64,.95,0,1],
 [12,0xb4d2dc,0x5288b4,0xfff3df,.98,2.25,.68,.94,0,1],
 [16,0xd0d5c6,0x6f98bd,0xffe0b5,.92,1.95,.60,.96,0,.95],
 [18,0xe6b498,0x766b9a,0xffb17b,.66,1.25,.44,.98,.10,.70],
 [20,0x303b58,0x25334d,0xc1b7da,.43,.20,.20,.95,.92,.06],
 [24,0x172d49,0x101e39,0x9dbbee,.40,.16,.18,.94,1,.03]];
 const wrap=h=>((h%24)+24)%24;
 function hour(seconds){return wrap(8+(Number.isFinite(seconds)?seconds:0)*24/duration)}
 function mode(h){h=wrap(h);return h<5.5||h>=19.5?0:h>=16.5?2:1}
 function label(h){h=wrap(h);return h>=5&&h<7.5?'Bình minh':h>=7.5&&h<12?'Buổi sáng':h>=12&&h<16.5?'Buổi chiều':h>=16.5&&h<19.5?'Hoàng hôn':'Ban đêm'}
 function format(h){const m=Math.floor(wrap(h)*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
 function sample(h){
  h=wrap(h);let i=keys.findIndex(k=>k[0]>h)-1;i=Math.max(0,i);const a=keys[i],b=keys[i+1],u=clamp((h-a[0])/(b[0]-a[0])),t=u*u*(3-2*u);
  const angle=(h-6)/24*Math.PI*2,alt=Math.sin(angle),dir=[-Math.cos(angle)*.86,Math.max(.10,Math.abs(alt)*.83),.48];
  return {hour:h,colors:[[a[1],b[1]],[a[2],b[2]],[a[3],b[3]]],blend:t,ambient:mix(a[4],b[4],t),direct:mix(a[5],b[5],t),env:mix(a[6],b[6],t),exposure:mix(a[7],b[7],t),night:mix(a[8],b[8],t),glow:mix(a[9],b[9],t),dir};
 }
 function approachHour(current,target,dt){let d=((target-current+36)%24)-12;return wrap(current+d*(1-Math.exp(-Math.max(0,dt)/1.2)))}
 const api={duration,hour,mode,label,format,sample,approachHour};if(typeof module!=='undefined')module.exports=api;else root.WWDay=api;
})(typeof globalThis!=='undefined'?globalThis:this);

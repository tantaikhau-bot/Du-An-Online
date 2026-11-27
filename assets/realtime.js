/* V12.1: bounded snapshot interpolation and a server clock, plus optional socket transport. */
(function(root){
 const finite=Number.isFinite,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const angle=(a,b,k)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*k;
 function addSnapshot(history,s){
  if(!s||![s.t,s.x,s.z,s.jump,s.heading].every(finite))return false;
  const last=history.at(-1);
  if(last&&s.t<=last.t)return false;
  if(last&&(s.t-last.t>4000||Math.hypot(s.x-last.x,s.z-last.z)>12))history.length=0;
  history.push({...s});while(history.length>8)history.shift();return true;
 }
 function sample(history,now,delay=850){
  if(!history.length||!finite(now))return null;
  const at=now-delay,first=history[0],last=history.at(-1);
  if(at<=first.t)return {...first};
  for(let i=1;i<history.length;i++){
   const b=history[i],a=history[i-1];if(at<=b.t){const k=clamp((at-a.t)/(b.t-a.t),0,1);
    return {t:at,x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k,jump:a.jump+(b.jump-a.jump)*k,heading:angle(a.heading,b.heading,k),moving:k<.5?a.moving:b.moving};}
  }
  const before=history.at(-2);let dx=0,dz=0;
  if(before&&last.moving&&last.t>before.t){
   const extra=clamp(at-last.t,0,150),span=last.t-before.t;
   dx=(last.x-before.x)*extra/span;dz=(last.z-before.z)*extra/span;
   const length=Math.hypot(dx,dz);if(length>.65){dx*=.65/length;dz*=.65/length;}
  }
  return {...last,x:last.x+dx,z:last.z+dz,moving:!!last.moving&&at-last.t<1000};
 }
 // Server sample identity is stable across repeated polling responses.
 function serverSnapshot134(state,history,s,serverMs,receivedMs,rtt=0){
  if(!s||![s.sample_ms,serverMs,receivedMs,s.x,s.z,s.jump,s.heading].every(finite))return false;
  if(s.sample_ms>serverMs+1000||serverMs-s.sample_ms>12000)return false;
  if(finite(state.last)&&s.sample_ms<=state.last)return false;
  const observed=receivedMs-clamp(serverMs-s.sample_ms,0,12000)-clamp(finite(rtt)?rtt/2:0,0,1000);
  let t=observed;
  if(finite(state.last)&&s.sample_ms-state.last<=4000&&history.length){
   const prior=history.at(-1).t,expected=prior+s.sample_ms-state.last;
   t=Math.max(prior+1,expected+clamp(observed-expected,-40,40));
  }
  if(!addSnapshot(history,{...s,t}))return false;
  state.last=s.sample_ms;return true;
 }
 function clockReading(serverMs,receivedMs,rttMs){
  if(![serverMs,receivedMs,rttMs].every(finite)||serverMs<0||rttMs<0||rttMs>12000)return null;
  return {serverMs:serverMs+Math.min(rttMs/2,1000),receivedMs};
 }
 function clockSeconds(c,now){return c&&finite(now)?(c.serverMs+Math.max(0,now-c.receivedMs))/1000:null}
 function retryDelay(failures,random=.5){return Math.round(Math.min(30000,700*2**clamp(failures,1,6))*(.8+.4*clamp(random,0,1)))}
 // V27.0: validate authoritative public presence snapshots before touching scene objects.
 function roster270(rows,uid,serverMs,receivedMs,rtt){
  if(!Array.isArray(rows)||!finite(serverMs)||!finite(receivedMs))return null;
  const own=String(uid),byId=new Map();
  for(const r of rows.slice(0,100)){
   if(!r||typeof r.id!=='string'||!r.id||r.id.length>100||r.id===own||r.area!==0||![r.x,r.y,r.sample_ms].every(finite)||r.x< -3710||r.x>4690||r.y< -1329||r.y>2479||r.sample_ms<0||r.sample_ms>serverMs+1000||serverMs-r.sample_ms>12000)continue;
   const prev=byId.get(r.id);if(prev&&prev.sample_ms>=r.sample_ms)continue;
   const pick=(key,choices,fallback)=>choices.includes(r[key])?r[key]:fallback;
   const body=pick('body',['male','female'],'male'),moving=r.moving===true||r.moving===1;
   byId.set(r.id,{id:r.id,name:typeof r.name==='string'?r.name.slice(0,30):'Lữ khách',area:0,x:r.x,y:r.y,sample_ms:r.sample_ms,body,
    skin:pick('skin',['warm','fair','deep'],'warm'),hair:pick('hair',['chestnut','silver','dark','auburn','blond'],'chestnut'),style:pick('style',['short','long','tied','bob','wavy','bun','swept'],'short'),dye:pick('dye',['original','moss','navy','wine','sand','ivory','charcoal'],'original'),
    height:pick('height',['compact','normal','tall'],'normal'),build:pick('build',['slim','normal','athletic'],'normal'),face:pick('face',['soft','classic','angular'],'classic'),eye:pick('eye',['brown','green','blue','amber'],'brown'),
    heading:finite(r.heading)?clamp(r.heading,-Math.PI*2,Math.PI*2):0,jump:finite(r.jump)?clamp(r.jump,0,2):0,moving,gait109:moving?(finite(r.gait109)?clamp(r.gait109,0,1):.65):0,
    avatar109:typeof r.avatar109==='string'&&/^[mf](?:[1-9]|10)$/.test(r.avatar109)?r.avatar109:body==='female'?'f1':'m1',
    vehicle:pick('vehicle',['bike','motor','car'],''),pet:pick('pet',['fox','rabbit','deer','cat','dragon'],''),action:pick('action',['idle','wave','bow','cheer','smile','happy','angry','surprised','sit','dance','hand','photo','hug','duet','portrait'],'idle'),friend:r.friend===1?1:0,received121:receivedMs,worldMs121:serverMs,rtt134:finite(rtt)?clamp(rtt,0,12000):0});
  }
  return [...byId.values()];
 }
 function selectPeers270(rows,x,z,range,cap,resident){
  if(![x,z,range,cap].every(finite)||range<=0||cap<=0)return [];
  return rows.map(r=>{const d=Math.hypot((r.x-490)/35-x,-(r.y-575)/14-z),kept=resident.has(r.id);return {r,d,score:d-(kept?2:0),kept}}).filter(v=>v.d<=range+(v.kept?3:0)).sort((a,b)=>a.score-b.score||a.r.id.localeCompare(b.r.id)).slice(0,Math.min(100,Math.floor(cap))).map(v=>v.r);
 }
 const api={addSnapshot,sample,serverSnapshot134,clockReading,clockSeconds,retryDelay,roster270,selectPeers270};
 if(typeof module!=='undefined')module.exports=api;else root.WWRealtime=api;
})(typeof globalThis!=='undefined'?globalThis:this);
/* Opt-in transport, same-origin socket with HTTP fallback. */
(function(){
 if(typeof window==='undefined')return;
 let socket=null,opening=null,pending=null,retryAt=0,next=0;
 const enabled=new URLSearchParams(location.search).get('ws')==='1';let failures=0;window.wwTransportMode='http';
 function disconnect(){
  if(socket){socket.close();socket=null}
  if(pending){clearTimeout(pending.timer);pending.reject(Error('WebSocket closed'));pending=null}
 }
 function connect(){
  if(socket?.readyState===WebSocket.OPEN)return Promise.resolve(socket);
  if(opening)return opening;
  opening=new Promise((resolve,reject)=>{
   let ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/ws/presence');
   socket=ws;let timer=setTimeout(()=>{ws.close();reject(Error('timeout'))},2500);
   ws.onopen=()=>{clearTimeout(timer);resolve(ws)};
   ws.onmessage=e=>{try{let v=JSON.parse(e.data);if(!pending||v.id!==pending.id)return;let p=pending;pending=null;clearTimeout(p.timer);if(v.status===200){window.wwTransportMode='websocket';failures=0;p.resolve(v.data)}else{let err=Error(v.data?.error||'Socket request failed');err.status=v.status;p.reject(err)}}catch{disconnect()}};
   ws.onclose=()=>{clearTimeout(timer);reject(Error('closed'));if(socket===ws){socket=null;if(pending){clearTimeout(pending.timer);pending.reject(Error('closed'));pending=null}}};
   ws.onerror=()=>{clearTimeout(timer);ws.close();reject(Error('socket error'))};
  }).finally(()=>{opening=null});
  return opening;
 }
 window.wwPulseTransport=async(api,data)=>{
  if(!enabled||Date.now()<retryAt||pending){window.wwTransportMode='http';return api('social/pulse',data)}
  try{
   let ws=await connect();
   return await new Promise((resolve,reject)=>{let id=++next,timer=setTimeout(()=>{pending=null;reject(Error('timeout'));disconnect()},3500);pending={id,timer,resolve,reject};try{ws.send(JSON.stringify({id,data}))}catch(e){clearTimeout(timer);pending=null;reject(e)}});
  }catch(e){if(e.status)throw e;retryAt=Date.now()+Math.max(5000,WWRealtime.retryDelay(++failures,Math.random()));disconnect();window.wwTransportMode='http';return api('social/pulse',data)}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)disconnect()});
 window.addEventListener('pagehide',disconnect);
})();

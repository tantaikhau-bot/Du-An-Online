/* Opt-in transport, same-origin socket with HTTP fallback. */
(function(){
 let socket=null,opening=null,pending=null,retryAt=0,next=0;
 const enabled=new URLSearchParams(location.search).get('ws')==='1';
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
   ws.onmessage=e=>{try{let v=JSON.parse(e.data);if(!pending||v.id!==pending.id)return;let p=pending;pending=null;clearTimeout(p.timer);if(v.status===200)p.resolve(v.data);else{let err=Error(v.data?.error||'Socket request failed');err.status=v.status;p.reject(err)}}catch{disconnect()}};
   ws.onclose=()=>{clearTimeout(timer);reject(Error('closed'));if(socket===ws){socket=null;if(pending){clearTimeout(pending.timer);pending.reject(Error('closed'));pending=null}}};
   ws.onerror=()=>{clearTimeout(timer);ws.close();reject(Error('socket error'))};
  }).finally(()=>{opening=null});
  return opening;
 }
 window.wwPulseTransport=async(api,data)=>{
  if(!enabled||Date.now()<retryAt||pending)return api('social/pulse',data);
  try{
   let ws=await connect();
   return await new Promise((resolve,reject)=>{let id=++next,timer=setTimeout(()=>{pending=null;reject(Error('timeout'));disconnect()},3500);pending={id,timer,resolve,reject};try{ws.send(JSON.stringify({id,data}))}catch(e){clearTimeout(timer);pending=null;reject(e)}});
  }catch(e){if(e.status)throw e;retryAt=Date.now()+30000;disconnect();return api('social/pulse',data)}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)disconnect()});
 window.addEventListener('pagehide',disconnect);
})();

"""Optional aiohttp front end. Existing HTTP backend stays on loopback.
Presence WebSocket delegates to the same authenticated social handler.
"""
import asyncio,json,os,threading,time
from aiohttp import web,ClientSession,ClientTimeout,WSMsgType
import server
MAX_SOCKETS=64
async def start(app):
 app['client']=ClientSession(timeout=ClientTimeout(total=12),cookie_jar=__import__('aiohttp').DummyCookieJar(),auto_decompress=False)
 app['sockets']=0
async def close(app):await app['client'].close()
def headers(req):
 return {k:v for k,v in req.headers.items() if k.lower() in ('cookie','content-type','x-wish-signature','accept')}
async def backend(req,path,method='GET',data=None):
 async with req.app['client'].request(method,req.app['backend']+path,headers=headers(req),data=data,allow_redirects=False) as r:
  return r.status,await r.read(),r.headers
async def presence(req):
 # Origin must match the public HTTPS host, not an arbitrary forwarded header.
 origin=req.headers.get('Origin','');expected=req.app['origin']
 if origin!=expected:return web.Response(status=403)
 if req.app['sockets']>=MAX_SOCKETS:return web.Response(status=503)
 status,body,_=await backend(req,'/api/me')
 if status!=200 or not json.loads(body).get('user'):return web.Response(status=401)
 req.app['sockets']+=1
 ws=web.WebSocketResponse(max_msg_size=8192,heartbeat=20)
 last=0
 try:
  await ws.prepare(req)
  async for msg in ws:
   if msg.type!=WSMsgType.TEXT:continue
   try:
    obj=json.loads(msg.data)
    if not isinstance(obj,dict) or type(obj.get('id')) is not int or not isinstance(obj.get('data'),dict):raise ValueError()
    now=time.monotonic()
    if now-last<.35:
     await ws.send_json({'id':obj['id'],'status':429,'data':{'error':'Gửi quá nhanh'}});continue
    last=now
    # Session checked again for every pulse. No general-purpose API tunnel.
    async with req.app['client'].post(req.app['backend']+'/api/social/pulse',headers={**headers(req),'Content-Type':'application/json'},json=obj['data']) as r:
     result=await r.json();await ws.send_json({'id':obj['id'],'status':r.status,'data':result})
     if r.status==401:break
   except (ValueError,TypeError):await ws.close(code=1003,message=b'Invalid message');break
   except (asyncio.TimeoutError,OSError):await ws.close(code=1011);break
 finally:
  req.app['sockets']-=1
  await ws.close()
 return ws
async def proxy(req):
 if req.method not in ('GET','HEAD','POST'):return web.Response(status=405)
 data=await req.read() if req.method=='POST' else None
 status,body,h=await backend(req,req.raw_path,req.method,data)
 keep={'content-type','cache-control','content-length','set-cookie','x-frame-options','referrer-policy','x-content-type-options'}
 response=web.Response(status=status,body=body if req.method!='HEAD' else None)
 for k,v in h.items():
  if k.lower() in keep:response.headers[k]=v
 return response
def make_app(backend_url,origin):
 app=web.Application(client_max_size=500000);app['backend']=backend_url;app['origin']=origin
 app.on_startup.append(start);app.on_cleanup.append(close)
 app.router.add_get('/ws/presence',presence);app.router.add_route('*','/{path:.*}',proxy)
 return app
if __name__=='__main__':
 origin=os.environ['WISH_PUBLIC_ORIGIN'].rstrip('/')
 server.init();internal=server.BoundedServer(('127.0.0.1',0),server.Handler)
 thread=threading.Thread(target=internal.serve_forever,daemon=True);thread.start()
 try:web.run_app(make_app('http://127.0.0.1:'+str(internal.server_port),origin),host='0.0.0.0',port=int(os.environ.get('PORT','8080')))
 finally:internal.shutdown();internal.server_close()

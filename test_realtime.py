import asyncio,json,tempfile,threading,time,unittest
from pathlib import Path
from aiohttp.test_utils import TestServer,TestClient
import server,realtime_gateway
class Realtime(unittest.IsolatedAsyncioTestCase):
 async def test_socket(self):
  old=server.DB
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=str(Path(tmp)/'test.sqlite3');server.init()
   with server.db() as c:
    c.execute("INSERT INTO users(id,name) VALUES('a','Alice')")
    c.execute('INSERT INTO sessions VALUES(?,?,?)',(server.tokenhash('test'),'a',int(time.time())+120))
   internal=server.BoundedServer(('127.0.0.1',0),server.Handler)
   t=threading.Thread(target=internal.serve_forever,daemon=True);t.start()
   origin='https://game.example'
   try:
    async with TestClient(TestServer(realtime_gateway.make_app('http://127.0.0.1:'+str(internal.server_port),origin))) as client:
     bad=await client.get('/ws/presence',headers={'Origin':'https://wrong.example'})
     self.assertEqual(bad.status,403)
     no=await client.get('/ws/presence',headers={'Origin':origin})
     self.assertEqual(no.status,401)
     async with client.ws_connect('/ws/presence',headers={'Origin':origin,'Cookie':'ww_session=test'}) as ws:
      await ws.send_json({'id':1,'data':{'x':490,'y':575,'area':0}})
      r=await ws.receive_json();self.assertEqual(r['status'],200);self.assertEqual(r['id'],1)
      await ws.send_json({'id':2,'data':{'x':490,'y':575,'area':0}})
      self.assertEqual((await ws.receive_json())['status'],429)
     res=await client.get('/healthz');self.assertEqual(res.status,200)
   finally:internal.shutdown();internal.server_close();t.join();server.DB=old
if __name__=='__main__':unittest.main()

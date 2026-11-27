"""Isolated regression tests; no live database or accounts."""
import http.client
import json
import re
import tempfile
import threading
import unittest
from pathlib import Path
import server

class Stability(unittest.TestCase):
 def test_http_and_db(self):
  previous=server.DB
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=str(Path(tmp)/'test.sqlite3')
   try:
    server.init()
    with server.db() as con:
     self.assertEqual(con.execute('SELECT count(*) FROM users').fetchone()[0],0)
    with self.assertRaises(server.sqlite3.ProgrammingError):
     con.execute('SELECT 1')
    srv=server.BoundedServer(('127.0.0.1',0),server.Handler)
    t=threading.Thread(target=srv.serve_forever,daemon=True);t.start()
    def req(method,path,body=None,extra=None):
     h=http.client.HTTPConnection('127.0.0.1',srv.server_port,timeout=5)
     try:
      h.request(method,path,body,{**({'Content-Type':'application/json'} if body is not None else {}),**(extra or {})})
      r=h.getresponse();return r.status,dict(r.getheaders()),r.read()
     finally:h.close()
    try:
     for path in ('/','/play','/healthz','/api/version','/favicon.ico','/favicon.svg'):
      a,b,body=req('GET',path)
      status,headers,empty=req('HEAD',path)
      self.assertEqual((a,status,empty),(200,200,b''))
      self.assertEqual(headers['Content-Length'],str(len(body)))
     html=req('GET','/play')[2].decode('utf-8')
     match=re.search(r"BUILD62='([^']+)'",html)
     self.assertIsNotNone(match)
     release=json.loads(req('GET','/api/version')[2])
     self.assertEqual(release['build'],match.group(1))
     self.assertEqual(release['version'],match.group(1).split('-')[0])
     a,headers,asset=req('GET','/assets/arsenal311.glb')
     self.assertEqual(a,200)
     self.assertEqual(headers['Content-Type'],'model/gltf-binary')
     self.assertEqual(asset[:4],b'glTF')
     self.assertEqual(int.from_bytes(asset[8:12],'little'),len(asset))
     status,head_headers,empty=req('HEAD','/assets/arsenal311.glb')
     self.assertEqual((status,head_headers['Content-Length'],empty),(200,str(len(asset)),b''))
     self.assertEqual(req('GET','/favicon.ico')[1]['Content-Type'],'image/svg+xml')
     self.assertEqual(req('HEAD','/api/save')[0],405)
     self.assertEqual(req('GET','/api/save')[0],401)
     self.assertEqual(req('POST','/api/dungeon/status','{}')[0],401)
     self.assertEqual(req('POST','/api/register','[]')[0],400)
     self.assertEqual(req('POST','/api/register','{"name":"a","name":"b"}')[0],400)
     self.assertEqual(req('POST','/api/register','{"value":NaN}')[0],400)
     self.assertEqual(req('POST','/api/register','{}',{'Sec-Fetch-Site':'cross-site'})[0],403)
     self.assertEqual(req('GET','/api/admin/runtime')[0],503 if len(server.os.environ.get('WISH_ADMIN_PASSWORD',''))<14 else 401)
    finally:
     srv.shutdown();srv.server_close();t.join(timeout=5)
   finally:server.DB=previous

if __name__=='__main__':unittest.main()

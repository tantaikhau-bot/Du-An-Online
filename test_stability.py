"""Isolated regression tests; no live database or accounts."""
import http.client
import json
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
    def req(method,path,body=None):
     h=http.client.HTTPConnection('127.0.0.1',srv.server_port,timeout=5)
     try:
      h.request(method,path,body,{'Content-Type':'application/json'} if body is not None else {})
      r=h.getresponse();return r.status,dict(r.getheaders()),r.read()
     finally:h.close()
    try:
     for path in ('/','/play','/healthz','/api/version','/favicon.ico','/favicon.svg'):
      a,b,body=req('GET',path)
      status,headers,empty=req('HEAD',path)
      self.assertEqual((a,status,empty),(200,200,b''))
      self.assertEqual(headers['Content-Length'],str(len(body)))
     self.assertEqual(json.loads(req('GET','/api/version')[2])['build'],'12.4-world-expansion')
     self.assertEqual(req('GET','/favicon.ico')[1]['Content-Type'],'image/svg+xml')
     self.assertEqual(req('HEAD','/api/save')[0],405)
     self.assertEqual(req('GET','/api/save')[0],401)
     self.assertEqual(req('POST','/api/register','[]')[0],400)
    finally:
     srv.shutdown();srv.server_close();t.join(timeout=5)
   finally:server.DB=previous

if __name__=='__main__':unittest.main()

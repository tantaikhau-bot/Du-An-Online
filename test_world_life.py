import unittest,sqlite3,os,tempfile,io
from unittest.mock import patch
from pathlib import Path
import social,admin
class H:
 def __init__(self,path,headers=None):self.path=path;self.headers=headers or {};self.wfile=io.BytesIO();self.status=None
 def reply(self,status,data,*args):return status,data
 def send_response(self,status):self.status=status
 def send_header(self,*a):pass
 def end_headers(self):pass
class WorldLife(unittest.TestCase):
 def test_presence(self):
  with sqlite3.connect(':memory:') as c:
   c.row_factory=sqlite3.Row
   c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT);CREATE TABLE blocked(uid TEXT PRIMARY KEY);INSERT INTO users VALUES('a','A'),('b','B');")
   social.init(c)
   def pulse(uid,**fields):return social.handle(H('/api/social/pulse'),c,{'id':uid},{'x':490,'y':575,'area':0,**fields})
   self.assertEqual(pulse('a',avatar109='f10',moving=True,gait109=1)[0],200)
   packet=pulse('b',body='female',avatar109='invalid',moving=False,gait109=1)[1]
   r=packet['players'][0]
   self.assertIsInstance(packet['world_ms'],int)
   self.assertIsInstance(r['sample_ms'],int)
   self.assertLessEqual(r['sample_ms'],packet['world_ms'])
   self.assertNotIn('seen',r)
   self.assertEqual((r['avatar109'],r['gait109']),('f10',1))
   r=pulse('a')[1]['players'][0];self.assertEqual((r['avatar109'],r['gait109']),('f1',0))
 def test_daily_adventure(self):
  import adventure
  with sqlite3.connect(':memory:') as c:
   c.row_factory=sqlite3.Row
   c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT);CREATE TABLE blocked(uid TEXT PRIMARY KEY);INSERT INTO users VALUES('a','A'),('b','B');")
   social.init(c)
   now=1700000000
   def call(action,body,uid='a',when=now):
    with c:
     return adventure.handle(H('/api/social/adventure/'+action),c,{'id':uid},body,when)
   status=call('status',{})[1];stops=status['stops'];day=status['day']
   self.assertEqual(status['step'],0)
   self.assertEqual(call('checkin',{'id':stops[1]['id'],'day':day})[0],409)
   self.assertEqual(call('checkin',{'id':stops[0]['id'],'day':day})[0],409)
   self.assertEqual(call('checkin',{'id':stops[0]['id'],'day':day,'coins':999})[0],400)
   for i,stop in enumerate(stops):
    when=now+10*i;_,x,z=adventure.PLACES[stop['id']]
    with c:c.execute('INSERT OR REPLACE INTO presence VALUES(?,?,?,?,?)',('a',490+x*35,575-z*14,0,when))
    code,result=call('checkin',{'id':stop['id'],'day':day},when=when)
    self.assertEqual(code,200);self.assertEqual(result['step'],i+1)
    self.assertEqual(call('checkin',{'id':stop['id'],'day':day},when=when)[0],409)
   self.assertTrue(result['complete']);self.assertEqual(result['completed_routes'],1)
   self.assertEqual(call('status',{},uid='b')[1]['completed_routes'],0)
   self.assertEqual(call('status',{},when=now+86400)[1]['step'],0)
   self.assertEqual(call('checkin',{'id':stops[0]['id'],'day':day},when=now+86400)[0],409)
 def test_backup_download(self):
  import time
  with tempfile.TemporaryDirectory() as tmp,sqlite3.connect(Path(tmp)/'live.sqlite3') as c,patch.dict(os.environ,{'WISH_ADMIN_PASSWORD':'unit-test-password-only'}):
   admin.init(c);c.execute("CREATE TABLE sample(x)");c.execute("INSERT INTO sample VALUES(42)");c.execute('INSERT INTO staff_sessions VALUES(?,?)',(admin.hash_token('test'),int(time.time())+100));c.commit()
   self.assertEqual(admin.handle(H('/api/admin/backup-download'),c,{})[0],401)
   h=H('/api/admin/backup-download',{'Cookie':'ww_admin=test'});admin.handle(h,c,{})
   self.assertEqual(h.status,200);p=Path(tmp)/'export.sqlite3';p.write_bytes(h.wfile.getvalue())
   with sqlite3.connect(p) as b:self.assertEqual(b.execute('PRAGMA integrity_check').fetchone()[0],'ok');self.assertEqual(b.execute('SELECT x FROM sample').fetchone()[0],42)
if __name__=='__main__':unittest.main()

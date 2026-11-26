import sqlite3,tempfile,unittest
from pathlib import Path
import save_guard,verified_rewards
from migration.backup_sqlite import snapshot
class H:
 def __init__(self,path):self.path=path
 def reply(self,status,data):return status,data
class Infrastructure(unittest.TestCase):
 def test_reward(self):
  with sqlite3.connect(':memory:') as c:
   verified_rewards.init(c)
   u={'id':'alice'}
   def call(path,d=None):
    with c:return verified_rewards.handle(H(path),c,u,d)
   self.assertEqual(call('/status')[1]['balance'],0)
   self.assertEqual(call('/claim',{'balance':999})[0],400)
   self.assertEqual(call('/claim',{})[1]['balance'],10)
   self.assertEqual(call('/claim',{})[0],409)
   self.assertEqual(call('/status')[1]['balance'],10)
 def test_guard(self):
  self.assertFalse(save_guard.valid_tree({'x':float('nan')}))
  self.assertTrue(save_guard.valid_tree({'x':[1,True,None]}))
  with sqlite3.connect(':memory:') as c:
   save_guard.init(c);save_guard.audit(c,'alice',2,{'coins':5},{'coins':10000})
   self.assertEqual(c.execute('SELECT delta FROM save_anomalies').fetchone()[0],9995)
 def test_runtime_guard(self):
  import runtime_guard as g
  self.assertEqual(g.decode(b'{"ok":[1,true,null]}'),{'ok':[1,True,None]})
  for raw in (b'{"x":NaN}',b'{"x":1e999}',b'{"x":1,"x":2}',b'{"x":9223372036854775808}',b'{"x":"\\ud800"}',b'[]',b'{"x":'+b'['*40+b'0'+b']'*40+b'}'):
   with self.assertRaises(ValueError):g.decode(raw)
  for _ in range(120):self.assertTrue(g.allow('quota-test','/api/save',100))
  self.assertFalse(g.allow('quota-test','/api/save',101))
  self.assertTrue(g.allow('quota-test','/api/social/pulse',101))
  self.assertTrue(g.allow('other-test','/api/save',101))
  self.assertTrue(g.allow('quota-test','/api/save',160))
  before=g.summary()['responses']['429'];g.record(429)
  self.assertEqual(g.summary()['responses']['429'],before+1)
 def test_backup(self):
  with tempfile.TemporaryDirectory() as tmp:
   src=Path(tmp)/'a.db';dst=Path(tmp)/'b.db'
   with sqlite3.connect(src) as c:
    c.execute('PRAGMA journal_mode=WAL');c.execute('CREATE TABLE t(x)');c.execute('INSERT INTO t VALUES(1)');c.commit()
    snapshot(src,dst)
   with sqlite3.connect(dst) as c:self.assertEqual(c.execute('SELECT x FROM t').fetchone()[0],1)
   with self.assertRaises(ValueError):snapshot(src,dst)
if __name__=='__main__':unittest.main()

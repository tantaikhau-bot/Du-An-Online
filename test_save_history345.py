import sqlite3, tempfile, unittest, threading
from pathlib import Path
import save_guard as g

class SaveHistoryTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.path=str(Path(self.tmp.name)/'world.sqlite3')
  self.c=sqlite3.connect(self.path,timeout=5)
  self.c.execute('CREATE TABLE users(id TEXT PRIMARY KEY, save TEXT, revision INTEGER NOT NULL DEFAULT 0)')
  self.c.executemany('INSERT INTO users(id) VALUES(?)',[('a',),('b',)])
  g.init(self.c); self.c.commit()
 def tearDown(self):
  self.c.close(); self.tmp.cleanup()
 def write(self,uid,rev,state):
  with self.c:return g.write_save345(self.c,uid,rev,state)
 def test_first_save_and_replay(self):
  self.assertEqual(self.write('a',0,{'coins':5}),('saved',1))
  self.assertEqual(self.write('a',0,{'coins':5}),('replay',1))
  self.assertEqual(g.list_history345(self.c,'a'),[])
  self.assertEqual(self.write('a',0,{'coins':6}),('conflict',1))
 def test_retention_and_isolation(self):
  for r in range(8):self.assertEqual(self.write('a',r,{'coins':r}),('saved',r+1))
  self.assertEqual([r['revision'] for r in g.list_history345(self.c,'a')],[7,6,5])
  self.assertEqual(g.read_history345(self.c,'a',7)['state'],{'coins':6})
  self.assertIsNone(g.read_history345(self.c,'a',4))
  self.assertIsNone(g.read_history345(self.c,'b',7))
  self.assertEqual(g.list_history345(self.c,'b'),[])
 def test_rollback(self):
  self.write('a',0,{'coins':1})
  self.c.execute("CREATE TRIGGER fail_save BEFORE UPDATE ON users BEGIN SELECT RAISE(ABORT,'failure'); END")
  self.c.commit()
  with self.assertRaises(sqlite3.IntegrityError):self.write('a',1,{'coins':2})
  self.assertEqual(g.list_history345(self.c,'a'),[])
  self.assertEqual(self.c.execute("SELECT revision FROM users WHERE id='a'").fetchone()[0],1)
 def test_concurrent_writers(self):
  barrier=threading.Barrier(2); outcomes=[]
  def work(n):
   c=sqlite3.connect(self.path,timeout=5)
   try:
    barrier.wait(timeout=5)
    with c:outcomes.append(g.write_save345(c,'a',0,{'coins':n}))
   finally:c.close()
  workers=[threading.Thread(target=work,args=(n,)) for n in (1,2)]
  for t in workers:t.start()
  for t in workers:t.join(10)
  self.assertCountEqual(outcomes,[('saved',1),('conflict',1)])
 def test_missing_and_invalid(self):
  self.assertEqual(self.write('missing',0,{'coins':1}),('missing',None))
  with self.assertRaises(ValueError):self.write('a',0,{'coins':float('nan')})
  self.assertEqual(self.c.execute("SELECT revision FROM users WHERE id='a'").fetchone()[0],0)
 def test_audit_and_reopen(self):
  self.write('a',0,{'coins':1});self.write('a',1,{'coins':9000})
  self.assertEqual(self.c.execute('SELECT delta FROM save_anomalies').fetchone()[0],8999)
  with sqlite3.connect(self.path) as c:self.assertEqual(g.read_history345(c,'a',1)['state'],{'coins':1})

if __name__=='__main__':unittest.main()

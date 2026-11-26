import sqlite3,unittest
import together
class Req:
 def __init__(self,action):self.path='/api/social/together/'+action
 def reply(self,status,obj):return status,obj
class PairPlanTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); CREATE TABLE friends(sender TEXT,receiver TEXT,status TEXT); INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Cara'); INSERT INTO friends VALUES('a','b','accepted');")
  together.init(self.c)
  self.c.execute("INSERT INTO ww_pairs VALUES('a','b','accepted',0)");self.c.commit()
 def tearDown(self):self.c.close()
 def call(self,uid,action,**d):
  result=together.handle(Req(action),self.c,{'id':uid},d)
  if result[0]>=400:self.c.rollback()
  return result
 def test_mutual(self):
  self.assertEqual(self.call('a','propose89',id='b',theme='ocean',date='')[0],200)
  v=self.call('b','pair89')[1]['plan']
  self.assertEqual(v['accepted'],0)
  self.assertEqual(self.call('a','accept89',id='b',revision=v['revision'])[0],409)
  self.assertEqual(self.call('b','accept89',id='a',revision=v['revision'])[0],200)
  self.assertEqual(self.call('a','pair89')[1]['plan']['accepted'],1)
  self.assertEqual(self.call('b','cancel89',id='a')[0],200)
  self.assertIsNone(self.call('a','pair89')[1]['plan'])
 def test_stale_and_invalid(self):
  self.assertEqual(self.call('a','propose89',id='c',theme='ocean',date='')[0],403)
  self.assertEqual(self.call('a','propose89',id='b',theme='bad',date='')[0],400)
  self.assertEqual(self.call('a','propose89',id='b',theme='ocean',date='not-date')[0],400)
  self.call('a','propose89',id='b',theme='ocean',date='')
  v=self.call('b','pair89')[1]['plan']
  self.call('a','propose89',id='b',theme='rose',date='')
  self.assertEqual(self.call('b','accept89',id='a',revision=v['revision'])[0],409)
  together.end_pair(self.c,'a','b');self.c.commit()
  self.assertIsNone(self.call('a','pair89')[1]['pair'])
if __name__=='__main__':unittest.main()

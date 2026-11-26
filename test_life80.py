import sqlite3,unittest
import together
class Request:
 def __init__(self,action):self.path='/api/social/together/'+action
 def reply(self,status,obj):return status,obj
class LifeTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); CREATE TABLE friends(sender TEXT,receiver TEXT,status TEXT); CREATE TABLE presence(uid TEXT PRIMARY KEY,x REAL,y REAL,area INTEGER,seen REAL); INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Cara'); INSERT INTO friends VALUES('a','b','accepted');")
  together.init(self.c)
  self.c.execute("INSERT INTO ww_pairs VALUES('a','b','accepted',0)")
  import time
  self.c.executemany('INSERT INTO presence VALUES(?,?,?,?,?)',[(uid,490,575,0,time.time()) for uid in ('a','b')]);self.c.commit()
 def tearDown(self):self.c.close()
 def call(self,uid,action,**d):
  result=together.handle(Request(action),self.c,{'id':uid},d)
  if result[0]>=400:self.c.rollback()
  return result
 def test_gifts(self):
  self.assertEqual(self.call('a','gift80',id='c',gift='flower')[0],403)
  self.assertEqual(self.call('a','gift80',id='b',gift='bad')[0],400)
  for _ in range(5):self.assertEqual(self.call('a','gift80',id='b',gift='flower')[0],201)
  self.assertEqual(self.call('a','gift80',id='b',gift='flower')[0],429)
  self.assertEqual(len(self.call('b','life80')[1]['gifts']),5)
 def test_mutual_vows(self):
  self.assertEqual(self.call('a','vow80',id='b')[0],200)
  self.assertFalse(self.call('b','life80')[1]['vow']['completed'])
  self.assertEqual(self.call('a','vow80',id='b')[0],409)
  self.assertEqual(self.call('b','vow80',id='a')[0],200)
  self.assertTrue(self.call('a','life80')[1]['vow']['completed'])
  self.assertEqual(self.call('b','unvow80',id='a')[0],200)
  self.assertFalse(self.call('a','life80')[1]['vow']['completed'])
 def test_distance_and_block(self):
  self.c.execute("UPDATE presence SET x=1000 WHERE uid='b'");self.c.commit()
  self.assertEqual(self.call('a','vow80',id='b')[0],409)
  self.assertEqual(self.call('b','block',id='a')[0],200)
  self.assertIsNone(self.call('a','life80')[1]['pair'])
if __name__=='__main__':unittest.main()

import sqlite3, unittest
import social

class Reply:
 path='/api/social/pulse'
 def reply(self,status,obj):return status,obj

class Pair63Test(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:')
  self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob');")
  social.init(self.c)
  self.c.execute("INSERT INTO friends VALUES('a','b','accepted')")
  self.c.commit()
 def tearDown(self):self.c.close()
 def pulse(self,uid,action='idle',target='',x=490):
  status,result=social.handle(Reply(),self.c,{'id':uid},{'x':x,'y':575,'area':0,'action':action,'target':target})
  self.assertEqual(status,200)
  return result
 def test_mutual_hug_and_invite(self):
  self.assertEqual(self.pulse('a','hug','b')['match'],'')
  b=self.pulse('b')
  self.assertEqual(b['incoming'][0]['id'],'a')
  self.assertEqual(b['players'][0]['action'],'idle')
  self.assertEqual(self.pulse('b','hug','a')['match'],'a')
  self.assertEqual(self.pulse('a','hug','b')['match'],'b')
 def test_dance_distance_and_block(self):
  self.pulse('a','duet','b')
  self.assertEqual(self.pulse('b','duet','a',x=700)['match'],'')
  self.assertEqual(self.pulse('b','duet','a')['match'],'a')
  self.c.execute("INSERT INTO ww_blocks VALUES('a','b')")
  self.c.commit()
  result=self.pulse('a','duet','b')
  self.assertEqual(result['match'],'')
  self.assertEqual(result['players'],[])
 def test_portrait(self):
  self.pulse('a','portrait')
  self.assertEqual(self.pulse('b')['players'][0]['action'],'portrait')

if __name__=='__main__':unittest.main()

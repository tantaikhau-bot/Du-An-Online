import sqlite3, unittest
import social
class Reply:
 path='/api/social/pulse'
 def reply(self,status,obj):return status,obj
class SharedWorldTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:')
  self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Cara');")
  social.init(self.c)
 def tearDown(self):self.c.close()
 def pulse(self,uid,**kwargs):
  code,out=social.handle(Reply(),self.c,{'id':uid},{'x':490,'y':575,'area':0,**kwargs})
  self.assertEqual(code,200)
  return out
 def test_motion_visibility_and_leave(self):
  self.pulse('a',heading=1.3,moving=True,jump=.4)
  a=self.pulse('b')['players'][0]
  self.assertEqual(a['id'],'a')
  self.assertEqual(a['heading'],1.3)
  self.assertEqual(a['moving'],1)
  self.assertAlmostEqual(a['jump'],.4)
  req=Reply();req.path='/api/social/leave'
  self.assertEqual(social.handle(req,self.c,{'id':'a'},{}),(200,{'ok':True}))
  self.assertFalse(self.pulse('b')['players'])
 def test_nearest_and_block(self):
  self.pulse('a',x=600)
  self.pulse('c',x=500)
  self.assertEqual([p['id'] for p in self.pulse('b')['players']],['c','a'])
  self.c.execute("INSERT INTO blocked VALUES('a')")
  self.assertEqual([p['id'] for p in self.pulse('b')['players']],['c'])
 def test_invalid_motion(self):
  self.pulse('a',heading='bad',moving=1,jump=100)
  p=self.pulse('b')['players'][0]
  self.assertEqual((p['heading'],p['moving'],p['jump']),(0,0,2))
if __name__=='__main__':unittest.main()

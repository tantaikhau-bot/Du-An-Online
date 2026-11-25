import sqlite3, unittest
import social
class Reply:
 path='/api/social/pulse'
 def reply(self,status,obj):return status,obj
class Avatar64Test(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:')
  self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob');")
  social.init(self.c)
 def tearDown(self):self.c.close()
 def pulse(self,uid,**kwargs):
  status,result=social.handle(Reply(),self.c,{'id':uid},{'x':490,'y':575,'area':0,**kwargs})
  self.assertEqual(status,200)
  return result
 def test_sync_appearance(self):
  self.pulse('a',height='tall',build='athletic',face='angular',eye='green',hair='auburn',style='wavy')
  a=self.pulse('b')['players'][0]
  for k,v in dict(height='tall',build='athletic',face='angular',eye='green',hair='auburn',style='wavy').items():self.assertEqual(a[k],v)
 def test_default_and_invalid_values(self):
  self.pulse('a',height='invalid',build=[],face=None,eye=5,hair='invalid',style='invalid')
  a=self.pulse('b')['players'][0]
  for k,v in dict(height='normal',build='normal',face='classic',eye='brown',hair='chestnut',style='short').items():self.assertEqual(a[k],v)
if __name__=='__main__':unittest.main()

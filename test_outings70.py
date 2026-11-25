import sqlite3, unittest
import social
class Req:
 def __init__(self,path):self.path='/api/social/'+path
 def reply(self,status,obj):return status,obj
class OutingTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Cara');")
  social.init(self.c)
  self.c.execute("INSERT INTO friends VALUES('a','b','accepted')");self.c.commit()
 def tearDown(self):self.c.close()
 def call(self,uid,path,**d):
  result=social.handle(Req(path),self.c,{'id':uid},d)
  if result[0]>=400:self.c.rollback()
  return result
 def pulse(self,uid,**kwargs):return self.call(uid,'pulse',x=490,y=575,area=0,**kwargs)[1]
 def test_pet(self):
  self.pulse('a',pet='fox')
  self.assertEqual(self.pulse('b')['players'][0]['pet'],'fox')
  self.pulse('a',pet='invalid')
  self.assertEqual(self.pulse('b')['players'][0]['pet'],'')
 def test_invitation_consent(self):
  self.pulse('a');self.pulse('b');self.pulse('c')
  self.assertEqual(self.call('a','outing/invite',id='c',place='plaza')[0],403)
  code,result=self.call('a','outing/invite',id='b',place='plaza')
  self.assertEqual(code,201);mid=result['id']
  self.assertEqual(self.pulse('b')['outings'][0]['status'],'pending')
  self.assertEqual(self.call('c','outing/accept',invite=mid)[0],404)
  self.assertEqual(self.call('b','outing/accept',invite=mid)[0],200)
  self.assertEqual(self.pulse('a')['outings'][0]['status'],'accepted')
 def test_blocked(self):
  self.pulse('a');self.pulse('b')
  self.c.execute("INSERT INTO ww_blocks VALUES('b','a')");self.c.commit()
  self.assertEqual(self.call('a','outing/invite',id='b',place='plaza')[0],403)
if __name__=='__main__':unittest.main()

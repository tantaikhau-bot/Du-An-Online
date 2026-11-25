import sqlite3, unittest
import social
class Req:
 def __init__(self,path):self.path='/api/social/'+path
 def reply(self,status,obj):return status,obj
class NearTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Cara');")
  social.init(self.c)
 def tearDown(self):self.c.close()
 def call(self,uid,path,**d):return social.handle(Req(path),self.c,{'id':uid},d)
 def pulse(self,uid,x=490):return self.call(uid,'pulse',x=x,y=575,area=0)[1]
 def test_radius_and_report(self):
  self.pulse('a');self.pulse('b',525);self.pulse('c',1200)
  code,out=self.call('a','near/send',body='Xin chào');self.assertEqual(code,201)
  self.assertEqual(self.pulse('b',525)['near'][0]['body'],'Xin chào')
  self.assertEqual(self.pulse('c',1200)['near'],[])
  self.assertEqual(self.call('c','near/report',message=out['id'],reason='Spam')[0],404);self.c.rollback()
  self.assertEqual(self.call('b','near/report',message=out['id'],reason='Spam')[0],201)
 def test_block_and_invalid(self):
  self.pulse('a');self.pulse('b')
  self.c.execute("INSERT INTO ww_blocks VALUES('b','a')");self.c.commit()
  self.assertEqual(self.call('a','near/send',body='https://example.com')[0],400)
  self.assertEqual(self.call('a','near/send',body='Chào')[0],201)
  self.assertEqual(self.pulse('b')['near'],[])
 def test_late_arrival(self):
  self.pulse('a');self.call('a','near/send',body='Chào');self.assertEqual(self.pulse('b')['near'],[])
if __name__=='__main__':unittest.main()

import sqlite3,unittest
import social
class Req:
 def __init__(self,path):self.path='/api/social/'+path
 def reply(self,status,obj):return status,obj
class CarTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); INSERT INTO users VALUES('a','Alice'),('b','Bob');")
  social.init(self.c)
  self.c.commit()
 def tearDown(self):self.c.close()
 def pulse(self,uid,**kwargs):
  status,result=social.handle(Req('pulse'),self.c,{'id':uid},{'x':490,'y':575,'area':0,**kwargs})
  self.assertEqual(status,200)
  return result
 def test_car_and_dismount(self):
  self.pulse('a',vehicle='car')
  self.assertEqual(self.pulse('b')['players'][0]['vehicle'],'car')
  self.pulse('a',vehicle='')
  self.assertEqual(self.pulse('b')['players'][0]['vehicle'],'')
 def test_enum(self):
  self.pulse('a',vehicle='invalid')
  self.assertEqual(self.pulse('b')['players'][0]['vehicle'],'')
 def test_leave(self):
  self.pulse('a',vehicle='car')
  social.handle(Req('leave'),self.c,{'id':'a'},{})
  self.assertFalse(self.pulse('b')['players'])
if __name__=='__main__':unittest.main()

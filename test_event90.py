import sqlite3,unittest
from datetime import date
import together
class Req:
 def __init__(self,action):self.path='/api/social/together/'+action
 def reply(self,status,obj):return status,obj
class EventTest(unittest.TestCase):
 def setUp(self):
  self.c=sqlite3.connect(':memory:');self.c.row_factory=sqlite3.Row
  self.c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE blocked(uid TEXT PRIMARY KEY); CREATE TABLE friends(sender TEXT,receiver TEXT,status TEXT); INSERT INTO users VALUES('a','A'),('b','B'),('c','C'),('d','D'); INSERT INTO friends VALUES('a','b','accepted'),('a','c','accepted');")
  together.init(self.c);self.c.execute("INSERT INTO ww_pairs VALUES('a','b','accepted',0)");self.c.commit()
 def tearDown(self):self.c.close()
 def call(self,u,action,**data):
  result=together.handle(Req(action),self.c,{'id':u},data)
  if result[0]>=400:self.c.rollback()
  return result
 def test_invite_rsvp_and_invalidation(self):
  self.assertEqual(self.call('a','propose89',id='b',theme='classic',date=date.today().isoformat())[0],200)
  rev=self.call('a','pair89')[1]['plan']['revision']
  self.assertEqual(self.call('a','invite90',guest='c',revision=rev)[0],409)
  self.assertEqual(self.call('b','accept89',id='a',revision=rev)[0],200)
  self.assertEqual(self.call('a','invite90',guest='d',revision=rev)[0],403)
  self.assertEqual(self.call('a','invite90',guest='c',revision=rev)[0],201)
  self.assertEqual(self.call('a','invite90',guest='c',revision=rev)[0],409)
  self.assertEqual(self.call('d','rsvp90',a='a',b='b',revision=rev,status='accepted')[0],404)
  self.assertEqual(self.call('c','rsvp90',a='a',b='b',revision=rev,status='accepted')[0],200)
  self.assertEqual(self.call('b','events90')[1]['guests'][0]['status'],'accepted')
  self.assertEqual(self.call('a','cancel89',id='b')[0],200)
  self.assertEqual(self.call('c','events90')[1]['incoming'],[])
if __name__=='__main__':unittest.main()

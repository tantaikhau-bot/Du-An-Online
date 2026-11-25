"""Isolated startup smoke tests; no production accounts or data touched."""
import sqlite3, time, together, social
class H:
 def __init__(self,action):self.path='/api/social/together/'+action
 def reply(self,status,data):return status,data
def smoke():
 c=sqlite3.connect(':memory:');c.row_factory=sqlite3.Row
 try:
  c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT);CREATE TABLE blocked(uid TEXT PRIMARY KEY);INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Chris');")
  social.init(c);c.execute("INSERT INTO friends VALUES('a','b','accepted')");c.execute("INSERT INTO friends VALUES('a','c','accepted')");c.commit()
  def call(u,action,status,**d):
   with c:r=together.handle(H(action),c,{'id':u},d)
   assert r[0]==status,(action,r,status)
   return r[1]
  call('a','send',201,id='b',body='Xin chào')
  assert call('b','chat',200,id='a')['messages'][0]['body']=='Xin chào'
  assert not call('c','chat',200,id='a')['messages']
  call('c','chat',403,id='b')
  call('c','send',403,id='b',body='Chào')
  call('a','send',400,body='https://example.com')
  call('b','send',201,body='Chào quảng trường')
  m=call('c','chat',200)['messages'][0]
  assert m['body']=='Chào quảng trường'
  call('c','report',201,message=m['id'],reason='Spam')
  call('c','report',409,message=m['id'],reason='Spam')
  call('a','invite',200,id='b')
  call('a','accept',404,id='b')
  call('c','accept',404,id='a')
  call('b','accept',200,id='a')
  call('a','invite',409,id='c')
  call('a','activity',409,id='b')
  c.executemany('INSERT INTO presence VALUES(?,?,?,?,?)',[('a',490,575,0,time.time()),('b',500,575,0,time.time())]);c.commit()
  call('a','activity',200,id='b')
  call('a','activity',409,id='b')
  call('b','activity',200,id='a')
  assert call('a','state',200)['activity']['completed']
  call('b','block',200,id='a')
  assert not call('a','state',200)['links']
  call('a','send',403,id='b',body='Chào')
  assert not call('a','chat',200)['messages']
  call('b','unblock',200,id='a')
  call('a','send',403,id='b',body='Chào')
  print('Together smoke tests passed: private chat, visibility, report, mutual acceptance, activity, block',flush=True)
 finally:c.close()
if __name__=='__main__':smoke()

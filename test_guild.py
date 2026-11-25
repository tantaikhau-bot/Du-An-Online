"""Isolated SQLite integration tests for V5.7."""
import sqlite3,time,social,guild,together
class H:
 def __init__(self,path):self.path=path
 def reply(self,status,data):return status,data
def smoke():
 c=sqlite3.connect(':memory:');c.row_factory=sqlite3.Row
 try:
  c.executescript("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT);CREATE TABLE blocked(uid TEXT PRIMARY KEY);INSERT INTO users VALUES('a','Alice'),('b','Bob'),('c','Chris'),('d','Dawn'),('e','Eve');")
  social.init(c)
  c.executemany("INSERT INTO friends VALUES(?,?,'accepted')",[('a',x) for x in 'bcde']);c.commit()
  def call(uid,action,status,**d):
   with c:result=guild.handle(H('/api/social/group/'+action),c,{'id':uid},d)
   assert result[0]==status,(action,result,status)
   return result[1]
  def chat(uid,action,status,**d):
   with c:result=together.handle(H('/api/social/together/'+action),c,{'id':uid},d)
   assert result[0]==status,(action,result,status)
   return result[1]
  g=call('a','create',201,kind='party',name='Team A')['id']
  call('a','create',409,kind='party',name='Team B')
  call('a','create',201,kind='guild',name='Guild A')
  call('b','accept',404,gid=g)
  for x in 'bcd':call('a','invite',200,gid=g,id=x);call(x,'accept',200,gid=g)
  call('a','invite',409,gid=g,id='e')
  call('b','invite',403,gid=g,id='e')
  call('e','chat',403,gid=g);call('e','send',403,gid=g,body='Hi')
  call('a','send',200,gid=g,body='Chao team')
  msg=call('b','chat',200,gid=g)['messages'][0]
  assert msg['body']=='Chao team'
  assert not chat('b','chat',200)['messages']
  assert not chat('b','chat',200,id='a')['messages']
  chat('e','report',404,message=msg['id'],reason='Spam')
  chat('b','report',201,message=msg['id'],reason='Spam')
  call('a','expedition',409,gid=g)
  c.executemany('INSERT INTO presence VALUES(?,?,?,?,?)',[('a',490,575,0,time.time()),('b',500,575,0,time.time())]);c.commit()
  call('a','expedition',200,gid=g);call('b','expedition',409,gid=g)
  assert next(x for x in call('a','state',200)['groups'] if x['id']==g)['xp']==25
  chat('b','block',200,id='a')
  assert not call('b','chat',200,gid=g)['messages']
  call('a','kick',200,gid=g,id='d');call('d','chat',403,gid=g)
  call('a','leave',200,gid=g);call('a','chat',403,gid=g)
  assert call('b','state',200)['groups'][0]['leader']=='b'
  print('Guild smoke tests passed: capacity, consent, chat isolation, report, expedition, blocking, leader transfer',flush=True)
 finally:c.close()
if __name__=='__main__':smoke()

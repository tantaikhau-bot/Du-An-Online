import time, math, sqlite3, together, guild

def init(c):
 together.init(c)
 guild.init(c)
 c.executescript('''CREATE TABLE IF NOT EXISTS presence(uid TEXT PRIMARY KEY,x REAL,y REAL,area INTEGER,seen REAL); CREATE TABLE IF NOT EXISTS character61(uid TEXT PRIMARY KEY,body TEXT,skin TEXT,hair TEXT,style TEXT,dye TEXT,action TEXT,target TEXT); CREATE TABLE IF NOT EXISTS friends(sender TEXT,receiver TEXT,status TEXT,PRIMARY KEY(sender,receiver)); CREATE TABLE IF NOT EXISTS greetings(sender TEXT,receiver TEXT,kind TEXT,created REAL); CREATE TABLE IF NOT EXISTS reports(reporter TEXT,target TEXT,reason TEXT,created REAL);''')

def handle(h,c,u,d):
 path=h.path; uid=u['id']; now=time.time(); reply=h.reply
 if path.startswith('/api/social/group/'):return guild.handle(h,c,u,d)
 if path.startswith('/api/social/together/'):return together.handle(h,c,u,d)
 if path=='/api/social/pulse':
  x,y,a=d.get('x'),d.get('y'),d.get('area')
  if type(x) not in (int,float) or type(y) not in (int,float) or not math.isfinite(x) or not math.isfinite(y) or not -2030<=x<=3010 or not -433<=y<=1583 or type(a)!=int or not 0<=a<=7:return reply(400,{'error':'Vị trí không hợp lệ'})
  def pick(key,allowed,default):
   v=d.get(key)
   return v if isinstance(v,str) and v in allowed else default
  body=pick('body',('male','female'),'male')
  skin=pick('skin',('warm','fair','deep'),'warm')
  hair=pick('hair',('chestnut','silver','dark'),'chestnut')
  style=pick('style',('short','long','tied'),'short')
  dye=pick('dye',('original','moss','navy','wine','sand','ivory','charcoal'),'original')
  action=pick('action',('idle','wave','smile','sit','dance','hand','photo'),'idle')
  target=d.get('target')
  if not isinstance(target,str) or len(target)>100 or target==uid:target=''
  if action not in ('hand','photo'):target=''
  c.execute('INSERT OR REPLACE INTO presence VALUES(?,?,?,?,?)',(uid,x,y,a,now))
  c.execute('INSERT OR REPLACE INTO character61 VALUES(?,?,?,?,?,?,?,?)',(uid,body,skin,hair,style,dye,action,target))
  c.execute('DELETE FROM presence WHERE seen<?',(now-30,))
  c.execute('DELETE FROM character61 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.commit()
  def mutually_ready(first,second,kind):
   if not second or kind not in ('hand','photo'):return False
   if together.blocked(c,first,second) or not together.available(c,second):return False
   if not c.execute("SELECT 1 FROM friends WHERE status='accepted' AND ((sender=? AND receiver=?) OR (sender=? AND receiver=?))",(first,second,second,first)).fetchone():return False
   row=c.execute('SELECT p.x,p.y,p.area,p.seen,q.action,q.target FROM presence p JOIN character61 q ON q.uid=p.uid WHERE p.uid=?',(second,)).fetchone()
   origin=c.execute('SELECT x,y,area,seen FROM presence WHERE uid=?',(first,)).fetchone()
   return bool(row and origin and row['seen']>now-4 and origin['seen']>now-4 and row['action']==kind and row['target']==first and row['area']==origin['area'] and math.hypot((row['x']-origin['x'])/35,(row['y']-origin['y'])/14)<3)
  players=[]
  for r in c.execute('SELECT p.uid AS id,u.name,p.x,p.y,p.area,q.body,q.skin,q.hair,q.style,q.dye,q.action,q.target FROM presence p JOIN users u ON u.id=p.uid LEFT JOIN character61 q ON q.uid=p.uid WHERE p.uid!=? AND p.seen>? AND p.uid NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=p.uid) OR (b.target=? AND b.owner=p.uid)) LIMIT 100',(uid,now-12,uid,uid)):
   v=dict(r)
   if v['action'] in ('hand','photo') and not mutually_ready(v['id'],v['target'],v['action']):v['action']='idle'
   v.pop('target',None)
   players.append(v)
  return reply(200,{'players':players,'match':target if mutually_ready(uid,target,action) else ''})
 if path=='/api/social/list':
  return reply(200,{'friends':[dict(r) for r in c.execute('SELECT f.sender,f.receiver,f.status,u.name,u.id FROM friends f JOIN users u ON u.id=CASE WHEN f.sender=? THEN f.receiver ELSE f.sender END WHERE f.sender=? OR f.receiver=?',(uid,uid,uid))], 'greetings':[dict(r) for r in c.execute('SELECT u.name,g.kind,g.created FROM greetings g JOIN users u ON u.id=g.sender WHERE g.receiver=? ORDER BY g.created DESC LIMIT 20',(uid,))]})
 if path=='/api/social/search':
  q=d.get('name','');
  if not isinstance(q,str) or not 2<=len(q)<=24:return reply(400,{'error':'Nhập tên 2–24 ký tự'})
  return reply(200,{'users':[dict(r) for r in c.execute('SELECT id,name FROM users WHERE instr(lower(name),lower(?))>0 AND id!=? AND id NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=users.id) OR (b.target=? AND b.owner=users.id)) LIMIT 20',(q,uid,uid,uid))]})
 target=d.get('id');
 if not isinstance(target,str) or target==uid or not c.execute('SELECT 1 FROM users WHERE id=?',(target,)).fetchone():return reply(400,{'error':'Người chơi không hợp lệ'})
 c.execute('BEGIN IMMEDIATE')
 if path!='/api/social/report' and (together.blocked(c,uid,target) or not together.available(c,target)):return reply(403,{'error':'Không thể tương tác với người này'})
 if path=='/api/social/invite':
  if c.execute('SELECT 1 FROM friends WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(uid,target,target,uid)).fetchone():return reply(409,{'error':'Đã có lời mời hoặc bạn bè'})
  c.execute('INSERT INTO friends VALUES(?,?,?)',(uid,target,'pending'))
 elif path=='/api/social/accept':
  if not c.execute("UPDATE friends SET status='accepted' WHERE sender=? AND receiver=? AND status='pending'",(target,uid)).rowcount:return reply(404,{'error':'Không có lời mời'})
 elif path=='/api/social/remove':
  together.end_pair(c,uid,target)
  c.execute('DELETE FROM friends WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(uid,target,target,uid))
 elif path=='/api/social/greet':
  kind=d.get('kind');
  if kind not in ('Xin chào','Chúc bình an','Chúc vui vẻ'):return reply(400,{'error':'Lời chào không hợp lệ'})
  if not c.execute("SELECT 1 FROM friends WHERE status='accepted' AND ((sender=? AND receiver=?) OR (sender=? AND receiver=?))",(uid,target,target,uid)).fetchone():return reply(403,{'error':'Chỉ gửi cho bạn bè'})
  if c.execute('SELECT 1 FROM greetings WHERE sender=? AND created>?',(uid,now-10)).fetchone():return reply(429,{'error':'Chờ 10 giây'})
  c.execute('INSERT INTO greetings VALUES(?,?,?,?)',(uid,target,kind,now))
 elif path=='/api/social/report':
  reason=d.get('reason');
  if reason not in ('Quấy rối','Tên không phù hợp','Khác'):return reply(400,{'error':'Lý do không hợp lệ'})
  if c.execute('SELECT 1 FROM reports WHERE reporter=? AND target=? AND created>?',(uid,target,now-86400)).fetchone():return reply(429,{'error':'Đã báo cáo hôm nay'})
  c.execute('INSERT INTO reports VALUES(?,?,?,?)',(uid,target,reason,now))
 else:return reply(404,{'error':'Không tìm thấy'})
 c.commit();return reply(200,{'ok':True})

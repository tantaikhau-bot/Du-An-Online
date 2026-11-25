import time, math, sqlite3

def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS presence(uid TEXT PRIMARY KEY,x REAL,y REAL,area INTEGER,seen REAL); CREATE TABLE IF NOT EXISTS friends(sender TEXT,receiver TEXT,status TEXT,PRIMARY KEY(sender,receiver)); CREATE TABLE IF NOT EXISTS greetings(sender TEXT,receiver TEXT,kind TEXT,created REAL); CREATE TABLE IF NOT EXISTS reports(reporter TEXT,target TEXT,reason TEXT,created REAL);''')

def handle(h,c,u,d):
 path=h.path; uid=u['id']; now=time.time(); reply=h.reply
 if path=='/api/social/pulse':
  x,y,a=d.get('x'),d.get('y'),d.get('area')
  if type(x) not in (int,float) or type(y) not in (int,float) or not math.isfinite(x) or not math.isfinite(y) or not -1050<=x<=2030 or not -41<=y<=1191 or type(a)!=int or not 0<=a<=7:return reply(400,{'error':'Vị trí không hợp lệ'})
  c.execute('INSERT OR REPLACE INTO presence VALUES(?,?,?,?,?)',(uid,x,y,a,now));c.execute('DELETE FROM presence WHERE seen<?',(now-30,));c.commit()
  return reply(200,{'players':[dict(r) for r in c.execute('SELECT p.uid AS id,u.name,p.x,p.y,p.area FROM presence p JOIN users u ON u.id=p.uid WHERE p.uid!=? AND p.seen>? LIMIT 100',(uid,now-12))]})
 if path=='/api/social/list':
  return reply(200,{'friends':[dict(r) for r in c.execute('SELECT f.sender,f.receiver,f.status,u.name,u.id FROM friends f JOIN users u ON u.id=CASE WHEN f.sender=? THEN f.receiver ELSE f.sender END WHERE f.sender=? OR f.receiver=?',(uid,uid,uid))], 'greetings':[dict(r) for r in c.execute('SELECT u.name,g.kind,g.created FROM greetings g JOIN users u ON u.id=g.sender WHERE g.receiver=? ORDER BY g.created DESC LIMIT 20',(uid,))]})
 if path=='/api/social/search':
  q=d.get('name','');
  if not isinstance(q,str) or not 2<=len(q)<=24:return reply(400,{'error':'Nhập tên 2–24 ký tự'})
  return reply(200,{'users':[dict(r) for r in c.execute('SELECT id,name FROM users WHERE instr(lower(name),lower(?))>0 AND id!=? LIMIT 20',(q,uid))]})
 target=d.get('id');
 if not isinstance(target,str) or target==uid or not c.execute('SELECT 1 FROM users WHERE id=?',(target,)).fetchone():return reply(400,{'error':'Người chơi không hợp lệ'})
 c.execute('BEGIN IMMEDIATE')
 if path=='/api/social/invite':
  if c.execute('SELECT 1 FROM friends WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(uid,target,target,uid)).fetchone():return reply(409,{'error':'Đã có lời mời hoặc bạn bè'})
  c.execute('INSERT INTO friends VALUES(?,?,?)',(uid,target,'pending'))
 elif path=='/api/social/accept':
  if not c.execute("UPDATE friends SET status='accepted' WHERE sender=? AND receiver=? AND status='pending'",(target,uid)).rowcount:return reply(404,{'error':'Không có lời mời'})
 elif path=='/api/social/remove':
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

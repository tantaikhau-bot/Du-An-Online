import time, math, sqlite3, together, guild, adventure

def init(c):
 adventure.init(c)
 c.execute('CREATE TABLE IF NOT EXISTS avatar109(uid TEXT PRIMARY KEY,preset TEXT NOT NULL,gait REAL NOT NULL)')
 together.init(c)
 guild.init(c)
 c.executescript('''CREATE TABLE IF NOT EXISTS presence(uid TEXT PRIMARY KEY,x REAL,y REAL,area INTEGER,seen REAL); CREATE TABLE IF NOT EXISTS character61(uid TEXT PRIMARY KEY,body TEXT,skin TEXT,hair TEXT,style TEXT,dye TEXT,action TEXT,target TEXT); CREATE TABLE IF NOT EXISTS character64(uid TEXT PRIMARY KEY,height TEXT,build TEXT,face TEXT,eye TEXT); CREATE TABLE IF NOT EXISTS motion68(uid TEXT PRIMARY KEY,heading REAL,moving INTEGER,jump REAL); CREATE TABLE IF NOT EXISTS pet70(uid TEXT PRIMARY KEY,kind TEXT); CREATE TABLE IF NOT EXISTS vehicle88(uid TEXT PRIMARY KEY,kind TEXT); CREATE INDEX IF NOT EXISTS presence88_seen ON presence(seen); CREATE TABLE IF NOT EXISTS outing70(id INTEGER PRIMARY KEY AUTOINCREMENT,sender TEXT,receiver TEXT,place TEXT,status TEXT,created REAL,updated REAL); CREATE INDEX IF NOT EXISTS outing70_receiver ON outing70(receiver,updated); CREATE INDEX IF NOT EXISTS outing70_sender ON outing70(sender,created); CREATE TABLE IF NOT EXISTS near69(id INTEGER PRIMARY KEY AUTOINCREMENT,sender TEXT NOT NULL,body TEXT NOT NULL,x REAL NOT NULL,y REAL NOT NULL,created REAL NOT NULL,hidden INTEGER NOT NULL DEFAULT 0); CREATE INDEX IF NOT EXISTS near69_sender ON near69(sender,created); CREATE TABLE IF NOT EXISTS near69_audience(mid INTEGER,uid TEXT,PRIMARY KEY(mid,uid)); CREATE INDEX IF NOT EXISTS near69_audience_uid ON near69_audience(uid,mid); CREATE TABLE IF NOT EXISTS friends(sender TEXT,receiver TEXT,status TEXT,PRIMARY KEY(sender,receiver)); CREATE INDEX IF NOT EXISTS friends88_receiver ON friends(receiver,status); CREATE TABLE IF NOT EXISTS greetings(sender TEXT,receiver TEXT,kind TEXT,created REAL); CREATE TABLE IF NOT EXISTS reports(reporter TEXT,target TEXT,reason TEXT,created REAL);''')

def leave(c,uid):
 for table in ('presence','character61','character64','motion68','pet70','vehicle88','avatar109'):
  c.execute('DELETE FROM '+table+' WHERE uid=?',(uid,))

def nearby69(c,uid,now):
 origin=c.execute('SELECT x,y FROM presence WHERE uid=? AND area=0 AND seen>?',(uid,now-5)).fetchone()
 if not origin:return []
 return [dict(r) for r in c.execute("""SELECT m.id,m.sender,u.name,m.body,m.created FROM near69 m JOIN near69_audience a ON a.mid=m.id JOIN users u ON u.id=m.sender JOIN presence p ON p.uid=m.sender WHERE a.uid=? AND m.hidden=0 AND m.created>? AND p.area=0 AND p.seen>? AND m.sender NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=m.sender) OR (b.owner=m.sender AND b.target=?)) AND ((p.x-?)/35.0)*((p.x-?)/35.0)+((p.y-?)/14.0)*((p.y-?)/14.0)<=144 ORDER BY m.id DESC LIMIT 25""",(uid,now-45,now-5,uid,uid,origin['x'],origin['x'],origin['y'],origin['y']))][::-1]

OUTING70=('plaza','village','falls','meadow','hill','forest')
def outings70(c,uid,now):
 return [dict(r) for r in c.execute("""SELECT o.id,o.sender,o.receiver,o.place,o.status,o.updated,u.name FROM outing70 o JOIN users u ON u.id=CASE WHEN o.sender=? THEN o.receiver ELSE o.sender END WHERE (o.sender=? OR o.receiver=?) AND o.updated>? AND u.id NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=u.id) OR (b.target=? AND b.owner=u.id)) AND EXISTS(SELECT 1 FROM friends f WHERE f.status='accepted' AND ((f.sender=? AND f.receiver=u.id) OR (f.receiver=? AND f.sender=u.id))) ORDER BY o.updated DESC LIMIT 20""",(uid,uid,uid,now-600,uid,uid,uid,uid)) if r['status']!='pending' or r['updated']>now-120]

def handle(h,c,u,d):
 path=h.path; uid=u['id']; now=time.time(); reply=h.reply
 if path.startswith('/api/social/adventure/'):return adventure.handle(h,c,u,d,now)
 if path.startswith('/api/social/group/'):return guild.handle(h,c,u,d)
 if path.startswith('/api/social/together/'):return together.handle(h,c,u,d)
 if path.startswith('/api/social/outing/'):
  action=path.rsplit('/',1)[-1]
  if action=='list':return reply(200,{'outings':outings70(c,uid,now)})
  c.execute('BEGIN IMMEDIATE')
  if action=='invite':
   peer,place=d.get('id'),d.get('place')
   if not isinstance(peer,str) or peer==uid or place not in OUTING70 or not together.available(c,peer) or together.blocked(c,uid,peer) or not together.friend(c,uid,peer):return reply(403,{'error':'Chỉ mời bạn bè đã đồng ý kết bạn'})
   if c.execute('SELECT count(*) FROM presence WHERE uid IN (?,?) AND area=0 AND seen>?',(uid,peer,now-5)).fetchone()[0]!=2:return reply(409,{'error':'Hai bạn cần online ngoài thế giới chung'})
   if c.execute('SELECT count(*) FROM outing70 WHERE sender=? AND created>?',(uid,now-60)).fetchone()[0]>=3:return reply(429,{'error':'Chờ trước khi gửi thêm lời mời'})
   if c.execute("SELECT 1 FROM outing70 WHERE sender=? AND receiver=? AND status='pending' AND updated>?",(uid,peer,now-120)).fetchone():return reply(409,{'error':'Đã có lời mời đang chờ'})
   c.execute('DELETE FROM outing70 WHERE updated<?',(now-86400,))
   mid=c.execute("INSERT INTO outing70(sender,receiver,place,status,created,updated) VALUES(?,?,?,'pending',?,?)",(uid,peer,place,now,now)).lastrowid
   c.commit();return reply(201,{'id':mid})
  mid=d.get('invite')
  if type(mid) is not int or not 0<mid<=9223372036854775807 or action not in ('accept','decline','cancel'):return reply(400,{'error':'Lời mời không hợp lệ'})
  o=c.execute('SELECT * FROM outing70 WHERE id=?',(mid,)).fetchone()
  if not o or o['status']!='pending' or o['updated']<=now-120 or (o['sender'] if action=='cancel' else o['receiver'])!=uid:return reply(404,{'error':'Lời mời đã hết hạn hoặc không thuộc về bạn'})
  peer=o['receiver'] if action=='cancel' else o['sender']
  if not together.available(c,peer) or together.blocked(c,uid,peer) or not together.friend(c,uid,peer):return reply(403,{'error':'Không thể tương tác'})
  if action=='accept' and c.execute('SELECT count(*) FROM presence WHERE uid IN (?,?) AND area=0 AND seen>?',(uid,peer,now-5)).fetchone()[0]!=2:return reply(409,{'error':'Hai bạn cần online ngoài thế giới chung'})
  c.execute('UPDATE outing70 SET status=?,updated=? WHERE id=?',({'accept':'accepted','decline':'declined','cancel':'cancelled'}[action],now,mid))
  c.commit();return reply(200,{'ok':True})
 if path=='/api/social/near/send':
  body=together.clean_body(d.get('body'))
  if body is None or len(body)>100:return reply(400,{'error':'Tin nhắn 1–100 ký tự, không chứa liên kết hoặc thông tin liên hệ'})
  c.execute('BEGIN IMMEDIATE')
  origin=c.execute('SELECT x,y FROM presence WHERE uid=? AND area=0 AND seen>?',(uid,now-5)).fetchone()
  if not origin:return reply(409,{'error':'Hãy vào thế giới chung trước'})
  if c.execute('SELECT count(*) FROM near69 WHERE sender=? AND created>?',(uid,now-10)).fetchone()[0]>=3 or c.execute('SELECT count(*) FROM near69 WHERE sender=? AND created>?',(uid,now-3600)).fetchone()[0]>=60:return reply(429,{'error':'Bạn gửi quá nhanh, hãy chờ'})
  c.execute('DELETE FROM near69_audience WHERE mid IN (SELECT id FROM near69 WHERE created<?)',(now-86400,))
  c.execute('DELETE FROM near69 WHERE created<?',(now-86400,))
  mid=c.execute('INSERT INTO near69(sender,body,x,y,created) VALUES(?,?,?,?,?)',(uid,body,origin['x'],origin['y'],now)).lastrowid
  c.execute('INSERT INTO near69_audience VALUES(?,?)',(mid,uid))
  for row in c.execute("""SELECT p.uid FROM presence p WHERE p.uid!=? AND p.area=0 AND p.seen>? AND p.uid NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=p.uid) OR (b.owner=p.uid AND b.target=?)) AND ((p.x-?)/35.0)*((p.x-?)/35.0)+((p.y-?)/14.0)*((p.y-?)/14.0)<=144 LIMIT 100""",(uid,now-5,uid,uid,origin['x'],origin['x'],origin['y'],origin['y'])):
   c.execute('INSERT OR IGNORE INTO near69_audience VALUES(?,?)',(mid,row['uid']))
  c.commit();return reply(201,{'id':mid})
 if path=='/api/social/near/report':
  mid=d.get('message');reason=d.get('reason')
  if type(mid) is not int or not 0<mid<=9223372036854775807 or reason not in ('Quấy rối','Spam','Nội dung không phù hợp','Khác'):return reply(400,{'error':'Báo cáo không hợp lệ'})
  c.execute('BEGIN IMMEDIATE')
  m=c.execute('SELECT m.sender,m.body FROM near69 m JOIN near69_audience a ON a.mid=m.id WHERE m.id=? AND a.uid=? AND m.created>?',(mid,uid,now-86400)).fetchone()
  if not m or m['sender']==uid:return reply(404,{'error':'Không tìm thấy tin nhắn'})
  if c.execute('SELECT count(*) FROM ww_chat_reports WHERE reporter=? AND created>?',(uid,now-86400)).fetchone()[0]>=20:return reply(429,{'error':'Đạt giới hạn báo cáo hôm nay'})
  if not c.execute('INSERT OR IGNORE INTO ww_chat_reports(reporter,target,message_id,body,reason,created) VALUES(?,?,?,?,?,?)',(uid,m['sender'],-mid,m['body'],reason,int(now))).rowcount:return reply(409,{'error':'Đã báo cáo'})
  c.commit();return reply(201,{'ok':True})
 if path=='/api/social/leave':
  leave(c,uid);c.commit();return reply(200,{'ok':True})
 if path=='/api/social/pulse':
  x,y,a=d.get('x'),d.get('y'),d.get('area')
  if type(x) not in (int,float) or type(y) not in (int,float) or not math.isfinite(x) or not math.isfinite(y) or not -3710<=x<=4690 or not -1329<=y<=2479 or type(a)!=int or not 0<=a<=7:return reply(400,{'error':'Vị trí không hợp lệ'})
  def pick(key,allowed,default):
   v=d.get(key)
   return v if isinstance(v,str) and v in allowed else default
  body=pick('body',('male','female'),'male')
  skin=pick('skin',('warm','fair','deep'),'warm')
  hair=pick('hair',('chestnut','silver','dark','auburn','blond'),'chestnut')
  style=pick('style',('short','long','tied','bob','wavy','bun','swept'),'short')
  height=pick('height',('compact','normal','tall'),'normal')
  build=pick('build',('slim','normal','athletic'),'normal')
  face=pick('face',('soft','classic','angular'),'classic')
  eye=pick('eye',('brown','green','blue','amber'),'brown')
  dye=pick('dye',('original','moss','navy','wine','sand','ivory','charcoal'),'original')
  action=pick('action',('idle','wave','bow','cheer','smile','happy','angry','surprised','sit','dance','hand','photo','hug','duet','portrait'),'idle')
  target=d.get('target')
  if not isinstance(target,str) or len(target)>100 or target==uid:target=''
  if action not in ('hand','photo','hug','duet'):target=''
  def num(key,lo,hi,default=0):
   v=d.get(key)
   return max(lo,min(hi,v)) if type(v) in (int,float) and math.isfinite(v) else default
  heading=num('heading',-math.pi*2,math.pi*2)
  jump=num('jump',0,2)
  moving=int(d.get('moving') is True)
  preset=pick('avatar109',tuple(f'{g}{i}' for g in ('m','f') for i in range(1,11)),'f1' if body=='female' else 'm1')
  gait=num('gait109',0,1,.65 if moving else 0) if moving else 0
  c.execute('INSERT OR REPLACE INTO avatar109 VALUES(?,?,?)',(uid,preset,gait))
  pet=pick('pet',('fox','rabbit','deer','cat','dragon'),'')
  vehicle=pick('vehicle',('bike','motor','car'),'') if a==0 else ''
  c.execute('INSERT OR REPLACE INTO vehicle88 VALUES(?,?)',(uid,vehicle))
  c.execute('INSERT OR REPLACE INTO pet70 VALUES(?,?)',(uid,pet))
  c.execute('INSERT OR REPLACE INTO presence VALUES(?,?,?,?,?)',(uid,x,y,a,now))
  c.execute('INSERT OR REPLACE INTO motion68 VALUES(?,?,?,?)',(uid,heading,moving,jump))
  c.execute('INSERT OR REPLACE INTO character61 VALUES(?,?,?,?,?,?,?,?)',(uid,body,skin,hair,style,dye,action,target))
  c.execute('INSERT OR REPLACE INTO character64 VALUES(?,?,?,?,?)',(uid,height,build,face,eye))
  c.execute('DELETE FROM presence WHERE seen<?',(now-30,))
  c.execute('DELETE FROM character61 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.execute('DELETE FROM character64 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.execute('DELETE FROM motion68 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.execute('DELETE FROM pet70 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.execute('DELETE FROM vehicle88 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.execute('DELETE FROM avatar109 WHERE uid NOT IN (SELECT uid FROM presence)')
  c.commit()
  def mutually_ready(first,second,kind):
   if not second or kind not in ('hand','photo','hug','duet'):return False
   if together.blocked(c,first,second) or not together.available(c,second):return False
   if not c.execute("SELECT 1 FROM friends WHERE status='accepted' AND ((sender=? AND receiver=?) OR (sender=? AND receiver=?))",(first,second,second,first)).fetchone():return False
   row=c.execute('SELECT p.x,p.y,p.area,p.seen,q.action,q.target FROM presence p JOIN character61 q ON q.uid=p.uid WHERE p.uid=?',(second,)).fetchone()
   origin=c.execute('SELECT x,y,area,seen FROM presence WHERE uid=?',(first,)).fetchone()
   return bool(row and origin and row['seen']>now-4 and origin['seen']>now-4 and row['action']==kind and row['target']==first and row['area']==origin['area'] and math.hypot((row['x']-origin['x'])/35,(row['y']-origin['y'])/14)<3)
  players=[]; incoming=[]
  friend_ids={row[0] for row in c.execute("SELECT CASE WHEN sender=? THEN receiver ELSE sender END FROM friends WHERE status='accepted' AND (sender=? OR receiver=?)",(uid,uid,uid))}
  for r in c.execute('SELECT p.uid AS id,u.name,p.x,p.y,p.area,p.seen,q.body,q.skin,q.hair,q.style,q.dye,q.action,q.target,f.height,f.build,f.face,f.eye,m.heading,m.moving,m.jump,k.kind AS pet,veh.kind AS vehicle,av.preset AS avatar109,av.gait AS gait109 FROM presence p JOIN users u ON u.id=p.uid LEFT JOIN character61 q ON q.uid=p.uid LEFT JOIN character64 f ON f.uid=p.uid LEFT JOIN motion68 m ON m.uid=p.uid LEFT JOIN pet70 k ON k.uid=p.uid LEFT JOIN vehicle88 veh ON veh.uid=p.uid LEFT JOIN avatar109 av ON av.uid=p.uid WHERE p.uid!=? AND p.seen>? AND p.uid NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=p.uid) OR (b.target=? AND b.owner=p.uid)) ORDER BY CASE WHEN p.area=? THEN 0 ELSE 1 END, ((p.x-?)/35.0)*((p.x-?)/35.0)+((p.y-?)/14.0)*((p.y-?)/14.0), p.uid LIMIT 100',(uid,now-12,uid,uid,a,x,x,y,y)):
   v=dict(r)
   v['sample_ms']=int(v.pop('seen')*1000)
   v['friend']=int(v['id'] in friend_ids)
   if v['friend'] and v['target']==uid and v['action'] in ('hand','photo','hug','duet') and v['area']==a and math.hypot((v['x']-x)/35,(v['y']-y)/14)<3 and c.execute('SELECT 1 FROM presence WHERE uid=? AND seen>?',(v['id'],now-4)).fetchone():
    incoming.append({'id':v['id'],'name':v['name'],'action':v['action']})
   if v['action'] in ('hand','photo','hug','duet') and not mutually_ready(v['id'],v['target'],v['action']):v['action']='idle'
   v.pop('target',None)
   players.append(v)
  return reply(200,{'world_ms':int(time.time()*1000),'players':players,'match':target if mutually_ready(uid,target,action) else '', 'incoming':incoming[:10], 'near':nearby69(c,uid,now) if a==0 else [], 'outings':outings70(c,uid,now) if a==0 else []})
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

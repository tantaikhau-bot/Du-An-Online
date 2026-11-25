import time,secrets,together
KINDS={'cottage','villa','bench','fountain','lamp','pond','fence','path','flowerbed'}
GIFTS={'flower':'Hoa yêu thương','lantern':'Hoa đăng tình bạn','star':'Ngôi sao may mắn'}
NOTES=['Khu vườn đẹp quá!','Chúc bạn một ngày vui vẻ!','Cảm ơn vì đã chia sẻ!']
def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS gardens(uid TEXT PRIMARY KEY, layout TEXT NOT NULL, privacy TEXT NOT NULL); CREATE TABLE IF NOT EXISTS garden_likes(owner TEXT, visitor TEXT, PRIMARY KEY(owner,visitor)); CREATE TABLE IF NOT EXISTS garden_notes(owner TEXT,visitor TEXT,body TEXT,created INTEGER,PRIMARY KEY(owner,visitor)); CREATE TABLE IF NOT EXISTS gifts(id TEXT PRIMARY KEY,sender TEXT,receiver TEXT,kind TEXT,created INTEGER,UNIQUE(sender,receiver,created));''')
def valid(a):
 return isinstance(a,list) and len(a)<=48 and all(isinstance(o,dict) and isinstance(o.get('kind'),str) and o['kind'] in KINDS and all(type(o.get(k)) is int and 0<=o[k]<n for k,n in [('x',8),('z',6),('r',4)]) for o in a) and len({(o['x'],o['z']) for o in a})==len(a) and sum(o['kind'] in ('cottage','villa') for o in a)<=1
def handle(h,c,u,d):
 import json
 uid=u['id']; p=h.path.rsplit('/',1)[-1]; r=h.reply; now=int(time.time())
 c.execute('BEGIN IMMEDIATE')
 if p=='publish':
  a=d.get('layout'); privacy=d.get('privacy')
  if privacy not in ('private','friends','public') or not valid(a):return r(400,{'error':'Bố cục hoặc quyền riêng tư không hợp lệ'})
  c.execute('INSERT OR REPLACE INTO gardens VALUES(?,?,?)',(uid,json.dumps([{k:o[k] for k in ('kind','x','z','r')} for o in a]),privacy));c.commit();return r(200,{'ok':True})
 if p=='inbox':
  own=c.execute('SELECT privacy FROM gardens WHERE uid=?',(uid,)).fetchone()
  return r(200,{'privacy':own[0] if own else 'private','gifts':[dict(x) for x in c.execute('SELECT g.id,u.name,g.kind,g.created FROM gifts g JOIN users u ON u.id=g.sender WHERE g.receiver=? AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=g.sender) OR (b.target=? AND b.owner=g.sender)) ORDER BY g.created DESC LIMIT 50',(uid,uid,uid))]})
 target=d.get('id')
 if not isinstance(target,str) or target==uid or not c.execute('SELECT 1 FROM users WHERE id=? AND id NOT IN (SELECT uid FROM blocked)',(target,)).fetchone():return r(404,{'error':'Không tìm thấy người chơi'})
 if together.blocked(c,uid,target):return r(403,{'error':'Không thể tương tác với người này'})
 friend=c.execute("SELECT 1 FROM friends WHERE status='accepted' AND ((sender=? AND receiver=?) OR (sender=? AND receiver=?))",(uid,target,target,uid)).fetchone()
 if p=='gift':
  if not friend:return r(403,{'error':'Chỉ gửi quà cho bạn bè'})
  kind=d.get('kind')
  if not isinstance(kind,str) or kind not in GIFTS:return r(400,{'error':'Quà không hợp lệ'})
  if c.execute('SELECT 1 FROM gifts WHERE sender=? AND receiver=? AND created>?',(uid,target,now-86400)).fetchone() or c.execute('SELECT count(*) FROM gifts WHERE sender=? AND created>?',(uid,now-86400)).fetchone()[0]>=10:return r(429,{'error':'Giới hạn quà miễn phí trong 24 giờ'})
  c.execute('INSERT INTO gifts VALUES(?,?,?,?,?)',(secrets.token_hex(12),uid,target,kind,now));c.commit();return r(200,{'ok':True})
 g=c.execute('SELECT * FROM gardens WHERE uid=?',(target,)).fetchone()
 if not g or g['privacy']=='private' or (g['privacy']=='friends' and not friend):return r(403,{'error':'Khu vườn chưa chia sẻ với bạn'})
 if p=='like':c.execute('INSERT OR IGNORE INTO garden_likes VALUES(?,?)',(target,uid))
 elif p=='note':
  if d.get('body') not in NOTES:return r(400,{'error':'Chọn lời nhắn có sẵn'})
  c.execute('INSERT OR REPLACE INTO garden_notes VALUES(?,?,?,?)',(target,uid,d['body'],now))
 elif p!='visit':return r(404,{'error':'Không tìm thấy'})
 c.commit();return r(200,{'layout':json.loads(g['layout']),'likes':c.execute('SELECT count(*) FROM garden_likes WHERE owner=?',(target,)).fetchone()[0],'notes':[dict(x) for x in c.execute('SELECT u.name,n.body FROM garden_notes n JOIN users u ON u.id=n.visitor WHERE n.owner=? ORDER BY n.created DESC LIMIT 20',(target,))]})

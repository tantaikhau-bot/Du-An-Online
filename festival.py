import time, secrets, economy
THEMES={'spring':'Mùa xuân','love':'Tình yêu','moon':'Trung thu','winter':'Giáng sinh'}
TASKS={'checkin':'Điểm danh lễ hội','wish':'Đăng một điều ước cộng đồng','gift':'Tặng một món quà cho bạn bè'}
def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS festivals(id TEXT PRIMARY KEY,title TEXT NOT NULL,theme TEXT NOT NULL,start INTEGER NOT NULL,end INTEGER NOT NULL,reward INTEGER NOT NULL,enabled INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS festival_checkins(event TEXT,uid TEXT,created INTEGER,PRIMARY KEY(event,uid)); CREATE TABLE IF NOT EXISTS festival_claims(event TEXT,uid TEXT,created INTEGER,PRIMARY KEY(event,uid));''')
def progress(c,e,uid):
 args=(uid,e['start'],e['end'])
 return {'checkin':bool(c.execute('SELECT 1 FROM festival_checkins WHERE event=? AND uid=?',(e['id'],uid)).fetchone()),'wish':bool(c.execute('SELECT 1 FROM wishes WHERE uid=? AND created>=? AND created<?',args).fetchone()),'gift':bool(c.execute('SELECT 1 FROM gifts WHERE sender=? AND created>=? AND created<?',args).fetchone())}
def active(e,now):return e['enabled'] and e['start']<=now<e['end']
def handle(h,c,u,d=None):
 uid=u['id'];now=int(time.time());p=h.path.rsplit('/',1)[-1];r=h.reply
 if p=='list' and d is None:
  events=[]
  for row in c.execute('SELECT * FROM festivals WHERE enabled=1 AND end>? ORDER BY start LIMIT 50',(now,)):
   e=dict(row);e.update(active=bool(active(e,now)),tasks=progress(c,e,uid),claimed=bool(c.execute('SELECT 1 FROM festival_claims WHERE event=? AND uid=?',(e['id'],uid)).fetchone()),participants=c.execute('SELECT count(*) FROM festival_checkins WHERE event=?',(e['id'],)).fetchone()[0],completed=c.execute('SELECT count(*) FROM festival_claims WHERE event=?',(e['id'],)).fetchone()[0]);events.append(e)
  return r(200,{'events':events,'themes':THEMES,'tasks':TASKS})
 if d is None or p not in ('checkin','claim'):return r(404,{'error':'Không tìm thấy'})
 if not isinstance(d.get('id'),str):return r(400,{'error':'Mã lễ hội không hợp lệ'})
 c.execute('BEGIN IMMEDIATE');e=c.execute('SELECT * FROM festivals WHERE id=?',(d['id'],)).fetchone()
 if not e or not active(e,now):return r(409,{'error':'Lễ hội chưa mở hoặc đã kết thúc'})
 if p=='checkin':c.execute('INSERT OR IGNORE INTO festival_checkins VALUES(?,?,?)',(e['id'],uid,now))
 else:
  if c.execute('SELECT 1 FROM festival_claims WHERE event=? AND uid=?',(e['id'],uid)).fetchone():return r(409,{'error':'Đã nhận thưởng'})
  if not all(progress(c,e,uid).values()):return r(409,{'error':'Chưa hoàn thành nhiệm vụ'})
  economy.balance(c,uid);economy.change(c,uid,e['reward'],'festival',e['id']);c.execute('INSERT INTO festival_claims VALUES(?,?,?)',(e['id'],uid,now))
 c.commit();return r(200,{'ok':True})
def staff(h,c,d=None):
 p=h.path.rsplit('/',1)[-1];r=h.reply;now=int(time.time())
 if p=='festivals' and d is None:return r(200,{'events':[dict(e) for e in c.execute('SELECT f.*,(SELECT count(*) FROM festival_checkins WHERE event=f.id) AS participants,(SELECT count(*) FROM festival_claims WHERE event=f.id) AS completed FROM festivals f ORDER BY start DESC LIMIT 100')]})
 if d is None:return r(404,{'error':'Không tìm thấy'})
 c.execute('BEGIN IMMEDIATE')
 if p=='festival-create':
  title,theme,start,end,reward=(d.get(k) for k in ('title','theme','start','end','reward'))
  if not isinstance(title,str) or not 1<=len(title.strip())<=80 or theme not in THEMES or any(type(x)!=int for x in (start,end,reward)) or not now-300<=start<end<=now+366*86400 or end-start>31*86400 or not 1<=reward<=100:return r(400,{'error':'Kiểm tra tên, thời gian (tối đa 31 ngày) và thưởng 1–100 Pha lê'})
  id=secrets.token_hex(12);c.execute('INSERT INTO festivals VALUES(?,?,?,?,?,?,1)',(id,title.strip(),theme,start,end,reward))
 elif p=='festival-close':
  id=d.get('id');
  if not isinstance(id,str) or not c.execute('UPDATE festivals SET enabled=0 WHERE id=? AND enabled=1',(id,)).rowcount:return r(404,{'error':'Không tìm thấy lễ hội đang mở'})
 else:return r(404,{'error':'Không tìm thấy'})
 c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',(p,id,now));c.commit();return r(200,{'id':id})

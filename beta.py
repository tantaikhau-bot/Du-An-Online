import time, threading, sqlite3, secrets
from pathlib import Path
from collections import deque
_lock=threading.Lock(); _hits={}
def allow(ip,path):
 limit=5 if path=='/api/admin/login' else 12 if path=='/api/login' else 5
 now=time.monotonic()
 with _lock:
  for k in list(_hits):
   if not _hits[k] or now-_hits[k][-1]>=60:del _hits[k]
  key=(ip,path)
  if key not in _hits and len(_hits)>=10000:return False
  q=_hits.setdefault(key,deque())
  while q and now-q[0]>=60:q.popleft()
  if len(q)>=limit:return False
  q.append(now);return True

def backup(c,db):
 root=Path(db).resolve().parent/'backups';root.mkdir(mode=0o700,exist_ok=True)
 dest=root/('wish-'+time.strftime('%Y%m%d-%H%M%S')+'-'+secrets.token_hex(4)+'.sqlite3')
 with sqlite3.connect(dest) as out:
  c.backup(out)
  if out.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('backup invalid')
 return dest.name

# Alpha feedback: authenticated, bounded, never published to other players.
def init_alpha(c):
 c.executescript("""CREATE TABLE IF NOT EXISTS alpha_feedback(id INTEGER PRIMARY KEY, uid TEXT NOT NULL, category TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0); CREATE INDEX IF NOT EXISTS idx_alpha_feedback_uid_created ON alpha_feedback(uid,created);""")
def submit_alpha(h,c,u,d):
 category=d.get('category'); body=d.get('body')
 if category not in ('graphics','movement','gameplay','save','other') or not isinstance(body,str) or not 10<=len(body.strip())<=1000:return h.reply(400,{'error':'Chọn loại phản hồi và nhập 10–1000 ký tự'})
 now=int(time.time())
 c.execute('BEGIN IMMEDIATE')
 last=c.execute('SELECT MAX(created) FROM alpha_feedback WHERE uid=?',(u['id'],)).fetchone()[0]
 count=c.execute('SELECT count(*) FROM alpha_feedback WHERE uid=? AND created>?',(u['id'],now-86400)).fetchone()[0]
 if (last is not None and now-last<60) or count>=10:return h.reply(429,{'error':'Chờ 60 giây; tối đa 10 phản hồi trong 24 giờ'})
 c.execute('INSERT INTO alpha_feedback(uid,category,body,created) VALUES(?,?,?,?)',(u['id'],category,body.strip(),now));c.commit()
 return h.reply(201,{'ok':True})
def feedback_admin(h,c,d=None):
 if h.path=='/api/admin/alpha-feedback' and d is None:
  return h.reply(200,{'items':[dict(r) for r in c.execute('SELECT f.id,f.category,f.body,f.created,f.reviewed,u.name FROM alpha_feedback f JOIN users u ON u.id=f.uid ORDER BY f.reviewed,f.created DESC LIMIT 100')]})
 if h.path=='/api/admin/alpha-review' and d is not None:
  key=d.get('id')
  if type(key) is not int:return h.reply(400,{'error':'Mã phản hồi không hợp lệ'})
  if not c.execute('UPDATE alpha_feedback SET reviewed=1 WHERE id=?',(key,)).rowcount:return h.reply(404,{'error':'Không tìm thấy phản hồi'})
  c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',('alpha-review',str(key),int(time.time())));c.commit();return h.reply(200,{'ok':True})
 return h.reply(404,{'error':'Không tìm thấy'})

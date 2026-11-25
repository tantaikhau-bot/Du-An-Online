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

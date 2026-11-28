"""Legacy save validation and anomaly telemetry. Never treats offline coins as money."""
import math,time,json
LIMIT=20000
def init(c):
 c.execute("""CREATE TABLE IF NOT EXISTS save_anomalies(uid TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, delta INTEGER NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(uid,revision,kind))""")
 c.execute("""CREATE TABLE IF NOT EXISTS save_history345(uid TEXT NOT NULL, revision INTEGER NOT NULL, state TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(uid,revision))""")
def valid_tree(value):
 stack=[(value,0)];n=0
 while stack:
  v,depth=stack.pop();n+=1
  if n>LIMIT or depth>24:return False
  if isinstance(v,dict):
   if any(not isinstance(k,str) or len(k)>160 for k in v):return False
   stack.extend((x,depth+1) for x in v.values())
  elif isinstance(v,list):stack.extend((x,depth+1) for x in v)
  elif isinstance(v,str):
   if len(v)>16000:return False
  elif type(v) is float:
   if not math.isfinite(v):return False
  elif v is not None and type(v) not in (int,bool):return False
 return True
def audit(c,uid,revision,old,new):
 if not isinstance(old,dict):return
 for key,limit in [('coins',5000),('xp',5000),('petXp',2000)]:
  a,b=old.get(key),new.get(key)
  if type(a) is int and type(b) is int and b-a>limit:
   c.execute('INSERT OR IGNORE INTO save_anomalies VALUES(?,?,?,?,?)',(uid,revision,key,b-a,int(time.time())))
 # Telemetry only: offline play may legitimately accumulate large balances.

# Keep the previous three revisions, in the same transaction as the new save.
HISTORY_LIMIT345=3
def write_save345(c,uid,revision,state):
 encoded=json.dumps(state,ensure_ascii=False,allow_nan=False)
 c.execute('BEGIN IMMEDIATE')
 row=c.execute('SELECT save,revision FROM users WHERE id=?',(uid,)).fetchone()
 if row is None:return ('missing',None)
 current,actual=row[0],row[1]
 if actual!=revision:
  # A lost HTTP response may cause the identical request to be retried.
  if actual==revision+1 and current==encoded:return ('replay',actual)
  return ('conflict',actual)
 if current is not None:
  c.execute('INSERT OR IGNORE INTO save_history345 VALUES(?,?,?,?)',(uid,actual,current,int(time.time())))
 r=c.execute('UPDATE users SET save=?,revision=revision+1 WHERE id=? AND revision=?',(encoded,uid,revision))
 if r.rowcount!=1:raise RuntimeError('save revision changed under transaction')
 audit(c,uid,revision+1,json.loads(current) if current else None,state)
 c.execute('DELETE FROM save_history345 WHERE uid=? AND revision NOT IN (SELECT revision FROM save_history345 WHERE uid=? ORDER BY revision DESC LIMIT ?)',(uid,uid,HISTORY_LIMIT345))
 return ('saved',revision+1)
def list_history345(c,uid):
 return [{'revision':r[0],'created':r[1],'bytes':r[2]} for r in c.execute('SELECT revision,created,length(CAST(state AS BLOB)) FROM save_history345 WHERE uid=? ORDER BY revision DESC LIMIT ?',(uid,HISTORY_LIMIT345))]
def read_history345(c,uid,revision):
 row=c.execute('SELECT state,created FROM save_history345 WHERE uid=? AND revision=?',(uid,revision)).fetchone()
 return {'state':json.loads(row[0]),'created':row[1],'revision':revision} if row else None

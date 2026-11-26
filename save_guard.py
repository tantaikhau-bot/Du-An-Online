"""Legacy save validation and anomaly telemetry. Never treats offline coins as money."""
import math,time
LIMIT=20000
def init(c):
 c.execute("""CREATE TABLE IF NOT EXISTS save_anomalies(uid TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, delta INTEGER NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(uid,revision,kind))""")
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

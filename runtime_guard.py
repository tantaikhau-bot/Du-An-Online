"""Bounded request parsing, account quotas and aggregate runtime counters."""
import json,math,time,threading
from collections import deque,Counter
MAX_BODY=500000
START=time.monotonic()
_lock=threading.Lock()
_counts=Counter()
_hits={}
def reject_constant(_):
 raise ValueError('non-finite JSON')
def finite_float(s):
 v=float(s)
 if not math.isfinite(v):raise ValueError('non-finite JSON')
 return v
def unique_object(pairs):
 out={}
 for k,v in pairs:
  if k in out:raise ValueError('duplicate JSON key')
  out[k]=v
 return out
def decode(raw):
 if len(raw)>MAX_BODY:raise ValueError('body too large')
 try:v=json.loads(raw.decode('utf-8'),parse_constant=reject_constant,parse_float=finite_float,object_pairs_hook=unique_object)
 except (UnicodeError,RecursionError) as e:raise ValueError('invalid JSON') from e
 if not isinstance(v,dict):raise ValueError('object required')
 stack=[(v,0)];count=0
 while stack:
  item,depth=stack.pop();count+=1
  if depth>32 or count>40000:raise ValueError('JSON complexity')
  if isinstance(item,dict):
   for k,child in item.items():
    if len(k)>200 or any(0xD800<=ord(ch)<=0xDFFF for ch in k):raise ValueError('invalid key')
    stack.append((child,depth+1))
  elif isinstance(item,list):stack.extend((child,depth+1) for child in item)
  elif isinstance(item,str):
   if any(0xD800<=ord(ch)<=0xDFFF for ch in item):raise ValueError('invalid Unicode')
  elif type(item) is int and not -(2**63)<=item<2**63:raise ValueError('integer out of range')
 return v
def allow(uid,path,now=None):
 now=time.monotonic() if now is None else now
 group='presence' if path=='/api/social/pulse' else 'write'
 limit=180 if group=='presence' else 120
 key=(uid,group)
 with _lock:
  if len(_hits)>=4096:
   for k,q in list(_hits.items()):
    if not q or now-q[-1]>=60:_hits.pop(k,None)
  if key not in _hits and len(_hits)>=4096:return False
  q=_hits.setdefault(key,deque())
  while q and now-q[0]>=60:q.popleft()
  if len(q)>=limit:return False
  q.append(now);return True
def record(code):
 key='2xx' if 200<=code<300 else '3xx' if 300<=code<400 else '429' if code==429 else '4xx' if 400<=code<500 else '5xx' if 500<=code<600 else 'other'
 with _lock:_counts[key]+=1
def summary():
 with _lock:return {'uptime_seconds':int(time.monotonic()-START),'responses':{k:_counts[k] for k in ('2xx','3xx','4xx','429','5xx','other')},'quota_buckets':len(_hits)}

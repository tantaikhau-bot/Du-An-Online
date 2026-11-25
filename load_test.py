"""Local-only concurrent health/page smoke load, no account mutation."""
import argparse, concurrent.futures, time, urllib.request, statistics
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8080);p.add_argument('--requests',type=int,default=300);p.add_argument('--workers',type=int,default=20);a=p.parse_args()
assert 1<=a.workers<=50 and 1<=a.requests<=10000
base=f'http://127.0.0.1:{a.port}'
def hit(i):
 start=time.perf_counter()
 try:
  with urllib.request.urlopen(base+('/healthz' if i%2 else '/play'),timeout=20) as r:r.read();ok=r.status==200
 except Exception:ok=False
 return ok,(time.perf_counter()-start)*1000
start=time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:results=list(pool.map(hit,range(a.requests)))
lat=sorted(t for _,t in results);ok=sum(v for v,_ in results)
print(f'{ok}/{a.requests} OK; {a.requests/(time.perf_counter()-start):.1f} req/s; p50 {statistics.median(lat):.1f} ms; p95 {lat[int(.95*(len(lat)-1))]:.1f} ms')
raise SystemExit(ok!=a.requests)

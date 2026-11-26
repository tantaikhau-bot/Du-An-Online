"""Isolated concurrent presence benchmark. Cannot target production."""
import argparse,concurrent.futures,http.client,json,statistics,tempfile,threading,time
from pathlib import Path
import server
def run(players,rounds):
 old=server.DB
 with tempfile.TemporaryDirectory() as tmp:
  server.DB=str(Path(tmp)/'load.sqlite3');server.init()
  try:
   with server.db() as c:
    for i in range(players):
     uid='test'+str(i);c.execute('INSERT INTO users(id,name) VALUES(?,?)',(uid,uid));c.execute('INSERT INTO sessions VALUES(?,?,?)',(server.tokenhash(uid),uid,int(time.time())+3600))
   svc=server.BoundedServer(('127.0.0.1',0),server.Handler)
   thread=threading.Thread(target=svc.serve_forever,daemon=True);thread.start()
   gate=threading.Barrier(players)
   def play(i):
    samples=[]
    for j in range(rounds):
     gate.wait(timeout=30);start=time.monotonic()
     conn=http.client.HTTPConnection('127.0.0.1',svc.server_port,timeout=15)
     try:
      conn.request('POST','/api/social/pulse',json.dumps({'x':490+i,'y':575,'area':0}),{'Content-Type':'application/json','Cookie':'ww_session=test'+str(i)})
      r=conn.getresponse();body=r.read();samples.append((r.status,(time.monotonic()-start)*1000))
     except OSError:samples.append((0,(time.monotonic()-start)*1000))
     finally:conn.close()
    return samples
   try:
    with concurrent.futures.ThreadPoolExecutor(max_workers=players) as pool:rows=[s for batch in pool.map(play,range(players)) for s in batch]
   finally:svc.shutdown();svc.server_close();thread.join()
   times=sorted(t for _,t in rows);result={'players':players,'requests':len(rows),'success':sum(s==200 for s,_ in rows),'p50_ms':round(statistics.median(times),1),'p95_ms':round(times[int(.95*(len(times)-1))],1),'errors':sum(s!=200 for s,_ in rows)}
   print(json.dumps(result),flush=True)
   if result['errors']:raise SystemExit(1)
  finally:server.DB=old
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--players',type=int,choices=(8,16,32,50),default=16);p.add_argument('--rounds',type=int,default=5);a=p.parse_args()
 if not 1<=a.rounds<=30:p.error('rounds 1..30')
 run(a.players,a.rounds)

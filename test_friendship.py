import tempfile, subprocess, os, sys, time, urllib.request, urllib.error, http.cookiejar, json, socket
from pathlib import Path
with tempfile.TemporaryDirectory() as tmp:
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
 env={**os.environ,'WISH_ADMIN_PASSWORD':'test-admin-password-123','PORT':str(port),'WISH_DB':str(Path(tmp)/'test.db')}
 def start():
  p=subprocess.Popen([sys.executable,'server.py'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  for _ in range(100):
   try:urllib.request.urlopen(f'http://127.0.0.1:{port}/api/me',timeout=.2);return p
   except OSError:time.sleep(.05)
  p.kill();raise RuntimeError('server not started')
 def client():return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def req(c,path,data=None,code=200):
  r=urllib.request.Request(f'http://127.0.0.1:{port}/api/'+path,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
  try:res=c.open(r)
  except urllib.error.HTTPError as e:res=e
  assert res.code==code,(path,res.code,code);return json.load(res)
 p=start()
 try:
  a,b,c=client(),client(),client()
  for cl,n in [(a,'garden_a'),(b,'garden_b'),(c,'garden_c')]:req(cl,'register',{'name':n,'password':'test-password-123'})
  aid=req(a,'me')['user']['id'];bid=req(b,'me')['user']['id']
  layout=[{'kind':'cottage','x':1,'z':1,'r':0}]
  req(a,'friendship/publish',{'layout':layout*2,'privacy':'public'},400)
  req(a,'friendship/publish',{'layout':layout,'privacy':'private'})
  req(b,'friendship/visit',{'id':aid},403)
  req(b,'friendship/gift',{'id':aid,'kind':'flower'},403)
  req(a,'social/invite',{'id':bid});req(b,'social/accept',{'id':aid})
  req(b,'friendship/visit',{'id':aid},403)
  req(a,'friendship/publish',{'layout':layout,'privacy':'friends'})
  assert req(b,'friendship/visit',{'id':aid})['layout']==layout
  req(c,'friendship/visit',{'id':aid},403)
  assert req(b,'friendship/like',{'id':aid})['likes']==1
  assert req(b,'friendship/like',{'id':aid})['likes']==1
  req(b,'friendship/note',{'id':aid,'body':'custom'},400)
  assert req(b,'friendship/note',{'id':aid,'body':'Khu vườn đẹp quá!'})['notes'][0]['name']=='garden_b'
  req(b,'friendship/gift',{'id':aid,'kind':'flower'});req(b,'friendship/gift',{'id':aid,'kind':'star'},429)
  assert req(a,'friendship/inbox',{})['gifts'][0]['kind']=='flower'
  assert not req(c,'friendship/inbox',{})['gifts']
  req(a,'friendship/publish',{'layout':layout,'privacy':'public'})
  assert req(c,'friendship/visit',{'id':aid})['layout']==layout
  p.terminate();p.wait();p=start()
  assert req(b,'friendship/visit',{'id':aid})['likes']==1
  assert req(a,'friendship/inbox',{})['gifts'][0]['kind']=='flower'
  req(a,'friendship/publish',{'layout':layout,'privacy':'private'})
  req(b,'friendship/like',{'id':aid},403)
  print('PASS: garden validation, privacy, friendship authorization, unique likes, notes, gift limits, inbox isolation, restart persistence')
 finally:
  p.terminate();p.wait()

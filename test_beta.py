import tempfile,subprocess,os,sys,time,urllib.request,urllib.error,http.cookiejar,json,socket,sqlite3
from pathlib import Path
with tempfile.TemporaryDirectory() as tmp:
 with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
 env={**os.environ,'WISH_ADMIN_PASSWORD':'beta-test-password-123','PORT':str(port),'WISH_DB':str(Path(tmp)/'world.db')}
 p=subprocess.Popen([sys.executable,'server.py'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 base=f'http://127.0.0.1:{port}';c=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def req(path,data=None,code=200):
  r=urllib.request.Request(base+path,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
  try:res=c.open(r,timeout=5)
  except urllib.error.HTTPError as e:res=e
  assert res.code==code,(path,res.code,code);assert res.headers['X-Frame-Options']=='DENY';return res.read()
 try:
  for _ in range(100):
   try:req('/');break
   except OSError:time.sleep(.05)
  for page in ['/','/play','/admin','/terms','/privacy']:assert b'<!doctype html>' in req(page).lower()
  req('/api/admin/backup',{},401)
  req('/api/register',{'name':'beta_player','password':'test-password-123'})
  req('/api/admin/login',{'password':'beta-test-password-123'})
  f=json.loads(req('/api/admin/backup',{}))['file'];path=Path(tmp)/'backups'/f
  with sqlite3.connect(path) as db:assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert db.execute('SELECT name FROM users').fetchone()[0]=='beta_player'
  req('/backups/'+f,code=404)
  for _ in range(4):req('/api/admin/login',{'password':'wrong'},401)
  req('/api/admin/login',{'password':'wrong'},429)
  print('PASS: landing/play/legal routes, security headers, backup authorization, database integrity, no public backup access, admin rate limit')
 finally:p.terminate();p.wait()

import social, admin, economy, beta, friendship, festival, referral, royal, payment
from urllib.parse import urlsplit
import threading, ipaddress
import os, sqlite3, json, hashlib, secrets, hmac, time, re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parent
DB=os.environ.get('WISH_DB',str(ROOT/'world.sqlite3'))
def db():
 c=sqlite3.connect(DB,timeout=10); c.row_factory=sqlite3.Row; c.execute("PRAGMA busy_timeout=10000"); return c
def init():
 with db() as c:
  c.execute("PRAGMA journal_mode=WAL")
  c.executescript('''CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT UNIQUE COLLATE NOCASE, salt TEXT, password TEXT, save TEXT, revision INTEGER DEFAULT 0); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, uid TEXT, expiry INTEGER); CREATE TABLE IF NOT EXISTS wishes(id TEXT PRIMARY KEY, uid TEXT, body TEXT, created INTEGER);''')
  beta.init_alpha(c)
  social.init(c)
  admin.init(c)
  economy.init(c)
  friendship.init(c)
  festival.init(c)
  referral.init(c)
  royal.init(c)
  payment.init(c)
  c.executescript("CREATE INDEX IF NOT EXISTS idx_presence_seen ON presence(seen); CREATE INDEX IF NOT EXISTS idx_wishes_uid_created ON wishes(uid,created); CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expiry);")
def digest(p,s):return hashlib.scrypt(p.encode(),salt=bytes.fromhex(s),n=16384,r=8,p=1).hex()
def tokenhash(t):return hashlib.sha256(t.encode()).hexdigest()
class BoundedServer(ThreadingHTTPServer):
 daemon_threads=True
 def __init__(self,*args):
  self.slots=threading.BoundedSemaphore(64);super().__init__(*args)
 def process_request(self,request,address):
  if not self.slots.acquire(blocking=False):
   try: request.sendall(b'HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
   except OSError: pass
   self.shutdown_request(request);return
  try:super().process_request(request,address)
  except BaseException:self.slots.release();raise
 def process_request_thread(self,*args):
  try:super().process_request_thread(*args)
  finally:self.slots.release()
class Handler(BaseHTTPRequestHandler):
 timeout=15
 def client_ip(self):
  if os.environ.get('WISH_TRUST_PROXY')=='1':
   try:return str(ipaddress.ip_address(self.headers.get('X-Real-IP','')))
   except ValueError:pass
  return self.client_address[0]

 def end_headers(self):
  self.send_header('X-Frame-Options','DENY');self.send_header('Referrer-Policy','no-referrer');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
 def reply(self,status,obj,cookie=None):
  b=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(b)))
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers();self.wfile.write(b)
 def cookie(self,t,age):return f'ww_session={t}; Path=/; HttpOnly; SameSite=Strict; Max-Age={age}'+('; Secure' if os.environ.get('WISH_SECURE')=='1' else '')
 def session(self,c):
  t=next((x.strip().split('=',1)[1] for x in self.headers.get('Cookie','').split(';') if x.strip().startswith('ww_session=')), '')
  return c.execute('SELECT u.*,s.token FROM users u JOIN sessions s ON u.id=s.uid WHERE s.token=? AND s.expiry>? AND u.id NOT IN (SELECT uid FROM blocked)',(tokenhash(t),int(time.time()))).fetchone()
 def do_GET(self):
  page=urlsplit(self.path).path
  if page=='/api/version':
   return self.reply(200,{'version':'9.2','build':'9.2-city-life','name':'City Life','features':['unified-inventory','accent-insensitive-search','filtered-npc-market','purchase-rollback','city-roof-detail','cleaner-minimap','distance-labels','distance-mesh-lod','shared-car','ceremony-rsvp','safe-sync','mobile-sharp','shared-world','version-check']})
  if page=='/healthz':
   try:
    with db() as c:c.execute('SELECT 1 FROM users LIMIT 1').fetchone()
    return self.reply(200,{'status':'ok'})
   except sqlite3.Error:return self.reply(503,{'status':'unavailable'})
  if page in ('/','/play','/admin','/privacy','/terms'):
   b=(ROOT/({'/':'landing.html','/play':'index.html','/admin':'admin.html','/privacy':'privacy.html','/terms':'terms.html'}[page])).read_bytes();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b);return
  with db() as c:
   if self.path.startswith('/api/admin/'):return admin.handle(self,c)
   if self.path=='/api/notices':return self.reply(200,{'notices':[dict(r) for r in c.execute('SELECT * FROM notices ORDER BY id DESC LIMIT 20')]})
   u=self.session(c)
   if self.path=='/api/me':return self.reply(200,{'user':{'id':u['id'],'name':u['name'],'revision':u['revision']} if u else None})
   if not u:return self.reply(401,{'error':'Cần đăng nhập'})
   if self.path.startswith('/api/royal/'):return royal.handle(self,c,u)
   if self.path.startswith('/api/referral/'):return referral.handle(self,c,u)
   if self.path.startswith('/api/festival/'):return festival.handle(self,c,u)
   if self.path.startswith('/api/economy/'):return economy.handle(self,c,u)
   if self.path=='/api/save':return self.reply(200,{'state':json.loads(u['save']) if u['save'] else None,'revision':u['revision'],'owner':u['id']})
   if self.path=='/api/wishes':return self.reply(200,{'wishes':[dict(r) for r in c.execute('SELECT w.id,w.body,w.created,u.name,(w.uid=?) AS mine FROM wishes w JOIN users u ON w.uid=u.id ORDER BY w.created DESC LIMIT 50',(u['id'],))]})
  self.reply(404,{'error':'Không tìm thấy'})
 def do_POST(self):
  try:
   if self.headers.get_content_type()!='application/json':return self.reply(415,{'error':'Yêu cầu JSON'})
   n=int(self.headers.get('Content-Length',0));
   if not 0<n<=500000:return self.reply(413,{'error':'Dữ liệu quá lớn'})
   d=json.loads(self.rfile.read(n));assert isinstance(d,dict)
   if self.path in ('/api/login','/api/register','/api/admin/login') and not beta.allow(self.client_ip(),self.path):return self.reply(429,{'error':'Quá nhiều yêu cầu. Thử lại sau 60 giây.'})
   with db() as c:
    if self.path=='/api/payment/sandbox-webhook':return payment.webhook(self,c,d)
    if self.path.startswith('/api/admin/'):return admin.handle(self,c,d)
    if self.path in ('/api/register','/api/login'):
     name=d.get('name','');p=d.get('password','')
     if not isinstance(name,str) or not re.fullmatch(r'[a-zA-Z0-9_]{3,24}',name) or not isinstance(p,str) or not 10<=len(p)<=128:return self.reply(400,{'error':'Tên 3–24 ký tự ASCII; mật khẩu 10–128 ký tự'})
     if self.path.endswith('register'):
      code=d.get('referral','');inviter=referral.resolve(c,code) if code else None
      if code and not inviter:return self.reply(400,{'error':'Mã giới thiệu không hợp lệ'})
      salt=secrets.token_hex(16);uid=secrets.token_hex(8)
      try:c.execute('INSERT INTO users(id,name,salt,password) VALUES(?,?,?,?)',(uid,name,salt,digest(p,salt)))
      except sqlite3.IntegrityError:return self.reply(409,{'error':'Tên đã được sử dụng'})
      if inviter:c.execute('INSERT INTO referrals VALUES(?,?,?,NULL)',(uid,inviter['id'],int(time.time())))
     else:
      u=c.execute('SELECT * FROM users WHERE name=?',(name,)).fetchone();actual=digest(p,u['salt'] if u else '00'*16)
      if not u or not hmac.compare_digest(actual,u['password']):return self.reply(401,{'error':'Sai tài khoản hoặc mật khẩu'})
      uid=u['id']
      if c.execute('SELECT 1 FROM blocked WHERE uid=?',(uid,)).fetchone():return self.reply(403,{'error':'Tài khoản bị khóa'})
     t=secrets.token_urlsafe(32);c.execute('DELETE FROM sessions WHERE expiry<?',(int(time.time()),));c.execute('INSERT INTO sessions VALUES(?,?,?)',(tokenhash(t),uid,int(time.time())+86400));c.commit();return self.reply(200,{'ok':True},self.cookie(t,86400))
    u=self.session(c)
    if not u:return self.reply(401,{'error':'Cần đăng nhập'})
    if self.path.startswith('/api/royal/'):return royal.handle(self,c,u,d)
    if self.path.startswith('/api/referral/'):return referral.handle(self,c,u,d)
    if self.path.startswith('/api/festival/'):return festival.handle(self,c,u,d)
    if self.path.startswith('/api/economy/'):return economy.handle(self,c,u,d)
    if self.path.startswith('/api/friendship/'):return friendship.handle(self,c,u,d)
    if self.path=='/api/alpha/feedback':return beta.submit_alpha(self,c,u,d)
    if self.path.startswith('/api/social/'):return social.handle(self,c,u,d)
    if self.path=='/api/logout':
     c.execute('DELETE FROM presence WHERE uid=?',(u['id'],))
     c.execute('DELETE FROM sessions WHERE token=?',(u['token'],));social.leave(c,u['id']);c.commit();return self.reply(200,{'ok':True},self.cookie('',0))
    if self.path=='/api/save':
     v=d.get('state');rev=d.get('revision');
     if 'owner' in d and d['owner']!=u['id']:return self.reply(403,{'error':'Tài khoản bản lưu không khớp'})
     if not isinstance(v,dict) or type(rev) is not int or not 0<=rev<9223372036854775807 or not isinstance(v.get('name'),str) or not all(isinstance(v.get(k),list) for k in ('wishes','lanterns','plants','owned','collection','decor')) or not all(type(v.get(k)) is int and 0<=v[k]<=10000000 for k in ('coins','xp','petXp','streak')) or not isinstance(v.get('daily'),dict) or not isinstance(v['daily'].get('claimed'),list):return self.reply(400,{'error':'Bản lưu không hợp lệ'})
     r=c.execute('UPDATE users SET save=?,revision=revision+1 WHERE id=? AND revision=?',(json.dumps(v,ensure_ascii=False),u['id'],rev));c.commit()
     return self.reply(200,{'revision':rev+1,'owner':u['id']}) if r.rowcount else self.reply(409,{'error':'Bản lưu máy chủ đã thay đổi; tải lại trước khi lưu'})
    if self.path=='/api/wishes':
     body=d.get('body','');now=int(time.time())
     if not isinstance(body,str) or not 1<=len(body.strip())<=280:return self.reply(400,{'error':'Điều ước tối đa 280 ký tự'})
     c.execute('BEGIN IMMEDIATE');last=c.execute('SELECT MAX(created) FROM wishes WHERE uid=?',(u['id'],)).fetchone()[0]
     if last and now-last<60:return self.reply(429,{'error':'Chờ 60 giây giữa các bài đăng'})
     c.execute('INSERT INTO wishes VALUES(?,?,?,?)',(secrets.token_hex(12),u['id'],body.strip(),now));c.commit();return self.reply(201,{'ok':True})
    if self.path=='/api/wishes/delete':
     c.execute('DELETE FROM wishes WHERE id=? AND uid=?',(str(d.get('id','')),u['id']));c.commit();return self.reply(200,{'ok':True})
   self.reply(404,{'error':'Không tìm thấy'})
  except (ValueError,TypeError,AssertionError,KeyError):self.reply(400,{'error':'Yêu cầu không hợp lệ'})
  except Exception as e:print(type(e).__name__,flush=True);self.reply(500,{'error':'Lỗi máy chủ'})
if __name__=='__main__':
 import test_together,test_guild;test_together.smoke();test_guild.smoke()
 init();port=int(os.environ.get('PORT','8080'));print(f'WISH WORLD: http://127.0.0.1:{port}',flush=True);BoundedServer((os.environ.get('HOST','127.0.0.1'),port),Handler).serve_forever()

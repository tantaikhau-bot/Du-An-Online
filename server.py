import social, admin, economy, beta, friendship, festival, referral, royal, payment, save_guard, verified_rewards, runtime_guard
from static_files import serve_static
from urllib.parse import urlsplit
import threading, ipaddress
from contextlib import contextmanager
import os, sqlite3, json, hashlib, secrets, hmac, time, re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parent
DB=os.environ.get('WISH_DB',str(ROOT/'world.sqlite3'))
@contextmanager
def db():
 c=sqlite3.connect(DB,timeout=10)
 try:
  c.row_factory=sqlite3.Row; c.execute("PRAGMA busy_timeout=10000")
  with c: yield c
 finally: c.close()
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
  save_guard.init(c)
  verified_rewards.init(c)
  c.executescript("CREATE INDEX IF NOT EXISTS idx_presence_seen ON presence(seen); CREATE INDEX IF NOT EXISTS idx_wishes_uid_created ON wishes(uid,created); CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expiry);")
def digest(p,s):return hashlib.scrypt(p.encode(),salt=bytes.fromhex(s),n=16384,r=8,p=1).hex()
def tokenhash(t):return hashlib.sha256(t.encode()).hexdigest()
class BoundedServer(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
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
 def send_response(self,code,message=None):
  runtime_guard.record(code)
  super().send_response(code,message)
 def client_ip(self):
  if os.environ.get('WISH_TRUST_PROXY')=='1':
   try:return str(ipaddress.ip_address(self.headers.get('X-Real-IP','')))
   except ValueError:pass
  return self.client_address[0]

 def end_headers(self):
  self.send_header('X-Frame-Options','DENY');self.send_header('Referrer-Policy','no-referrer');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
 def reply(self,status,obj,cookie=None):
  b=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(b)))
  if status==429:self.send_header('Retry-After','60')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers()
  if self.command!='HEAD':self.wfile.write(b)
 def cookie(self,t,age):return f'ww_session={t}; Path=/; HttpOnly; SameSite=Strict; Max-Age={age}'+('; Secure' if os.environ.get('WISH_SECURE')=='1' or (os.environ.get('RENDER')=='true' and os.environ.get('WISH_SECURE')!='0') else '')
 def session(self,c):
  t=next((x.strip().split('=',1)[1] for x in self.headers.get('Cookie','').split(';') if x.strip().startswith('ww_session=')), '')
  return c.execute('SELECT u.*,s.token FROM users u JOIN sessions s ON u.id=s.uid WHERE s.token=? AND s.expiry>? AND u.id NOT IN (SELECT uid FROM blocked)',(tokenhash(t),int(time.time()))).fetchone()
 def do_HEAD(self):
  page=urlsplit(self.path).path
  if page.startswith('/assets/') or page in ('/','/play','/admin','/privacy','/terms','/healthz','/api/version','/favicon.ico','/favicon.svg'):
   return self.do_GET()
  return self.reply(405,{'error':'Phương thức không được hỗ trợ'})
 def do_GET(self):
  page=urlsplit(self.path).path
  if page.startswith('/assets/'):return serve_static(self,ROOT,page)
  if page in ('/favicon.ico','/favicon.svg'):
   b=b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#183c36"/><path d="M32 5 38 25 59 32 38 39 32 59 25 39 5 32 25 25Z" fill="#e5cc87"/></svg>'
   self.send_response(200);self.send_header('Content-Type','image/svg+xml');self.send_header('Cache-Control','public, max-age=86400');self.send_header('Content-Length',str(len(b)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(b)
   return
  if page=='/api/version':
   return self.reply(200,{'version':'13.3','build':'13.3-cinematic-world','name':'Cinematic World','features':['weather-water-material','bounded-river-reeds','adaptive-mist-foam','visible-ground-contact-shadow','vrm-action-crossfade','blended-face-expressions','bounded-wearable-secondary-motion','expanded-vrm-emote-poses','lighting-style-presets','smoothed-camera-clearance','opt-in-movement-audio','immersive-discovery-actions','npc-loading-fallback','strict-json-input','account-write-quotas','cross-site-post-guard','runtime-admin-counters','secure-admin-cookie','sqlite-busy-retry-status','four-regional-landmark-candidates','local-region-atlas','hysteresis-cell-culling','account-daily-adventure-routes','ordered-presence-checkins','cosmetic-adventure-badges','pet-acceleration-controller','pet-obstacle-detours','pet-follow-wait-recall','pet-touch-reaction','server-world-clock','timestamped-presence-snapshots','bounded-peer-interpolation','jittered-network-retry','six-local-weather-profiles','continuous-weather-blending','wind-scaled-particles','continuous-city-lighting','quality-bounded-precipitation','bounded-independent-sagittal-stance','continuous-air-flex','five-performance-presets','device-quality-detection','heap-pressure-heuristic','cpu-frame-measurement','camera-vector-reuse','grass-distance-optimization','continuous-daylight','world-clock-hud','idle-support-anchor','velocity-shaped-jump-arms','cat-rabbit-skinned-meshes','cat-rabbit-distance-lod','pet-sniff-meow','peer-visible-fallback','peer-vrm-retry','rigged-animal-assets','recessed-animal-eyes','five-fantasy-creature-meshes','species-articulated-idle','creature-reactions','shared-creature-assets','bridge-lantern-clearance','balanced-avatar-scale','dual-sole-contact','mesh-sole-contact','visible-terrain-alignment','npc-ground-contact','grounded-idle','contact-shadow','soft-knee-stance','restored-vrm-roster','speed-synchronised-gait','relaxed-male-motion','turn-acceleration-lean','rabbit-sculpture','species-specific-motion','fur-vertex-detail','asymmetric-idle','weighted-landing','matte-animal-fur','optional-avatar-bases','bone-attached-accessories','continuous-gait','natural-body-counterrotation','directional-arm-flex','arm-clearance','twenty-motion-personalities','safe-sagittal-ik','motion-preview','pet-gait-hysteresis','foot-contact-ik','remote-vrm-presets','private-backup-download','enhanced-housing','blended-locomotion','four-phase-jump','npc-impostor-lod','pet-velocity-animation','corrected-humanoid-pose','twenty-avatar-presets','nearby-npc-vrm','smooth-animal-normals','ten-avatar-presets','shared-preview-world-model','same-origin-model-cache','automatic-fox-deer','vrm-skinned-avatar-beta','portrait-closeup','secondary-hair-motion','anime-toon-character','facial-expressions','jump-anticipation','head-and-icon','database-connection-cleanup','mobile-clarity-guard','verified-rewards','save-validation','local-asset-support','effects-first-adaptive-quality','river-static-instancing','lightweight-water','near-character-detail','performance-diagnostics','unified-inventory','shared-car','ceremony-rsvp','safe-sync','shared-world','version-check']})
  if page=='/healthz':
   try:
    with db() as c:c.execute('SELECT 1 FROM users LIMIT 1').fetchone()
    return self.reply(200,{'status':'ok'})
   except sqlite3.Error:return self.reply(503,{'status':'unavailable'})
  if page in ('/','/play','/admin','/privacy','/terms'):
   b=(ROOT/({'/':'landing.html','/play':'index.html','/admin':'admin.html','/privacy':'privacy.html','/terms':'terms.html'}[page])).read_bytes();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(b)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(b)
   return
  with db() as c:
   if self.path.startswith('/api/admin/'):return admin.handle(self,c)
   if self.path=='/api/notices':return self.reply(200,{'notices':[dict(r) for r in c.execute('SELECT * FROM notices ORDER BY id DESC LIMIT 20')]})
   u=self.session(c)
   if self.path=='/api/me':return self.reply(200,{'user':{'id':u['id'],'name':u['name'],'revision':u['revision']} if u else None})
   if not u:return self.reply(401,{'error':'Cần đăng nhập'})
   if self.path.startswith('/api/verified/'):return verified_rewards.handle(self,c,u)
   if self.path.startswith('/api/royal/'):return royal.handle(self,c,u)
   if self.path.startswith('/api/referral/'):return referral.handle(self,c,u)
   if self.path.startswith('/api/festival/'):return festival.handle(self,c,u)
   if self.path.startswith('/api/economy/'):return economy.handle(self,c,u)
   if self.path=='/api/save':return self.reply(200,{'state':json.loads(u['save']) if u['save'] else None,'revision':u['revision'],'owner':u['id']})
   if self.path=='/api/wishes':return self.reply(200,{'wishes':[dict(r) for r in c.execute('SELECT w.id,w.body,w.created,u.name,(w.uid=?) AS mine FROM wishes w JOIN users u ON w.uid=u.id ORDER BY w.created DESC LIMIT 50',(u['id'],))]})
  self.reply(404,{'error':'Không tìm thấy'})
 def do_POST(self):
  try:
   if self.headers.get('Sec-Fetch-Site','').lower()=='cross-site':return self.reply(403,{'error':'Không nhận yêu cầu từ website khác'})
   if self.headers.get_content_type()!='application/json':return self.reply(415,{'error':'Yêu cầu JSON'})
   lengths=self.headers.get_all('Content-Length') or []
   if self.headers.get('Transfer-Encoding') or len(lengths)!=1 or not re.fullmatch(r'[0-9]{1,9}',lengths[0]):return self.reply(400,{'error':'Độ dài dữ liệu không hợp lệ'})
   n=int(lengths[0])
   if not 0<n<=runtime_guard.MAX_BODY:return self.reply(413,{'error':'Dữ liệu quá lớn'})
   raw=self.rfile.read(n)
   if len(raw)!=n:return self.reply(400,{'error':'Dữ liệu chưa đầy đủ'})
   d=runtime_guard.decode(raw)
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
    if not runtime_guard.allow(u['id'],self.path):return self.reply(429,{'error':'Máy chủ giới hạn yêu cầu. Thử lại sau 60 giây.'})
    if self.path.startswith('/api/verified/'):return verified_rewards.handle(self,c,u,d)
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
     if not save_guard.valid_tree(v):return self.reply(400,{'error':'Cấu trúc bản lưu không hợp lệ'})
     r=c.execute('UPDATE users SET save=?,revision=revision+1 WHERE id=? AND revision=?',(json.dumps(v,ensure_ascii=False,allow_nan=False),u['id'],rev))
     if r.rowcount:save_guard.audit(c,u['id'],rev+1,json.loads(u['save']) if u['save'] else None,v)
     c.commit()
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
  except (BrokenPipeError,ConnectionResetError,TimeoutError):self.close_connection=True
  except sqlite3.OperationalError as e:
   if (getattr(e,'sqlite_errorcode',0)&255) in (sqlite3.SQLITE_BUSY,sqlite3.SQLITE_LOCKED):return self.reply(503,{'error':'Máy chủ đang bận, vui lòng thử lại'})
   print(type(e).__name__,flush=True);self.reply(500,{'error':'Lỗi máy chủ'})
  except Exception as e:print(type(e).__name__,flush=True);self.reply(500,{'error':'Lỗi máy chủ'})
if __name__=='__main__':
 import test_together,test_guild;test_together.smoke();test_guild.smoke()
 init()
 if os.environ.get('RENDER')=='true' and 'WISH_DB' not in os.environ:print('WARNING: SQLite uses the deployment filesystem; configure durable storage before production use.',flush=True)
 port=int(os.environ.get('PORT','8080'));print(f'WISH WORLD: http://127.0.0.1:{port}',flush=True);BoundedServer((os.environ.get('HOST','127.0.0.1'),port),Handler).serve_forever()

import economy, beta, festival, referral, royal, payment
import time, os, json, hmac, secrets, hashlib

def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS staff_sessions(token TEXT PRIMARY KEY, expiry INTEGER); CREATE TABLE IF NOT EXISTS blocked(uid TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS reviewed(report_id INTEGER PRIMARY KEY); CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, action TEXT, target TEXT, created INTEGER); CREATE TABLE IF NOT EXISTS notices(id INTEGER PRIMARY KEY, body TEXT, created INTEGER);''')

def hash_token(t):return hashlib.sha256(t.encode()).hexdigest()
def cookie(t,age):return f'ww_admin={t}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age={age}'+('; Secure' if os.environ.get('WISH_SECURE')=='1' else '')
def handle(h,c,d=None):
 path=h.path; now=int(time.time()); key=os.environ.get('WISH_ADMIN_PASSWORD',''); reply=h.reply
 if not key or len(key)<14:return reply(503,{'error':'Chưa cấu hình mật khẩu quản trị (ít nhất 14 ký tự)'})
 if path=='/api/admin/login' and d is not None:
  p=d.get('password');
  if not isinstance(p,str) or not hmac.compare_digest(p.encode(),key.encode()):return reply(401,{'error':'Sai mật khẩu quản trị'})
  t=secrets.token_urlsafe(32);c.execute('DELETE FROM staff_sessions WHERE expiry<?',(now,));c.execute('INSERT INTO staff_sessions VALUES(?,?)',(hash_token(t),now+3600));c.commit();return reply(200,{'ok':True},cookie(t,3600))
 t=next((x.strip().split('=',1)[1] for x in h.headers.get('Cookie','').split(';') if x.strip().startswith('ww_admin=')), '')
 if not c.execute('SELECT 1 FROM staff_sessions WHERE token=? AND expiry>?',(hash_token(t),now)).fetchone():return reply(401,{'error':'Cần đăng nhập quản trị'})
 if path in ('/api/admin/alpha-feedback','/api/admin/alpha-review'):return beta.feedback_admin(h,c,d)
 if path=='/api/admin/payments':return payment.staff(h,c,d)
 if path in ('/api/admin/royal','/api/admin/royal-config'):return royal.staff(h,c,d)
 if path=='/api/admin/referrals' and d is None:return referral.staff(h,c)
 if path in ('/api/admin/festivals','/api/admin/festival-create','/api/admin/festival-close'):return festival.staff(h,c,d)
 if path in ('/api/admin/economy','/api/admin/price','/api/admin/sandbox-credit'):return economy.staff(h,c,d)
 if path=='/api/admin/backup' and d is not None:
  filename=beta.backup(c,c.execute('PRAGMA database_list').fetchone()[2]);c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',('backup',filename,now));c.commit();return reply(200,{'file':filename})
 if path=='/api/admin/dashboard' and d is None:
  count=lambda q:c.execute(q).fetchone()[0]
  return reply(200,{'stats':{'users':count('SELECT count(*) FROM users'),'online':c.execute('SELECT count(*) FROM presence WHERE seen>?',(now-12,)).fetchone()[0],'reports':count('SELECT count(*) FROM reports WHERE rowid NOT IN (SELECT report_id FROM reviewed)'),'blocked':count('SELECT count(*) FROM blocked')},'users':[dict(r) for r in c.execute('SELECT id,name,revision,id IN (SELECT uid FROM blocked) AS blocked FROM users ORDER BY name LIMIT 200')],'reports':[dict(r) for r in c.execute('SELECT r.rowid AS id,r.reason,r.created,a.name AS reporter,b.name AS target,r.target AS uid,r.rowid IN (SELECT report_id FROM reviewed) AS reviewed FROM reports r JOIN users a ON a.id=r.reporter JOIN users b ON b.id=r.target ORDER BY r.created DESC LIMIT 100')],'wishes':[dict(r) for r in c.execute('SELECT w.id,w.body,u.name FROM wishes w JOIN users u ON u.id=w.uid ORDER BY w.created DESC LIMIT 100')],'notices':[dict(r) for r in c.execute('SELECT * FROM notices ORDER BY id DESC LIMIT 20')],'audit':[dict(r) for r in c.execute('SELECT * FROM audit ORDER BY id DESC LIMIT 50')]})
 if d is None:return reply(404,{'error':'Không tìm thấy'})
 if path=='/api/admin/logout':
  c.execute('DELETE FROM staff_sessions WHERE token=?',(hash_token(t),));c.commit();return reply(200,{'ok':True},cookie('',0))
 action=path.rsplit('/',1)[-1]; target=d.get('id');c.execute('BEGIN IMMEDIATE')
 if action in ('block','unblock'):
  if not isinstance(target,str) or not c.execute('SELECT 1 FROM users WHERE id=?',(target,)).fetchone():return reply(404,{'error':'Không tìm thấy người chơi'})
  if action=='block':
   c.execute('INSERT OR IGNORE INTO blocked VALUES(?)',(target,));c.execute('DELETE FROM sessions WHERE uid=?',(target,));c.execute('DELETE FROM presence WHERE uid=?',(target,))
  else:c.execute('DELETE FROM blocked WHERE uid=?',(target,))
 elif action=='review':
  if type(target)!=int or not c.execute('SELECT 1 FROM reports WHERE rowid=?',(target,)).fetchone():return reply(404,{'error':'Không tìm thấy báo cáo'})
  c.execute('INSERT OR IGNORE INTO reviewed VALUES(?)',(target,))
 elif action=='delete-wish':
  if not isinstance(target,str) or not c.execute('DELETE FROM wishes WHERE id=?',(target,)).rowcount:return reply(404,{'error':'Không tìm thấy điều ước'})
 elif action=='notice':
  body=d.get('body');
  if not isinstance(body,str) or not 1<=len(body.strip())<=280:return reply(400,{'error':'Thông báo tối đa 280 ký tự'})
  target=c.execute('INSERT INTO notices(body,created) VALUES(?,?)',(body.strip(),now)).lastrowid
 elif action=='delete-notice':
  if type(target)!=int or not c.execute('DELETE FROM notices WHERE id=?',(target,)).rowcount:return reply(404,{'error':'Không tìm thấy thông báo'})
 else:return reply(404,{'error':'Không tìm thấy'})
 c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',(action,str(target),now));c.commit();return reply(200,{'ok':True})

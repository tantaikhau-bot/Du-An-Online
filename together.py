"""V5.6 Together: authenticated text chat, mutual companionship, blocking and reporting."""
import time, re, unicodedata
RETENTION=7*86400
def init(c):
 c.executescript("""CREATE TABLE IF NOT EXISTS ww_blocks(owner TEXT, target TEXT, PRIMARY KEY(owner,target));
 CREATE TABLE IF NOT EXISTS ww_pairs(sender TEXT, receiver TEXT, status TEXT, created INTEGER, PRIMARY KEY(sender,receiver));
 CREATE TABLE IF NOT EXISTS ww_chat(id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT NOT NULL, receiver TEXT, body TEXT NOT NULL, created INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0);
 CREATE INDEX IF NOT EXISTS ww_chat_sender ON ww_chat(sender,created);
 CREATE INDEX IF NOT EXISTS ww_chat_receiver ON ww_chat(receiver,id);
 CREATE TABLE IF NOT EXISTS ww_chat_reports(id INTEGER PRIMARY KEY, reporter TEXT, target TEXT, message_id INTEGER, body TEXT, reason TEXT, created INTEGER, reviewed INTEGER DEFAULT 0, UNIQUE(reporter,message_id));
 CREATE TABLE IF NOT EXISTS ww_pair_activity(a TEXT,b TEXT,day TEXT,first TEXT,second TEXT,completed INTEGER DEFAULT 0,PRIMARY KEY(a,b,day));
 """)
def blocked(c,a,b):
 return bool(c.execute('SELECT 1 FROM ww_blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)',(a,b,b,a)).fetchone())
def available(c,u):
 return isinstance(u,str) and bool(c.execute('SELECT 1 FROM users WHERE id=? AND id NOT IN (SELECT uid FROM blocked)',(u,)).fetchone())
def friend(c,a,b):
 return bool(c.execute("SELECT 1 FROM friends WHERE status='accepted' AND ((sender=? AND receiver=?) OR (sender=? AND receiver=?))",(a,b,b,a)).fetchone())
def pair(c,u):
 return c.execute("SELECT * FROM ww_pairs WHERE (sender=? OR receiver=?) AND status='accepted'",(u,u)).fetchone()
def other(p,u):
 return p['receiver'] if p['sender']==u else p['sender']
def end_pair(c,a,b):
 c.execute('DELETE FROM ww_pairs WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(a,b,b,a))
def clean_body(v):
 if not isinstance(v,str):return None
 v=unicodedata.normalize('NFKC',v).strip()
 if not 1<=len(v)<=240 or any(unicodedata.category(ch) in ('Cc','Cf','Cs') for ch in v):return None
 # Lightweight anti-spam and personal-contact guard, not comprehensive moderation.
 if re.search(r'https?://|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\d[\s.()+-]*){9,}',v,re.I):return None
 return v
def handle(h,c,u,d):
 uid=u['id']; action=h.path.rsplit('/',1)[-1]; now=int(time.time()); reply=h.reply
 def err(status,msg):return reply(status,{'error':msg})
 if action=='state':
  links=[dict(x) for x in c.execute("SELECT p.sender,p.receiver,p.status,p.created,u.id,u.name FROM ww_pairs p JOIN users u ON u.id=CASE WHEN p.sender=? THEN p.receiver ELSE p.sender END WHERE (p.sender=? OR p.receiver=?) AND u.id NOT IN (SELECT uid FROM blocked) LIMIT 20",(uid,uid,uid)) if not blocked(c,uid,x['id'])]
  blocks=[dict(x) for x in c.execute('SELECT u.id,u.name FROM ww_blocks b JOIN users u ON u.id=b.target WHERE b.owner=? LIMIT 200',(uid,))]
  p=pair(c,uid); activity=None
  if p and available(c,other(p,uid)) and not blocked(c,uid,other(p,uid)) and friend(c,uid,other(p,uid)):
   a,b=sorted((uid,other(p,uid)));day=time.strftime('%Y-%m-%d',time.gmtime(now+7*3600))
   row=c.execute('SELECT first,second,completed FROM ww_pair_activity WHERE a=? AND b=? AND day=?',(a,b,day)).fetchone()
   activity={'mine':bool(row and uid in (row['first'],row['second'])),'completed':bool(row and row['completed'])}
  return reply(200,{'links':links,'blocks':blocks,'activity':activity})
 if action=='chat':
  peer=d.get('id'); after=d.get('after',0)
  if type(after) is not int or after<0 or after>9223372036854775807:return err(400,'Mốc tin nhắn không hợp lệ')
  if peer is not None and (not available(c,peer) or peer==uid or blocked(c,uid,peer) or not friend(c,uid,peer)):return err(403,'Chat riêng chỉ dành cho bạn bè chưa bị chặn')
  where="m.hidden=0 AND m.created>=? AND m.sender NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=m.sender) OR (b.owner=m.sender AND b.target=?))"
  args=[now-RETENTION,uid,uid]
  if peer is None:where+=' AND m.receiver IS NULL'
  else:where+=' AND ((m.sender=? AND m.receiver=?) OR (m.sender=? AND m.receiver=?))';args.extend([uid,peer,peer,uid])
  if after:where+=' AND m.id>?';args.append(after)
  rows=[dict(r) for r in c.execute('SELECT m.id,m.sender,u.name,m.body,m.created FROM ww_chat m JOIN users u ON u.id=m.sender WHERE '+where+(' ORDER BY m.id ASC LIMIT 50' if after else ' ORDER BY m.id DESC LIMIT 50'),args)]
  if not after:rows.reverse()
  return reply(200,{'messages':rows})
 if action=='send':
  peer=d.get('id');body=clean_body(d.get('body'))
  if body is None:return err(400,'Tin nhắn 1–240 ký tự, không có liên kết, email hoặc số điện thoại')
  c.execute('BEGIN IMMEDIATE')
  if peer is not None and (not available(c,peer) or peer==uid or blocked(c,uid,peer) or not friend(c,uid,peer)):return err(403,'Không thể chat riêng với người này')
  if c.execute('SELECT count(*) FROM ww_chat WHERE sender=? AND created>?',(uid,now-10)).fetchone()[0]>=3 or c.execute('SELECT count(*) FROM ww_chat WHERE sender=? AND created>?',(uid,now-3600)).fetchone()[0]>=80:return err(429,'Gửi quá nhanh, hãy chờ')
  c.execute('DELETE FROM ww_chat WHERE created<?',(now-RETENTION,))
  c.execute('INSERT INTO ww_chat(sender,receiver,body,created) VALUES(?,?,?,?)',(uid,peer,body,now));c.commit();return reply(201,{'ok':True})
 if action=='report':
  mid=d.get('message'); reason=d.get('reason')
  if type(mid) is not int or not 0<mid<=9223372036854775807 or reason not in ('Quấy rối','Spam','Nội dung không phù hợp','Khác'):return err(400,'Báo cáo không hợp lệ')
  c.execute('BEGIN IMMEDIATE')
  m=c.execute('SELECT * FROM ww_chat WHERE id=? AND created>=?',(mid,now-RETENTION)).fetchone()
  if not m or m['sender']==uid or (m['receiver'] is not None and m['receiver']!=uid):return err(404,'Không tìm thấy tin nhắn')
  if c.execute('SELECT count(*) FROM ww_chat_reports WHERE reporter=? AND created>?',(uid,now-86400)).fetchone()[0]>=20:return err(429,'Đạt giới hạn báo cáo hôm nay')
  if not c.execute('INSERT OR IGNORE INTO ww_chat_reports(reporter,target,message_id,body,reason,created) VALUES(?,?,?,?,?,?)',(uid,m['sender'],mid,m['body'],reason,now)).rowcount:return err(409,'Đã báo cáo tin nhắn')
  c.commit();return reply(201,{'ok':True})
 target=d.get('id')
 if not isinstance(target,str) or target==uid:return err(400,'Người chơi không hợp lệ')
 c.execute('BEGIN IMMEDIATE')
 if action=='unblock':
  c.execute('DELETE FROM ww_blocks WHERE owner=? AND target=?',(uid,target));c.commit();return reply(200,{'ok':True})
 if not available(c,target):return err(404,'Không tìm thấy người chơi')
 if action=='block':
  if c.execute('SELECT count(*) FROM ww_blocks WHERE owner=?',(uid,)).fetchone()[0]>=200 and not c.execute('SELECT 1 FROM ww_blocks WHERE owner=? AND target=?',(uid,target)).fetchone():return err(429,'Danh sách chặn đã đầy')
  c.execute('INSERT OR IGNORE INTO ww_blocks VALUES(?,?)',(uid,target))
  end_pair(c,uid,target)
  c.execute('DELETE FROM friends WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(uid,target,target,uid))
  c.commit();return reply(200,{'ok':True})
 if action=='end':
  end_pair(c,uid,target);c.commit();return reply(200,{'ok':True})
 if blocked(c,uid,target) or not friend(c,uid,target):return err(403,'Chỉ kết đôi với bạn bè đã đồng ý kết bạn')
 if action=='invite':
  if pair(c,uid) or pair(c,target):return err(409,'Một trong hai đã có bạn đồng hành')
  if c.execute('SELECT 1 FROM ww_pairs WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)',(uid,target,target,uid)).fetchone():return err(409,'Đã có lời mời')
  if c.execute("SELECT count(*) FROM ww_pairs WHERE sender=? AND status='pending'",(uid,)).fetchone()[0]>=5:return err(429,'Tối đa 5 lời mời đang chờ')
  c.execute("INSERT INTO ww_pairs VALUES(?,?,'pending',?)",(uid,target,now))
 elif action=='accept':
  if pair(c,uid) or pair(c,target):return err(409,'Một trong hai đã có bạn đồng hành')
  if not c.execute("UPDATE ww_pairs SET status='accepted' WHERE sender=? AND receiver=? AND status='pending'",(target,uid)).rowcount:return err(404,'Không có lời mời')
  c.execute("DELETE FROM ww_pairs WHERE status='pending' AND (sender IN (?,?) OR receiver IN (?,?))",(uid,target,uid,target))
 elif action=='activity':
  p=pair(c,uid)
  if not p or other(p,uid)!=target:return err(403,'Cần kết đôi đồng hành trước')
  positions=c.execute('SELECT uid,x,y,area FROM presence WHERE uid IN (?,?) AND seen>?',(uid,target,now-12)).fetchall()
  if len(positions)!=2 or positions[0]['area']!=positions[1]['area'] or ((positions[0]['x']-positions[1]['x'])/35)**2+((positions[0]['y']-positions[1]['y'])/14)**2>5**2:return err(409,'Hai bạn cần đứng gần nhau trong cùng khu vực')
  a,b=sorted((uid,target));day=time.strftime('%Y-%m-%d',time.gmtime(now+7*3600))
  row=c.execute('SELECT * FROM ww_pair_activity WHERE a=? AND b=? AND day=?',(a,b,day)).fetchone()
  c.execute('DELETE FROM ww_pair_activity WHERE day<?',(time.strftime('%Y-%m-%d',time.gmtime(now-30*86400)),))
  if not row:c.execute('INSERT INTO ww_pair_activity(a,b,day,first) VALUES(?,?,?,?)',(a,b,day,uid))
  elif row['completed'] or row['first']==uid:return err(409,'Bạn đã gửi lời chúc hôm nay')
  else:c.execute('UPDATE ww_pair_activity SET second=?,completed=1 WHERE a=? AND b=? AND day=?',(uid,a,b,day))
 else:return err(404,'Không tìm thấy')
 c.commit();return reply(200,{'ok':True})
def staff(h,c,d=None):
 if h.path=='/api/admin/chat-reports' and d is None:
  return h.reply(200,{'items':[dict(r) for r in c.execute('SELECT r.*,a.name AS reporter_name,b.name AS target_name FROM ww_chat_reports r JOIN users a ON a.id=r.reporter JOIN users b ON b.id=r.target ORDER BY r.reviewed,r.created DESC LIMIT 100')]})
 if h.path=='/api/admin/chat-review' and d is not None:
  key=d.get('id');hide=d.get('hide',False)
  if type(key) is not int or type(hide) is not bool:return h.reply(400,{'error':'Báo cáo không hợp lệ'})
  row=c.execute('SELECT message_id FROM ww_chat_reports WHERE id=?',(key,)).fetchone()
  if not row:return h.reply(404,{'error':'Không tìm thấy'})
  if hide:c.execute('UPDATE ww_chat SET hidden=1 WHERE id=?',(row['message_id'],))
  c.execute('UPDATE ww_chat_reports SET reviewed=1 WHERE id=?',(key,))
  c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',('chat-hide' if hide else 'chat-review',str(key),int(time.time())));c.commit();return h.reply(200,{'ok':True})
 return h.reply(404,{'error':'Không tìm thấy'})

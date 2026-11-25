"""V5.7: invitation-only parties and guilds, member chat, shared expedition."""
import time, secrets, re, together
CAP={'party':4,'guild':20}
def init(c):
 c.executescript("""CREATE TABLE IF NOT EXISTS ww_groups(id TEXT PRIMARY KEY,kind TEXT NOT NULL,name TEXT NOT NULL,leader TEXT NOT NULL,xp INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS ww_group_members(gid TEXT NOT NULL,uid TEXT NOT NULL,kind TEXT NOT NULL,joined INTEGER NOT NULL,PRIMARY KEY(gid,uid),UNIQUE(uid,kind));
 CREATE TABLE IF NOT EXISTS ww_group_invites(gid TEXT,uid TEXT,sender TEXT,created INTEGER,PRIMARY KEY(gid,uid));
 CREATE INDEX IF NOT EXISTS ww_group_invites_uid ON ww_group_invites(uid,created);
 CREATE TABLE IF NOT EXISTS ww_group_daily(gid TEXT,day TEXT,completed INTEGER DEFAULT 0,PRIMARY KEY(gid,day));
 """)
 if 'gid' not in [r[1] for r in c.execute('PRAGMA table_info(ww_chat)')]:
  c.execute('ALTER TABLE ww_chat ADD COLUMN gid TEXT')
 c.execute('CREATE INDEX IF NOT EXISTS ww_chat_gid ON ww_chat(gid,id)')
def membership(c,uid,gid):
 return c.execute('SELECT g.* FROM ww_groups g JOIN ww_group_members m ON g.id=m.gid WHERE g.id=? AND m.uid=?',(gid,uid)).fetchone()
def remove(c,gid,uid):
 c.execute('DELETE FROM ww_group_members WHERE gid=? AND uid=?',(gid,uid))
 c.execute('DELETE FROM ww_group_invites WHERE gid=? AND (uid=? OR sender=?)',(gid,uid,uid))
 g=c.execute('SELECT leader FROM ww_groups WHERE id=?',(gid,)).fetchone()
 if not g:return
 if g['leader']==uid:
  n=c.execute('SELECT uid FROM ww_group_members WHERE gid=? AND uid NOT IN (SELECT uid FROM blocked) ORDER BY joined,uid LIMIT 1',(gid,)).fetchone()
  if n:c.execute('UPDATE ww_groups SET leader=? WHERE id=?',(n['uid'],gid))
  else:
   for table in ('ww_group_members','ww_group_invites','ww_group_daily','ww_groups'):
    c.execute('DELETE FROM '+table+' WHERE '+('id' if table=='ww_groups' else 'gid')+'=?',(gid,))
   c.execute('DELETE FROM ww_chat WHERE gid=?',(gid,))
def remove_user(c,uid):
 for row in c.execute('SELECT gid FROM ww_group_members WHERE uid=?',(uid,)).fetchall():remove(c,row['gid'],uid)
 c.execute('DELETE FROM ww_group_invites WHERE uid=? OR sender=?',(uid,uid))
def handle(h,c,u,d):
 uid=u['id']; act=h.path.rsplit('/',1)[-1]; now=int(time.time()); today=time.strftime('%Y-%m-%d',time.gmtime(now+7*3600));r=h.reply
 def err(n,m):return r(n,{'error':m})
 if act=='state':
  groups=[]
  for g in c.execute('SELECT g.* FROM ww_groups g JOIN ww_group_members m ON m.gid=g.id WHERE m.uid=?',(uid,)).fetchall():
   item=dict(g);item['members']=[dict(x) for x in c.execute('SELECT m.uid AS id,u.name,EXISTS(SELECT 1 FROM presence p WHERE p.uid=m.uid AND p.seen>?) AS online FROM ww_group_members m JOIN users u ON u.id=m.uid WHERE m.gid=? AND m.uid NOT IN (SELECT uid FROM blocked) ORDER BY m.joined,m.uid',(now-12,g['id'])) if not together.blocked(c,uid,x['id'])]
   item['completed']=bool(c.execute('SELECT 1 FROM ww_group_daily WHERE gid=? AND day=? AND completed=1',(g['id'],today)).fetchone())
   groups.append(item)
  invites=[dict(x) for x in c.execute('SELECT i.gid,i.sender,g.name,g.kind,u.name AS inviter FROM ww_group_invites i JOIN ww_groups g ON g.id=i.gid JOIN users u ON u.id=i.sender WHERE i.uid=? AND i.created>? LIMIT 20',(uid,now-86400)) if together.available(c,x['sender']) and not together.blocked(c,uid,x['sender'])]
  return r(200,{'groups':groups,'invites':invites})
 if act=='create':
  kind=d.get('kind');name=d.get('name')
  if not isinstance(kind,str) or kind not in CAP or not isinstance(name,str) or not 3<=len(name.strip())<=24 or not together.clean_body(name) or not re.fullmatch(r'[\w \-]+',name.strip()):return err(400,'Tên nhóm 3–24 ký tự, chữ/số/dấu cách')
  c.execute('BEGIN IMMEDIATE')
  if c.execute('SELECT 1 FROM ww_group_members WHERE uid=? AND kind=?',(uid,kind)).fetchone():return err(409,'Bạn đã ở trong nhóm loại này')
  gid=secrets.token_hex(12);c.execute('INSERT INTO ww_groups VALUES(?,?,?,?,0,?)',(gid,kind,name.strip(),uid,now));c.execute('INSERT INTO ww_group_members VALUES(?,?,?,?)',(gid,uid,kind,now));c.commit();return r(201,{'id':gid})
 gid=d.get('gid')
 if not isinstance(gid,str) or len(gid)!=24:return err(400,'Nhóm không hợp lệ')
 if act in ('accept','decline'):
  c.execute('BEGIN IMMEDIATE')
  inv=c.execute('SELECT i.sender,g.* FROM ww_group_invites i JOIN ww_groups g ON g.id=i.gid WHERE i.gid=? AND i.uid=? AND i.created>?',(gid,uid,now-86400)).fetchone()
  if not inv:return err(404,'Lời mời đã hết hạn')
  if act=='decline':c.execute('DELETE FROM ww_group_invites WHERE gid=? AND uid=?',(gid,uid));c.commit();return r(200,{'ok':True})
  if not together.available(c,inv['sender']) or not together.friend(c,uid,inv['sender']) or together.blocked(c,uid,inv['sender']):return err(403,'Lời mời không còn hợp lệ')
  if c.execute('SELECT 1 FROM ww_group_members WHERE uid=? AND kind=?',(uid,inv['kind'])).fetchone():return err(409,'Bạn đã ở trong nhóm loại này')
  members=c.execute('SELECT uid FROM ww_group_members WHERE gid=?',(gid,)).fetchall()
  if len(members)>=CAP[inv['kind']]:return err(409,'Nhóm đã đầy')
  if any(together.blocked(c,uid,m['uid']) for m in members):return err(403,'Không thể tham gia nhóm này')
  c.execute('INSERT INTO ww_group_members VALUES(?,?,?,?)',(gid,uid,inv['kind'],now));c.execute('DELETE FROM ww_group_invites WHERE gid=? AND uid=?',(gid,uid));c.commit();return r(200,{'ok':True})
 if act=='chat':
  if not membership(c,uid,gid):return err(403,'Chỉ thành viên được đọc chat nhóm')
  rows=[dict(x) for x in c.execute('SELECT m.id,m.sender,u.name,m.body,m.created FROM ww_chat m JOIN users u ON u.id=m.sender WHERE m.gid=? AND m.hidden=0 AND m.created>=? AND m.sender NOT IN (SELECT uid FROM blocked) AND NOT EXISTS(SELECT 1 FROM ww_blocks b WHERE (b.owner=? AND b.target=m.sender) OR (b.owner=m.sender AND b.target=?)) ORDER BY m.id DESC LIMIT 50',(gid,now-together.RETENTION,uid,uid))]
  rows.reverse();return r(200,{'messages':rows})
 c.execute('BEGIN IMMEDIATE')
 g=membership(c,uid,gid)
 if not g:return err(403,'Bạn không còn là thành viên')
 if act=='leave':remove(c,gid,uid)
 elif act=='invite':
  target=d.get('id')
  if g['leader']!=uid:return err(403,'Chỉ trưởng nhóm được mời')
  if target==uid or not together.available(c,target) or not together.friend(c,uid,target) or together.blocked(c,uid,target):return err(403,'Chỉ mời bạn bè chưa bị chặn')
  if c.execute('SELECT 1 FROM ww_group_members WHERE uid=? AND kind=?',(target,g['kind'])).fetchone():return err(409,'Người chơi đã có nhóm')
  if c.execute('SELECT count(*) FROM ww_group_members WHERE gid=?',(gid,)).fetchone()[0]>=CAP[g['kind']]:return err(409,'Nhóm đã đầy')
  c.execute('DELETE FROM ww_group_invites WHERE created<?',(now-86400,))
  if c.execute('SELECT count(*) FROM ww_group_invites WHERE gid=?',(gid,)).fetchone()[0]>=20:return err(429,'Quá nhiều lời mời')
  if not c.execute('INSERT OR IGNORE INTO ww_group_invites VALUES(?,?,?,?)',(gid,target,uid,now)).rowcount:return err(409,'Đã gửi lời mời')
 elif act=='kick':
  target=d.get('id')
  if g['leader']!=uid or target==uid or not isinstance(target,str) or not membership(c,target,gid):return err(403,'Không thể loại thành viên')
  remove(c,gid,target)
 elif act=='send':
  body=together.clean_body(d.get('body'))
  if body is None:return err(400,'Tin nhắn 1–240 ký tự, không có thông tin liên hệ')
  if c.execute('SELECT count(*) FROM ww_chat WHERE sender=? AND created>?',(uid,now-10)).fetchone()[0]>=3 or c.execute('SELECT count(*) FROM ww_chat WHERE sender=? AND created>?',(uid,now-3600)).fetchone()[0]>=80:return err(429,'Gửi quá nhanh, hãy chờ')
  c.execute('DELETE FROM ww_chat WHERE created<?',(now-together.RETENTION,))
  c.execute('INSERT INTO ww_chat(sender,body,created,gid) VALUES(?,?,?,?)',(uid,body,now,gid))
 elif act=='expedition':
  if c.execute('SELECT 1 FROM ww_group_daily WHERE gid=? AND day=? AND completed=1',(gid,today)).fetchone():return err(409,'Đã hoàn thành thử thách hôm nay')
  mine=c.execute('SELECT * FROM presence WHERE uid=? AND seen>?',(uid,now-12)).fetchone()
  if not mine:return err(409,'Hãy vào thế giới trước')
  # Meet near a landmark; all coordinates are reported by the client, not authoritative.
  points=[(0,0),(-56,-53),(56,-51),(-56,54),(56,52)]
  x,z=(mine['x']-490)/35,-(mine['y']-575)/14
  point=next((p for p in points if (x-p[0])**2+(z-p[1])**2<=25),None)
  if not point:return err(409,'Đến quảng trường hoặc một trong bốn vùng viễn du')
  count=0
  for p in c.execute('SELECT p.* FROM presence p JOIN ww_group_members m ON p.uid=m.uid WHERE m.gid=? AND p.seen>? AND p.area=? AND p.uid NOT IN (SELECT uid FROM blocked)',(gid,now-12,mine['area'])):
   if together.blocked(c,uid,p['uid']):continue
   px,pz=(p['x']-490)/35,-(p['y']-575)/14
   if (px-point[0])**2+(pz-point[1])**2<=25 and (px-x)**2+(pz-z)**2<=25:count+=1
  if count<2:return err(409,'Cần ít nhất hai thành viên đứng gần nhau tại địa danh')
  c.execute('INSERT OR REPLACE INTO ww_group_daily VALUES(?,?,1)',(gid,today));c.execute('UPDATE ww_groups SET xp=xp+25 WHERE id=?',(gid,))
  c.execute('DELETE FROM ww_group_daily WHERE day<?',(time.strftime('%Y-%m-%d',time.gmtime(now-30*86400)),))
 else:return err(404,'Không tìm thấy')
 c.commit();return r(200,{'ok':True})

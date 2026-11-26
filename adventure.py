"""Account-bound daily scenic routes. No currency or tradable reward.
Position is checked against authenticated presence, still client-reported.
"""
import math,time,together
PLACES={
 'plaza':('Quảng trường',0,0),'village':('Làng bình an',0,-16),
 'falls':('Thác ánh sao',-12,-4.2),'meadow':('Đồng hoa',-28,-28),
 'forest':('Rừng cổ tích',-26,24),'hill':('Đồi pha lê',32,-29),
 'pine':('Rừng thông sương',-56,-53),'ruins':('Di tích cổ',56,-51),
 'amber':('Rừng hổ phách',-56,54),'summit':('Cao nguyên tuyết',56,52),
}
ROUTES=(
 ('plaza','village','falls'),('meadow','village','pine'),
 ('plaza','forest','amber'),('village','hill','ruins'),
 ('plaza','forest','summit'),
)
TITLES=('Dạo bước bình an','Hương hoa và thông','Dấu chân cổ tích','Hành trình pha lê','Chạm tới cao nguyên')
def init(c):
 c.executescript("""CREATE TABLE IF NOT EXISTS ww_adventure123(
 uid TEXT NOT NULL, day INTEGER NOT NULL, step INTEGER NOT NULL CHECK(step BETWEEN 1 AND 3),
 updated REAL NOT NULL, PRIMARY KEY(uid,day));
 CREATE TABLE IF NOT EXISTS ww_coop136(day INTEGER NOT NULL,a TEXT NOT NULL,b TEXT NOT NULL,sender TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','cancelled','complete')),step INTEGER NOT NULL DEFAULT 0 CHECK(step BETWEEN 0 AND 3),updated REAL NOT NULL,PRIMARY KEY(day,a,b));
 CREATE INDEX IF NOT EXISTS ww_coop136_b ON ww_coop136(day,b);""")
def daily(now):
 return int((now+7*3600)//86400)
def details(c,uid,now):
 day=daily(now);i=day%len(ROUTES);route=ROUTES[i]
 row=c.execute('SELECT step FROM ww_adventure123 WHERE uid=? AND day=?',(uid,day)).fetchone()
 step=row[0] if row else 0
 total=c.execute('SELECT count(*) FROM ww_adventure123 WHERE uid=? AND step=3',(uid,)).fetchone()[0]
 # Epoch day zero was Thursday; Monday is day four. Account-bound, no extra currency.
 week=day-(day+3)%7
 weekly=c.execute('SELECT count(*) FROM ww_adventure123 WHERE uid=? AND step=3 AND day>=? AND day<=?',(uid,week,day)).fetchone()[0]
 return {'day':day,'title':TITLES[i],'stops':[{'id':k,'name':PLACES[k][0]} for k in route],
         'step':step,'complete':step==3,'completed_routes':total,'weekly':{'count':weekly,'goal':3,'complete':weekly>=3,'reset':(week+7)*86400-7*3600},'reset':(day+1)*86400-7*3600}
def handle(h,c,u,d,now=None):
 now=time.time() if now is None else now
 uid=u['id'];action=h.path.rsplit('/',1)[-1]
 def err(status,msg):return h.reply(status,{'error':msg})
 if not isinstance(d,dict):return err(400,'Dữ liệu không hợp lệ')
 if action.startswith('coop-'):return coop(h,c,uid,d,now,action[5:])
 if action=='status':
  if d:return err(400,'Không nhận tham số trạng thái')
  return h.reply(200,details(c,uid,now))
 if action!='checkin':return err(404,'Không tìm thấy')
 if set(d)!={'id','day'} or type(d['day']) is not int or not isinstance(d['id'],str):return err(400,'Điểm đến không hợp lệ')
 if d['day']!=daily(now):return err(409,'Hành trình đã đổi ngày, hãy tải lại')
 c.execute('BEGIN IMMEDIATE')
 v=details(c,uid,now);step=v['step']
 if v['complete']:return err(409,'Đã hoàn thành hành trình hôm nay')
 stop=v['stops'][step]['id']
 if d['id']!=stop:return err(409,'Hãy ghé đúng điểm tiếp theo')
 p=c.execute('SELECT x,y,area,seen FROM presence WHERE uid=?',(uid,)).fetchone()
 if not p or p['area']!=0 or p['seen']<now-4 or p['seen']>now+1:return err(409,'Cần kết nối trong thế giới chung')
 _,x,z=PLACES[stop]
 if math.hypot((p['x']-490)/35-x,-(p['y']-575)/14-z)>3.5:return err(409,'Hãy đến gần điểm check-in')
 old=c.execute('SELECT updated FROM ww_adventure123 WHERE uid=? AND day=?',(uid,v['day'])).fetchone()
 if old and now-old[0]<3:return err(429,'Hãy tiếp tục hành trình trước khi check-in')
 c.execute('INSERT INTO ww_adventure123(uid,day,step,updated) VALUES(?,?,?,?) ON CONFLICT(uid,day) DO UPDATE SET step=excluded.step,updated=excluded.updated',(uid,v['day'],step+1,now))
 c.commit()
 return h.reply(200,details(c,uid,now))

def coop_allowed(c,a,b):
 return a!=b and together.available(c,a) and together.available(c,b) and together.friend(c,a,b) and not together.blocked(c,a,b)
def coop_presence(c,uid,now):
 p=c.execute('SELECT x,y,area,seen FROM presence WHERE uid=?',(uid,)).fetchone()
 return p if p and p['area']==0 and now-4<=p['seen']<=now+1 else None
def coop_details(c,uid,now):
 day=daily(now);route=ROUTES[day%len(ROUTES)]
 rows=[]
 for row in c.execute("SELECT * FROM ww_coop136 WHERE day=? AND (a=? OR b=?) AND status IN ('pending','accepted','complete') ORDER BY updated DESC",(day,uid,uid)):
  peer=row['b'] if row['a']==uid else row['a']
  if not coop_allowed(c,uid,peer):continue
  name=c.execute('SELECT name FROM users WHERE id=?',(peer,)).fetchone()[0]
  rows.append({'peer':peer,'name':name,'incoming':row['sender']!=uid,'status':row['status'],'step':row['step']})
 return {'day':day,'title':TITLES[day%len(ROUTES)],'stops':[{'id':k,'name':PLACES[k][0]} for k in route],'pairs':rows}
def coop(h,c,uid,d,now,action):
 def err(code,msg):return h.reply(code,{'error':msg})
 day=daily(now)
 if action=='status':
  if d:return err(400,'Không nhận tham số trạng thái')
  return h.reply(200,coop_details(c,uid,now))
 if action not in ('invite','accept','decline','cancel','checkin'):return err(404,'Không tìm thấy')
 fields={'peer','day','id'} if action=='checkin' else {'peer','day'}
 if set(d)!=fields or type(d['day']) is not int or not isinstance(d['peer'],str):return err(400,'Yêu cầu không hợp lệ')
 if d['day']!=day:return err(409,'Hành trình đã đổi ngày')
 peer=d['peer']
 if not coop_allowed(c,uid,peer):return err(403,'Chỉ tương tác với bạn bè đã đồng ý')
 a,b=sorted((uid,peer))
 c.execute('BEGIN IMMEDIATE')
 row=c.execute('SELECT * FROM ww_coop136 WHERE day=? AND a=? AND b=?',(day,a,b)).fetchone()
 def occupied(who):
  return c.execute("SELECT 1 FROM ww_coop136 WHERE day=? AND (a=? OR b=?) AND status IN ('accepted','complete')",(day,who,who)).fetchone()
 if action=='invite':
  if row or occupied(uid) or occupied(peer):return err(409,'Đã có hành trình hoặc lời mời hôm nay')
  if c.execute('SELECT count(*) FROM ww_coop136 WHERE day=? AND sender=?',(day,uid)).fetchone()[0]>=3:return err(429,'Tối đa 3 lời mời mỗi ngày')
  p,q=coop_presence(c,uid,now),coop_presence(c,peer,now)
  if not p or not q or math.hypot((p['x']-q['x'])/35,(p['y']-q['y'])/14)>5:return err(409,'Hai bạn cần đứng gần nhau')
  c.execute("INSERT INTO ww_coop136 VALUES(?,?,?,?,'pending',0,?)",(day,a,b,uid,now))
 elif not row:return err(404,'Không có lời mời')
 elif action in ('accept','decline'):
  if row['status']!='pending' or row['sender']==uid:return err(409,'Chỉ người nhận được phản hồi')
  if action=='accept' and (occupied(uid) or occupied(peer)):return err(409,'Một người đã có hành trình hôm nay')
  c.execute('UPDATE ww_coop136 SET status=?,updated=? WHERE day=? AND a=? AND b=?',('accepted' if action=='accept' else 'declined',now,day,a,b))
 elif action=='cancel':
  if row['status'] not in ('pending','accepted'):return err(409,'Không thể hủy')
  c.execute("UPDATE ww_coop136 SET status='cancelled',updated=? WHERE day=? AND a=? AND b=?",(now,day,a,b))
 else:
  if row['status']!='accepted':return err(409,'Cần đồng ý hành trình trước')
  stop=ROUTES[day%len(ROUTES)][row['step']]
  if d['id']!=stop:return err(409,'Hãy ghé đúng điểm tiếp theo')
  _,x,z=PLACES[stop]
  for who in (uid,peer):
   p=coop_presence(c,who,now)
   if not p or math.hypot((p['x']-490)/35-x,-(p['y']-575)/14-z)>3.5:return err(409,'Cả hai cần đến gần điểm check-in')
  if now-row['updated']<3:return err(429,'Hãy tiếp tục hành trình')
  step=row['step']+1
  c.execute('UPDATE ww_coop136 SET step=?,status=?,updated=? WHERE day=? AND a=? AND b=?',(step,'complete' if step==3 else 'accepted',now,day,a,b))
 c.commit()
 return h.reply(200,coop_details(c,uid,now))

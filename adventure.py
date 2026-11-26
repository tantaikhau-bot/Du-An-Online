"""Account-bound daily scenic routes. No currency or tradable reward.
Position is checked against authenticated presence, still client-reported.
"""
import math,time
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
 updated REAL NOT NULL, PRIMARY KEY(uid,day));""")
def daily(now):
 return int((now+7*3600)//86400)
def details(c,uid,now):
 day=daily(now);i=day%len(ROUTES);route=ROUTES[i]
 row=c.execute('SELECT step FROM ww_adventure123 WHERE uid=? AND day=?',(uid,day)).fetchone()
 step=row[0] if row else 0
 total=c.execute('SELECT count(*) FROM ww_adventure123 WHERE uid=? AND step=3',(uid,)).fetchone()[0]
 return {'day':day,'title':TITLES[i],'stops':[{'id':k,'name':PLACES[k][0]} for k in route],
         'step':step,'complete':step==3,'completed_routes':total,'reset':(day+1)*86400-7*3600}
def handle(h,c,u,d,now=None):
 now=time.time() if now is None else now
 uid=u['id'];action=h.path.rsplit('/',1)[-1]
 def err(status,msg):return h.reply(status,{'error':msg})
 if not isinstance(d,dict):return err(400,'Dữ liệu không hợp lệ')
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

"""Server-resolved solo, turn-based PvE. Cosmetic progress only."""
import time
STAGES=(
 ('Mầm bóng tối','🌿',64,8,16),
 ('Sói sương','🐺',84,10,20),
 ('Hộ vệ đá','🗿',106,12,24),
 ('Tinh linh bão','🌪️',128,14,28),
 ('Long vương pha lê','🐉',156,16,34),
)
SKILLS={'strike':(0,18),'burst':(20,38),'guard':(0,6),'heal':(25,0)}
def init(c):
 c.execute("""CREATE TABLE IF NOT EXISTS ww_dungeon138(uid TEXT PRIMARY KEY,stage INTEGER NOT NULL DEFAULT 1,best INTEGER NOT NULL DEFAULT 0,rev INTEGER NOT NULL DEFAULT 0,hp INTEGER NOT NULL DEFAULT 100,energy INTEGER NOT NULL DEFAULT 60,enemy INTEGER NOT NULL DEFAULT 64,turn INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'ready',updated REAL NOT NULL DEFAULT 0,notice TEXT NOT NULL DEFAULT '')""")
def state(c,uid):
 row=c.execute('SELECT * FROM ww_dungeon138 WHERE uid=?',(uid,)).fetchone()
 return dict(row) if row else {'uid':uid,'stage':1,'best':0,'rev':0,'hp':100,'energy':60,'enemy':64,'turn':0,'status':'ready','updated':0,'notice':''}
def view(v):
 name,icon,maxhp,attack,heavy=STAGES[v['stage']-1]
 boss=v['stage']==len(STAGES)
 charged=v['turn']%3==2
 return {k:v[k] for k in ('stage','best','rev','hp','energy','enemy','turn','status','notice')}|{'count':len(STAGES),'enemy_name':name,'enemy_icon':icon,'enemy_max':maxhp,'boss':boss,'incoming':'Đòn cường kích' if charged else 'Đòn thường','incoming_damage':heavy if charged else attack,'skills':[{'id':k,'cost':cost,'damage':damage} for k,(cost,damage) in SKILLS.items()]}
def store(c,v):
 keys=('uid','stage','best','rev','hp','energy','enemy','turn','status','updated','notice')
 c.execute('INSERT INTO ww_dungeon138('+','.join(keys)+') VALUES('+','.join('?' for _ in keys)+') ON CONFLICT(uid) DO UPDATE SET '+','.join(k+'=excluded.'+k for k in keys[1:]),tuple(v[k] for k in keys))
def handle(h,c,u,d,now=None):
 now=time.time() if now is None else now;uid=u['id'];action=h.path.rsplit('/',1)[-1]
 def err(code,msg):return h.reply(code,{'error':msg})
 if action=='status':
  if d:return err(400,'Không nhận tham số')
  return h.reply(200,view(state(c,uid)))
 if action not in ('start','act'):return err(404,'Không tìm thấy')
 if not isinstance(d,dict) or set(d)!=({'rev','stage'} if action=='start' else {'rev','skill'}) or type(d['rev']) is not int:return err(400,'Yêu cầu không hợp lệ')
 c.execute('BEGIN IMMEDIATE');v=state(c,uid)
 if d['rev']!=v['rev']:return err(409,'Lượt đã thay đổi, hãy làm mới')
 if action=='start':
  stage=d['stage']
  if type(stage) is not int or not 1<=stage<=min(len(STAGES),v['best']+1):return err(403,'Ải chưa mở khóa')
  if v['status']=='fight':return err(409,'Hãy hoàn thành hoặc kết thúc trận hiện tại')
  if now-v['updated']<.25:return err(429,'Thử lại sau')
  v.update(stage=stage,hp=100,energy=60,enemy=STAGES[stage-1][2],turn=0,status='fight',notice='Trận chiến bắt đầu')
 else:
  if v['status']!='fight':return err(409,'Chưa có trận đang diễn ra')
  skill=d['skill']
  if not isinstance(skill,str) or skill not in (*SKILLS,'retreat'):return err(400,'Kỹ năng không hợp lệ')
  if now-v['updated']<.25:return err(429,'Thao tác quá nhanh')
  if skill=='retreat':v.update(status='lost',notice='Đã rút lui an toàn')
  else:
   cost,damage=SKILLS[skill]
   if v['energy']<cost:return err(409,'Chưa đủ năng lượng')
   v['energy']-=cost
   if skill=='heal':v['hp']=min(100,v['hp']+35)
   v['enemy']=max(0,v['enemy']-damage)
   if v['enemy']==0:
    v['status']='won';v['best']=max(v['best'],v['stage']);v['notice']='Chiến thắng! Đã ghi nhận huy hiệu ải.'
   else:
    _,_,_,attack,heavy=STAGES[v['stage']-1]
    incoming=heavy if v['turn']%3==2 else attack
    if skill=='guard':incoming=max(1,incoming//4)
    v['hp']=max(0,v['hp']-incoming)
    v['energy']=min(60,v['energy']+(18 if skill=='guard' else 8))
    v['status']='fight' if v['hp'] else 'lost'
    v['notice']='Đã gây '+str(damage)+' sát thương · nhận '+str(incoming)+' sát thương' if v['hp'] else 'Đã thua, có thể thử lại'
   v['turn']+=1
   if v['turn']>=80 and v['status']=='fight':v.update(status='lost',notice='Đã hết số lượt thử thách')
 v['rev']+=1;v['updated']=now;store(c,v);c.commit()
 return h.reply(200,view(v))

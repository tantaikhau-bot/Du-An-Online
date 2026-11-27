"""Server-resolved solo, turn-based PvE. Cosmetic progress only."""
import time
import secrets
import json
MAGIC={
 'fire':('Hỏa cầu',18,22,2,'Thiêu đốt 2 lượt, mỗi lượt 6 ST'),
 'ice':('Băng trói',16,15,2,'Giảm 50% đòn phản công hiện tại'),
 'lightning':('Thiên lôi',24,32,3,'Sát thương mạnh, cộng 8 ST khi địch chuẩn bị cường kích'),
 'light':('Thánh quang',22,0,3,'Hồi 28 HP và giảm 50% đòn phản công'),
 'shadow':('Bóng tối',20,20,3,'Hút 12 HP tối đa theo sát thương thực tế'),
}
def cooldowns(v):
 return json.loads(v['magic_cd'])
def skill_view(v,k,cost):
 q={'id':k,'cost':cost,'damage':attack_profile(v,k)[0],'stamina_cost':attack_profile(v,k)[1],'cooldown':max(0,cooldowns(v).get(k,0)-v['turn'])}
 if k in MAGIC:
  q.update(name=MAGIC[k][0],effect=MAGIC[k][4],cooldown_turns=MAGIC[k][3])
  if k=='lightning' and v['turn']%3==2:q['damage']+=8
 return q
MAX_HP=100
MAX_ENERGY=60
MAX_STAMINA=100
ARMOR=5
WEAPONS={
 'sword':('Kiếm',18,38,12,20),
 'bow':('Cung',16,40,10,22),
 'staff':('Trượng phép',14,46,10,24),
 'daggers':('Song đao',15,34,8,18),
 'greatsword':('Đại kiếm',23,44,18,28),
}
COMBO_BONUS=(100,115,135)
def attack_profile(v,skill):
 name,strike,burst,light,heavy=WEAPONS[v['weapon']]
 if skill=='strike':return strike*COMBO_BONUS[min(v['combo'],2)]//100,light
 if skill=='burst':return burst,heavy
 return SKILLS[skill][1],STAMINA_COST[skill]
STAMINA_COST={'strike':12,'burst':20,'guard':0,'heal':0,'dodge':20}
STAMINA_COST.update({k:0 for k in MAGIC})
def mitigate(raw,armor=ARMOR):
 return max(1,raw*100//(100+max(0,armor)))
STAGES=(
 ('Mầm bóng tối','🌿',64,8,16),
 ('Sói sương','🐺',84,10,20),
 ('Hộ vệ đá','🗿',106,12,24),
 ('Tinh linh bão','🌪️',128,14,28),
 ('Long vương pha lê','🐉',156,16,34),
)
SKILLS={'strike':(0,18),'burst':(20,38),'guard':(0,6),'heal':(25,0),'dodge':(0,0)}
SKILLS.update({k:(q[1],q[2]) for k,q in MAGIC.items()})
def init(c):
 c.execute("""CREATE TABLE IF NOT EXISTS ww_dungeon138(uid TEXT PRIMARY KEY,stage INTEGER NOT NULL DEFAULT 1,best INTEGER NOT NULL DEFAULT 0,rev INTEGER NOT NULL DEFAULT 0,hp INTEGER NOT NULL DEFAULT 100,energy INTEGER NOT NULL DEFAULT 60,enemy INTEGER NOT NULL DEFAULT 64,turn INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'ready',updated REAL NOT NULL DEFAULT 0,notice TEXT NOT NULL DEFAULT '')""")
 if 'stamina' not in {row[1] for row in c.execute('PRAGMA table_info(ww_dungeon138)')}:
  c.execute('ALTER TABLE ww_dungeon138 ADD COLUMN stamina INTEGER NOT NULL DEFAULT 100')
 columns={row[1] for row in c.execute('PRAGMA table_info(ww_dungeon138)')}
 if 'weapon' not in columns:c.execute("ALTER TABLE ww_dungeon138 ADD COLUMN weapon TEXT NOT NULL DEFAULT 'sword'")
 if 'combo' not in columns:c.execute('ALTER TABLE ww_dungeon138 ADD COLUMN combo INTEGER NOT NULL DEFAULT 0')
 if 'magic_cd' not in columns:c.execute("ALTER TABLE ww_dungeon138 ADD COLUMN magic_cd TEXT NOT NULL DEFAULT '{}'")
 if 'burn' not in columns:c.execute('ALTER TABLE ww_dungeon138 ADD COLUMN burn INTEGER NOT NULL DEFAULT 0')
def state(c,uid):
 row=c.execute('SELECT * FROM ww_dungeon138 WHERE uid=?',(uid,)).fetchone()
 return dict(row) if row else {'uid':uid,'stage':1,'best':0,'rev':0,'hp':100,'energy':60,'enemy':64,'turn':0,'status':'ready','updated':0,'notice':'','stamina':MAX_STAMINA,'weapon':'sword','combo':0,'magic_cd':'{}','burn':0}
def view(v):
 name,icon,maxhp,attack,heavy=STAGES[v['stage']-1]
 boss=v['stage']==len(STAGES)
 charged=v['turn']%3==2
 return {k:v[k] for k in ('stage','best','rev','hp','energy','enemy','turn','status','notice','stamina','weapon','combo','burn')}|{'combat_version':'28.2','weapon_name':WEAPONS[v['weapon']][0],'weapons':[{'id':k,'name':w[0],'strike':w[1],'burst':w[2],'stamina':w[3]} for k,w in WEAPONS.items()],'combo_max':3,'max_hp':MAX_HP,'max_energy':MAX_ENERGY,'max_stamina':MAX_STAMINA,'armor':ARMOR,'crit_chance':5,'count':len(STAGES),'enemy_name':name,'enemy_icon':icon,'enemy_max':maxhp,'boss':boss,'incoming':'Đòn cường kích' if charged else 'Đòn thường','incoming_damage':heavy if charged else attack,'skills':[skill_view(v,k,cost) for k,(cost,damage) in SKILLS.items()]}
def store(c,v):
 keys=('uid','stage','best','rev','hp','energy','enemy','turn','status','updated','notice','stamina','weapon','combo','magic_cd','burn')
 c.execute('INSERT INTO ww_dungeon138('+','.join(keys)+') VALUES('+','.join('?' for _ in keys)+') ON CONFLICT(uid) DO UPDATE SET '+','.join(k+'=excluded.'+k for k in keys[1:]),tuple(v[k] for k in keys))
def handle(h,c,u,d,now=None):
 now=time.time() if now is None else now;uid=u['id'];action=h.path.rsplit('/',1)[-1]
 def err(code,msg):return h.reply(code,{'error':msg})
 if action=='status':
  if d:return err(400,'Không nhận tham số')
  return h.reply(200,view(state(c,uid)))
 if action not in ('start','act'):return err(404,'Không tìm thấy')
 if not isinstance(d,dict) or set(d) not in (({'rev','stage'},{'rev','stage','weapon'}) if action=='start' else ({'rev','skill'},)) or type(d['rev']) is not int:return err(400,'Yêu cầu không hợp lệ')
 c.execute('BEGIN IMMEDIATE');v=state(c,uid)
 if d['rev']!=v['rev']:return err(409,'Lượt đã thay đổi, hãy làm mới')
 if action=='start':
  stage=d['stage'];weapon=d.get('weapon',v['weapon'])
  if not isinstance(weapon,str) or weapon not in WEAPONS:return err(400,'Vũ khí không hợp lệ')
  if type(stage) is not int or not 1<=stage<=min(len(STAGES),v['best']+1):return err(403,'Ải chưa mở khóa')
  if v['status']=='fight':return err(409,'Hãy hoàn thành hoặc kết thúc trận hiện tại')
  if now-v['updated']<.25:return err(429,'Thử lại sau')
  v.update(stage=stage,weapon=weapon,combo=0,magic_cd='{}',burn=0,hp=MAX_HP,energy=MAX_ENERGY,stamina=MAX_STAMINA,enemy=STAGES[stage-1][2],turn=0,status='fight',notice='Trận chiến bắt đầu')
 else:
  if v['status']!='fight':return err(409,'Chưa có trận đang diễn ra')
  skill=d['skill']
  if not isinstance(skill,str) or skill not in (*SKILLS,'retreat'):return err(400,'Kỹ năng không hợp lệ')
  if now-v['updated']<.25:return err(429,'Thao tác quá nhanh')
  if skill=='retreat':v.update(combo=0,magic_cd='{}',burn=0,status='lost',notice='Đã rút lui an toàn')
  else:
   cost=SKILLS[skill][0];damage,stamina_cost=attack_profile(v,skill)
   cds=cooldowns(v)
   if cds.get(skill,0)>v['turn']:return err(409,'Kỹ năng đang hồi chiêu')
   if v['energy']<cost:return err(409,'Chưa đủ năng lượng')
   if v['stamina']<stamina_cost:return err(409,'Chưa đủ thể lực; hãy phòng thủ để hồi phục')
   v['stamina']-=stamina_cost
   v['combo']=(v['combo']+1)%3 if skill=='strike' else 0
   v['energy']-=cost
   critical=skill in ('strike','burst') and secrets.randbelow(100)<5
   if critical:damage=damage*3//2
   if skill in MAGIC:cds[skill]=v['turn']+MAGIC[skill][3]+1
   v['magic_cd']=json.dumps(cds,separators=(',',':'))
   if skill=='lightning' and v['turn']%3==2:damage+=8
   if skill=='heal':v['hp']=min(MAX_HP,v['hp']+35)
   if skill=='light':v['hp']=min(MAX_HP,v['hp']+28)
   if skill=='shadow':v['hp']=min(MAX_HP,v['hp']+min(12,damage,v['enemy']))
   if skill=='fire':v['burn']=2
   burn_damage=6 if v['burn'] else 0
   v['burn']=max(0,v['burn']-1)
   damage=min(v['enemy'],damage+burn_damage)
   v['enemy']=max(0,v['enemy']-damage)
   if v['enemy']==0:
    v['status']='won';v['best']=max(v['best'],v['stage']);v['notice']='Chiến thắng! Đã ghi nhận huy hiệu ải.'
   else:
    _,_,_,attack,heavy=STAGES[v['stage']-1]
    incoming=heavy if v['turn']%3==2 else attack
    incoming=mitigate(incoming)
    if skill=='guard':incoming=max(1,incoming//4)
    if skill in ('ice','light'):incoming=max(1,incoming//2)
    if skill=='dodge':incoming=0
    v['hp']=max(0,v['hp']-incoming)
    v['energy']=min(MAX_ENERGY,v['energy']+(18 if skill=='guard' else 8))
    v['stamina']=min(MAX_STAMINA,v['stamina']+(24 if skill=='guard' else 8 if skill=='heal' else 4))
    v['status']='fight' if v['hp'] else 'lost'
    v['notice']=('Chí mạng! ' if critical else '')+(MAGIC[skill][0]+' · ' if skill in MAGIC else '')+('Thiêu đốt · ' if burn_damage else '')+'Đã gây '+str(damage)+' sát thương · nhận '+str(incoming)+' sát thương' if v['hp'] else 'Đã thua, có thể thử lại'
   v['turn']+=1
   if v['turn']>=80 and v['status']=='fight':v.update(status='lost',notice='Đã hết số lượt thử thách')
 v['rev']+=1;v['updated']=now;store(c,v);c.commit()
 return h.reply(200,view(v))

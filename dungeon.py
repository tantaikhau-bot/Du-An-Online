"""Server-authoritative solo, party and shared boss PvE. Cosmetic progress only."""
import time
import secrets
import json
PARTY_ROLES={'damage':'Tấn công','tank':'Hộ vệ','support':'Hỗ trợ'}
PARTY_TTL=1800
PARTY_COOLDOWN=3
MAGIC={
 'fire':('Hỏa cầu',18,22,2,'Thiêu đốt 2 lượt, mỗi lượt 6 ST'),
 'ice':('Băng trói',16,15,2,'Giảm 50% đòn phản công hiện tại'),
 'lightning':('Thiên lôi',24,32,3,'Sát thương mạnh, cộng 8 ST khi địch chuẩn bị cường kích'),
 'light':('Thánh quang',22,0,3,'Hồi 28 HP và giảm 50% đòn phản công'),
 'shadow':('Bóng tối',20,20,3,'Hút 12 HP tối đa theo sát thương thực tế'),
}
# AI is deterministic per turn: preview and resolution use the same snapshot.
AI_PROFILES=(
 ('Mầm bóng tối','fire','shadow'),
 ('Sói sương','fire','ice'),
 ('Hộ vệ đá','lightning','fire'),
 ('Tinh linh bão','ice','lightning'),
 ('Long vương pha lê','light','shadow'),
)
REGIONS=('Rừng bóng tối','Thung lũng sương','Thành đá cổ','Đỉnh bão tố','Hang pha lê','Sa mạc cổ','Vực dung nham','Vương quốc băng','Đền thiên giới','Vực hư vô')
REGION_BOSSES=('Cổ thụ ma','Sói chúa','Titan đá','Chúa tể bão','Long vương tinh thể','Vua cát','Hỏa long','Nữ hoàng băng','Hộ thần thiên giới','Long thần hư vô')
def is_boss(stage):
 return stage==5 or stage%10==0
def region_index(stage):
 return (stage-1)//10
def ai_kind(stage):
 return stage if stage<=5 else (region_index(stage)%5)+1
def power_percent(stage):
 return 100+max(0,stage-5)*3
def player_caps(stage):
 extra=max(0,stage-5)
 return MAX_HP+extra*3,MAX_ENERGY+extra,MAX_STAMINA
def scaled(v,n):
 return n*power_percent(v['stage'])//100
def boss_phase(hp,maxhp):
 if hp*100<=maxhp*15:return 4
 if hp*100<=maxhp*40:return 3
 if hp*100<=maxhp*70:return 2
 return 1

def enemy_plan(v):
 stage=v['stage'];kind=ai_kind(stage);turn=v['turn'];_,_,hp,attack,heavy=STAGES[stage-1]
 low=v['enemy']*100<=hp*30
 mode='heavy' if turn%3==2 else 'normal'
 if kind==2 and turn%4==1:mode='dodge'
 if kind==3 and turn%4==1:mode='guard'
 if kind==4 and turn%4==1:mode='counter'
 if kind==5 and turn%4==1:mode='guard'
 if low and mode=='normal' and stage>=2:mode='rage'
 if is_boss(stage):
  phase=boss_phase(v['enemy'],hp)
  if phase==2 and turn%3==1:mode='crystal'
  if phase==3 and turn%3==2:mode='nova'
  if phase==4:mode='nova' if turn%2==1 else 'rage'
 names={'normal':'Đòn thường','heavy':'Đòn cường kích','dodge':'Lướt né','guard':'Thế thủ','counter':'Phản công','rage':'Cuồng nộ','crystal':'Mưa tinh thể','nova':'Long tức hủy diệt'}
 raw={'normal':attack,'heavy':heavy,'dodge':max(1,attack//2),'guard':max(1,attack//2),'counter':attack,'rage':attack*3//2,'crystal':heavy,'nova':heavy+8}[mode]
 return mode,names[mode],mitigate(raw)
def adjusted_damage(v,skill,damage,mode):
 _,weak,resist=AI_PROFILES[ai_kind(v['stage'])-1]
 if skill==weak:damage=damage*125//100
 if skill==resist:damage=damage*75//100
 if mode=='guard' and skill in ('strike','burst'):damage=damage*60//100
 if mode=='dodge' and skill in ('strike','burst'):damage=damage*50//100
 return damage
def cooldowns(v):
 return json.loads(v['magic_cd'])
def skill_view(v,k,cost,mode=None,cds=None):
 if mode is None:mode=enemy_plan(v)[0]
 if cds is None:cds=cooldowns(v)
 q={'id':k,'cost':cost,'damage':attack_profile(v,k)[0],'stamina_cost':attack_profile(v,k)[1],'cooldown':max(0,cds.get(k,0)-v['turn'])}
 if k=='heal':q['heal']=scaled(v,35)
 if k in MAGIC:
  q.update(name=MAGIC[k][0],effect=MAGIC[k][4],cooldown_turns=MAGIC[k][3])
  if k=='fire':q['effect']='Thiêu đốt 2 lượt, mỗi lượt '+str(scaled(v,6))+' ST'
  if k=='light':q['effect']='Hồi '+str(scaled(v,28))+' HP và giảm 50% đòn phản công'
  if k=='shadow':q['effect']='Hút tối đa '+str(scaled(v,12))+' HP theo sát thương thực tế'
  if k=='lightning' and mode in ('heavy','crystal','nova'):q['damage']+=scaled(v,8)
 q['damage']=adjusted_damage(v,k,q['damage'],mode)
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
 if skill=='strike':return scaled(v,strike*COMBO_BONUS[min(v['combo'],2)]//100),light
 if skill=='burst':return scaled(v,burst),heavy
 return scaled(v,SKILLS[skill][1]),STAMINA_COST[skill]
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
# Keep floors 1–5 and their stored progress unchanged; subsequent floors use bounded integer scaling.
def make_floor(stage):
 region=region_index(stage);kind=ai_kind(stage);name,icon,_,_,_=STAGES[kind-1]
 boss=is_boss(stage)
 hp=100+(stage-5)*4+(35 if boss else 0)
 attack=12+(stage-5)//3+(3 if boss else 0)
 heavy=attack*2+4
 return (REGION_BOSSES[region] if boss else name+' · '+REGIONS[region], '🐉' if boss else icon,hp,attack,heavy)
STAGES=STAGES+tuple(make_floor(i) for i in range(6,101))
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
 c.execute("CREATE TABLE IF NOT EXISTS ww_world_boss284(event INTEGER PRIMARY KEY,hp INTEGER NOT NULL,rev INTEGER NOT NULL DEFAULT 0)")
 c.execute("CREATE TABLE IF NOT EXISTS ww_world_boss_player284(event INTEGER NOT NULL,uid TEXT NOT NULL,damage INTEGER NOT NULL DEFAULT 0,last REAL NOT NULL DEFAULT 0,PRIMARY KEY(event,uid))")
 init_party(c)

def init_party(c):
 c.execute("CREATE TABLE IF NOT EXISTS ww_party286(code TEXT PRIMARY KEY,leader TEXT NOT NULL,stage INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'lobby',hp INTEGER NOT NULL DEFAULT 0,max_hp INTEGER NOT NULL DEFAULT 0,enemy INTEGER NOT NULL DEFAULT 0,enemy_max INTEGER NOT NULL DEFAULT 0,rev INTEGER NOT NULL DEFAULT 0,updated REAL NOT NULL)")
 c.execute("CREATE TABLE IF NOT EXISTS ww_party_member286(uid TEXT PRIMARY KEY,code TEXT NOT NULL,role TEXT NOT NULL,damage INTEGER NOT NULL DEFAULT 0,healing INTEGER NOT NULL DEFAULT 0,last REAL NOT NULL DEFAULT 0)")
 c.execute("CREATE INDEX IF NOT EXISTS ww_party_member_code286 ON ww_party_member286(code)")
 c.execute('CREATE INDEX IF NOT EXISTS ww_party_updated287 ON ww_party286(updated)')
 c.execute('CREATE INDEX IF NOT EXISTS ww_world_rank287 ON ww_world_boss_player284(event,damage DESC,uid)')
 cols={r[1] for r in c.execute('PRAGMA table_info(ww_party286)')}
 if 'shield' not in cols:c.execute('ALTER TABLE ww_party286 ADD COLUMN shield INTEGER NOT NULL DEFAULT 0')
 if 'actions' not in cols:c.execute('ALTER TABLE ww_party286 ADD COLUMN actions INTEGER NOT NULL DEFAULT 0')
 c.execute("CREATE TABLE IF NOT EXISTS ww_combat_badge286(uid TEXT NOT NULL,kind TEXT NOT NULL,level INTEGER NOT NULL,PRIMARY KEY(uid,kind,level))")
 
def party_snapshot(c,uid,now):
 p=c.execute('SELECT p.* FROM ww_party286 p JOIN ww_party_member286 m ON m.code=p.code WHERE m.uid=? AND p.updated>?',(uid,now-PARTY_TTL)).fetchone()
 badges=[r[0] for r in c.execute("SELECT level FROM ww_combat_badge286 WHERE uid=? AND kind='party' ORDER BY level",(uid,))]
 if not p:return {'party':None,'badges':badges}
 members=[]
 for m in c.execute('SELECT m.*,u.name FROM ww_party_member286 m LEFT JOIN users u ON u.id=m.uid WHERE m.code=? ORDER BY m.uid',(p['code'],)):
  members.append({'name':m['name'] or 'Lữ khách','role':m['role'],'damage':m['damage'],'healing':m['healing'],'mine':m['uid']==uid,'leader':m['uid']==p['leader'],'cooldown':max(0,PARTY_COOLDOWN-(now-m['last'])) if m['uid']==uid else 0})
 return {'party':{k:p[k] for k in ('code','stage','status','hp','max_hp','enemy','enemy_max','rev','shield','actions')}|{'leader':p['leader']==uid,'members':members,'enemy_name':STAGES[p['stage']-1][0]},'badges':badges}

def party_handle(h,c,uid,d,now,action):
 def err(code,msg):
  if c.in_transaction:c.rollback()
  return h.reply(code,{'error':msg})
 if not isinstance(d,dict):return err(400,'Yêu cầu không hợp lệ')
 if action=='party-status':
  if d:return err(400,'Không nhận tham số')
  return h.reply(200,party_snapshot(c,uid,now))
 fields={'party-create':{'stage','role'},'party-join':{'code','role'},'party-start':set(),'party-leave':set(),'party-act':{'skill','rev'}}
 if action not in fields or set(d)!=fields[action]:return err(400,'Yêu cầu không hợp lệ')
 c.execute('BEGIN IMMEDIATE')
 c.execute('DELETE FROM ww_party_member286 WHERE code IN (SELECT code FROM ww_party286 WHERE updated<=?)',(now-PARTY_TTL,))
 c.execute('DELETE FROM ww_party286 WHERE updated<=?',(now-PARTY_TTL,))
 p=c.execute('SELECT p.* FROM ww_party286 p JOIN ww_party_member286 m ON m.code=p.code WHERE m.uid=?',(uid,)).fetchone()
 if action in ('party-create','party-join'):
  if p:return err(409,'Bạn đang ở trong tổ đội')
  role=d['role']
  if not isinstance(role,str) or role not in PARTY_ROLES:return err(400,'Vai trò không hợp lệ')
  if action=='party-create':
   stage=d['stage']
   if type(stage) is not int or not 1<=stage<=min(len(STAGES),state(c,uid)['best']+1):return err(403,'Ải chưa mở khóa')
   code=secrets.token_hex(6).upper()
   c.execute('INSERT INTO ww_party286(code,leader,stage,updated) VALUES(?,?,?,?)',(code,uid,stage,now))
  else:
   code=d['code']
   if not isinstance(code,str) or len(code)!=12:return err(400,'Mã tổ đội không hợp lệ')
   code=code.upper()
   target=c.execute('SELECT * FROM ww_party286 WHERE code=?',(code,)).fetchone()
   if not target or target['status']!='lobby':return err(409,'Tổ đội không còn mở')
   if target['stage']>state(c,uid)['best']+1:return err(403,'Bạn chưa mở khóa ải này')
   if c.execute('SELECT COUNT(*) FROM ww_party_member286 WHERE code=?',(code,)).fetchone()[0]>=4:return err(409,'Tổ đội đã đủ 4 người')
   c.execute('UPDATE ww_party286 SET updated=?,rev=rev+1 WHERE code=?',(now,code))
  c.execute('INSERT INTO ww_party_member286(uid,code,role) VALUES(?,?,?)',(uid,code,role))
 elif not p:return err(409,'Chưa có tổ đội')
 else:
  code=p['code']
  if action=='party-leave':
   c.execute('DELETE FROM ww_party_member286 WHERE uid=?',(uid,))
   remaining=c.execute('SELECT uid FROM ww_party_member286 WHERE code=? ORDER BY uid',(code,)).fetchall()
   if not remaining:c.execute('DELETE FROM ww_party286 WHERE code=?',(code,))
   else:
    leader=remaining[0]['uid'] if p['leader']==uid else p['leader']
    status='lost' if p['status']=='fight' and len(remaining)<2 else p['status']
    c.execute('UPDATE ww_party286 SET leader=?,status=?,updated=?,rev=rev+1 WHERE code=?',(leader,status,now,code))
  elif action=='party-start':
   if p['leader']!=uid or p['status']!='lobby':return err(403,'Chỉ trưởng nhóm được bắt đầu')
   count=c.execute('SELECT COUNT(*) FROM ww_party_member286 WHERE code=?',(code,)).fetchone()[0]
   if count<2:return err(409,'Cần ít nhất 2 người')
   hp=player_caps(p['stage'])[0]*count;enemy=STAGES[p['stage']-1][2]*count
   c.execute("UPDATE ww_party286 SET status='fight',hp=?,max_hp=?,enemy=?,enemy_max=?,updated=?,rev=rev+1 WHERE code=?",(hp,hp,enemy,enemy,now,code))
  elif action=='party-act':
   if p['status']!='fight':return err(409,'Không có trận đang diễn ra')
   if type(d['rev']) is not int or d['rev']!=p['rev']:return err(409,'Trạng thái đã đổi, hãy làm mới')
   m=c.execute('SELECT * FROM ww_party_member286 WHERE uid=?',(uid,)).fetchone()
   if now-m['last']<PARTY_COOLDOWN:return err(429,'Kỹ năng đang hồi chiêu')
   skill=d['skill'];role=m['role']
   if not isinstance(skill,str) or skill not in ('strike','guard','heal') or (skill=='guard' and role!='tank') or (skill=='heal' and role!='support'):return err(400,'Kỹ năng không phù hợp vai trò')
   damage=min(p['enemy'],(24 if role=='damage' else 16)*power_percent(p['stage'])//100) if skill=='strike' else 0
   heal=min(p['max_hp']-p['hp'],28*power_percent(p['stage'])//100) if skill=='heal' else 0
   if skill=='heal' and not heal:return err(409,'Sinh lực tổ đội đã đầy')
   incoming=mitigate(STAGES[p['stage']-1][3])
   shield=p['shield']
   if skill=='guard':incoming=max(1,incoming//4);shield=1
   elif shield:incoming=max(1,incoming//2);shield=0
   enemy=p['enemy']-damage;hp=max(0,p['hp']+heal-(incoming if enemy else 0))
   actions=p['actions']+1
   status='won' if not enemy else 'lost' if not hp or actions>=160 else 'fight'
   c.execute('UPDATE ww_party_member286 SET damage=damage+?,healing=healing+?,last=? WHERE uid=?',(damage,heal,now,uid))
   c.execute('UPDATE ww_party286 SET hp=?,enemy=?,status=?,shield=?,actions=?,updated=?,rev=rev+1 WHERE code=?',(hp,enemy,status,shield,actions,now,code))
   if status=='won':
    c.execute("INSERT OR IGNORE INTO ww_combat_badge286(uid,kind,level) SELECT uid,'party',? FROM ww_party_member286 WHERE code=? AND (damage>0 OR healing>0 OR last>0)",(p['stage'],code))
 c.commit()
 return h.reply(200,party_snapshot(c,uid,now))

WORLD_PERIOD=7200
WORLD_WINDOW=1800
WORLD_HP=12000
WORLD_COOLDOWN=4

def world_snapshot(c,uid,now):
 event=int(now)//WORLD_PERIOD;start=event*WORLD_PERIOD;ends=start+WORLD_WINDOW
 row=c.execute('SELECT hp,rev FROM ww_world_boss284 WHERE event=?',(event,)).fetchone()
 hp,rev=(row['hp'],row['rev']) if row else (WORLD_HP,0)
 player=c.execute('SELECT damage,last FROM ww_world_boss_player284 WHERE event=? AND uid=?',(event,uid)).fetchone()
 wait=max(0,WORLD_COOLDOWN-(now-player['last'])) if player else 0
 leaders=[{'name':r['name'] or 'Lữ khách','damage':r['damage']} for r in c.execute('SELECT u.name,p.damage FROM ww_world_boss_player284 p LEFT JOIN users u ON u.id=p.uid WHERE p.event=? ORDER BY p.damage DESC,p.uid LIMIT 10',(event,))]
 return {'event':event,'server_now':now,'start':start,'ends':ends,'next_start':start+WORLD_PERIOD,'active':now<ends and hp>0,'hp':hp,'max_hp':WORLD_HP,'phase':boss_phase(hp,WORLD_HP),'rev':rev,'my_damage':player['damage'] if player else 0,'cooldown':wait,'leaders':leaders}

def world_handle(h,c,uid,d,now,action):
 def err(code,msg):
  if c.in_transaction:c.rollback()
  return h.reply(code,{'error':msg})
 if not isinstance(d,dict):return err(400,'Yêu cầu không hợp lệ')
 if action=='world-status':
  if d:return err(400,'Không nhận tham số')
  return h.reply(200,world_snapshot(c,uid,now))
 if not isinstance(d,dict) or set(d)!={'event'} or type(d['event']) is not int:return err(400,'Yêu cầu không hợp lệ')
 c.execute('BEGIN IMMEDIATE')
 v=world_snapshot(c,uid,now)
 if d['event']!=v['event'] or not v['active']:return err(409,'Boss đã kết thúc hoặc chưa mở')
 if v['cooldown']>0:return err(429,'Chờ hồi chiêu')
 event=v['event'];damage=min(v['hp'],30)
 c.execute('INSERT OR IGNORE INTO ww_world_boss284(event,hp) VALUES(?,?)',(event,WORLD_HP))
 c.execute('UPDATE ww_world_boss284 SET hp=hp-?,rev=rev+1 WHERE event=?',(damage,event))
 c.execute('INSERT INTO ww_world_boss_player284(event,uid,damage,last) VALUES(?,?,?,?) ON CONFLICT(event,uid) DO UPDATE SET damage=damage+excluded.damage,last=excluded.last',(event,uid,damage,now))
 c.execute('DELETE FROM ww_world_boss_player284 WHERE event<?',(event-12,))
 c.execute('DELETE FROM ww_world_boss284 WHERE event<?',(event-12,))
 c.commit()
 return h.reply(200,world_snapshot(c,uid,now))

def state(c,uid):
 row=c.execute('SELECT * FROM ww_dungeon138 WHERE uid=?',(uid,)).fetchone()
 return dict(row) if row else {'uid':uid,'stage':1,'best':0,'rev':0,'hp':100,'energy':60,'enemy':64,'turn':0,'status':'ready','updated':0,'notice':'','stamina':MAX_STAMINA,'weapon':'sword','combo':0,'magic_cd':'{}','burn':0}
def view(v):
 name,icon,maxhp,attack,heavy=STAGES[v['stage']-1]
 boss=is_boss(v['stage'])
 mode,incoming_name,incoming=enemy_plan(v);cds=cooldowns(v)
 _,weak,resist=AI_PROFILES[ai_kind(v['stage'])-1]
 return {k:v[k] for k in ('stage','best','rev','hp','energy','enemy','turn','status','notice','stamina','weapon','combo','burn')}|{'combat_version':'28.7','region':REGIONS[region_index(v['stage'])],'region_index':region_index(v['stage']),'regions':list(REGIONS),'boss_floors':[i for i in range(1,len(STAGES)+1) if is_boss(i)],'power_percent':power_percent(v['stage']),'milestones':[i for i in range(10,v['best']+1,10)],'boss_phase':boss_phase(v['enemy'],maxhp) if boss else 0,'boss_phase_name':('Thức tỉnh','Tinh thể','Long tức','Cuồng nộ')[boss_phase(v['enemy'],maxhp)-1] if boss else '', 'boss_phases':4 if boss else 0,'enemy_mode':mode,'enemy_weakness':weak,'enemy_resistance':resist,'enemy_counter_bonus':6 if mode=='counter' else 0,'weapon_name':WEAPONS[v['weapon']][0],'weapons':[{'id':k,'name':w[0],'strike':w[1],'burst':w[2],'stamina':w[3]} for k,w in WEAPONS.items()],'combo_max':3,'max_hp':player_caps(v['stage'])[0],'max_energy':player_caps(v['stage'])[1],'max_stamina':MAX_STAMINA,'armor':ARMOR,'crit_chance':5,'count':len(STAGES),'enemy_name':name,'enemy_icon':icon,'enemy_max':maxhp,'boss':boss,'incoming':incoming_name,'incoming_damage':incoming,'skills':[skill_view(v,k,cost,mode,cds) for k,(cost,damage) in SKILLS.items()]}
def store(c,v):
 keys=('uid','stage','best','rev','hp','energy','enemy','turn','status','updated','notice','stamina','weapon','combo','magic_cd','burn')
 c.execute('INSERT INTO ww_dungeon138('+','.join(keys)+') VALUES('+','.join('?' for _ in keys)+') ON CONFLICT(uid) DO UPDATE SET '+','.join(k+'=excluded.'+k for k in keys[1:]),tuple(v[k] for k in keys))
def handle(h,c,u,d,now=None):
 now=time.time() if now is None else now;uid=u['id'];action=h.path.rsplit('/',1)[-1]
 def err(code,msg):
  if c.in_transaction:c.rollback()
  return h.reply(code,{'error':msg})
 if not isinstance(d,dict):return err(400,'Yêu cầu không hợp lệ')
 if action.startswith('party-'):return party_handle(h,c,uid,d,now,action)
 if action in ('world-status','world-strike'):return world_handle(h,c,uid,d,now,action)
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
  v.update(stage=stage,weapon=weapon,combo=0,magic_cd='{}',burn=0,hp=player_caps(stage)[0],energy=player_caps(stage)[1],stamina=MAX_STAMINA,enemy=STAGES[stage-1][2],turn=0,status='fight',notice='Trận chiến bắt đầu')
 else:
  if v['status']!='fight':return err(409,'Chưa có trận đang diễn ra')
  skill=d['skill']
  if not isinstance(skill,str) or skill not in (*SKILLS,'retreat'):return err(400,'Kỹ năng không hợp lệ')
  if now-v['updated']<.25:return err(429,'Thao tác quá nhanh')
  if skill=='retreat':v.update(combo=0,magic_cd='{}',burn=0,status='lost',notice='Đã rút lui an toàn')
  else:
   mode,enemy_move,incoming=enemy_plan(v)
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
   if skill=='lightning' and mode in ('heavy','crystal','nova'):damage+=scaled(v,8)
   damage=adjusted_damage(v,skill,damage,mode)
   if skill=='heal':v['hp']=min(player_caps(v['stage'])[0],v['hp']+scaled(v,35))
   if skill=='light':v['hp']=min(player_caps(v['stage'])[0],v['hp']+scaled(v,28))
   if skill=='shadow':v['hp']=min(player_caps(v['stage'])[0],v['hp']+min(scaled(v,12),damage,v['enemy']))
   if skill=='fire':v['burn']=2
   burn_damage=scaled(v,6) if v['burn'] else 0
   v['burn']=max(0,v['burn']-1)
   damage=min(v['enemy'],damage+burn_damage)
   previous_phase=boss_phase(v['enemy'],STAGES[v['stage']-1][2]) if is_boss(v['stage']) else 0
   v['enemy']=max(0,v['enemy']-damage)
   if v['enemy']==0:
    v['status']='won';v['best']=max(v['best'],v['stage']);v['notice']='Chiến thắng! Đã ghi nhận huy hiệu ải.'+(' · Hoàn thành khu vực '+REGIONS[region_index(v['stage'])] if v['stage']%10==0 else '')
   else:
    if mode=='counter' and skill in ('strike','burst'):incoming+=6
    if skill=='guard':incoming=max(1,incoming//4)
    if skill in ('ice','light'):incoming=max(1,incoming//2)
    if skill=='dodge':incoming=0
    v['hp']=max(0,v['hp']-incoming)
    v['energy']=min(player_caps(v['stage'])[1],v['energy']+(18 if skill=='guard' else 8))
    v['stamina']=min(MAX_STAMINA,v['stamina']+(24 if skill=='guard' else 8 if skill=='heal' else 4))
    v['status']='fight' if v['hp'] else 'lost'
    v['notice']=('Chí mạng! ' if critical else '')+(MAGIC[skill][0]+' · ' if skill in MAGIC else '')+('Thiêu đốt · ' if burn_damage else '')+'Đã gây '+str(damage)+' sát thương · '+enemy_move+' · nhận '+str(incoming)+' sát thương' if v['hp'] else 'Đã thua, có thể thử lại'
   if previous_phase and v['status']=='fight':
    phase=boss_phase(v['enemy'],STAGES[v['stage']-1][2])
    if phase!=previous_phase:v['notice']+=' · Boss chuyển giai đoạn '+str(phase)
   v['turn']+=1
   if v['turn']>=80 and v['status']=='fight':v.update(status='lost',notice='Đã hết số lượt thử thách')
 v['rev']+=1;v['updated']=now;store(c,v);c.commit()
 return h.reply(200,view(v))

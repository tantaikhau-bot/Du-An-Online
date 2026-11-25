import time,re,economy
REWARD=10
WAIT=86400
CAP=5
def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS referrals(invitee TEXT PRIMARY KEY, inviter TEXT NOT NULL, created INTEGER NOT NULL, claimed INTEGER); CREATE INDEX IF NOT EXISTS referral_inviter ON referrals(inviter,created);''')
def resolve(c,code):
 if not isinstance(code,str) or not re.fullmatch('[0-9a-f]{16}',code):return None
 return c.execute('SELECT id FROM users WHERE id=? AND id NOT IN (SELECT uid FROM blocked)',(code,)).fetchone()
def qualify(c,row,now):
 return now-row['created']>=WAIT and bool(c.execute('SELECT 1 FROM wishes WHERE uid=? AND created>=?',(row['invitee'],row['created'])).fetchone()) and not c.execute('SELECT 1 FROM blocked WHERE uid IN (?,?)',(row['invitee'],row['inviter'])).fetchone()
def handle(h,c,u,d=None):
 uid=u['id'];now=int(time.time());r=h.reply;p=h.path.rsplit('/',1)[-1]
 if p=='status' and d is None:
  rows=[dict(x) for x in c.execute('SELECT * FROM referrals WHERE inviter=? ORDER BY created DESC',(uid,))];return r(200,{'code':uid,'invited':len(rows),'claimed':sum(x['claimed'] is not None for x in rows),'eligible':sum(x['claimed'] is None and qualify(c,x,now) for x in rows),'reward':REWARD,'cap':CAP})
 if p!='claim' or d is None:return r(404,{'error':'Không tìm thấy'})
 c.execute('BEGIN IMMEDIATE');count=c.execute('SELECT count(*) FROM referrals WHERE inviter=? AND claimed IS NOT NULL',(uid,)).fetchone()[0]
 if count>=CAP:return r(409,{'error':'Đã đạt giới hạn thưởng thử nghiệm'})
 row=next((x for x in c.execute('SELECT * FROM referrals WHERE inviter=? AND claimed IS NULL ORDER BY created',(uid,)) if qualify(c,x,now)),None)
 if not row:return r(409,{'error':'Chưa có lượt giới thiệu đủ điều kiện'})
 economy.balance(c,uid);economy.change(c,uid,REWARD,'referral',row['invitee']);c.execute('UPDATE referrals SET claimed=? WHERE invitee=?',(now,row['invitee']));c.commit();return r(200,{'ok':True})
def staff(h,c):
 return h.reply(200,{'total':c.execute('SELECT count(*) FROM referrals').fetchone()[0],'rewarded':c.execute('SELECT count(*) FROM referrals WHERE claimed IS NOT NULL').fetchone()[0],'top':[dict(x) for x in c.execute('SELECT u.name,count(*) AS invited,sum(r.claimed IS NOT NULL) AS rewarded FROM referrals r JOIN users u ON u.id=r.inviter GROUP BY r.inviter ORDER BY invited DESC LIMIT 50')]})

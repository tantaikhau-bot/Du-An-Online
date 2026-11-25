import time, re, economy
DAY=86400
ITEMS=[('royal_outfit','Trang phục hoàng gia',120),('celestial_dragon','Rồng thiên giới',240),('aurora_effect','Hào quang cực quang',80),('royal_home','Nhà hoàng gia',350)]
def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS vip(uid TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS royal_settings(id INTEGER PRIMARY KEY CHECK(id=1),price INTEGER NOT NULL,active INTEGER NOT NULL); INSERT OR IGNORE INTO royal_settings VALUES(1,300,1);''')
 c.executemany('INSERT OR IGNORE INTO catalog VALUES(?,?,?,1)',ITEMS)
def handle(h,c,u,d=None):
 uid=u['id']; p=h.path.rsplit('/',1)[-1];r=h.reply;now=int(time.time())
 if p=='status' and d is None:
  row=c.execute('SELECT expires FROM vip WHERE uid=?',(uid,)).fetchone(); exp=row[0] if row else 0; settings=dict(c.execute('SELECT price,active FROM royal_settings WHERE id=1').fetchone());return r(200,{'expires':exp,'active':exp>now,'offer':settings,'server_time':now})
 if p!='subscribe' or d is None:return r(404,{'error':'Không tìm thấy'})
 key=d.get('request_id');quoted=d.get('price')
 if not isinstance(key,str) or not re.fullmatch('[a-zA-Z0-9_-]{16,80}',key) or type(quoted)!=int:return r(400,{'error':'Yêu cầu không hợp lệ'})
 c.execute('BEGIN IMMEDIATE');b=economy.balance(c,uid)
 if c.execute("SELECT 1 FROM ledger WHERE uid=? AND kind='vip' AND ref=?",(uid,key)).fetchone():return r(409,{'error':'Yêu cầu đã xử lý'})
 price,active=c.execute('SELECT price,active FROM royal_settings WHERE id=1').fetchone()
 if not active or quoted!=price:return r(409,{'error':'Gói đã thay đổi, vui lòng tải lại'})
 row=c.execute('SELECT expires FROM vip WHERE uid=?',(uid,)).fetchone();exp=row[0] if row else 0
 if exp>now:return r(409,{'error':'VIP đang còn hạn; không tự động gia hạn'})
 if b<price:return r(409,{'error':'Không đủ Pha lê'})
 economy.change(c,uid,-price,'vip',key);exp=now+30*DAY;c.execute('INSERT INTO vip VALUES(?,?) ON CONFLICT(uid) DO UPDATE SET expires=excluded.expires',(uid,exp));c.commit();return r(200,{'expires':exp,'balance':b-price})
def staff(h,c,d=None):
 r=h.reply;now=int(time.time())
 if h.path.endswith('/royal') and d is None:return r(200,{'offer':dict(c.execute('SELECT price,active FROM royal_settings WHERE id=1').fetchone()),'members':c.execute('SELECT count(*) FROM vip WHERE expires>?',(now,)).fetchone()[0],'purchases':c.execute("SELECT count(*) FROM ledger WHERE kind='vip'").fetchone()[0]})
 if not h.path.endswith('/royal-config') or d is None:return r(404,{'error':'Không tìm thấy'})
 price=d.get('price');active=d.get('active')
 if type(price)!=int or not 1<=price<=100000 or type(active)!=bool:return r(400,{'error':'Cấu hình không hợp lệ'})
 c.execute('UPDATE royal_settings SET price=?,active=? WHERE id=1',(price,int(active)));c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',('royal-config',str(price),now));c.commit();return r(200,{'ok':True})

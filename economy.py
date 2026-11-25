import time,secrets

def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS wallets(uid TEXT PRIMARY KEY, balance INTEGER NOT NULL CHECK(balance>=0)); CREATE TABLE IF NOT EXISTS catalog(id TEXT PRIMARY KEY,name TEXT,price INTEGER CHECK(price>0),active INTEGER DEFAULT 1); CREATE TABLE IF NOT EXISTS entitlements(uid TEXT,item TEXT,PRIMARY KEY(uid,item)); CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY,uid TEXT,delta INTEGER,kind TEXT,ref TEXT,created INTEGER, UNIQUE(uid,kind,ref)); CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,uid TEXT,amount INTEGER,crystals INTEGER,status TEXT,created INTEGER);''')
 c.executemany('INSERT OR IGNORE INTO catalog VALUES(?,?,?,1)',[('moon_badge','Huy hiệu ánh trăng',20),('star_badge','Huy hiệu sao vàng',40),('garden_badge','Huy hiệu vườn xanh',60)])
def balance(c,uid):
 c.execute('INSERT OR IGNORE INTO wallets VALUES(?,0)',(uid,));return c.execute('SELECT balance FROM wallets WHERE uid=?',(uid,)).fetchone()[0]
def change(c,uid,delta,kind,ref):
 c.execute('UPDATE wallets SET balance=balance+? WHERE uid=?',(delta,uid));c.execute('INSERT INTO ledger VALUES(?,?,?,?,?,?)',(secrets.token_hex(12),uid,delta,kind,ref,int(time.time())))
def handle(h,c,u,d=None):
 uid=u['id'];p=h.path.rsplit('/',1)[-1];r=h.reply
 if p=='wallet' and d is None:
  b=balance(c,uid);c.commit();return r(200,{'balance':b,'catalog':[dict(x) for x in c.execute('SELECT * FROM catalog WHERE active=1')],'owned':[x[0] for x in c.execute('SELECT item FROM entitlements WHERE uid=?',(uid,))],'ledger':[dict(x) for x in c.execute('SELECT delta,kind,ref,created FROM ledger WHERE uid=? ORDER BY rowid DESC LIMIT 50',(uid,))],'orders':[dict(x) for x in c.execute('SELECT * FROM orders WHERE uid=? ORDER BY created DESC LIMIT 20',(uid,))]})
 if d is None:return r(404,{'error':'Không tìm thấy'})
 c.execute('BEGIN IMMEDIATE');b=balance(c,uid)
 if p=='claim':
  if c.execute("SELECT 1 FROM ledger WHERE uid=? AND kind='welcome'",(uid,)).fetchone():return r(409,{'error':'Đã nhận quà'})
  change(c,uid,100,'welcome','once')
 elif p=='buy':
  item=d.get('item');row=c.execute('SELECT * FROM catalog WHERE id=? AND active=1',(item,)).fetchone()
  if not row:return r(404,{'error':'Vật phẩm không tồn tại'})
  if c.execute('SELECT 1 FROM entitlements WHERE uid=? AND item=?',(uid,item)).fetchone():return r(409,{'error':'Đã sở hữu'})
  if b<row['price']:return r(409,{'error':'Không đủ Pha lê'})
  change(c,uid,-row['price'],'purchase',item);c.execute('INSERT INTO entitlements VALUES(?,?)',(uid,item))
 elif p=='order':
  pack=d.get('pack');packs={'small':(10000,100),'medium':(49000,550),'large':(99000,1200)}
  if not isinstance(pack,str) or pack not in packs:return r(400,{'error':'Gói không hợp lệ'})
  if c.execute("SELECT count(*) FROM orders WHERE uid=? AND created>?",(uid,int(time.time())-60)).fetchone()[0]>=3:return r(429,{'error':'Thử lại sau'})
  amount,crystals=packs[pack];oid=secrets.token_hex(12);c.execute('INSERT INTO orders VALUES(?,?,?,?,?,?)',(oid,uid,amount,crystals,'sandbox_pending',int(time.time())));c.commit();return r(201,{'id':oid,'status':'sandbox_pending','amount':amount,'crystals':crystals})
 else:return r(404,{'error':'Không tìm thấy'})
 c.commit();return r(200,{'balance':balance(c,uid)})
def staff(h,c,d):
 p=h.path.rsplit('/',1)[-1];r=h.reply
 if p=='economy' and d is None:return r(200,{'catalog':[dict(x) for x in c.execute('SELECT * FROM catalog')],'orders':[dict(x) for x in c.execute('SELECT o.*,u.name FROM orders o JOIN users u ON o.uid=u.id ORDER BY o.created DESC LIMIT 100')],'total_crystals':c.execute('SELECT coalesce(sum(balance),0) FROM wallets').fetchone()[0],'real_revenue':0})
 if d is None:return r(404,{'error':'Không tìm thấy'})
 c.execute('BEGIN IMMEDIATE');target=d.get('id')
 if p=='price':
  price=d.get('price');active=d.get('active')
  if type(price)!=int or not 1<=price<=100000 or type(active)!=bool:return r(400,{'error':'Giá hoặc trạng thái không hợp lệ'})
  if not c.execute('UPDATE catalog SET price=?,active=? WHERE id=?',(price,int(active),target)).rowcount:return r(404,{'error':'Không tìm thấy'})
 elif p=='sandbox-credit':
  order=c.execute('SELECT * FROM orders WHERE id=?',(target,)).fetchone()
  if not order:return r(404,{'error':'Không tìm thấy'})
  if order['status']!='sandbox_pending':return r(409,{'error':'Đơn đã xử lý'})
  balance(c,order['uid']);change(c,order['uid'],order['crystals'],'sandbox_credit',target);c.execute("UPDATE orders SET status='sandbox_credited' WHERE id=?",(target,))
 else:return r(404,{'error':'Không tìm thấy'})
 c.execute('INSERT INTO audit(action,target,created) VALUES(?,?,?)',(p,str(target),int(time.time())));c.commit();return r(200,{'ok':True})

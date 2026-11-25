"""Internal sandbox payment events. Never accepts real money."""
import hashlib,hmac,json,os,re,time,secrets,economy

def init(c):
 c.executescript('''CREATE TABLE IF NOT EXISTS payment_events(id TEXT PRIMARY KEY, order_id TEXT NOT NULL UNIQUE, amount INTEGER NOT NULL, created INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status,created);''')

def canonical(d):
 return json.dumps({k:d[k] for k in ('event_id','order_id','amount','timestamp','status','currency')},sort_keys=True,separators=(',',':')).encode()

def webhook(h,c,d):
 r=h.reply; key=os.environ.get('WISH_SANDBOX_SECRET','')
 if len(key)<32:return r(503,{'error':'Sandbox webhook chưa cấu hình'})
 if not all(isinstance(d.get(k),str) and re.fullmatch('[a-zA-Z0-9_-]{1,80}',d[k]) for k in ('event_id','order_id')) or type(d.get('amount')) is not int or type(d.get('timestamp')) is not int or d.get('status')!='paid_test' or d.get('currency')!='VND':return r(400,{'error':'Dữ liệu sandbox không hợp lệ'})
 if abs(int(time.time())-d['timestamp'])>300:return r(400,{'error':'Sự kiện hết hạn'})
 sig=hmac.new(key.encode(),canonical(d),hashlib.sha256).hexdigest()
 if not hmac.compare_digest(sig,h.headers.get('X-Wish-Signature','')):return r(401,{'error':'Chữ ký không hợp lệ'})
 c.execute('BEGIN IMMEDIATE')
 prior=c.execute('SELECT * FROM payment_events WHERE id=?',(d['event_id'],)).fetchone()
 if prior:
  c.rollback();return r(200,{'duplicate':True}) if prior['order_id']==d['order_id'] and prior['amount']==d['amount'] else r(409,{'error':'Mã sự kiện đã dùng'})
 o=c.execute('SELECT * FROM orders WHERE id=?',(d['order_id'],)).fetchone()
 if not o or o['amount']!=d['amount'] or o['status']!='sandbox_pending':c.rollback();return r(409,{'error':'Đơn không hợp lệ hoặc đã xử lý'})
 economy.balance(c,o['uid']);economy.change(c,o['uid'],o['crystals'],'sandbox_credit',o['id'])
 c.execute('INSERT INTO payment_events VALUES(?,?,?,?)',(d['event_id'],o['id'],o['amount'],int(time.time())))
 c.execute("UPDATE orders SET status='sandbox_credited' WHERE id=?",(o['id'],));c.commit();return r(200,{'ok':True,'mode':'sandbox'})

def staff(h,c,d=None):
 if d is not None:return h.reply(405,{'error':'Chỉ đọc'})
 rows=[dict(x) for x in c.execute('SELECT status,count(*) AS count,sum(amount) AS amount FROM orders GROUP BY status')]
 return h.reply(200,{'mode':'sandbox','real_revenue':0,'summary':rows,'events':[dict(x) for x in c.execute('SELECT * FROM payment_events ORDER BY created DESC LIMIT 100')]})

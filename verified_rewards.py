"""Server-owned reward account, intentionally isolated from legacy offline Sao."""
import time
def init(c):
 c.executescript("""CREATE TABLE IF NOT EXISTS verified_wallet(uid TEXT PRIMARY KEY,balance INTEGER NOT NULL CHECK(balance>=0)); CREATE TABLE IF NOT EXISTS verified_claim(uid TEXT NOT NULL,day INTEGER NOT NULL,PRIMARY KEY(uid,day));""")
def handle(h,c,u,d=None):
 uid=u['id'];day=int(time.time())//86400;p=h.path.rsplit('/',1)[-1]
 if p=='status' and d is None:
  row=c.execute('SELECT balance FROM verified_wallet WHERE uid=?',(uid,)).fetchone()
  return h.reply(200,{'balance':row[0] if row else 0,'claimed':bool(c.execute('SELECT 1 FROM verified_claim WHERE uid=? AND day=?',(uid,day)).fetchone()),'reward':10,'reset':(day+1)*86400})
 if p!='claim' or d is None:return h.reply(404,{'error':'Không tìm thấy'})
 if d:return h.reply(400,{'error':'Không nhận số tiền hoặc ngày từ client'})
 c.execute('BEGIN IMMEDIATE')
 if not c.execute('INSERT OR IGNORE INTO verified_claim VALUES(?,?)',(uid,day)).rowcount:
  return h.reply(409,{'error':'Đã nhận thưởng hôm nay'})
 c.execute('INSERT INTO verified_wallet VALUES(?,10) ON CONFLICT(uid) DO UPDATE SET balance=verified_wallet.balance+10',(uid,))
 b=c.execute('SELECT balance FROM verified_wallet WHERE uid=?',(uid,)).fetchone()[0]
 c.commit();return h.reply(200,{'balance':b,'claimed':True})

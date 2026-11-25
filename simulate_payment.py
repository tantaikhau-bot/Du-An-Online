import os,sys,time,secrets,hmac,hashlib,json,urllib.request
from payment import canonical
if len(sys.argv)!=3:raise SystemExit('Usage: python simulate_payment.py ORDER_ID AMOUNT_VND')
key=os.environ.get('WISH_SANDBOX_SECRET','')
if len(key)<32:raise SystemExit('Set WISH_SANDBOX_SECRET (32+ characters)')
d=dict(event_id=secrets.token_hex(16),order_id=sys.argv[1],amount=int(sys.argv[2]),timestamp=int(time.time()),status='paid_test',currency='VND')
r=urllib.request.Request('http://127.0.0.1:8080/api/payment/sandbox-webhook',data=json.dumps(d).encode(),headers={'Content-Type':'application/json','X-Wish-Signature':hmac.new(key.encode(),canonical(d),hashlib.sha256).hexdigest()})
print(urllib.request.urlopen(r).read().decode())

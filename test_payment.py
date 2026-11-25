import tempfile,subprocess,os,sys,time,urllib.request,urllib.error,http.cookiejar,json,socket,shutil,hmac,hashlib
from pathlib import Path
from payment import canonical
exec(Path('test_friendship.py').read_text().split(' p=start()')[0].replace('with tempfile.TemporaryDirectory() as tmp:', 'if True:\n tmp=tempfile.mkdtemp()'))
env['WISH_SANDBOX_SECRET']='test-only-secret-abcdefghijklmnopqrstuvwxyz';p=start()
try:
 a,staff=client(),client();req(a,'register',{'name':'pay_test','password':'test-password-123'});order=req(a,'economy/order',{'pack':'small'},201)
 d=dict(event_id='test_event',order_id=order['id'],amount=10000,timestamp=int(time.time()),status='paid_test',currency='VND')
 def send(d,code=200,valid=True):
  sig=hmac.new(env['WISH_SANDBOX_SECRET'].encode(),canonical(d),hashlib.sha256).hexdigest() if valid else 'bad'
  r=urllib.request.Request(f'http://127.0.0.1:{port}/api/payment/sandbox-webhook',data=json.dumps(d).encode(),headers={'Content-Type':'application/json','X-Wish-Signature':sig})
  try:res=urllib.request.urlopen(r)
  except urllib.error.HTTPError as e:res=e
  assert res.code==code,(res.code,code);return json.load(res)
 send(d,401,False);send(dict(d,amount=1),409);send(dict(d,timestamp=0),400)
 from concurrent.futures import ThreadPoolExecutor
 with ThreadPoolExecutor(2) as pool: results=list(pool.map(lambda _:send(d),range(2)))
 assert sum(x.get('duplicate',False) for x in results)==1
 send(dict(d,event_id='another_event'),409);assert req(a,'economy/wallet')['balance']==100
 req(a,'admin/payments',None,401);req(staff,'admin/login',{'password':'test-admin-password-123'});v=req(staff,'admin/payments');assert v['real_revenue']==0 and len(v['events'])==1
 req(staff,'admin/sandbox-credit',{'id':order['id']},409)
 print('PASS payment: signatures, amount, expiry, concurrency, replay, admin authorization and reconciliation')
finally:p.terminate();p.wait();shutil.rmtree(tmp)

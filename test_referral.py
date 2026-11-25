import tempfile,subprocess,os,sys,time,urllib.request,urllib.error,http.cookiejar,json,socket,sqlite3,shutil
from pathlib import Path
exec(Path('test_friendship.py').read_text().split(' p=start()')[0].replace('with tempfile.TemporaryDirectory() as tmp:', 'if True:\n tmp=tempfile.mkdtemp()'))
p=start()
try:
 a,b,staff=client(),client(),client();pw='test-password-123'
 req(a,'register',{'name':'ref_a','password':pw});code=req(a,'referral/status')['code']
 assert urllib.request.urlopen(f'http://127.0.0.1:{port}/play?ref={code}').status==200
 req(b,'register',{'name':'ref_b','password':pw,'referral':'invalid'},400)
 req(b,'register',{'name':'ref_b','password':pw,'referral':code});req(a,'referral/claim',{},409)
 req(b,'wishes',{'body':'Chúc vui vẻ'},201);req(a,'referral/claim',{},409)
 with sqlite3.connect(env['WISH_DB']) as c:
  c.execute('UPDATE referrals SET created=created-86401')
 assert req(a,'referral/status')['eligible']==1
 from concurrent.futures import ThreadPoolExecutor
 def claim(_):
  try:req(a,'referral/claim',{});return True
  except AssertionError as e:assert e.args[0][1]==409;return False
 with ThreadPoolExecutor(2) as pool:assert sum(pool.map(claim,range(2)))==1
 assert req(a,'economy/wallet')['balance']==10
 req(a,'admin/referrals',None,401);req(staff,'admin/login',{'password':'test-admin-password-123'});assert req(staff,'admin/referrals')['rewarded']==1
 p.terminate();p.wait();p=start();assert req(a,'referral/status')['claimed']==1;req(a,'referral/claim',{},409)
 print('PASS referral: link, invalid code, qualification, concurrent claim, wallet, admin authorization, persistence')
finally:
 p.terminate();p.wait();shutil.rmtree(tmp)

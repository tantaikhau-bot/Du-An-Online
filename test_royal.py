import tempfile,subprocess,os,sys,time,urllib.request,urllib.error,http.cookiejar,json,socket,sqlite3,shutil
from pathlib import Path
exec(Path('test_friendship.py').read_text().split(' p=start()')[0].replace('with tempfile.TemporaryDirectory() as tmp:', 'if True:\n tmp=tempfile.mkdtemp()'))
p=start()
try:
 a,b,staff=client(),client(),client();pw='test-password-123'
 for cl,n in [(a,'royal_a'),(b,'royal_b')]:req(cl,'register',{'name':n,'password':pw})
 req(a,'economy/claim',{});req(a,'royal/subscribe',{'price':300,'request_id':'test-request-0001'},409)
 req(a,'admin/royal',None,401);req(staff,'admin/login',{'password':'test-admin-password-123'});req(staff,'admin/royal-config',{'price':40,'active':True})
 req(a,'royal/subscribe',{'price':300,'request_id':'test-request-0002'},409)
 from concurrent.futures import ThreadPoolExecutor
 def buy(i):
  try:req(a,'royal/subscribe',{'price':40,'request_id':'test-request-000'+str(i)});return True
  except AssertionError as e:assert e.args[0][1]==409;return False
 with ThreadPoolExecutor(2) as pool:assert sum(pool.map(buy,[3,4]))==1
 assert req(a,'economy/wallet')['balance']==60 and req(a,'royal/status')['active'] and not req(b,'royal/status')['active']
 assert req(staff,'admin/royal')['members']==1
 req(staff,'admin/royal-config',{'price':40,'active':False});req(b,'royal/subscribe',{'price':40,'request_id':'test-request-0005'},409)
 p.terminate();p.wait();p=start();assert req(a,'royal/status')['active']
 with sqlite3.connect(env['WISH_DB']) as c:c.execute('UPDATE vip SET expires=0')
 assert not req(a,'royal/status')['active'];req(staff,'admin/royal-config',{'price':40,'active':True});req(a,'royal/subscribe',{'price':40,'request_id':'test-request-0006'});assert req(a,'economy/wallet')['balance']==20
 print('PASS royal: authorization, pricing, concurrent purchases, isolation, persistence, expiry and renewal')
finally:
 p.terminate();p.wait();shutil.rmtree(tmp)

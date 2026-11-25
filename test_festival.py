import tempfile, subprocess, os, sys, time, urllib.request, urllib.error, http.cookiejar, json, socket
from pathlib import Path
# Reuse test harness from friendship test, without running its body.
exec(Path('test_friendship.py').read_text().split(' p=start()')[0].replace('with tempfile.TemporaryDirectory() as tmp:', 'if True:\n tmp=tempfile.mkdtemp()'))
p=start()
try:
 a,b,staff=client(),client(),client()
 for cl,n in [(a,'festival_a'),(b,'festival_b')]:req(cl,'register',{'name':n,'password':'test-password-123'})
 aid=req(a,'me')['user']['id'];bid=req(b,'me')['user']['id']; now=int(time.time())
 event={'title':'Lễ hội ánh sao','theme':'winter','start':now-5,'end':now+3600,'reward':20}
 req(a,'admin/festival-create',event,401);req(staff,'admin/login',{'password':'test-admin-password-123'})
 req(staff,'admin/festival-create',{**event,'reward':1000},400)
 id=req(staff,'admin/festival-create',event)['id']; future=req(staff,'admin/festival-create',{**event,'start':now+100,'end':now+200})['id']
 req(a,'festival/checkin',{'id':future},409);req(a,'festival/claim',{'id':id},409)
 req(a,'festival/checkin',{'id':id});req(a,'festival/checkin',{'id':id});req(a,'festival/claim',{'id':id},409)
 req(a,'social/invite',{'id':bid});req(b,'social/accept',{'id':aid});req(a,'friendship/gift',{'id':bid,'kind':'flower'});req(a,'wishes',{'body':'Chúc mọi người vui vẻ'},201)
 assert req(a,'festival/list')['events'][0]['tasks']=={'checkin':True,'wish':True,'gift':True}
 assert not any(req(b,'festival/list')['events'][0]['tasks'].values())
 from concurrent.futures import ThreadPoolExecutor
 def claim(_):
  try:req(a,'festival/claim',{'id':id});return True
  except AssertionError as e:assert e.args[0][1]==409;return False
 with ThreadPoolExecutor(2) as pool:assert sum(pool.map(claim,range(2)))==1
 assert req(a,'economy/wallet')['balance']==20
 assert req(staff,'admin/festivals')['events'][1]['completed']==1
 p.terminate();p.wait();p=start();assert req(a,'festival/list')['events'][0]['claimed'];assert req(a,'economy/wallet')['balance']==20
 req(staff,'admin/festival-close',{'id':id});req(b,'festival/checkin',{'id':id},409)
 print('PASS: admin authorization, event validation, scheduling, task verification, isolation, concurrent claim, wallet, persistence, closure')
finally:
 p.terminate();p.wait()
 import shutil;shutil.rmtree(tmp)

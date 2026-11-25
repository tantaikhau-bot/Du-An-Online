import tempfile, subprocess, os, sys, time, urllib.request, urllib.error, http.cookiejar, json, socket
from pathlib import Path
with tempfile.TemporaryDirectory() as tmp:
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
 env={**os.environ,'WISH_ADMIN_PASSWORD':'test-admin-password-123','PORT':str(port),'WISH_DB':str(Path(tmp)/'test.db')}
 def start():
  p=subprocess.Popen([sys.executable,'server.py'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  for _ in range(100):
   try:urllib.request.urlopen(f'http://127.0.0.1:{port}/api/me',timeout=.2);return p
   except OSError:time.sleep(.05)
  p.kill();raise RuntimeError('server not started')
 def client():return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def req(c,path,data=None,code=200):
  r=urllib.request.Request(f'http://127.0.0.1:{port}/api/'+path,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
  try:res=c.open(r)
  except urllib.error.HTTPError as e:res=e
  assert res.code==code,(path,res.code,code);return json.load(res)
 p=start()
 try:
  a,b=client(),client(); assert req(a,'me')['user'] is None;req(a,'save',code=401)
  for c,n in [(a,'tester_a'),(b,'tester_b')]:req(c,'register',{'name':n,'password':'test-password-123'})
  req(b,'register',{'name':'tester_a','password':'test-password-123'},409)
  aid=req(a,'me')['user']['id'];bid=req(b,'me')['user']['id']
  assert req(a,'social/pulse',{'x':490,'y':575,'area':0})['players']==[]
  assert req(b,'social/pulse',{'x':500,'y':580,'area':0})['players'][0]['id']==aid
  assert req(a,'social/pulse',{'x':490,'y':575,'area':0})['players'][0]['id']==bid
  req(a,'social/pulse',{'x':9999,'y':575,'area':0},400)
  assert req(a,'social/search',{'name':'tester_b'})['users'][0]['id']==bid
  req(a,'social/greet',{'id':bid,'kind':'Xin chào'},403)
  req(a,'social/invite',{'id':bid});req(a,'social/invite',{'id':bid},409)
  req(a,'social/accept',{'id':bid},404);req(b,'social/accept',{'id':aid})
  assert req(a,'social/list',{})['friends'][0]['status']=='accepted'
  req(a,'social/greet',{'id':bid,'kind':'Xin chào'});req(a,'social/greet',{'id':bid,'kind':'Xin chào'},429)
  assert req(b,'social/list',{})['greetings'][0]['kind']=='Xin chào'
  req(b,'social/report',{'id':aid,'reason':'Khác'});req(b,'social/report',{'id':aid,'reason':'Khác'},429)
  req(b,'social/remove',{'id':aid});assert not req(a,'social/list',{})['friends']
  print('PASS: presence, position validation, search, invites, acceptance authorization, greetings, reporting, removal')

  state={k:[] for k in ['wishes','lanterns','plants','owned','collection','decor']};state.update(name='Test',coins=120,xp=0,petXp=0,streak=0,daily={'date':'2026-11-25','claimed':[]})
  assert req(a,'save',{'state':state,'revision':0})['revision']==1;assert req(a,'save')['state']==state;assert req(b,'save')['state'] is None
  req(a,'save',{'state':state,'revision':0},409)
  req(a,'wishes',{'body':'Hello world'},201);req(a,'wishes',{'body':'Again'},429)
  w=req(b,'wishes')['wishes'][0];assert w['body']=='Hello world' and not w['mine'];req(b,'wishes/delete',{'id':w['id']});assert len(req(b,'wishes')['wishes'])==1
  p.terminate();p.wait();p=start();assert req(a,'save')['state']==state;assert len(req(b,'wishes')['wishes'])==1
  req(a,'wishes/delete',{'id':w['id']});assert not req(b,'wishes')['wishes'];req(a,'logout',{});req(a,'save',code=401);req(a,'login',{'name':'tester_a','password':'wrong-password'},401);req(a,'login',{'name':'tester_a','password':'test-password-123'});assert req(a,'save')['revision']==1
  staff=client();req(a,'admin/dashboard',code=401);req(staff,'admin/login',{'password':'bad'},401);req(staff,'admin/login',{'password':'test-admin-password-123'})
  dash=req(staff,'admin/dashboard');assert dash['stats']['users']==2 and dash['stats']['reports']==1
  req(staff,'admin/review',{'id':dash['reports'][0]['id']});assert req(staff,'admin/dashboard')['stats']['reports']==0
  req(staff,'admin/block',{'id':aid});req(a,'save',code=401);req(a,'login',{'name':'tester_a','password':'test-password-123'},403)
  req(staff,'admin/unblock',{'id':aid});req(a,'login',{'name':'tester_a','password':'test-password-123'})
  req(staff,'admin/notice',{'body':'Welcome'});notice=req(a,'notices')['notices'][0];assert notice['body']=='Welcome';req(staff,'admin/delete-notice',{'id':notice['id']});assert not req(a,'notices')['notices']
  req(b,'wishes',{'body':'Moderate me'},201);w=req(staff,'admin/dashboard')['wishes'][0];req(staff,'admin/delete-wish',{'id':w['id']});assert not req(b,'wishes')['wishes']
  assert len(req(staff,'admin/dashboard')['audit'])==6;req(staff,'admin/logout',{});req(staff,'admin/dashboard',code=401)
  req(a,'economy/wallet',code=200);assert req(a,'economy/wallet')['balance']==0
  req(a,'economy/claim',{});req(a,'economy/claim',{},409)
  req(a,'economy/buy',{'item':'moon_badge','price':0});assert req(a,'economy/wallet')['balance']==80
  req(a,'economy/buy',{'item':'moon_badge'},409)
  assert req(b,'economy/wallet')['balance']==0
  req(b,'economy/buy',{'item':'star_badge'},409)
  order=req(a,'economy/order',{'pack':'small','amount':1,'crystals':999999},201);assert order['amount']==10000 and order['crystals']==100
  req(a,'admin/sandbox-credit',{'id':order['id']},401)
  req(staff,'admin/login',{'password':'test-admin-password-123'})
  req(staff,'admin/sandbox-credit',{'id':order['id']});req(staff,'admin/sandbox-credit',{'id':order['id']},409)
  assert req(a,'economy/wallet')['balance']==180
  req(staff,'admin/price',{'id':'star_badge','price':50,'active':True});req(a,'economy/buy',{'item':'star_badge'});assert req(a,'economy/wallet')['balance']==130
  assert req(staff,'admin/economy')['real_revenue']==0
  state['coins']=999999;req(a,'save',{'state':state,'revision':1});assert req(a,'economy/wallet')['balance']==130
  p.terminate();p.wait();p=start();assert req(a,'economy/wallet')['balance']==130
  print('PASS: server wallet, isolation, welcome once, price authority, ownership, insufficient balance, sandbox order, admin authorization, duplicate credit, persistence, local save separation')
  print('PASS: admin authorization, dashboard, report review, session revocation, block/unblock, notices, moderation, audit, logout')
  print('PASS: registration, login/logout, authorization, isolation, revision conflicts, community posting/deletion, cooldown, restart persistence')
 finally:p.terminate();p.wait()

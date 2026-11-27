"""Allowlisted static assets with bounded, same-origin upstream cache."""
from pathlib import Path
import shutil,urllib.request,hashlib,struct,threading,time,os,json,re,html
from urllib.parse import urlsplit
from http_assets import MAX_TEXT_BYTES, accepts_gzip, etag_matches, text_representation
FILES={'arsenal311.glb':'model/gltf-binary','leafy_grass.jpg':'image/jpeg','spirit-cat161.glb':'model/gltf-binary','spirit-rabbit161.glb':'model/gltf-binary','spirit-fox161.glb':'model/gltf-binary','spirit-deer161.glb':'model/gltf-binary','jade-ice-dragon160.glb':'model/gltf-binary','jade-dragon156.js':'text/javascript; charset=utf-8','meshopt-decoder1531.js':'text/javascript; charset=utf-8','companion-portraits152.css':'text/css; charset=utf-8','dragon-pilot16.json':'application/json; charset=utf-8','daylight.js':'text/javascript; charset=utf-8','fantasy-creatures.js':'text/javascript; charset=utf-8','original-avatar.js':'text/javascript; charset=utf-8','character-identity.js':'text/javascript; charset=utf-8','Sendagaya_Shibu.vrm':'model/gltf-binary','Vivi.vrm':'model/gltf-binary','arm-motion.js':'text/javascript; charset=utf-8','foot-ik.js':'text/javascript; charset=utf-8','smooth-motion.js':'text/javascript; charset=utf-8','HairSample_Male.vrm':'model/gltf-binary','HairSample_Female.vrm':'model/gltf-binary','vrm-character.js':'text/javascript; charset=utf-8','three-vrm.module.js':'text/javascript; charset=utf-8','Sakurada_Fumiriya.vrm':'model/gltf-binary','Sendagaya_Shino.vrm':'model/gltf-binary','deer.glb':'model/gltf-binary','cat.glb':'model/gltf-binary','rabbit.glb':'model/gltf-binary','dragon.glb':'model/gltf-binary','anime-character.js':'text/javascript; charset=utf-8','game-policy.js':'text/javascript; charset=utf-8','realtime.js':'text/javascript; charset=utf-8','fox.glb':'model/gltf-binary','hero.glb':'model/gltf-binary','forrest_ground_01.jpg':'image/jpeg','medieval_blocks_05.jpg':'image/jpeg','medieval_wood.jpg':'image/jpeg','manifest.json':'application/json'}
VRM='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/'
UPSTREAM={
 'leafy_grass.jpg':('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/leafy_grass/leafy_grass_diff_1k.jpg',None),
 'medieval_blocks_05.jpg':('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/medieval_blocks_05/medieval_blocks_05_diff_1k.jpg',None),
 'medieval_wood.jpg':('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/medieval_wood/medieval_wood_diff_1k.jpg',None),
 'spirit-cat161.glb':('https://vinish-models.pages.dev/cats/british-shorthair.glb',None),
 'spirit-rabbit161.glb':('https://vinish-models.pages.dev/rabbits-mice-and-squirrels/wild-rabbit.glb',None),
 'spirit-fox161.glb':('https://vinish-models.pages.dev/wolves-and-foxes/red-fox.glb',None),
 'spirit-deer161.glb':('https://vinish-models.pages.dev/deer-elk-and-moose/red-deer-stag.glb',None),
 'jade-ice-dragon160.glb':('https://vinish-models.pages.dev/dragons/ice-dragon.glb',None),
 'cat.glb':('https://vinish-models.pages.dev/cats/british-shorthair.glb',None),
 'rabbit.glb':('https://vinish-models.pages.dev/rabbits-mice-and-squirrels/wild-rabbit.glb',None),
 'dragon.glb':('https://raw.githubusercontent.com/euuuuuuan/cairnfall-public/8ee4cfd789282c59632a9339e61564b7d6c1acfe/assets/vendor/quaternius_monsters/Dragon.glb',None),
 'Sendagaya_Shibu.vrm':(VRM+'Sendagaya_Shibu.vrm','git:233c9070f7bc3e13d2e162774dacccf72baaf566'),
 'Vivi.vrm':(VRM+'Vivi.vrm','git:bed294ca40452e8703b530f93db4c5fc015e307d'),
 'HairSample_Male.vrm':(VRM+'HairSample_Male.vrm',None),
 'HairSample_Female.vrm':(VRM+'HairSample_Female.vrm',None),
 'Sakurada_Fumiriya.vrm':(VRM+'Sakurada_Fumiriya.vrm','d8fb05f33e377df028cb6b9d58c441ce68326c41fa23f6c735d40c65ae3dc710'),
 'Sendagaya_Shino.vrm':(VRM+'Sendagaya_Shino.vrm','1e177c1a7b14f783a9c48395831db8616260d3bddd4154cb2784b779adca49b5'),
 'three-vrm.module.js':('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js',None),
 'fox.glb':('https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/main/public/glb/animals_pack/Fox.glb','git:4b9e53701955206f394e3ebfd12831d74e0e3d31'),
 'deer.glb':('https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/main/public/glb/animals_pack/Deer.glb','git:0c1a5a5d55ec13ca7899dd3a57256724cd9fca4e')
}
LOCKS={k:threading.Lock() for k in UPSTREAM}
FAILED={}
PET118={
 'cat.glb':('british-shorthair.glb','https://vinish.dev/free-3d-models/cats'),
 'rabbit.glb':('wild-rabbit.glb','https://vinish.dev/free-3d-models/rabbits-mice-and-squirrels'),
}
def read_pet118(name,url):
 filename,page=PET118[name]
 candidates=[url]
 if name=='rabbit.glb':
  candidates.extend(['https://vinish-models.pages.dev/'+p+'/wild-rabbit.glb' for p in ('small-animals','rabbits','rabbits-mice-squirrels','rodents')])
 candidates.extend([u.replace('vinish-models.pages.dev','models.vinish.dev') for u in list(candidates)])
 try:
  with urllib.request.urlopen(urllib.request.Request(page,headers={'User-Agent':'Mozilla/5.0'}),timeout=8) as response:
   markup=html.unescape(response.read(2500000).decode('utf-8','replace')).replace('\\/','/')
  discovered=[u for u in re.findall(r'https://[^"\s<>]+?\.glb',markup) if urlsplit(u).hostname in ('vinish-models.pages.dev','models.vinish.dev') and urlsplit(u).path.endswith('/'+filename)]
  candidates=discovered+candidates
 except Exception:pass
 for u in dict.fromkeys(candidates):
  try:
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'WishWorld/11.6.2'}),timeout=8) as r:data=r.read(8*1024*1024+1)
   if len(data)>8*1024*1024 or len(data)<20 or data[:4]!=b'glTF' or struct.unpack_from('<I',data,8)[0]!=len(data):raise ValueError('bad GLB')
   n,k=struct.unpack_from('<II',data,12)
   if k!=0x4e4f534a:raise ValueError('bad GLB JSON')
   doc=json.loads(data[20:20+n]);clips={a.get('name','').lower() for a in doc.get('animations',[])}
   if not doc.get('skins') or not {'idle','walk','run'}<=clips:raise ValueError('missing skin or clips')
   if any('uri' in b and not b['uri'].startswith('data:') for b in doc.get('buffers',[])):raise ValueError('external buffer')
   if any('uri' in im and not im['uri'].startswith('data:') for im in doc.get('images',[])):raise ValueError('external image')
   print('Verified pet asset: '+name+' '+u+' '+str(sorted(clips)),flush=True)
   return data
  except Exception as e:print('Pet source unavailable: '+u+' '+str(e)[:90],flush=True)
 raise ValueError('No verified rigged pet source for '+name)
def validate_jade160(data):
 if len(data)<20 or len(data)>8*1024*1024 or data[:4]!=b'glTF':raise ValueError('invalid Jade GLB size/header')
 version,total,n,kind=struct.unpack_from('<IIII',data,4)
 if version!=2 or total!=len(data) or kind!=0x4e4f534a or n>len(data)-20:raise ValueError('invalid Jade GLB metadata')
 doc=json.loads(data[20:20+n])
 clips={a.get('name','').lower() for a in doc.get('animations',[])}
 if not doc.get('skins') or not {'idle','fly'}<=clips:raise ValueError('Jade rig or clips missing')
 if any('uri' in a and not a['uri'].startswith('data:') for a in doc.get('buffers',[])+doc.get('images',[])):raise ValueError('external Jade dependency')
 if not doc.get('images') or not any('normalTexture' in m for m in doc.get('materials',[])):raise ValueError('Jade texture/normal missing')
 return doc
SPIRIT161={
 'spirit-cat161.glb':('cat','british-shorthair.glb','https://vinish.dev/free-3d-models/cats'),
 'spirit-rabbit161.glb':('rabbit','wild-rabbit.glb','https://vinish.dev/free-3d-models/rabbits-mice-and-squirrels'),
 'spirit-fox161.glb':('fox','red-fox.glb','https://vinish.dev/free-3d-models/wolves-and-foxes'),
 'spirit-deer161.glb':('deer','red-deer-stag.glb','https://vinish.dev/free-3d-models/deer-elk-and-moose'),
}
def validate_spirit161(data,kind):
 if len(data)<20 or len(data)>8*1024*1024 or data[:4]!=b'glTF':raise ValueError('invalid spirit GLB')
 version,total,n,tag=struct.unpack_from('<IIII',data,4)
 if version!=2 or total!=len(data) or tag!=0x4e4f534a or n>len(data)-20:raise ValueError('invalid spirit metadata')
 doc=json.loads(data[20:20+n]);clips={a.get('name','').lower() for a in doc.get('animations',[])}
 if not {'idle','walk','run'}<=clips:raise ValueError('missing locomotion clips')
 if kind=='deer':
  names={n.get('name','').lower() for n in doc.get('nodes',[])}
  if not doc.get('skins') and not ({'head','leg_fl','leg_fr','leg_hl','leg_hr'}<=names):raise ValueError('missing deer joint rig')
 elif not doc.get('skins'):raise ValueError('missing skin')
 if any('uri' in a and not a['uri'].startswith('data:') for a in doc.get('buffers',[])+doc.get('images',[])):raise ValueError('external dependency')
 return doc
def read_spirit161(name,url):
 kind,filename,page=SPIRIT161[name];candidates=[url,url.replace('vinish-models.pages.dev','models.vinish.dev')]
 for u in candidates:
  try:
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'WishWorld/16.1'}),timeout=12) as r:data=r.read(8*1024*1024+1)
   validate_spirit161(data,kind);return data
  except Exception as e:print('Spirit source unavailable: '+u+' '+str(e)[:100],flush=True)
 # Recover exact linked model from the official catalog, if a path moved.
 try:
  with urllib.request.urlopen(urllib.request.Request(page,headers={'User-Agent':'Mozilla/5.0'}),timeout=8) as r:
   markup=html.unescape(r.read(2500000).decode('utf-8','replace')).replace('\\/','/')
  for u in dict.fromkeys(re.findall(r'https://[^"\s<>]+?\.glb',markup)):
   if urlsplit(u).hostname not in ('vinish-models.pages.dev','models.vinish.dev') or not urlsplit(u).path.endswith('/'+filename) or u in candidates:continue
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'WishWorld/16.1'}),timeout=12) as r:data=r.read(8*1024*1024+1)
   validate_spirit161(data,kind);return data
 except Exception as e:print('Spirit catalog unavailable: '+str(e)[:100],flush=True)
 raise ValueError('No verified model: '+name)
def cached_asset(name):
 folder=Path(os.environ.get('WISH_ASSET_CACHE','/tmp/wish-assets-v107'));folder.mkdir(mode=0o700,parents=True,exist_ok=True)
 dest=folder/name
 with LOCKS[name]:
  if dest.is_file():return dest
  if time.monotonic()<FAILED.get(name,0):return None
  temp=dest.with_suffix(dest.suffix+'.part')
  try:
   url,digest=UPSTREAM[name]
   if name in SPIRIT161:data=read_spirit161(name,url)
   elif name in PET118:data=read_pet118(name,url)
   else:
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'WishWorld/10.5'}),timeout=15) as r:
     data=r.read((2 if name.endswith('.jpg') else 8 if name=='jade-ice-dragon160.glb' else 40)*1024*1024+1)
   if name.endswith('.jpg') and (len(data)>2*1024*1024 or not data.startswith(b'\xff\xd8') or not data.endswith(b'\xff\xd9')):raise ValueError('invalid texture JPEG')
   if name=='jade-ice-dragon160.glb':validate_jade160(data)
   if not data or len(data)>40*1024*1024:raise ValueError('asset length')
   if name.endswith(('.vrm','.glb')) and (len(data)<20 or data[:4]!=b'glTF' or struct.unpack_from('<I',data,8)[0]!=len(data)):raise ValueError('bad glTF')
   if name.startswith('HairSample_') or name in ('Sendagaya_Shibu.vrm','Vivi.vrm'):
    n,kind=struct.unpack_from('<II',data,12)
    if kind!=0x4e4f534a:raise ValueError('bad VRM JSON')
    meta=json.loads(data[20:20+n]).get('extensions',{}).get('VRM',{}).get('meta',{})
    if meta.get('licenseName')!='CC0':raise ValueError('VRM license not CC0')
   if name.endswith('.js') and (len(data)<1000 or b'VRMLoaderPlugin' not in data):raise ValueError('bad module')
   if digest and digest.startswith('git:'):
    if hashlib.sha1(('blob '+str(len(data))).encode()+bytes([0])+data).hexdigest()!=digest[4:]:raise ValueError('asset hash')
   elif digest and hashlib.sha256(data).hexdigest()!=digest:raise ValueError('asset hash')
   temp.write_bytes(data);temp.replace(dest)
   print('Asset cached: '+name+' '+str(len(data)),flush=True);return dest
  except Exception as e:
   temp.unlink(missing_ok=True);FAILED[name]=time.monotonic()+30
   print('Asset unavailable: '+name+' '+str(e)[:160],flush=True);return None
def serve_static(h,root,page):
 name=page.removeprefix('/assets/')
 if name not in FILES:return h.reply(404,{'error':'Không tìm thấy'})
 base=(root/'assets').resolve();p=(base/name).resolve()
 if p.parent!=base:return h.reply(404,{'error':'Không tìm thấy'})
 if not p.is_file() and name in UPSTREAM:
  p=cached_asset(name)
  if p is None:return h.reply(503,{'error':'Tài nguyên 3D chưa sẵn sàng'})
 if not p.is_file():return h.reply(404,{'error':'Không tìm thấy'})
 stat=p.stat()
 if FILES[name].startswith(('text/javascript','text/css','application/json')) and stat.st_size<=MAX_TEXT_BYTES:
  rep=text_representation(str(p),stat.st_mtime_ns,stat.st_size)
  if rep is not None:
   raw,packed,tag=rep
   if etag_matches(h.headers.get('If-None-Match'),tag):
    h.send_response(304);h.send_header('ETag',tag);h.send_header('Vary','Accept-Encoding');h.send_header('Cache-Control','public, max-age=3600');h.end_headers();return
   encoded=packed is not None and accepts_gzip(h.headers.get('Accept-Encoding'))
   body=packed if encoded else raw
   h.send_response(200);h.send_header('Content-Type',FILES[name]);h.send_header('Content-Length',str(len(body)));h.send_header('ETag',tag);h.send_header('Vary','Accept-Encoding');h.send_header('Cache-Control','public, max-age=3600')
   if encoded:h.send_header('Content-Encoding','gzip')
   h.end_headers()
   if h.command!='HEAD':h.wfile.write(body)
   return
 with p.open('rb') as f:
  h.send_response(200);h.send_header('Content-Type',FILES[name]);h.send_header('Content-Length',str(p.stat().st_size));h.send_header('Cache-Control','public, max-age=3600');h.end_headers()
  if h.command!='HEAD':shutil.copyfileobj(f,h.wfile)

"""Allowlisted static assets with bounded, same-origin upstream cache."""
from pathlib import Path
import shutil,urllib.request,hashlib,struct,threading,time,os
FILES={'vrm-character.js':'text/javascript; charset=utf-8','three-vrm.module.js':'text/javascript; charset=utf-8','Sakurada_Fumiriya.vrm':'model/gltf-binary','Sendagaya_Shino.vrm':'model/gltf-binary','deer.glb':'model/gltf-binary','anime-character.js':'text/javascript; charset=utf-8','game-policy.js':'text/javascript; charset=utf-8','realtime.js':'text/javascript; charset=utf-8','fox.glb':'model/gltf-binary','hero.glb':'model/gltf-binary','forrest_ground_01.jpg':'image/jpeg','medieval_blocks_05.jpg':'image/jpeg','medieval_wood.jpg':'image/jpeg','manifest.json':'application/json'}
VRM='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/'
UPSTREAM={
 'Sakurada_Fumiriya.vrm':(VRM+'Sakurada_Fumiriya.vrm','d8fb05f33e377df028cb6b9d58c441ce68326c41fa23f6c735d40c65ae3dc710'),
 'Sendagaya_Shino.vrm':(VRM+'Sendagaya_Shino.vrm','1e177c1a7b14f783a9c48395831db8616260d3bddd4154cb2784b779adca49b5'),
 'three-vrm.module.js':('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js',None),
 'fox.glb':('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb',None),
 'deer.glb':('https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/main/public/glb/animals_pack/Deer.glb','git:0c1a5a5d55ec13ca7899dd3a57256724cd9fca4e')
}
LOCKS={k:threading.Lock() for k in UPSTREAM}
FAILED={}
def cached_asset(name):
 folder=Path(os.environ.get('WISH_ASSET_CACHE','/tmp/wish-assets-v105'));folder.mkdir(mode=0o700,parents=True,exist_ok=True)
 dest=folder/name
 with LOCKS[name]:
  if dest.is_file():return dest
  if time.monotonic()<FAILED.get(name,0):return None
  temp=dest.with_suffix(dest.suffix+'.part')
  try:
   url,digest=UPSTREAM[name]
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'WishWorld/10.5'}),timeout=15) as r:
    data=r.read(40*1024*1024+1)
   if not data or len(data)>40*1024*1024:raise ValueError('asset length')
   if name.endswith(('.vrm','.glb')) and (len(data)<20 or data[:4]!=b'glTF' or struct.unpack_from('<I',data,8)[0]!=len(data)):raise ValueError('bad glTF')
   if name.endswith('.js') and (len(data)<1000 or b'VRMLoaderPlugin' not in data):raise ValueError('bad module')
   if digest and digest.startswith('git:'):
    if hashlib.sha1(('blob '+str(len(data))+'\0').encode()+data).hexdigest()!=digest[4:]:raise ValueError('asset hash')
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
 with p.open('rb') as f:
  h.send_response(200);h.send_header('Content-Type',FILES[name]);h.send_header('Content-Length',str(p.stat().st_size));h.send_header('Cache-Control','public, max-age=3600');h.end_headers()
  if h.command!='HEAD':shutil.copyfileobj(f,h.wfile)

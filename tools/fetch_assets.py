"""Optional local asset pack: bounded downloads, format validation, SHA256 manifest."""
import hashlib,json,os,urllib.request,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'assets'
SOURCES={
 'fox.glb':'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb',
 'hero.glb':'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/Rogue.glb',
 **{x+'.jpg':'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/'+x+'/'+x+'_diff_4k.jpg' for x in ('forrest_ground_01','medieval_blocks_05','medieval_wood')}
}
def fetch():
 ROOT.mkdir(exist_ok=True);manifest={}
 for name,url in SOURCES.items():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'WishWorld asset build'}),timeout=30) as r:data=r.read(32*1024*1024+1)
  if len(data)>32*1024*1024:raise ValueError('Asset too large: '+name)
  if name.endswith('.glb'):
   if len(data)<12 or data[:4]!=b'glTF' or struct.unpack('<I',data[8:12])[0]!=len(data):raise ValueError('Invalid GLB '+name)
  elif not data.startswith(b'\xff\xd8'):raise ValueError('Invalid JPEG '+name)
  dest=ROOT/name;tmp=dest.with_suffix(dest.suffix+'.part');tmp.write_bytes(data);os.replace(tmp,dest)
  manifest[name]={'source':url,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
if __name__=='__main__':fetch()

"""Download two CC0 VRoid example avatars; validate VRM magic, metadata and size."""
import urllib.request,json,struct,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'assets'
for name in ('Sakurada_Fumiriya','Sendagaya_Shino'):
 url='https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/'+name+'.vrm'
 with urllib.request.urlopen(url,timeout=45) as r:data=r.read(40*1024*1024+1)
 if len(data)>40*1024*1024 or len(data)<20 or data[:4]!=b'glTF' or struct.unpack_from('<I',data,8)[0]!=len(data):raise ValueError('Invalid model '+name)
 n,kind=struct.unpack_from('<II',data,12)
 if kind!=0x4e4f534a:raise ValueError('Missing JSON')
 doc=json.loads(data[20:20+n]);meta=doc.get('extensions',{}).get('VRM',{}).get('meta',{})
 if not meta or not doc.get('skins'):raise ValueError('Missing VRM skin or metadata')
 print(name,len(data),hashlib.sha256(data).hexdigest(),meta.get('licenseName'),meta.get('title'))
 out=ROOT/(name+'.vrm');tmp=out.with_suffix('.part');tmp.write_bytes(data);tmp.replace(out)

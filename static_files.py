"""Serve only explicitly allowed public assets; never expose SQLite or source files."""
from pathlib import Path
import shutil
FILES={'vrm-character.js':'text/javascript; charset=utf-8','Sakurada_Fumiriya.vrm':'model/gltf-binary','Sendagaya_Shino.vrm':'model/gltf-binary','anime-character.js':'text/javascript; charset=utf-8','game-policy.js':'text/javascript; charset=utf-8','realtime.js':'text/javascript; charset=utf-8','fox.glb':'model/gltf-binary','hero.glb':'model/gltf-binary','forrest_ground_01.jpg':'image/jpeg','medieval_blocks_05.jpg':'image/jpeg','medieval_wood.jpg':'image/jpeg','manifest.json':'application/json'}
def serve_static(h,root,page):
 name=page.removeprefix('/assets/')
 if name not in FILES:return h.reply(404,{'error':'Không tìm thấy'})
 base=(root/'assets').resolve();p=(base/name).resolve()
 if p.parent!=base or not p.is_file():return h.reply(404,{'error':'Không tìm thấy'})
 with p.open('rb') as f:
  h.send_response(200);h.send_header('Content-Type',FILES[name]);h.send_header('Content-Length',str(p.stat().st_size));h.send_header('Cache-Control','public, max-age=3600');h.end_headers()
  if h.command!='HEAD':shutil.copyfileobj(f,h.wfile)

#!/usr/bin/env python3
"""Validate local, self-contained GLB assets; generate release manifest only after explicit visual approval."""
import argparse, hashlib, json, struct
from pathlib import Path

KINDS={"fox":.68,"cat":.53,"rabbit":.52,"dragon":.90,"deer":1.12}
BASE=Path(__file__).resolve().parents[1]/"assets"/"companions16"

def inspect(path):
    raw=path.read_bytes()
    if len(raw)<20 or len(raw)>20*1024*1024:
        raise ValueError("GLB size must be between 20 bytes and 20 MiB")
    magic,version,total,n,typ=struct.unpack_from("<4sIIII",raw)
    if magic!=b"glTF" or version!=2 or total!=len(raw) or typ!=0x4e4f534a or n>len(raw)-20:
        raise ValueError("invalid GLB header")
    doc=json.loads(raw[20:20+n])
    if any("uri" in b for b in doc.get("buffers",[])) or any("uri" in im for im in doc.get("images",[])):
        raise ValueError("external resources are not allowed; export embedded GLB")
    if not doc.get("skins") or not any(len(s.get("joints",[]))>=4 for s in doc["skins"]):
        raise ValueError("missing skeletal rig")
    if not any("skin" in node and "mesh" in node for node in doc.get("nodes",[])):
        raise ValueError("missing skinned mesh")
    if not doc.get("images") or not any("baseColorTexture" in m.get("pbrMetallicRoughness",{}) for m in doc.get("materials",[])):
        raise ValueError("missing embedded color texture")
    anim={a.get("name","").strip().lower():a for a in doc.get("animations",[])}
    required={"idle","walk","run","reaction"}
    if not required<=set(anim) or not all(anim[k].get("channels") for k in required):
        raise ValueError("missing required animated clips: idle, walk, run, reaction")
    triangles=0
    for mesh in doc.get("meshes",[]):
        for p in mesh.get("primitives",[]):
            if p.get("mode",4)!=4:raise ValueError("export triangles")
            idx=p.get("indices",p.get("attributes",{}).get("POSITION"))
            triangles+=doc["accessors"][idx]["count"]//3
    if not 1<=triangles<=25000:raise ValueError(f"triangle budget: {triangles}, max 25000")
    return {"file":path.name,"sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw),"triangles":triangles,"clips":sorted(anim)}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--directory",type=Path,default=BASE)
    p.add_argument("--species",choices=KINDS,default=None,help="Validate one pilot species; omit for all five")
    p.add_argument("--approve",action="store_true",help="Only after visual review, animation, license and mobile testing")
    args=p.parse_args()
    models={}; errors=[]
    for kind,height in KINDS.items():
        if args.species and kind!=args.species:continue
        try:
            meta=inspect(args.directory/(kind+".glb"))
            meta.update(height=height,forward="-Z",approved=args.approve)
            models[kind]=meta
            print(kind,meta["triangles"],"triangles",meta["clips"])
        except (OSError,ValueError,KeyError,IndexError,TypeError,struct.error) as e:
            errors.append(f"{kind}: {e}")
    if errors:
        print("\n".join(errors))
        return 1
    if args.approve:
        manifest=args.directory/"manifest.json"
        prior={}
        if args.species and manifest.exists():
            previous=json.loads(manifest.read_text())
            if previous.get("schema")==1 and previous.get("approved") is True:prior=previous.get("models",{})
        prior.update(models)
        manifest.write_text(json.dumps({"schema":1,"approved":True,"models":prior},indent=2)+"\n")
    return 0
if __name__=="__main__":raise SystemExit(main())

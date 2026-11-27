"""Offline GLB texture preparation. Requires gltf-transform CLI and KTX-Software.
Run: python tools/prepare_nature_ktx2.py [asset-key ...]
Outputs validated GLBs under assets/nature-ktx2. Does not modify original assets.
"""
import ast
import json
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 3 * 1024 * 1024

def sources():
    tree = ast.parse((ROOT / "server.py").read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "NATURE203" for t in node.targets):
            return ast.literal_eval(node.value)
    raise ValueError("Missing NATURE203")

def inspect_glb(data):
    if not 20 <= len(data) <= LIMIT:
        raise ValueError("GLB size outside server budget")
    magic, version, total, n, kind = struct.unpack_from("<4sIIII", data)
    if magic != b"glTF" or version != 2 or total != len(data) or kind != 0x4e4f534a or n > len(data) - 20:
        raise ValueError("Invalid GLB")
    meta = json.loads(data[20:20+n])
    if not meta.get("meshes") or any("uri" in v and not v["uri"].startswith("data:") for v in meta.get("buffers", []) + meta.get("images", [])):
        raise ValueError("GLB requires external resources")
    return meta

def compressed(meta):
    textures = meta.get("textures", [])
    return bool(textures) and all("KHR_texture_basisu" in t.get("extensions", {}) for t in textures)

def main():
    urls = sources()
    keys = sys.argv[1:] or list(urls)
    if any(k not in urls for k in keys):
        raise SystemExit("Unknown asset key")
    cli = shutil.which("gltf-transform")
    output = ROOT / "assets" / "nature-ktx2"
    output.mkdir(parents=True, exist_ok=True)
    failures = []
    for key in keys:
        try:
            with tempfile.TemporaryDirectory() as td:
                src, dst = Path(td)/"original.glb", Path(td)/"packed.glb"
                with urlopen(Request(urls[key], headers={"User-Agent":"WishWorld/21.3"}), timeout=30) as r:
                    data = r.read(LIMIT+1)
                meta = inspect_glb(data)
                if compressed(meta) or not meta.get("textures"):
                    packed = data
                else:
                    if not cli:
                        raise RuntimeError("Install gltf-transform CLI and KTX-Software")
                    src.write_bytes(data)
                    subprocess.run([cli, "uastc", str(src), str(dst)], check=True, timeout=300)
                    packed = dst.read_bytes()
                    if not compressed(inspect_glb(packed)):
                        raise ValueError("Output is not fully Basis-compressed")
                tmp = output / (key+".tmp")
                tmp.write_bytes(packed)
                tmp.replace(output / (key+".glb"))
                print(key, len(data), "->", len(packed), "bytes")
        except Exception as exc:
            failures.append(key)
            print(key, "FAILED", exc, file=sys.stderr)
    return int(bool(failures))

if __name__ == "__main__":
    raise SystemExit(main())

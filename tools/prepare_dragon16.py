#!/usr/bin/env python3
"""Prepare the approved concept crop for CPU-only TripoSR smoke test.
Use a full-resolution dragon-reference.png for the actual sculpt.
The existing 80px portrait atlas is only a build smoke-test input.
"""
import base64, io, re
from pathlib import Path
from PIL import Image
base=Path(__file__).resolve().parents[1]
target=base/"assets/companions16/dragon-reference.png"
out=base/"dragon-input.png"
if target.exists():
    im=Image.open(target).convert("RGB")
    print("Full reference",im.size)
else:
    css=(base/"assets/companion-portraits152.css").read_text()
    b64=re.search(r"data:image/webp;base64,([A-Za-z0-9+/=]+)",css).group(1)
    atlas=Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    w,h=atlas.size
    im=atlas.crop((round(w*3/5),0,round(w*4/5),h))
    print("SMOKE TEST ONLY: portrait crop",im.size,"not an approved model input")
im.save(out)

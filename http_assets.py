"""Bounded immutable text asset representations; no user-specific content."""
import gzip
import hashlib
from pathlib import Path
from functools import lru_cache

MAX_TEXT_BYTES=1024*1024
def accepts_gzip(header):
 explicit=None;wildcard=0.0
 for entry in (header or '').split(','):
  name,*params=entry.strip().lower().split(';')
  name=name.strip()
  if name not in ('gzip','*'):continue
  q=1.0
  for p in params:
   k,sep,v=p.strip().partition('=')
   if sep and k.strip()=='q':
    try:q=float(v)
    except ValueError:q=0.0
    if not 0<=q<=1:q=0.0
  if name=='gzip':explicit=q
  else:wildcard=q
 return (explicit if explicit is not None else wildcard)>0

@lru_cache(maxsize=12)
def text_representation(path, stamp, size):
    # stamp and size invalidate the cache when a deployment replaces the file.
    if size>MAX_TEXT_BYTES:
        return None
    with Path(path).open('rb') as stream:
        raw=stream.read(MAX_TEXT_BYTES+1)
    if len(raw)>MAX_TEXT_BYTES:
        return None
    packed=gzip.compress(raw,compresslevel=5,mtime=0) if len(raw)>=1024 else None
    if packed is not None and len(packed)>=len(raw):
        packed=None
    tag='W/"'+hashlib.sha256(raw).hexdigest()+'"'
    return raw,packed,tag

def etag_matches(header, tag):
    # GET and HEAD use weak comparison for If-None-Match.
    def weak(value):
        return value.strip().removeprefix('W/')
    return any(v.strip()=='*' or weak(v)==weak(tag) for v in (header or '').split(','))

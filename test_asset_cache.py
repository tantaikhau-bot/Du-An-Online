import unittest,tempfile,os,hashlib,struct,io
from unittest.mock import patch
import static_files
class Assets(unittest.TestCase):
 def test_cache_hash_and_reuse(self):
  data=b'glTF'+struct.pack('<II',2,20)+b'12345678'
  with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'WISH_ASSET_CACHE':d}),patch.dict(static_files.UPSTREAM,{'deer.glb':('https://example.invalid/asset',hashlib.sha256(data).hexdigest())}),patch('static_files.urllib.request.urlopen',return_value=io.BytesIO(data)) as fetch:
   self.assertEqual(static_files.cached_asset('deer.glb').read_bytes(),data)
   self.assertEqual(static_files.cached_asset('deer.glb').read_bytes(),data)
   self.assertEqual(fetch.call_count,1)
 def test_reject_corrupt(self):
  with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'WISH_ASSET_CACHE':d}),patch.dict(static_files.FAILED,{},clear=True),patch('static_files.urllib.request.urlopen',return_value=io.BytesIO(b'not a glb')):
   self.assertIsNone(static_files.cached_asset('fox.glb'))
if __name__=='__main__':unittest.main()

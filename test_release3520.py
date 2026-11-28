import tempfile
import unittest
from pathlib import Path
import server

class ReleaseIdentity(unittest.TestCase):
 def test_actual_release(self):
  self.assertTrue(server.validate_release())
 def test_mismatched_release(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)
   for name in ('index.html','landing.html','admin.html'):
    (root/name).write_text('V'+server.RELEASE_VERSION+' '+server.RELEASE_NAME+" BUILD62='"+server.RELEASE_BUILD+"'",encoding='utf-8')
   self.assertTrue(server.validate_release(root))
   (root/'admin.html').write_text('old release',encoding='utf-8')
   with self.assertRaisesRegex(RuntimeError,'admin.html'):server.validate_release(root)
   (root/'admin.html').write_text('V'+server.RELEASE_VERSION+' '+server.RELEASE_NAME,encoding='utf-8')
   (root/'index.html').write_text('V'+server.RELEASE_VERSION+' '+server.RELEASE_NAME+" BUILD62='old'",encoding='utf-8')
   with self.assertRaisesRegex(RuntimeError,'build mismatch'):server.validate_release(root)

if __name__=='__main__':unittest.main()

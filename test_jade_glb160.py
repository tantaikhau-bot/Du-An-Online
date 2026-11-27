import unittest,struct,json
from static_files import validate_jade160,UPSTREAM
def fake(doc):
 b=json.dumps(doc).encode()
 b+=b' '*(-len(b)%4)
 return struct.pack('<4sIIII',b'glTF',2,20+len(b),len(b),0x4e4f534a)+b
class JadeGLB(unittest.TestCase):
 def test_validation(self):
  doc={'skins':[{}],'animations':[{'name':'Idle'},{'name':'Fly'}],'images':[{'bufferView':0}],'materials':[{'normalTexture':{'index':0}}]}
  self.assertEqual(validate_jade160(fake(doc)),doc)
  for change in ({'skins':[]},{'animations':[]},{'images':[{'uri':'https://example.com/x'}]},{'materials':[]}):
   with self.assertRaises(ValueError):validate_jade160(fake(dict(doc,**change)))
 def test_source(self):
  self.assertEqual(UPSTREAM['jade-ice-dragon160.glb'][0],'https://vinish-models.pages.dev/dragons/ice-dragon.glb')
if __name__=='__main__':unittest.main()

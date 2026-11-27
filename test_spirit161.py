import unittest,struct,json
from static_files import validate_spirit161,SPIRIT161,FILES,UPSTREAM
def fake(doc):
 b=json.dumps(doc).encode();b+=b' '*(-len(b)%4)
 return struct.pack('<4sIIII',b'glTF',2,20+len(b),len(b),0x4e4f534a)+b
class Spirit161(unittest.TestCase):
 def test_manifest(self):
  self.assertEqual({v[0] for v in SPIRIT161.values()},{'cat','rabbit','fox','deer'})
  for k in SPIRIT161:self.assertIn(k,FILES);self.assertIn(k,UPSTREAM)
 def test_rig(self):
  d={'skins':[{}],'animations':[{'name':k} for k in ('Idle','Walk','Run')]}
  self.assertEqual(validate_spirit161(fake(d),'fox'),d)
  with self.assertRaises(ValueError):validate_spirit161(fake(dict(d,skins=[])),'cat')
  with self.assertRaises(ValueError):validate_spirit161(fake(dict(d,animations=[])),'rabbit')
  e=dict(d,skins=[],nodes=[{'name':k} for k in ('Head','Leg_FL','Leg_FR','Leg_HL','Leg_HR')])
  self.assertEqual(validate_spirit161(fake(e),'deer'),e)
  with self.assertRaises(ValueError):validate_spirit161(fake(dict(d,buffers=[{'uri':'https://example.com/x'}])),'fox')
if __name__=='__main__':unittest.main()

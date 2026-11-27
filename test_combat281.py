"""V28.1 regression checks for the authoritative turn-based combat API."""
import sqlite3
import unittest
from unittest.mock import patch
import dungeon

class Handler:
    def __init__(self, action):
        self.path = '/api/dungeon/' + action
    def reply(self, code, body):
        return code, body

class Combat281Tests(unittest.TestCase):
    def setUp(self):
        self.c = sqlite3.connect(':memory:')
        self.c.row_factory = sqlite3.Row
        dungeon.init(self.c)
        dungeon.init(self.c)
        self.c.commit()
        self.now = 100
    def tearDown(self):
        self.c.close()
    def call(self, action, data=None):
        self.now += 1
        try:
            return dungeon.handle(Handler(action), self.c, {'id':'test'}, data or {}, self.now)
        finally:
            if self.c.in_transaction:
                self.c.rollback()
    def start(self, weapon='sword'):
        code, v = self.call('start', {'rev':0,'stage':1,'weapon':weapon})
        self.assertEqual(code, 200)
        return v
    def act(self, v, skill):
        code, v = self.call('act', {'rev':v['rev'],'skill':skill})
        self.assertEqual(code, 200)
        return v
    def test_profiles(self):
        self.assertEqual(len(dungeon.WEAPONS),5)
        v=self.start('greatsword')
        self.assertEqual(v['weapon'],'greatsword')
        self.assertEqual(v['combo'],0)
        self.assertEqual(v['stamina'],100)
        self.assertEqual(v['combat_version'],'28.1')
        self.assertEqual(next(q for q in v['skills'] if q['id']=='strike')['damage'],23)
    @patch('dungeon.secrets.randbelow',return_value=99)
    def test_combo_and_guard_reset(self, _):
        v=self.start()
        v=self.act(v,'strike')
        self.assertEqual((v['combo'],v['enemy'],v['stamina']),(1,46,92))
        v=self.act(v,'strike')
        self.assertEqual((v['combo'],v['enemy']),(2,26))
        self.assertEqual(next(q for q in v['skills'] if q['id']=='strike')['damage'],24)
        v=self.act(v,'guard')
        self.assertEqual(v['combo'],0)
        self.assertEqual(v['stamina'],100)
    def test_stale_revision_and_unknown_weapon(self):
        code,_=self.call('start',{'rev':0,'stage':1,'weapon':'invalid'})
        self.assertEqual(code,400)
        self.start()
        code,_=self.call('act',{'rev':0,'skill':'strike'})
        self.assertEqual(code,409)
    def test_legacy_start_and_dodge(self):
        code,v=self.call('start',{'rev':0,'stage':1})
        self.assertEqual(code,200)
        v=self.act(v,'dodge')
        self.assertEqual(v['hp'],100)
        self.assertEqual(v['stamina'],84)

if __name__=='__main__':
    unittest.main()

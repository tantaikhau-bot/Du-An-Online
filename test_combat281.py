"""V28.4 regression checks for the authoritative turn-based combat API."""
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
        self.assertEqual(v['combat_version'],'28.4')
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

    def test_magic_burn_and_cooldown(self):
        v=self.start()
        v=self.act(v,'fire')
        self.assertEqual((v['enemy'],v['burn']),(31,1))
        self.assertEqual(next(q for q in v['skills'] if q['id']=='fire')['cooldown'],2)
        code,_=self.call('act',{'rev':v['rev'],'skill':'fire'})
        self.assertEqual(code,409)
        v=self.act(v,'guard')
        self.assertEqual((v['enemy'],v['burn']),(19,0))
        self.assertEqual(next(q for q in v['skills'] if q['id']=='fire')['cooldown'],1)
        v=self.act(v,'dodge')
        self.assertEqual(next(q for q in v['skills'] if q['id']=='fire')['cooldown'],0)
    def test_ice_reduces_damage(self):
        v=self.start()
        v=self.act(v,'ice')
        self.assertEqual(v['hp'],97)
    def test_lightning_charged_bonus(self):
        v=self.start()
        v=self.act(v,'dodge')
        v=self.act(v,'guard')
        self.assertEqual(next(q for q in v['skills'] if q['id']=='lightning')['damage'],40)
        v=self.act(v,'lightning')
        self.assertEqual(v['enemy'],18)
    def test_magic_effects_reset_on_new_round(self):
        v=self.start()
        v=self.act(v,'fire')
        v=self.act(v,'retreat')
        code,v=self.call('start',{'rev':v['rev'],'stage':1,'weapon':'staff'})
        self.assertEqual(code,200)
        self.assertEqual(v['burn'],0)
        self.assertTrue(all(q['cooldown']==0 for q in v['skills']))

    def test_tactical_profiles(self):
        for stage,mode in ((2,'dodge'),(3,'guard'),(4,'counter'),(5,'guard')):
            v=dungeon.state(self.c,'other')
            v.update(stage=stage,turn=1,enemy=dungeon.STAGES[stage-1][2])
            self.assertEqual(dungeon.enemy_plan(v)[0],mode)
            self.assertEqual(dungeon.view(v)['enemy_mode'],mode)
        v.update(stage=2,turn=0,enemy=20)
        self.assertEqual(dungeon.enemy_plan(v)[0],'rage')
    def test_elemental_affinity(self):
        v=dungeon.state(self.c,'other')
        self.assertEqual(dungeon.adjusted_damage(v,'fire',20,'normal'),25)
        self.assertEqual(dungeon.adjusted_damage(v,'shadow',20,'normal'),15)
        self.assertEqual(dungeon.adjusted_damage(v,'strike',20,'guard'),12)
        self.assertEqual(dungeon.adjusted_damage(v,'strike',20,'dodge'),10)
    @patch('dungeon.secrets.randbelow',return_value=99)
    def test_counter_resolution_matches_preview(self, _):
        v=dungeon.state(self.c,'test')
        v.update(stage=4,best=3,status='fight',turn=1,enemy=128)
        dungeon.store(self.c,v)
        self.c.commit()
        preview=dungeon.view(v)
        self.assertEqual(preview['enemy_mode'],'counter')
        v=self.act(v,'strike')
        self.assertEqual(v['hp'],100-preview['incoming_damage']-preview['enemy_counter_bonus'])
    def test_guard_preview_matches_actual_damage(self):
        v=dungeon.state(self.c,'test')
        v.update(stage=3,best=2,status='fight',turn=1,enemy=106)
        dungeon.store(self.c,v)
        self.c.commit()
        preview=dungeon.view(v)
        with patch('dungeon.secrets.randbelow',return_value=99):
            v=self.act(v,'strike')
        self.assertEqual(v['enemy'],106-next(q for q in preview['skills'] if q['id']=='strike')['damage'])

    def test_boss_thresholds(self):
        for hp,phase in ((100,1),(71,1),(70,2),(41,2),(40,3),(16,3),(15,4)):
            self.assertEqual(dungeon.boss_phase(hp,100),phase)
        v=dungeon.state(self.c,'other')
        v.update(stage=5,enemy=20,turn=1)
        self.assertEqual(dungeon.enemy_plan(v)[0],'nova')
        self.assertEqual(dungeon.view(v)['boss_phase'],4)

    def world_call(self, uid, action, data, now):
        try:
            return dungeon.handle(Handler(action),self.c,{'id':uid},data,now)
        finally:
            if self.c.in_transaction:self.c.rollback()

    def test_world_boss_shared_health_and_cooldown(self):
        now=7201
        code,v=self.world_call('a','world-status',{},now)
        self.assertEqual(code,200)
        self.assertTrue(v['active'])
        event=v['event']
        code,v=self.world_call('a','world-strike',{'event':event},now)
        self.assertEqual((code,v['hp'],v['my_damage']),(200,11970,30))
        code,_=self.world_call('a','world-strike',{'event':event},now+1)
        self.assertEqual(code,429)
        code,v=self.world_call('b','world-strike',{'event':event},now+1)
        self.assertEqual((code,v['hp'],v['my_damage']),(200,11940,30))
        code,v=self.world_call('a','world-strike',{'event':event},now+4)
        self.assertEqual((code,v['hp'],v['my_damage']),(200,11910,60))
        code,_=self.world_call('a','world-strike',{'event':event},9000)
        self.assertEqual(code,409)
        code,_=self.world_call('a','world-strike',{'event':event},14401)
        self.assertEqual(code,409)

if __name__=='__main__':
    unittest.main()

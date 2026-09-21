import unittest
import json
import threading
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from unittest.mock import patch
import server


def unit(name, **extra):
    return dict(id=name, name=name, attack=1, max_hp=100, current_hp=100, **extra)


class BulletBatchTests(unittest.TestCase):
    def test_collision_shields_both_sides(self):
        for side in ('left','right'):
            attacker=unit('Attacker',shield=True)
            target=unit('Target',shield=True)
            mine=[None,attacker];foes=[None,None,target];events=[]
            self.assertTrue(server.perform_attack_action(attacker,1,side,mine,foes,events))
            blocks=[e for e in events if e.get('type')=='shield_block']
            self.assertEqual([(e['source_slot'],e['slot']) for e in blocks],[(2,3),(3,2)])
            self.assertEqual(attacker['current_hp'],100)
            self.assertEqual(target['current_hp'],100)
            self.assertFalse(server.has_shield(attacker))
            self.assertFalse(server.has_shield(target))
            server.perform_attack_action(attacker,1,side,mine,foes,events)
            self.assertEqual(attacker['current_hp'],99)
            self.assertEqual(target['current_hp'],99)

    def test_battle_http_response(self):
        class QuietHandler(server.Handler):
            def log_message(self,*args): pass
        httpd=server.ThreadingHTTPServer(('127.0.0.1',0),QuietHandler)
        worker=threading.Thread(target=httpd.serve_forever,daemon=True);worker.start()
        payload=json.dumps({'left':[unit('Attacker')],'right':[unit('Shield',shield=True)]}).encode()
        request=Request(f'http://127.0.0.1:{httpd.server_port}/api/battle',data=payload,headers={'Content-Type':'application/json'})
        try:
            with patch.object(server,'player',return_value={'shop_level':1}),patch.object(server,'settle_battle',return_value={}) as settle:
                with urlopen(request,timeout=5) as response:
                    self.assertEqual(response.status,200)
                    result=json.load(response)
                self.assertIn(result['winner'],('left','right','draw'))
                self.assertTrue(any(e.get('type')=='shield_block' for e in result['events']))
                settle.assert_called_once()
                settle.reset_mock()
                with patch.object(server,'tavern_battle',side_effect=RuntimeError('test failure')),self.assertLogs(level='ERROR'):
                    with self.assertRaises(HTTPError) as raised: urlopen(request,timeout=5)
                    self.assertEqual(raised.exception.code,500)
                    self.assertIn('error',json.load(raised.exception))
                settle.assert_not_called()
        finally:
            httpd.shutdown();httpd.server_close();worker.join(timeout=5)

    def run_effect(self, kind, hits=7, shield=False):
        source=unit('W')
        mostima=unit('Mostima', cumulative_damage=dict(type='team_buff', threshold=3, attack=1, max_hp=1))
        morale=unit('Morale', morale=dict(attack=2))
        team=[source,mostima,morale]
        foes=[unit('Target', shield=shield)]
        events=[]
        if kind=='initiative':
            source['initiative']=dict(type='random_bullet_damage',hits=hits,damage=1)
            server.resolve_one_precombat_effect('initiative',source,0,team,foes,'left',events)
        else:
            server.trigger_legacy_effect(source,0,'left',team,foes,events,dict(type=kind,hits=hits,damage=1))
        counter=next(i for i,e in enumerate(events) if e.get('type')=='cumulative_counter')
        shots=[i for i,e in enumerate(events) if e.get('damage_type')=='bullet' or e.get('projectile')=='bullet']
        self.assertLess(max(shots),counter)
        count=events[counter]['added']
        self.assertEqual(mostima['cumulative_damage_count'],count%3)
        self.assertEqual(len([e for e in events if e.get('mechanic')=='morale']),count//3)
        self.assertEqual(morale['attack'],1+3*(count//3))
        return events

    def test_legacy(self): self.run_effect('bullet_damage')
    def test_initiative(self): self.run_effect('initiative')
    def test_w(self): self.run_effect('all_units_bullet_damage',2)
    def test_shield(self):
        events=self.run_effect('bullet_damage',shield=True)
        self.assertTrue(any(e.get('projectile')=='bullet' for e in events))


if __name__=='__main__': unittest.main()

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import server


class SaleTests(unittest.TestCase):
    def test_every_unit_can_be_sold_at_shop_level_one(self):
        # Use an isolated database; never modify the player's saved game.
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(server, 'DB_PATH', Path(directory) / 'sales.sqlite'):
                server.initialise_database()
                units=[card for card in server.cards() if card['card_type']=='unit']
                self.assertTrue(any(card['id']=='Hoederer' for card in units))
                gold=server.player('local')['gold']
                for card in units:
                    with self.subTest(card=card['id']):
                        result=server.sell_unit(card['id'])
                        gold+=1
                        self.assertEqual(result['gold'],gold)
                        self.assertEqual(result['refund'],1)
                        self.assertEqual(result['shop_level'],1)


if __name__=='__main__': unittest.main()

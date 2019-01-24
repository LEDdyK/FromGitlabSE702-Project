from unittest import TestCase

# Create your tests here.
from hci.utils import participator


class ParticipatorTestCase(TestCase):
    def test_participator_gives_int(self):
        self.assertEqual(type(participator.get_stage(1, 1)), int)

    def test_normal_case_stage_one(self):
        self.assertEqual(participator.get_stage(2, 2), 3)

    def test_overflow_case_stage_one(self):
        self.assertEqual(participator.get_stage(123, 3), 6)

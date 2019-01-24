import os

from mindless import settings


def get_stage(participant_id: int, stage_number: int):
    with open(os.path.join(settings.BASE_DIR, 'hci/participant_allocation.txt'), 'r') as alloc_file:
        allocs = alloc_file.readlines()
        return int(allocs[(participant_id - 1) % len(allocs)][stage_number - 1])

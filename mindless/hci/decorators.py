from django.shortcuts import get_object_or_404

from hci.models import Participant, Stage
from hci.utils import participator


def add_ppnt_stg(view):
    def wrapper(request, *args, **kwargs):
        ppnt = get_object_or_404(Participant, pk=(kwargs['ppntid']))
        context = {
            'ppnt': ppnt,
            'total_stages': Stage.objects.count()
        }
        if 'stgid' in kwargs:
            stgid = kwargs['stgid']
            context['stage_disp'] = stgid
            context['stage'] = get_object_or_404(Stage,
                                                 pk=participator.get_stage(ppnt.ranking(), stgid))

        args = args + (context,)
        return view(request, *args, **kwargs)

    return wrapper

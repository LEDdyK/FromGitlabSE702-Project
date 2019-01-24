import datetime as dt
import json

from django.contrib import admin
from django.http import HttpResponse

from hci.models import *


class ExportJsonMixin:
    def export_as_csv(self, request, queryset):

        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename=mindless_export_{dt.datetime.today().isoformat()}.json'
        f_result = {}

        for ppnt in queryset:
            ppnt: Participant = ppnt
            f_result[ppnt.participant_id] = {'surveys': {}}
            for ans in ppnt.surveyanswer_set.all():
                ans: SurveyAnswer = ans
                if not str(ans.stage.identifier) in f_result[ppnt.participant_id]['surveys']:
                    f_result[ppnt.participant_id]['surveys'][ans.stage.identifier] = {}

                f_result[ppnt.participant_id]['surveys'][ans.stage.identifier][ans.question.identifier] = ans.answer

            if hasattr(ppnt, 'studysurvey'):
                f_result[ppnt.participant_id]['surveys']['study'] = ppnt.studysurvey
            for task_result in ppnt.stagetaskresult_set.all():
                loaded_result = json.loads(task_result.result)
                f_result[ppnt.participant_id][task_result.stage.identifier] = loaded_result

        response.write(json.dumps(f_result))
        return response

    export_as_csv.short_description = "Export selected"


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin, ExportJsonMixin):
    actions = ["export_as_csv"]


@admin.register(Stage)
@admin.register(StageTaskResult)
@admin.register(SurveyQuestion)
@admin.register(SurveyAnswer)
@admin.register(StudySurvey)
class HciAdmin(admin.ModelAdmin):
    pass

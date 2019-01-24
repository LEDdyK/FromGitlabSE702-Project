import json

from django.shortcuts import render, redirect
from django.urls import reverse

from hci.decorators import add_ppnt_stg
from hci.forms import StudySurveyForm
from hci.models import Participant, Stage, StageTaskResult, SurveyQuestion, SurveyAnswer
from hci.utils import participator


def participant_selection(r):
    pending_ppnts = [ppnt for ppnt in Participant.objects.all() if ppnt.get_next_link()]
    finished_ppnts = [ppnt for ppnt in Participant.objects.all() if not ppnt.get_next_link()]
    ctx = {'pending_ppnts': pending_ppnts, 'finished_ppnts': finished_ppnts}
    return render(r, 'hci/participant_selection.html', ctx)


@add_ppnt_stg
def study_introduction(r, *args, **kwargs):
    ctx = args[0]
    ctx['stages'] = [(stg_num + 1, Stage.objects.get(pk=stg_id)) for stg_num, stg_id in
                     enumerate([participator.get_stage(ctx['ppnt'].participant_id, stg_no + 1) for stg_no in range(3)])]
    return render(r, 'hci/study_introduction.html', ctx)


@add_ppnt_stg
def study_survey(r, *args, **kwargs):
    ctx = args[0]
    if r.method == 'POST':
        form = StudySurveyForm(r.POST)
        if form.is_valid():
            survey = form.save(commit=False)
            survey.participant = ctx['ppnt']
            survey.save()
            return redirect('stage-introduction', kwargs['ppntid'], Stage.objects.first().identifier)
        else:
            ctx['form'] = form
            return render(r, 'hci/study_survey.html', ctx)

    ctx['form'] = StudySurveyForm()
    return render(r, 'hci/study_survey.html', ctx)


@add_ppnt_stg
def stage_introduction(r, *args, **kwargs):
    return render(r, 'hci/stage_introduction.html', args[0])


@add_ppnt_stg
def stage_task(r, *args, **kwargs):
    ctx = args[0]
    is_practice = kwargs.get('is_practice', False)
    if r.method == 'POST':
        clicker_data = r.POST['clicker-data']
        filler_data = r.POST['filler-data']
        if is_practice and clicker_data and filler_data:
            return redirect('stage-introduction', kwargs['ppntid'], 1)
        elif not is_practice and clicker_data and filler_data:
            json_string = {'clicker': json.loads(clicker_data), "filler": json.loads(filler_data)}
            combined_json = json.dumps(json_string)
            StageTaskResult.objects.update_or_create(defaults={'result': combined_json}, participant=ctx['ppnt'],
                                                     stage=ctx['stage'])
            return redirect('stage-conclusion' if ctx['ppnt'].is_control else 'stage-survey', kwargs['ppntid'],
                            kwargs['stgid'])

    ctx['is_practice'] = is_practice
    return render(r, 'hci/stage_task.html', ctx)


@add_ppnt_stg
def stage_survey(r, *args, **kwargs):
    ctx = args[0]
    all_questions = SurveyQuestion.objects.all()

    if r.method == 'POST':
        all_answered = all([f'qtn-{q.identifier}' in r.POST for q in all_questions])
        if all_answered:
            for question in all_questions:
                SurveyAnswer.objects.update_or_create(question=question, participant=ctx['ppnt'], stage=ctx['stage'],
                                                      defaults={'answer': r.POST[f'qtn-{question.identifier}']})
            return redirect('stage-conclusion', kwargs['ppntid'], kwargs['stgid']) if kwargs['stgid'] < 3 else redirect(
                'study-conclusion', kwargs['ppntid'])

    ctx['answers'] = [
        {'label': 'Strongly disagree', 'value': 1},
        {'label': 'Disagree', 'value': 2},
        {'label': 'Slightly disagree', 'value': 3},
        {'label': 'Slightly agree', 'value': 4},
        {'label': 'Agree', 'value': 5},
        {'label': 'Strongly agree', 'value': 6},
    ]
    ctx['all_questions'] = all_questions
    return render(r, 'hci/stage_survey.html', ctx)


@add_ppnt_stg
def stage_conclusion(r, *args, **kwargs):
    if kwargs['stgid'] == Stage.objects.last().identifier:
        return redirect('study-conclusion', kwargs['ppntid'])

    ctx = args[0]
    ctx['next_link'] = reverse('stage-introduction', args=(kwargs['ppntid'], kwargs['stgid'] + 1))
    return render(r, 'hci/stage_conclusion.html', ctx)


@add_ppnt_stg
def study_conclusion(r, *args, **kwargs):
    return render(r, 'hci/study_conclusion.html', args[0])

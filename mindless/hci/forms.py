from django import forms

from hci.models import Participant, StudySurvey


class ParticipantForm(forms.Form):
    participant = forms.ModelChoiceField(Participant.objects.all())


class StudySurveyForm(forms.ModelForm):
    class Meta:
        model = StudySurvey
        exclude = ['participant']
        widgets = {
            'gender': forms.RadioSelect,
            'age_bracket': forms.RadioSelect,
            'mindfulness': forms.RadioSelect,
            'meditation': forms.RadioSelect,
            'meditation_tech': forms.RadioSelect,
        }

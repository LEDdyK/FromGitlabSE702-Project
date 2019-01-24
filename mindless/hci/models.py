from django.db import models
from django.db.models import Count
from django.urls import reverse


class Participant(models.Model):
    first_names = models.CharField(max_length=50, blank=False, null=False)
    last_name = models.CharField(max_length=50, blank=False, null=False)
    participant_id = models.PositiveSmallIntegerField('Participant ID', primary_key=True)
    is_control = models.BooleanField('Control participant', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def ranking(self):
        aggregate = Participant.objects.filter(created_at__lt=self.created_at).aggregate(ranking=Count('created_at'))
        return aggregate['ranking'] + 1

    class Meta:
        ordering = ('participant_id',)

    def __str__(self):
        return f'{self.first_names} {self.last_name} ({self.participant_id})'

    def get_next_link(self):
        completed_stage_count = self.stagetaskresult_set.count()
        if not hasattr(self, 'studysurvey'):
            return reverse('study-introduction', args=(self.participant_id,))

        if completed_stage_count < 3:
            return reverse('stage-introduction', args=(self.participant_id, completed_stage_count + 1))

        return None


meditation_choices = [
    ('none', 'Not at all'), ('less_1_week', 'Less than once per week'), ('1_3_week', '1-3 times per week'),
    ('4_7_week', '4-7 times per week'), ('multiple_day', 'Multiple times per day')]
mindfulness_choices = [('0', 'Not at all'), ('1', 'Partially'), ('2', 'Reasonably'), ('3', 'Thoroughly')]
gender_choices = [('m', 'Male'), ('f', 'Female'), ('custom', 'Specify')]
age_bracket_choices = [('20_under', '20 or under'), ('21_23', '21-23'), ('24_27', '24-27'), ('28_plus', '28+')]
meditation_tech_choices = [('never', 'Never'), ('sometimes', 'Sometimes'), ('always', 'Always')]


class StudySurvey(models.Model):
    participant = models.OneToOneField(Participant, models.CASCADE, primary_key=True)
    gender = models.CharField(max_length=10, choices=gender_choices, verbose_name='What is your gender?', default=None)
    custom_gender = models.CharField(max_length=50, blank=True, verbose_name='My gender')
    age_bracket = models.CharField(max_length=50, choices=age_bracket_choices, verbose_name='How old are you?',
                                   default=None)
    mindfulness = models.CharField(max_length=50, choices=mindfulness_choices,
                                   verbose_name='How well do you believe you understand mindfulness?', default=None)
    meditation = models.CharField(max_length=50, choices=meditation_choices, verbose_name='How often do you meditate?',
                                  default=None)
    meditation_tech = models.CharField(max_length=50, choices=meditation_tech_choices,
                                       verbose_name='Do you use technology to meditate?',
                                       default=meditation_tech_choices[0])

    def __str__(self):
        return str(self.participant)


class Stage(models.Model):
    identifier = models.PositiveSmallIntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField()

    class Meta:
        ordering = ('identifier',)

    def __str__(self):
        return f'Stage {self.identifier} ({self.name})'


class StageTaskResult(models.Model):
    participant = models.ForeignKey(Participant, models.CASCADE)
    stage = models.ForeignKey(Stage, models.CASCADE)
    result = models.TextField()

    class Meta:
        unique_together = (('participant', 'stage'),)
        ordering = ('participant', 'stage',)

    def __str__(self):
        return f'Stage {self.stage.identifier} / Participant {self.participant.participant_id}'


class SurveyQuestion(models.Model):
    identifier = models.PositiveSmallIntegerField()
    question = models.TextField()

    class Meta:
        ordering = ('identifier',)

    def __str__(self):
        return f'Question {self.identifier}'


class SurveyAnswer(models.Model):
    question = models.ForeignKey(SurveyQuestion, models.CASCADE)
    participant = models.ForeignKey(Participant, models.CASCADE)
    answer = models.TextField()
    stage = models.ForeignKey(Stage, models.CASCADE)

    class Meta:
        unique_together = (('question', 'stage', 'participant'),)
        ordering = ('participant', 'stage', 'question',)

    def __str__(self):
        return f'Stage {self.stage.identifier} / Question {self.question.identifier} / Participant {self.participant.participant_id}'

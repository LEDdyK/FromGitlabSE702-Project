# Generated by Django 2.1 on 2018-09-05 04:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hci', '0002_auto_20180830_0633'),
    ]

    operations = [
        migrations.CreateModel(
            name='SurveyAnswer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', models.TextField()),
                ('participant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hci.Participant')),
            ],
            options={
                'ordering': ('participant', 'stage', 'question'),
            },
        ),
        migrations.CreateModel(
            name='SurveyQuestion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.PositiveSmallIntegerField()),
                ('question', models.TextField()),
            ],
            options={
                'ordering': ('identifier',),
            },
        ),
        migrations.AlterUniqueTogether(
            name='stagesurveyanswer',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='stagesurveyanswer',
            name='participant',
        ),
        migrations.RemoveField(
            model_name='stagesurveyanswer',
            name='stage_survey_question',
        ),
        migrations.AlterUniqueTogether(
            name='stagesurveyquestion',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='stagesurveyquestion',
            name='stage',
        ),
        migrations.DeleteModel(
            name='StageSurveyAnswer',
        ),
        migrations.DeleteModel(
            name='StageSurveyQuestion',
        ),
        migrations.AddField(
            model_name='surveyanswer',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hci.SurveyQuestion'),
        ),
        migrations.AddField(
            model_name='surveyanswer',
            name='stage',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hci.Stage'),
        ),
        migrations.AlterUniqueTogether(
            name='surveyanswer',
            unique_together={('question', 'stage', 'participant')},
        ),
    ]

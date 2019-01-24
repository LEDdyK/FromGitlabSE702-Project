"""mindless URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from hci import views

urlpatterns = [
    path('', views.participant_selection),
    path('<int:ppntid>/', views.study_introduction, name='study-introduction'),
    path('<int:ppntid>/survey/', views.study_survey, name='study-survey'),
    path('<int:ppntid>/practice/', views.stage_task, {'is_practice': True}, name='practice-task'),
    path('<int:ppntid>/stage/<int:stgid>/', views.stage_introduction, name='stage-introduction'),
    path('<int:ppntid>/stage/<int:stgid>/task/', views.stage_task, name='stage-task'),
    path('<int:ppntid>/stage/<int:stgid>/survey/', views.stage_survey, name='stage-survey'),
    path('<int:ppntid>/stage/<int:stgid>/conclusion/', views.stage_conclusion, name='stage-conclusion'),
    path('<int:ppntid>/conclusion/', views.study_conclusion, name='study-conclusion'),
    path('admin/', admin.site.urls),
]

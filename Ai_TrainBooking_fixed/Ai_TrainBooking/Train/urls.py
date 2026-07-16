from django.urls import path
from . import views

urlpatterns = [
    path('', views.Index, name="index"),
    path('trains', views.train_list, name="train_list"),
    path('Ai', views.AI, name="Ai"),
    path('train_static_list', views.train_static_list, name="train_static_list"),
    path('api/ai-recommendation', views.Ai_Rcommendation, name="ai_recommendation"),
]

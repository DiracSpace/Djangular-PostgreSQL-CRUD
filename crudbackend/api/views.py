from django.contrib.auth.models import User
from rest_framework import viewsets
from api.serializers import EstudiantesSerializer
from .models import Estudiantes


class EstudiantesViewSet(viewsets.ModelViewSet):
    queryset = Estudiantes.objects.all()
    serializer_class = EstudiantesSerializer
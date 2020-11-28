from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.response import Response
from api.serializers import EstudiantesSerializer, IDEstudiantesSerializer
from .models import Estudiantes


class EstudiantesViewSet(viewsets.ModelViewSet):
    queryset = Estudiantes.objects.all()
    serializer_class = EstudiantesSerializer

    def list(self, request, *args, **kwargs):
        estudianteslist = Estudiantes.objects.all()
        serializer = IDEstudiantesSerializer(estudianteslist, many=True)
        return Response(serializer.data)
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Estudiantes

class EstudiantesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiantes
        fields = ['id', 'name', 'email', 'controlnum', 'year']

class IDEstudiantesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiantes
        fields = ['id', 'name']

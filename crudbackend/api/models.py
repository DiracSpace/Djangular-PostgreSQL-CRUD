from django.db import models

class Estudiantes(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    controlnum = models.CharField(max_length=10)
    year = models.IntegerField()
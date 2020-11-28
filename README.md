# Pasos a seguir para Django + Angular y PostgreSQL

Prerequisitos

* Instalar Python3
* Instalar Django y Django REST
* Instalar Node.js
* Instalar Angular
* Instalar PostgreSQL

# Configurando nuestro proyecto base

Primero ocupamos generar nuestro directorio padre que se llamará `crud`. Nos metemos y generamos un proyecto con django. Adentro de esa carpeta vamos a crear nuestra API en Python con django.

```bash
$ mkdir crud && cd crud
$ django-admin startproject [nombre-proyecto]
$ cd [nombre-proyecto]
$ django-admin startapp api
```

# Corriendo nuestro servidor

El programa `manage.py` se encarga de darnos un mejor manejo de Django usando la consola con argumentos para especificar lo que ocupamos. Primero, debemos migrar los nuevos cambios generados pero como no tenemos una bd conectada pues usará `SQLite`. Ya después de que definamos nuestro modelo, podemos integrar una bd.

```bash
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

Esto solo permitirá a Django diseña la bd base de nuestro proyecto para su panel administrativo. Ahora ocupamos generar un superusuario para poder administrar nuestro proyecto y escribimos los cambios a la bd de nuevo.

```bash
$ python3 manage.py createsuperuser
$ python3 manage.py migrate
```

Finalmente corremos nuestro proyecto, nos dará una url y nos dirijimos ahí con nuestro navegador.

```bash
$ python3 manage.py runserver
```

# configurando Django REST Framework

Primero debemos ir a nuestro `settings.py`, que debería estar en `crud/[nombre-proyecto]/[nombre-proyecto]/` y agregar nuestro framework de peticiones además de nuestra `api`.

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'api',
]
```

Después, agregamos un nuevo archivo llamado `serializers.py` debajo del directorio `/api/`.

```python
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']

```

¿Qué es un serializer?

Pues, en términos simples, estos permiten datos complejos como querysets e instancias de modelos puedan ser parseados como tipos de datos nativos en Python. De tal forma que podemos ahora renderizarlos en JSON o XML, aunque también nos ayudan a deserializar los datos de vuelta a su tipo de dato complejo.

Ahora, debemos irnos a `views.py`.

```python
from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework import permissions
from api.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
```

¿Qué es un view?

Un función view, o view, es simplemente una función escrita en Python que recibe como parámetro una petición web y devuelve una respuesta web. Puede contener un renderizado HTML, una redirección, una página 404, un documento XML/JSON, una imagen, etc.

Ahora, Django REST tiene una subclase llamada `APIView` que son algo distintas de la clase `View` por algunas razones:

* Las peticiones que sean pasadas deberán ser instancias `request` de REST y no la petición `HTTPRequest` de Django.
* Se pueden retornar instancias request de la librería REST y no necesariamente instancias HTTPRequest de Django
* Todas las excepciones son de la clase `APIException` y son manejadas
* Todas las peticiones entrantes serán autenticadas y deberán tener los permisos adecuados antes de enviar una respuesta.

Lo siguiente que tendremos que hacer es ir a `urls.py`.

```python
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from api import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
```

Este es, en términos simples, la redirección de rutas predefinidas. Ahora, `routers` es una clase que nos permite mejorar el direccionamiento de peticiones de una forma más simple y de alto nivel a comparación de Django.

# Creando nuestro propio modelo

Ahora, nos dirijimos a `models.py` para poder realizar el modelo de tabla en nuestra base de datos. 

```python
from django.db import models

class Estudiantes(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    controlnum = models.CharField(max_length=10)
    year = models.IntegerField()
```

¿Qué es un `model`?

Un modelo es la fuente única y definitiva de información sobre los datos. Contiene los campos y comportamientos esenciales de los datos que está almacenando. Generalmente, cada modelo se asigna a una sola tabla de base de datos.

# Editando nuestros Serializers

Ahora, como hemos modificado la estrutura de nuestro modelo de datos, debemos modificar también el programa que parsea esos objetos o instancias. 

* Antes que nada, debemos cambiar el tipo de `Serializer` a uno general para así poder aceptar objetos creados por nosotros. 

* Después debemos importar la clase de nuestro `models.py` en el mismo directorio para poder acceder a esas variables que declaramos y así posteriormente cambiar el modelo al que nos estamos refiriendo.

* Finalmente agregamos los argumentos o parámetros que buscamos a la lista.

```python
from .models import Estudiantes

class EstudiantesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiantes
        fields = ['name', 'email', 'controlnum', 'year']
```

# Editando nuestros Views

Aquí también debemos reescribir lo que teníamos ya que también hemos cambiado la forma en que vamos a responder ante las peticiones entrantes.

* Lo primero que haremos es cambiar el tipo de `Serializer` que tenemos de User a nuestra clase Estudiantes

* Después, debemos de importar nuestro modelo personalizado y sus valores para que Django sepa cómo responderá

* Ahora, cambiaremos nuestra clase `UserViewSet` a `EstudiantesViewSet`

* Finalmente cambiaremos el `queryset` para que tenga el valor del objeto `Estudiantes` y sus valores al igual que el `UserSerializer` por `EstudiantesSerializer`

NOTA: Aquí debemos quitar lo siguiente porque sino tenemos cuenta, no podremos hacer peticiones al API. También PyLinter me arroja error por el `Estudiantes.objects.all()`. Sí funciona, tú dale.


```python
from rest_framework import permissions

permission_classes = [permissions.IsAuthenticated]
```

```python
from api.serializers import EstudiantesSerializer
from .models import Estudiantes

class EstudiantesViewSet(viewsets.ModelViewSet):
    queryset = Estudiantes.objects.all()
    serializer_class = EstudiantesSerializer
```

# Editar admin

Podemos agregar lo siquiente para poder agregar datos nuevos desde la interfaz del admin. Aún así, en la ruta `/estudiantes/` podemos hacer peticiones POST.

```python
from .models import Estudiantes

admin.site.register(Estudiantes)
```

Ahora, si agregamos desde la interfaz web, debemos refrescar para poder ver todos los objetos ingresados. Aún así, desde la interfaz admin puedes ver todos los objetos de tipo Estudiantes

# Frontend con Angular

Ahora, por fin implementaremos nuestro frontend para desplegar una lista de nuestros objetos ya ingresados. Dentro de nuestro directorio padre `/CRUD/` debería estar el proyecto Django `/crudbackend/`. Ahora, haremos lo siguiente y aceptaremos las dos preguntas. Personalmente, elegí CSS porque me siento más cómodo con ello.

```bash
$ ng new --skip-git crudfrontend

? Do you want to enforce stricter type checking and stricter bundle budgets in the workspace?
  This setting helps improve maintainability and catch bugs ahead of time.
  For more information, see https://angular.io/strict Yes
? Would you like to add Angular routing? Yes
? Which stylesheet format would you like to use? CSS
```

Después de un rato siendo miserable y pensando "¿Qué estoy haciendo con mi vida? ¿Por qué caí tan bajo como para usar un framework de JS?" se habrá generado nuestro proyecto.

Ahora, nuestro directorio se debería ver algo así

```
CRUD
 |--- crudbackend
 |--- crudfrontend
```

# Practicando con Angular

Lo que haremos es, dentro de VS Code, es dirijirnos a `/crudfrontend/src/app/app.component.html y app.component.ts`. Borramos todo el código del HTML y pondremos lo siguiente.

```
<div style="text-align: center;">
  <h2>{{ title }}</h2>
</div>

<ul>
  <li *ngFor="let estudiante of estudiantes">
    <a>{{ estudiante.name }}</a>
  </li>
</ul>
```

Lo que hará es generar una lista con todos los datos que tengamos en nuestra base de datos. Más adelante agregaremos el servicio de conexión. Ahora, en el `TypeScript` agregaremos un arreglo simple para desplegar y entender mejor lo que queremos hacer. Quedaría así

```
export class AppComponent {
  title = 'crudfrontend';
  estudiantes = [{name: 'Jayson'}, {name: 'Pablo'}];
}
```

Hacemos `ng serve` y podremos ver cómo nuestros datos estáticos ahora pueden notarse en el front.

# HTTPClient a Django API

Primero, en nuestra consola ponemos `ng generate service api` lo que nos genera un archivo `api.service.ts` en el cual tendremos nuestras peticiones. Ahora haremos

* Debemos importar la librería HttpClient aquí, ya que se usará

* Ahora, en el `constructor` debemos generar un parámetro privado para usar en esta clase y como deriva de la clase HttpClient pues hacemos referencia a eso

```
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

constructor(private http: HttpClient) { }
```

* Declaramos nuestra url base para poder seguirla llamando en nuestras funciones y concatenar lo demás

* También tomamos en cuenta algunos headers para la petición

```
base_url = 'http://127.0.0.1:8000/';
httpHeaders = new HttpHeaders().set(
	'Content-Type', 'application/json'
);
```

* Ahora sí, tenemos nuestra función. Mandamos declarar nuestra función con Observable ya que la función get() de la clase HttpClient nos devuelve un Observable o en sí un objeto con múltiples valores de distintos tipos.

```
// Get all Estudiantes
getAllStudents(): Observable<any>
{
	return this.http.get(this.base_url + 'estudiantes/', { headers: this.httpHeaders });
}
```

Con esto tenemos nuestro prototipo de API en Angular

NOTA: Antes de poder implementar en nuestro componente del proyecto, primero debemos ir a `app.module.ts` e importarla ahí

```
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';

imports: [
    ....
    HttpClientModule
],
providers: [ApiService],
```

Ahora sí, nos vamos a `app.component.ts` para invocar la función y mostrar los datos.

* Primero importamos nuesta `ApiService` 

* Segundo, debemos vaciar nuestro arreglo para que los valores estáticos no estén ahí siempre

* Ahora, en nuestro `constructor` mandamos invocar la instancia de la `ApiService`

```
import { ApiService } from './api.service';


estudiantes = [];

constructor(private api: ApiService) { 
	this.getAllStudents();
}	
```

Nuestra función queda como abajo

```
  getAllStudents = () => {
    this.api.getAllStudents().subscribe(
      (data:any) => {
        this.estudiantes = data;
      },
      error => {
        console.log(error);
      }
    );
  }
```

NOTA: si corremos el proyecto ahorita, nos dirá que hay un error con el CORS Policy.

¿Qué son CORS? 

Cross-Origin Resource Sharing es un mecanismo que permite solicitar recursos restringidos en una página web desde otro dominio fuera del dominio desde el que se sirvió el primer recurso. Lo que significa que Django no está permitiendo ni dando nuestra información a peticiones no autorizadas desde otro sitio no confiable.

# CORS en Django

Primero instalamos `pip install django-cors-headers`


Nos vamos a `settings.py` y agregamos los siguientes puntos

```python
INSTALLED_APPS = [
    ......
    'corsheaders',
    'rest_framework',
    'api',
]


MIDDLEWARE = [
    ......
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

# Operaciones CRUD

Como vimos anteriormente, nadamas obteníamos los datos de nuestra base de datos y los desplegamos en nuestra interfaz. Sin embargo, nos topamos con varias situaciones.

Si tenemos un proyecto más grande, o simplemente unos modelos más grandes, se nos alentaría la aplicación con todas las peticiones o la carga del modelo. Por ende, tenemos que configurar un nuevo serializer que nadamas nos mande la información sobre el id del Estudiante y su nombre para poder hacer cambios después.

Nos dirijimos a `serializers.py` y agregamos otra clase serializer llamada `IDEstudiantesSerializer`. Como el modelo de datos es el mismo, solo tenemos que modificar el arreglo y los valores que devolveremos. Quedaría así

```python
class IDEstudiantesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiantes
        fields = ['id', 'name']
```

Ahora, como habíamos hablado anteriormente, las funciones views son las encargadas de devolver una respuesta web a nuestras peticiones. Por ende, debemos agregar un poco de lógica a `views.py`.

* Primero, debemos importar nuestra nueva clase `Serializer`
* Después, importamos la librería `Response` de `rest_framework`


Sobreescribimos una función interna de Django llamada `list` que devuelve la lista de datos. sin embargo, queremos una lista personalizada por lo que debemos crear nuestro propia función.

```python
from api.serializers import EstudiantesSerializer, IDEstudiantesSerializer
from rest_framework.response import Response

class EstudiantesViewSet(viewsets.ModelViewSet):
    queryset = Estudiantes.objects.all()
    serializer_class = EstudiantesSerializer

    def list(self, request, *args, **kwargs):
        estudianteslist = Estudiantes.objects.all()
        serializer = IDEstudiantesSerializer(estudianteslist, many=True)
        return Response(serializer.data)
```

Con esto, guardamos y corremos nuestro servidor con angular aparte. Lo que haremos es ir a `Network` y seleccionar `estudiantes/`. Veremos que ahora nuestros datos son sólo los que ocuparemos.

```
0: {id: 1, name: "Andrés Reyna Espinoza"}
id: 1
name: "Andrés Reyna Espinoza"
```

Necesitamos ahora crear una función que nos permita consultar los demás datos según lo que seleccionemos. Para eso, deberemos ir a Angular y nuestro `app.component.html` y agregamos una función `click` a nuestras etiquetas y agregamos un poco de `CSS` para ver que le damos click

```
<style>
  a {
    cursor: pointer;
  }
</style>

<a (click)="estudianteClick(estudiante)">{{ estudiante.name }}</a>
```

Como no existe como tal la función `estudianteClick()`, debemos ir a nuestro `app.component.ts` para agregarla

```
estudianteClick = (estudiante) => {
    console.log(estudiante.id);
}
```

Guardamos, y nos vamos al navegador. Veremos que ahora en `consola` podemos ver el número de control.

Ahora, como podemos obtener el número de control desde nuestro punto actual debemos buscar la forma de alterar esos datos más adelante. sin embargo, debemos hacer una función que nos permita consultar sólo los datos del estudiante seleccionado. Por lo que iremos a `api.service.ts` para poder agregar dicha función la cual llamaremos `getStudent()` y recibirá como parámetro el `id`

```
getStudent(id): Observable<any>
{
	return this.http.get(this.base_url + 'estudiantes/' + id + '/', { headers: this.httpHeaders });
}
```

Finalmente, debemos regresar a nuestro `app.component.ts` y modificar lo que teníamos para así mandar llamar la función de la api

```
estudianteClick = (estudiante) => {
	this.api.getStudent(estudiante.id).subscribe(
		(data: any) => {
			console.log(data);
		},
		error => {
			console.log(error);
		}
    );
}
```

# PUT y POST

Como ocupamos ingresar un `form` a nuestro HTML, debemos ir a importar la librería de Angular en `app.module.ts` e importar lo siguiente

```
import { FormsModule} from '@angular/forms';

imports: [
    ........,
    FormsModule
],
```

Acomodaremos todos los valores dentro de una sola instancia. Por lo que crearemos un objeto `estudianteSeleccionado`. En nuestro constructor, asignaremos propiedades con valores sin información para evitar errores de `undefined`. 

```
this.estudianteSeleccionado = {
	id: 0,
    name: '',
    email: '',
    controlnum: '',
    year: ''
};
```

NOTA: Debemos ir a `serializers.py` y agregar `id` a la lista de datos que regresará nuestro primer arreglo.

Ahora ocupamos mandar los datos recibidos de la selección a nuestro form. Lo que haremos es que, al seleccionar un alumno, haremos una petición GET para arrastrar los datos y sobreescribir los valores de nuestro objeto `estudianteSeleccionado` con los nuevos valores.

```
estudianteClick = (estudiante) => {
	this.api.getStudent(estudiante.id).subscribe(
		(data: any) => {
			this.estudianteSeleccionado = data;
		},
		error => {
			console.log(error);
		}
    );
}
```

Ahora, lo que buscamos es generar un form para que el usuario inserte sus datos o cambie los datos que tenemos registrados. Agregamos el siguiente `HTML`

```
<hr />

<a>Name: <input type="text" [(ngModel)]="estudianteSeleccionado.name" /></a><br />
<a>Email: <input type="text" [(ngModel)]="estudianteSeleccionado.email" /></a><br />
<a>Control number: <input type="text" [(ngModel)]="estudianteSeleccionado.controlnum" /></a><br />
<a>Year: <input type="text" [(ngModel)]="estudianteSeleccionado.year" /></a><br />
<hr />
```

Finalmente hemos llegado a las funciones de `PUT` y `POST`.

¿Qué es PUT?

Esta tipo de petición se encarga de generar un nuevo recurso u objeto de datos replazando así la representación que existía en el origen. En términos simples, actualiza la información de nuestro servidor (Django + PostgreSQL)

¿Qué es POST?

Envía datos al servidor, debe tener el header `Content-Type`

Lo primero que haremos es generar botones que nos permitirán llamar funciones específicas en `app.component.html`

```
<button (click)="actualizarEstudiante()"> PUT </button>
<button (click)="registrarEstudiante()"> POST </button>
<button (click)="eliminarEstudiante()"> DELETE </button>
```

Dentro de nuestra `api.service.ts`, y la clase `ApiService`, vamos a definir un objeto del mismo nombre. Haremos uso de `getter` y `setter` para así pasar nuestro objeto a este servicio

```
estudiante;

setData(estudianteSeleccionado){ this.estudiante = estudianteSeleccionado; }
getData(){ return this.estudiante; }
```

También vamos a generar nuestra función `updateEstudiante()` en donde vamos a definir un objeto constante `body` que será nuestro payload o conjunto de datos a mandar. Definimos el modelo igual que nuestro modelo de datos en Django y lo igualamos al valor que obtuvimos de nuestro setter y getter.

```
// PUT un estudiante
updateStudent(): Observable<any>
{
	const body = {
		name: this.estudiante.name,
    	email: this.estudiante.email,
    	controlnum: this.estudiante.controlnum,
    	year: this.estudiante.year
	};

    return this.http.put(this.base_url + 'estudiantes/' + this.estudiante.id + '/', body, { headers: this.httpHeaders });
}
```

Finalmente debemos ir a `app.component.ts` y agregar la invocación de la función `actualizarEstudiante()`. También, usando la instancia `api` de nuestro constructor, haremos referencia a las funciones `setData()` y `getData()` para pasar nuestro objeto.

```
actualizarEstudiante = () => {
	this.api.setData(this.estudianteSeleccionado);
    this.api.getData();

    this.api.updateStudent().subscribe(
      (data: any) => {
        this.estudianteSeleccionado = data;
        this.getAllStudents();
      },
      error => {
        console.log(error);
      }
    );
}
```

Guardamos, ejecutamos y funcionará

```
Request URL: http://127.0.0.1:8000/estudiantes/1/
Request Method: PUT
Status Code: 200 OK
```

En lo último, debemos poder registrar alumnos nuevos. La estructura será la misma, excepto que cambiaremos el nombre de la función del `api` y agregaremos `this.getAllStudents()` para leer la nueva lista de estudiantes cada que se haga una edición.

```
registrarEstudiante = () => {
	this.api.setData(this.estudianteSeleccionado);
    this.api.getData();

    this.api.registerStudent().subscribe(
      (data: any) => {
        this.estudianteSeleccionado = data;
        this.getAllStudents();
      },
      error => {
        console.log(error);
      }
    );
}

eliminarEstudiante = () => {
    this.api.eraseStudent(this.estudianteSeleccionado.id).subscribe(
      (data: any) => {
        this.getAllStudents();
      },
      error => {
        console.log(error);
      }
    );
}
```

```
// POST un estudiante
registerStudent(): Observable<any>
{
	const body = {
      name: this.estudiante.name,
      email: this.estudiante.email,
      controlnum: this.estudiante.controlnum,
      year: this.estudiante.year
    };

    return this.http.post(this.base_url + 'estudiantes/', body, { headers: this.httpHeaders });
}

// DELETE un estudiante
eraseStudent(id): Observable<any>
{
	return this.http.delete(this.base_url + 'estudiantes/' + id + '/', { headers: this.httpHeaders });
}
```

# PostgreSQL con Django

Primero nos metemos a psql

```bash
$ sudo -u postgres psql
```

Después creamos una base de datos

```bash
postgres=# create database estudiantes;
CREATE DATABASE
```

Creamos un usuario

```bash
postgres=# create user adminescuela with encrypted password 'adminesadmin';
CREATE ROLE
```

Hacemos unas modificaciones a los parámetros

* Cambiamos el encoding a `UTF-8` que es lo que espera Django
* Cambiamos el esquema de aislamiento para transacciones 
* Cambiamos el time zone a `UTC` que es el que maneja Django

```bash
postgres=# alter role adminescuela set client_encoding to 'utf8';
ALTER ROLE
postgres=# alter role adminescuela set default_transaction_isolation to 'read committed';
ALTER ROLE
postgres=# alter role adminescuela set timezone to 'UTC';
ALTER ROLE
```

Finalmente nos damos todos los permisos de administrador solamente a esa base de datos y salimos

```bash
postgres=# grant all privileges on database Estudiantes to adminescuela;
GRANT
postgres=# \q
```

Ahora, debemos integrarlo con Django

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'estudiantes',
        'USER': 'adminescuela',
        'PASSWORD': 'adminesadmin',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Finalmente en la consola debemos hacer las migraciones y migrar

```bash
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

# Referencias

* https://www.django-rest-framework.org/tutorial/quickstart/
* https://djangocentral.com/using-postgresql-with-django/
* https://github.com/adamchainz/django-cors-headers
* https://linuxize.com/post/how-to-list-databases-tables-in-postgreqsl/

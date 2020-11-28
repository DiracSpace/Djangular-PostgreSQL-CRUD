import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private http: HttpClient) { }

  base_url = 'http://127.0.0.1:8000/';
  httpHeaders = new HttpHeaders().set(
    'Content-Type', 'application/json'
  );

  estudiante;
  setData(estudianteSeleccionado){ this.estudiante = estudianteSeleccionado; }
  getData(){ return this.estudiante; }

  // GET todos Estudiantes
  getAllStudents(): Observable<any>
  {
    return this.http.get(this.base_url + 'estudiantes/', { headers: this.httpHeaders });
  }

  // GET un estudiante
  getStudent(id): Observable<any>
  {
    return this.http.get(this.base_url + 'estudiantes/' + id + '/', { headers: this.httpHeaders });
  }

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
}

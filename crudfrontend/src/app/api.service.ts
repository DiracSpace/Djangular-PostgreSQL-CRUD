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

  // Get all Estudiantes
  getAllStudents(): Observable<any>
  {
    return this.http.get(this.base_url + 'estudiantes/', { headers: this.httpHeaders });
  }
}

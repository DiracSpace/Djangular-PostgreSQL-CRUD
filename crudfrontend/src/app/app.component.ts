import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: []
})

export class AppComponent 
{
  title = 'crudfrontend';
  estudiantes = [];

  constructor(private api: ApiService) { 
    this.getAllStudents();
  }
  
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
}
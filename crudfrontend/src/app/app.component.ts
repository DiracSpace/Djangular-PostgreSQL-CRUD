import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: []
})

export class AppComponent {
  title = 'crudfrontend';
  estudiantes = [];

  estudianteSeleccionado;

  constructor(private api: ApiService) {
    this.getAllStudents();
    this.estudianteSeleccionado = {
      id: 0,
      name: '',
      email: '',
      controlnum: '',
      year: ''
    };
  }

  getAllStudents = () => {
    this.api.getAllStudents().subscribe(
      (data: any) => {
        this.estudiantes = data;
      },
      error => {
        console.log(error);
      }
    );
  }

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
}
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { LoginService } from 'src/login/login.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';
import { Roles } from '../statics/roles.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CatalogueService {
  constructor(private appService: LoginService, private http: HttpService, private readonly config: ConfigService){}

  getRules(role: Roles): Rule[] {
    return [
      {
        roles: [Roles.Student, Roles.Employee],
        keyName: 'student_rules',
        name: {
          en: 'Something',
          es: 'Algo',
        },
        pdfUrl: 'https://um.edu.mx/descargas/reglamento.pdf',
      },
      {
        roles: [Roles.Student, Roles.Employee],
        keyName: 'legislation_undergraduate',
        name: {
          en: 'Something',
          es: 'Algo',
        },
        pdfUrl: 'https://um.edu.mx/descargas/leg_pregrado.pdf',
      },
      {
        roles: [Roles.Student, Roles.Employee],
        keyName: 'legislation_posgraduate',
        name: {
          en: 'Something',
          es: 'Algo',
        },
        pdfUrl: 'https://um.edu.mx/descargas/leg_posgrado.pdf',
      },
      {
        roles: [Roles.Employee],
        keyName: 'policy_manual',
        name: {
          en: 'Something',
          es: 'Algo',
        },
        pdfUrl: 'https://virtual-um.um.edu.mx/financiero/rh/formularios/ManualDePoliticas.pdf',
      },
    ].filter(r => r.roles.includes(role));
  }

  getCountries() {
    return this.appService.token().pipe(
      map(res => res.data),
      switchMap(token => this.http.get<any[]>(`${this.config.get<String>('academic.url')}/listaPaises`, {headers: {Authorization: token}})),
      map(res => {
        const countries: Country[] = [];
        res.data.forEach(c => countries.push({id: c['paisId'], name: c['nombrePais']}));
        return countries;
      }),
      catchError(this.handleError<String>(null)),
    );
  }

  handleError<T>(result?: T) {
    return (error: AxiosError<any>): Observable<T> => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
  
      return of(result as T);
    }
  }
}

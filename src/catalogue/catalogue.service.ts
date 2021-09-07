import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { LoginService } from 'src/login/login.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';
import { Roles } from '../statics/roles.enum';
import { ConfigType } from '@nestjs/config';
import academicConfig from 'src/config/academic.config';
import { rules } from 'src/statics/rules.list';

@Injectable()
export class CatalogueService {
  constructor(
    private http: HttpService,
    private acaService: LoginService,
    @Inject(academicConfig.KEY) private readonly acaConfig: ConfigType<typeof academicConfig>,
  ){}

  getRulesFor(role: Roles): Rule[] {
    return rules.filter(r => r.roles.includes(role));
  }

  getCountries(): Observable<Country[]> {
    return this.acaService.token().pipe(
      switchMap(token => this.http.get<any[]>(`${this.acaConfig.url}/listaPaises`, {headers: {Authorization: token}})),
      map(res => {
        const countries: Country[] = [];
        res.data.forEach(c => countries.push({id: c['paisId'], name: c['nombrePais']}));
        return countries;
      }),
      catchError(this.handleError<Country[]>([])),
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

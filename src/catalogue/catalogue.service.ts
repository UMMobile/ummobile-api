import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/acaAuth/acaAuth.service';
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
    private acaAuth: AcaAuthService,
    @Inject(academicConfig.KEY) private readonly acaConfig: ConfigType<typeof academicConfig>,
  ){}

  /**
   * Filter the rules for the specific role.
   * @param role The role to find the rules
   * @return A rules list
   */
  filterRulesFor(role: Roles): Rule[] {
    return rules.filter(r => r.roles.includes(role));
  }

  /**
   * Fetches the catalogue of countries.
   * @return An observable with the countries list
   */
  fetchCountries(): Observable<Country[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<any[]>(`${this.acaConfig.url}/listaPaises`, {headers: {Authorization: token}})),
      map(res => {
        const countries: Country[] = [];
        res.data.forEach(c => countries.push({id: c['paisId'], name: c['nombrePais']}));
        return countries;
      }),
      catchError(this.handleError<Country[]>([])),
    );
  }

  private handleError<T>(result?: T) {
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

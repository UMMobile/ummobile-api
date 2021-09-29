import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';
import { Roles } from '../statics/roles.enum';
import { rules } from 'src/statics/rules.list';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class CatalogueService {
  constructor(
    private http: HttpService,
    private acaAuth: AcaAuthService,
    private readonly utils: UtilsService,
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
      switchMap(token => this.http.get<any[]>('/listaPaises', {headers: {Authorization: token}})),
      map(res => {
        const countries: Country[] = [];
        res.data.forEach(c => countries.push({id: c['paisId'], name: c['nombrePais']}));
        return countries;
      }),
      catchError(this.utils.handleHttpError<Country[]>([])),
    );
  }
}

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { catchError, map, Observable, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';
import { Roles } from 'src/statics/types';
import { rules } from 'src/statics/rules.list';
import { UtilsService } from 'src/utils/utils.service';
import academicConfig from 'src/config/academic.config';
import { ConfigType } from '@nestjs/config';
import calendarConfig from 'src/config/calendar.config';
import { Calendar } from './entities/calendar.entity';

@Injectable()
export class CatalogueService {
  constructor(
    private http: HttpService,
    private acaAuth: AcaAuthService,
    private readonly utils: UtilsService,
    @Inject(academicConfig.KEY) private readonly academic: ConfigType<typeof academicConfig>,
    @Inject(calendarConfig.KEY) private readonly calendar: ConfigType<typeof calendarConfig>,
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
      switchMap(token => this.http.get<any[]>(`${this.academic.url}/listaPaises`, {headers: {Authorization: token}})),
      map(res => {
        const countries: Country[] = [];
        res.data.forEach(c => countries.push({id: Number.parseInt(c['paisId']), name: c['nombrePais']}));
        return countries;
      }),
      catchError(this.utils.handleHttpError<Country[]>([])),
    );
  }

  /**
   * Fetches the current year calendar for the user.
   * @return An observable with the calendar.
   */
  fetchCurrentCalendar(role: Roles): Observable<Calendar> {
    const currentYear: number = new Date().getFullYear();
    return this.fetchCalendarByYear(role, currentYear);
  }

  /**
   * Fetches the calendar for the user & for an specific year.
   * @return An observable with the calendar.
   */
   fetchCalendarByYear(role: Roles, year: number): Observable<Calendar> {
    const date: Date = new Date(`${year}-08-01T10:00:00-07:00`);
    const calendarId: string = role === Roles.Employee ? this.calendar.employeeId : this.calendar.studentId;
    return this.http.get<any>(`${this.calendar.url}/${calendarId}/events?key=${this.calendar.key}&timeMin=${date.toISOString()}`)
    .pipe(
      map(({data}) => Calendar.fromMap(data)),
      catchError(this.utils.handleHttpError<Calendar>(new Calendar())),
    );
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { UtilsService } from 'src/utils/utils.service';
import { CovidValidations, CovidInformation, CovidValidation, CovidReasons } from './entities/covidInformation.entity';

@Injectable()
export class QuestionnaireService {
  private DAYS_AFTER: {[key: string]: number} = {
    ARRIVAL_INTERNALS: 5,
    ARRIVAL_EXTERNALS: 7,
    SUSPICION: 7,
    COVID: 14,
  };

  constructor(
    private http: HttpService,
    private acaAuth: AcaAuthService,
    private utils: UtilsService,
  ){}

  /**
   * Fetches the user extra covid information.
   * @param userId The user id
   * @param periodId The period id
   * @return An observable with the user covid information
   */
   fetchCovidInformation(userId: String, periodId: String = '2122A'): Observable<CovidInformation> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/datosDeRetorno?CodigoAlumno=${userId}&PeriodoId=${periodId}`, {headers:{Authorization:token}})),
      map(({data}) => ({
          arrivalDate: data['fechaLlegada'] ? this.utils.parseDDMMYYYY(data['fechaLlegada']) : undefined,
          isVaccinated: data['vacuna'],
          haveCovid: data['positivoCovid'],
          startCovidDate: data['fechaPositivo'] ? this.utils.parseDDMMYYYY(data['fechaPositivo']) : undefined,
          isSuspect: data['sospechoso'],
          startSuspicionDate: data['fechaSospechoso'] ? this.utils.parseDDMMYYYY(data['fechaSospechoso']) : undefined,
          isInQuarantine: data['aislamiento'],
          quarantineEndDate: data['finAislamiento'] ? this.utils.parseDDMMYYYY(data['finAislamiento']) : undefined,
      })),
      catchError(this.handleError<CovidInformation>(new CovidInformation())),
    );
  }

  /**
   * Fetches the user extra covid information validation.
   * @param userId The user id
   * @param periodId The period id
   * @return An observable with the user covid information validation
   */
   fetchCovidValidations(userId: String, periodId: String = '2122A'): Observable<CovidValidation> {
    return forkJoin([
      this.fetchCovidInformation(userId, periodId),
      this.fetchIfResponsiveLetter(userId),
    ]).pipe(
      map(([info, {haveResponsiveLetter}]) => {
        const v: CovidValidation = new CovidValidation();

        v.validations = {
          recentArrival: this.checkIfRecentArrival(info),
          isSuspect: this.checkIfIsSuspect(info),
          haveCovid: this.checkIfHaveCovid(info),
          isInQuarantine: this.checkIfIsInQuarantine(info),
          noResponsiveLetter: !haveResponsiveLetter,
        };
        v.pass = this.checkICanPass(v.validations);
        v.reason = this.getReason(v.validations);
        v.usedData = info;

        return v;
      }),
      catchError(this.handleError<CovidValidation>(new CovidValidation())),
    );
  }

  /**
   * Fetches if the user have a responsive letter.
   * @param userId The user id
   * @return An observable with an object with a `haveResponsiveLetter` field.
   */
   fetchIfResponsiveLetter(userId: String): Observable<{haveResponsiveLetter: Boolean}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/tieneCartaResponsiva?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ haveResponsiveLetter: data === 'S' ? true : false })),
      catchError(this.handleError<{haveResponsiveLetter: Boolean}>({haveResponsiveLetter: false})),
    );
  }

  /**
   * Check if has recent arrival.
   * 
   * Return `True` if:
   * - Is external & arrived in less than 7 days
   * - ~~Is internal & arrived in less than 5 days~~
   * @param info The COVID extra information.
   * @return `True` if have recent arrival. Otherwise `False`.
   */
  private checkIfRecentArrival = (info: CovidInformation): Boolean => info.arrivalDate ? !this.utils.nthDaysPassed(info.arrivalDate, this.DAYS_AFTER['ARRIVAL_EXTERNALS']) : false;

  /**
   * Check if is in quarantine.
   * 
   * Return `True` if:
   * - Is in quarantine & have end date & end date haven't passed yet.
   * - Is quarantine & do not have end date.
   * @param info The COVID extra information.
   * @return `True` if is in quarantine. Otherwise `False`.
   */
  private checkIfIsInQuarantine = (info: CovidInformation): Boolean => info.isInQuarantine ? info.quarantineEndDate ? !this.utils.isBeforeToday(info.quarantineEndDate) : true : false;

  /**
   * Check if have COVID.
   * 
   * Return `True` if:
   * - Have COVID & have start date & 14 days haven't passed since the start.
   * - Have COVID & do not have start date.
   * @param info The COVID extra information.
   * @return `True` if have COVID. Otherwise `False`.
   */
  private checkIfHaveCovid = (info: CovidInformation): Boolean => info.haveCovid ? info.startCovidDate ? !this.utils.nthDaysPassed(info.startCovidDate, this.DAYS_AFTER['COVID']) : true : false;

  /**
   * Check if is suspect.
   * 
   * Return `True` if:
   * - Is suspect & have start date & 7 days haven't passed since the start.
   * - Is suspect & dop not have start date.
   * @param info The COVID extra information.
   * @return `True` if is suspect. Otherwise `False`.
   */
  private checkIfIsSuspect = (info: CovidInformation): Boolean => info.isSuspect ? info.startSuspicionDate ? !this.utils.nthDaysPassed(info.startSuspicionDate, this.DAYS_AFTER['SUSPICION']) : true : false;

  /**
   * Check if can pass.
   * 
   * Return `True` if:
   * - Is not in quarantine
   * - Do not have COVID
   * - Isn't suspect
   * - Has no recent arrival
   * @param validations The COVID extra information validations.
   * @return `True` if can pass. Otherwise `False`.
   */
  private checkICanPass = (validations: CovidValidations): Boolean => [validations.noResponsiveLetter, validations.haveCovid, validations.isInQuarantine, validations.isSuspect, validations.recentArrival].every(i => !i);

  /**
   * Get the reason of the answer to if can or cannot pass.
   * 
   * The reason is selected following the next order:
   * - Do not upload the responsive letter (`noResponsiveLetter`)
   * - Is in quarantine (`isInQuarantine`)
   * - Have COVID (`haveCovid`)
   * - Is suspect (`isSuspect`)
   * - Has recent arrival (`recentArrival`)
   * - None (`none`)
   * @param validations The COVID extra information validations.
   * @return A string key that indicate the reason.
   */
  private getReason = (validations: CovidValidations): CovidReasons => {
    switch (true) {
      case validations.noResponsiveLetter:
        return 'noResponsiveLetter';
      case validations.isInQuarantine:
        return 'isInQuarantine';
      case validations.haveCovid:
        return 'haveCovid';
      case validations.isSuspect:
        return 'isSuspect';
      case validations.recentArrival:
        return 'recentArrival';
      default:
        return 'none';
    }
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

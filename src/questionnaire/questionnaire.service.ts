import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { UtilsService } from 'src/utils/utils.service';
import { CovidQuestionnaireAnswerDto } from './dto/createCovidQuestionnaireAnswer.dto';
import { UpdateCovidInformationDto } from './dto/updateCovidInformation.dto';
import { CovidValidations, CovidInformation, CovidValidation, CovidReasons } from './entities/covidInformation.entity';
import { CovidQuestionnaire, CovidQuestionnaireDocument } from './entities/covidQuestionnaire.entity';

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
    @InjectModel(CovidQuestionnaire.name) private covidQuestionnaire: Model<CovidQuestionnaireDocument>
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
   * Update the user extra covid information.
   * @param userId The user id
   * @param information The information to update:
   * @param information.isSuspect The field to mark or dismark the user as suspect. Default `false`.
   * @return An observable with an object with an `updated` & `message` fields
   */
  updateCovidInformation(
     userId: String,
     information: UpdateCovidInformationDto = {isSuspect: false},
  ): Observable<{updated: Boolean, message?: String}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.put<String>(`/modificarSospechoso?CodigoAlumno=${userId}&Sospechoso=${information.isSuspect ? 'S' : 'N'}`, {}, {headers:{Authorization:token}})),
      map(({data}) => ({
        updated: data === 'guardado' ? true : false,
        message: data === '-' ? `The user ${userId} have no COVID extra information to update` : undefined,
      })),
      catchError(this.handleError<{updated: Boolean}>({updated: false})),
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
      switchMap(token => this.http.get<String>(`/tieneCartaResponsiva?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ haveResponsiveLetter: data === 'S' ? true : false })),
      catchError(this.handleError<{haveResponsiveLetter: Boolean}>({haveResponsiveLetter: false})),
    );
  }

  /**
   * Save a new answer to the COVID questionnaire.
   * @param userId The user id
   * @param covidQuestionnaireAnswerDto The answers to save
   * @return An observable with an object with the Document saved.
   */
   async saveCovidQuestionnaireAnswer(userId: String, covidQuestionnaireAnswerDto: CovidQuestionnaireAnswerDto): Promise<CovidQuestionnaireDocument> {
    // Save to academic
    this.acaAuth.token().pipe(
      switchMap(token => this.http.put<void>('/grabarEncuestaCovid', {
        'codigoPersonal': userId,
        ...this.mapToAcadmicBodyFormat(covidQuestionnaireAnswerDto),
      }, {headers: {Authorization: token}})),
      catchError(this.handleError<void>()),
    ).subscribe();

    // Save to own database
    return await this.covidQuestionnaire.findByIdAndUpdate({_id: userId}, { $push: { answers: covidQuestionnaireAnswerDto } }, {new: true, upsert: true});
  }

  /**
   * Retrieve the answers of the COVID questionnaire.
   * @param userId The user id
   * @return An observable the list of answers.
   */
   async getCovidQuestionnaireAnswers(userId: String): Promise<CovidQuestionnaireDocument> {
    return await this.covidQuestionnaire.findById(userId, 'answers');
  }

  /**
   * Retrieve the answers of the COVID questionnaire for current day.
   * @param userId The user id
   * @return An observable the list of answers.
   */
   async getTodayCovidQuestionnaireAnswers(userId: String): Promise<CovidQuestionnaire> {
    const answers: CovidQuestionnaire = await this.covidQuestionnaire.findById(userId);
    // Remove every answer that does not have date or is not today
    answers.answers = answers.answers.filter((answer) => answer['createdAt'] && this.utils.isStillToday(new Date(answer['createdAt'])));
    return answers;
  }

  /**
   * Map the body of the academic endpoint that save the questionnaire answer.
   * 
   * Map the following fields:
   * ```
   * {
      "fechaUno": "string",
      "fechaDos": "string",
      "paisUno": "string",
      "paisDos": "string",
      "ciudadUno": "string",
      "ciudadDos": "string",
      "contacto": "string",
      "contactoFecha": "string",
      "fiebre": "string",
      "tos": "string",
      "cabeza": "string",
      "respirar": "string",
      "garganta": "string",
      "escurrimiento": "string",
      "olfato": "string",
      "gusto": "string",
      "cuerpo": "string",
    }
   * ```
   * @param answer The COVID questionnaire answer DTO.
   * @return The formatted request body
   */
  private mapToAcadmicBodyFormat = (answer: CovidQuestionnaireAnswerDto): {} => {
    const body: {} = {};

    // COUNTRIES INFORMATION
    answer.countries.forEach((item, index) => {
      let position: string;

      if(index === 0) {
        position = 'Uno';
      } else if(index === 1) {
        position = 'Dos';
      }

      body[`pais${position}`] = item.country;
      body[`ciudad${position}`] = item.city;
      body[`fecha${position}`] = item.date;
    });

    const toAcademicBoolean: Function = (item: string) => item === 'true' ? 'S' : 'N';
    // CONTACT INFORMATION
    body['contacto'] = toAcademicBoolean(answer.recentContact.yes);
    if(body['contacto'])
      body['contactoFecha'] = answer.recentContact.when;

    // MAJOR SYMPTOMS
    body['respirar'] = toAcademicBoolean(answer.majorSymptoms.dificultyBreathing);
    body['fiebre'] = toAcademicBoolean(answer.majorSymptoms.fever);
    body['tos'] = toAcademicBoolean(answer.majorSymptoms.frequentCoughing);
    body['cabeza'] = toAcademicBoolean(answer.majorSymptoms.headache);
    
    // MINOR SYMPTOMS
    body['cuerpo'] = toAcademicBoolean(answer.minorSymptoms.bodyPain);
    body['olfato'] = toAcademicBoolean(answer.minorSymptoms.lossOfSmell);
    body['gusto'] = toAcademicBoolean(answer.minorSymptoms.lossOfTaste);
    body['escurrimiento'] = toAcademicBoolean(answer.minorSymptoms.runnyNose);
    body['garganta'] = toAcademicBoolean(answer.minorSymptoms.soreThroat);

    return body;
  };

  /**
   * Check if has recent arrival.
   * 
   * Return `true` if:
   * - Is external & arrived in less than 7 days
   * - ~~Is internal & arrived in less than 5 days~~
   * @param info The COVID extra information.
   * @return `true` if have recent arrival. Otherwise `false`.
   */
  private checkIfRecentArrival = (info: CovidInformation): Boolean => info.arrivalDate ? !this.utils.nthDaysPassed(info.arrivalDate, this.DAYS_AFTER['ARRIVAL_EXTERNALS']) : false;

  /**
   * Check if is in quarantine.
   * 
   * Return `true` if:
   * - Is in quarantine & have end date & end date haven't passed yet.
   * - Is quarantine & do not have end date.
   * @param info The COVID extra information.
   * @return `true` if is in quarantine. Otherwise `false`.
   */
  private checkIfIsInQuarantine = (info: CovidInformation): Boolean => info.isInQuarantine ? info.quarantineEndDate ? !this.utils.isBeforeToday(info.quarantineEndDate) : true : false;

  /**
   * Check if have COVID.
   * 
   * Return `true` if:
   * - Have COVID & have start date & 14 days haven't passed since the start.
   * - Have COVID & do not have start date.
   * @param info The COVID extra information.
   * @return `true` if have COVID. Otherwise `false`.
   */
  private checkIfHaveCovid = (info: CovidInformation): Boolean => info.haveCovid ? info.startCovidDate ? !this.utils.nthDaysPassed(info.startCovidDate, this.DAYS_AFTER['COVID']) : true : false;

  /**
   * Check if is suspect.
   * 
   * Return `true` if:
   * - Is suspect & have start date & 7 days haven't passed since the start.
   * - Is suspect & dop not have start date.
   * @param info The COVID extra information.
   * @return `true` if is suspect. Otherwise `false`.
   */
  private checkIfIsSuspect = (info: CovidInformation): Boolean => info.isSuspect ? info.startSuspicionDate ? !this.utils.nthDaysPassed(info.startSuspicionDate, this.DAYS_AFTER['SUSPICION']) : true : false;

  /**
   * Check if can pass.
   * 
   * Return `true` if:
   * - Is not in quarantine
   * - Do not have COVID
   * - Isn't suspect
   * - Has no recent arrival
   * @param validations The COVID extra information validations.
   * @return `true` if can pass. Otherwise `false`.
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

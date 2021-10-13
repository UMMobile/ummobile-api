import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { catchError, forkJoin, map, Observable, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { Residence, Reasons } from 'src/statics/types';
import { UtilsService } from 'src/utils/utils.service';
import { CovidQuestionnaireAnswerDto } from './dto/createCovidQuestionnaireAnswer.dto';
import { ResponsiveLetterDto } from './dto/responsiveLetter.dto';
import { UpdateCovidInformationDto, UpdatedCovidInformationResDto } from './dto/updateCovidInformation.dto';
import { CovidValidations, CovidInformation, CovidValidation } from './entities/covidInformation.entity';
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
          isVaccinated: data['vacuna'] ? data['vacuna'] === 'S' ? true : false : false,
          haveCovid: data['positivoCovid'] ? data['positivoCovid'] === 'S' ? true : false : false,
          startCovidDate: data['fechaPositivo'] ? this.utils.parseDDMMYYYY(data['fechaPositivo']) : undefined,
          isSuspect: data['sospechoso'] ? data['sospechoso'] === 'S' ? true : false : false,
          startSuspicionDate: data['fechaSospechoso'] ? this.utils.parseDDMMYYYY(data['fechaSospechoso']) : undefined,
          isInQuarantine: data['aislamiento'] ? data['aislamiento'] === 'S' ? true : false : false,
          quarantineEndDate: data['finAislamiento'] ? this.utils.parseDDMMYYYY(data['finAislamiento']) : undefined,
      })),
      catchError(this.utils.handleHttpError<CovidInformation>(new CovidInformation())),
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
  ): Observable<UpdatedCovidInformationResDto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.put<String>(`/modificarSospechoso?CodigoAlumno=${userId}&Sospechoso=${information.isSuspect ? 'S' : 'N'}`, {}, {headers:{Authorization:token}})),
      map(({data}) => ({
        updated: data === 'guardado' ? true : false,
        message: data === '-' ? `The user ${userId} have no COVID extra information to update` : undefined,
      })),
      catchError(this.utils.handleHttpError<UpdatedCovidInformationResDto>({updated: false})),
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
      this.fetchResidence(userId),
    ]).pipe(
      map(([info, {haveResponsiveLetter}, residence]) => {
        const v: CovidValidation = new CovidValidation();

        v.validations = {
          recentArrival: this.checkIfRecentArrival(info, residence),
          isSuspect: this.checkIfIsSuspect(info),
          haveCovid: this.checkIfHaveCovid(info),
          isInQuarantine: this.checkIfIsInQuarantine(info),
          noResponsiveLetter: !haveResponsiveLetter,
        };
        v.allowAccess = this.checkICanPass(v.validations);
        v.reason = this.getReason(v.validations);
        v.qrUrl = this.getQrUrl(userId, v.allowAccess, residence);
        v.usedData = info;

        return v;
      }),
      catchError(this.utils.handleHttpError<CovidValidation>(new CovidValidation())),
    );
  }

  /**
   * Fetches if the user have a responsive letter.
   * @param userId The user id
   * @return An observable with an object with a `haveResponsiveLetter` field.
   */
  fetchIfResponsiveLetter(userId: String): Observable<ResponsiveLetterDto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<String>(`/tieneCartaResponsiva?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ haveResponsiveLetter: data === 'S' ? true : false })),
      catchError(this.utils.handleHttpError<ResponsiveLetterDto>({haveResponsiveLetter: false})),
    );
  }

  /**
   * Save a new answer to the COVID questionnaire.
   * 
   * The answers are validated to know if is suspect or not. If is suspect the information is updated in the academic.
   * @param userId The user id
   * @param covidQuestionnaireAnswerDto The answers to save
   * @return An observable with an object with the Document saved.
   */
  saveCovidQuestionnaireAnswer(userId: String, covidQuestionnaireAnswerDto: CovidQuestionnaireAnswerDto): Observable<CovidValidation> {
    // Save to academic
    this.acaAuth.token().pipe(
      switchMap(token => this.http.put<void>('/grabarEncuestaCovid', {
        'codigoPersonal': userId,
        ...this.mapToAcadmicBodyFormat(covidQuestionnaireAnswerDto),
      }, {headers: {Authorization: token}})),
      catchError(this.utils.handleHttpError<void>()),
    ).subscribe();

    const canPass: Boolean = this.validateQuestionnaire(covidQuestionnaireAnswerDto);
    // Save to own database
    this.covidQuestionnaire.findByIdAndUpdate({_id: userId}, {$push:{answers:{
      ...covidQuestionnaireAnswerDto, canPass,
    }}}, {new: true, upsert: true});

    // Fetch and return the last validations
    if(!canPass) {
      // If is suspect then update academic information
      return this.updateCovidInformation(userId, {isSuspect: !canPass})
      .pipe(switchMap(() => this.fetchCovidValidations(userId)));
    } else {
      return this.fetchCovidValidations(userId);
    }
  }

  /**
   * Retrieve the answers of the COVID questionnaire.
   * @param userId The user id
   * @return An observable the list of answers.
   */
  async getCovidQuestionnaireAnswers(userId: string): Promise<CovidQuestionnaire> {
    const defaultValues: CovidQuestionnaire = new CovidQuestionnaire();
    defaultValues._id = userId;
    defaultValues.answers = [];
    return await this.covidQuestionnaire.findById(userId, 'answers') ?? defaultValues;
  }

  /**
   * Retrieve the answers of the COVID questionnaire for current day.
   * @param userId The user id
   * @return An observable the list of answers.
   */
  async getTodayCovidQuestionnaireAnswers(userId: string): Promise<CovidQuestionnaire> {
    const defaultValues: CovidQuestionnaire = new CovidQuestionnaire();
    defaultValues._id = userId;
    defaultValues.answers = [];

    const answers: CovidQuestionnaire = await this.covidQuestionnaire.findById(userId);
    if(!answers) return defaultValues;

    // Remove every answer that does not have date or is not today
    answers.answers = answers.answers.filter((answer) => answer['createdAt'] && this.utils.isStillToday(new Date(answer['createdAt'])));
    return answers;
  }

  /** 
   * Validate if can pass to the campus acording to the questionnaire answers.
   * 
   * Cannot pass if:
   * - Have 1 serious symptom (fever, frequent cough or difficulty breathing)
   * - Have 2 or more major symptoms
   * - Have 4 or more minor symptoms
   * - Have 1 or more major symptoms and 1 or more minor symptoms
   * - Had been in contact with a recent confirm case of COVID
   * 
   * @param questionnaire The questionnaire answers
   * @return `true` if can pass. Otherwise `false`.
   */
  private validateQuestionnaire(questionnaire: CovidQuestionnaireAnswerDto): Boolean {
    // Cannot pass if have recent contact
    let haveRecentContact: boolean = questionnaire.recentContact.yes ? true : false;
    if (haveRecentContact) {
      return false;
    }

    // Cannot pass if have a serious symptom
    let haveASeriousSymptom: boolean = false;
    [
      'fever',
      'frequenteCoughing',
      'difficultyBreating',
    ].forEach((element) => {
      if (questionnaire.majorSymptoms[element]) {
        haveASeriousSymptom = true;
      }
    });

    if (haveASeriousSymptom) {
      return false;
    }

    let majorSymptoms: number = 0;
    Object.values(questionnaire.majorSymptoms).forEach((value) => {
      if (value) {
        majorSymptoms++;
      }
    });

    if (majorSymptoms >= 2) {
      // Cannot pass if have 2 or more major symptom
      return false;
    }

    let minorSymptoms: number = 0;
    Object.values(questionnaire.minorSymptoms).forEach((value) => {
      if (value) {
        minorSymptoms++;
      }
    });

    if (minorSymptoms >= 4) {
      // Cannot pass if have 4 or more minor symptom
      return false;
    } else if (majorSymptoms >= 1 && minorSymptoms >= 1) {
      // Cannot pass if have 1 or more minor symptom and 1 or more major symtom
      return false;
    } else {
      return true;
    }
  }

  /**
   * Format the URL to get the correct QR image.
   * 
   * | Condition                 | Color           |
   * |:--------------------------|:----------------|
   * | Internals                 | #3bbeff (green) |
   * | Externals                 | #3bbe3f (blue)  |
   * | Everyone that cannot pass | #be3b3b (red)   |
   * 
   * The API used is `https://api.qrserver.com`.
   * 
   * @param userId The user id.
   * @param allowAccess If the user can enter 
   * @param residence 
   * @returns 
   */
  private getQrUrl(userId: String, allowAccess: Boolean, residence: Residence): string {
    if (allowAccess) {
      if (residence === Residence.Internal) {
        return `https://api.qrserver.com/v1/create-qr-code/?data=${userId}&size=300x300&color=3bbeff`;
      } else {
        return `https://api.qrserver.com/v1/create-qr-code/?data=${userId}&size=300x300&color=3bbe3f`;
      }
    } else {
      return `https://api.qrserver.com/v1/create-qr-code/?data=${userId}&size=300x300&color=be3b3b`;
    }
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
   * - Is internal & arrived in less than 5 days
   * @param info The COVID extra information.
   * @return `true` if have recent arrival. Otherwise `false`.
   */
  private checkIfRecentArrival = (info: CovidInformation, residence: Residence): boolean => info.arrivalDate ? !this.utils.nthDaysPassed(info.arrivalDate, residence === Residence.External ? this.DAYS_AFTER['ARRIVAL_EXTERNALS'] : this.DAYS_AFTER['ARRIVAL_INTERNALS']) : false;

  /**
   * Check if is in quarantine.
   * 
   * Return `true` if:
   * - Is in quarantine & have end date & end date haven't passed yet.
   * - Is quarantine & do not have end date.
   * @param info The COVID extra information.
   * @return `true` if is in quarantine. Otherwise `false`.
   */
  private checkIfIsInQuarantine = (info: CovidInformation): boolean => info.isInQuarantine ? info.quarantineEndDate ? !this.utils.isBeforeToday(info.quarantineEndDate) : true : false;

  /**
   * Check if have COVID.
   * 
   * Return `true` if:
   * - Have COVID & have start date & 14 days haven't passed since the start.
   * - Have COVID & do not have start date.
   * @param info The COVID extra information.
   * @return `true` if have COVID. Otherwise `false`.
   */
  private checkIfHaveCovid = (info: CovidInformation): boolean => info.haveCovid ? info.startCovidDate ? !this.utils.nthDaysPassed(info.startCovidDate, this.DAYS_AFTER['COVID']) : true : false;

  /**
   * Check if is suspect.
   * 
   * Return `true` if:
   * - Is suspect & have start date & 7 days haven't passed since the start.
   * - Is suspect & dop not have start date.
   * @param info The COVID extra information.
   * @return `true` if is suspect. Otherwise `false`.
   */
  private checkIfIsSuspect = (info: CovidInformation): boolean => info.isSuspect ? info.startSuspicionDate ? !this.utils.nthDaysPassed(info.startSuspicionDate, this.DAYS_AFTER['SUSPICION']) : true : false;

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
  private checkICanPass = (validations: CovidValidations): boolean => [validations.noResponsiveLetter, validations.haveCovid, validations.isInQuarantine, validations.isSuspect, validations.recentArrival].every(i => !i);

  /**
   * Fetch the residence of the user.
   * @param validations The user id to fetch with
   * @returns The residence
   */
  private fetchResidence = (userId: String): Observable<Residence> => {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/academico?CodigoAlumno=${userId}`, {headers: {Authorization: token}})),
      map(({data}) => this.utils.fromStringToResidence(data['residencia'])),
      catchError(this.utils.handleHttpError<Residence>(Residence.Unknown))
    );
  }

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
   * @return The Reason.
   */
  private getReason = (validations: CovidValidations): Reasons => {
    switch (true) {
      case validations.noResponsiveLetter:
        return Reasons.NoResponsiveLetter;
      case validations.isInQuarantine:
        return Reasons.IsInQuarantine;
      case validations.haveCovid:
        return Reasons.HaveCovid;
      case validations.isSuspect:
        return Reasons.IsSuspect;
      case validations.recentArrival:
        return Reasons.RecentArrival;
      default:
        return Reasons.None;
    }
  }
}

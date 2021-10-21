import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { UtilsService } from 'src/utils/utils.service';
import { AllSubjectsDto } from './dto/allSubjects.dto';
import { AverageDto } from './dto/average.dto';
import { PlanDto } from './dto/plan.dto';
import { Document } from './entities/document.entity';
import { Semester } from './entities/semester.entity';
import { Subject } from './entities/subject.entity';

@Injectable()
export class AcademicService {
  constructor(
    private http: HttpService,
    private acaAuth: AcaAuthService,
    private readonly utils: UtilsService,
  ) {}

  /**
   * Fetches the documents of the user.
   * @param userId The user id to fetch with
   * @return An observable with a `Document` list
   */
  fetchDocuments(userId: String): Observable<Document[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => forkJoin([
        this.http.get<[]>(`/listaDocumentos?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<[]>(`/listaImagenes?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
      ])),
      map(([docs, imgs]) => {
        const documents: Document[] = [];
        docs.data.forEach(document => documents.push({
          id: Number.parseInt(document['documentoId']),
          name: document['documentoNombre'],
          images: [
            ...imgs.data
            .filter(img => img['documentoId'] === document['documentoId'])
            .map(img => ({
              page: Number.parseInt(img['hoja']),
              image: img['imagen'],
            }))
          ]
        }));
        return documents;
      }),
      catchError(this.utils.handleHttpError<Document[]>([])),
    )
  }

  /**
   * Fetches and merge the subjects by semester that the user has taken.
   * @param userId The user id to fetch with
   * @param options The options to manipulate the data
   * @param options.sort Option to know if semesters should be sort. Default `true`.
   * @return An observable with an `AllSubjectsDto`
   */
  fetchSemestersWithSubjects(
    userId: string,
    options: {sort:boolean} = {sort: true},
  ): Observable<AllSubjectsDto> {
    return this.fetchPlan(userId)
    .pipe(map(data => data.plan))
    .pipe(
      switchMap(planId => forkJoin([
        of(planId),
        this.fetchSemesterInfo(planId),
        this.fetchGlobalAverage(userId, planId)
          .pipe(map(data => data.average)),
        this.fetchAllSubjects(userId, planId),
      ])),
      map(([planId, semesters, average, subjects]) => {
        semesters.forEach(semester => {
          semester.subjects.push(
            ...subjects.filter(subject =>semester.order === subject.extras.semester)
          );
        });

        if(options.sort)
          semesters = semesters.sort((a, b) => a.order - b.order);

        return {planId, average, semesters};
      }),
      catchError(this.utils.handleHttpError<AllSubjectsDto>({planId:'', average: 0, semesters:[]})),
    );
  }

  /**
   * Fetches and merge the current subjecs of the user with the current semester.
   * @param userId The user id
   * @return An observable with a `Semester`
   */
  fetchCurrentSemester(userId:string): Observable<Semester> {
    return this.fetchPlan(userId)
    .pipe(map(data => data.plan))
    .pipe(
      switchMap(planId => forkJoin([
        this.fetchSemesterInfo(planId),
        this.fetchCurrentSubjects(userId),
      ])),
      map(([semesters, subjects]) => {
        const semesterOrder: number = subjects[0].extras.semester ?? 0;
        const semester: Semester = semesters.filter(semester => semester.order === semesterOrder)[0] ?? new Semester();
        semester.subjects.push(...subjects);
        return semester;
      }),
      catchError(this.utils.handleHttpError<Semester>(new Semester())),
    );
  }

  /**
   * Fetches the last plan where the user has been enrolled.
   * @param userId The user id to fetch with
   * @return An observable with a `PlanDto`
   */
  fetchPlan(userId: string): Observable<PlanDto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/plan?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(res => ({ plan: res.data['dato'] })),
      catchError(this.utils.handleHttpError<PlanDto>({plan: ''})),
    );
  }

  /**
   * Fetches the current global average.
   * @param userId The user id
   * @return An observable with an `AverageDto`
   */
  fetchCurrentGlobalAverage(userId:string): Observable<AverageDto> {
    return this.fetchPlan(userId)
    .pipe(map(data => data.plan))
    .pipe(
      switchMap(planId => this.fetchGlobalAverage(userId, planId)),
      catchError(this.utils.handleHttpError<AverageDto>({average:0})),
    );
  }

  /**
   * Fetches the current subjecs of the user.
   * @param userId The user id
   * @return An observable with a `Subject` list
   */
  private fetchCurrentSubjects(userId:String): Observable<Subject[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaMateriasActuales?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        let subjects: Subject[] = [];
        data.forEach(subject => subjects.push(this.mapSubject(subject)));
        return subjects;
      }),
      catchError(this.utils.handleHttpError<Subject[]>([])),
    );
  }

  /**
   * Fetches the global average.
   * @param userId The user id
   * @param planId The plan id
   * @return An observable with an `AverageDto`
   */
   private fetchGlobalAverage(userId:String, planId:String): Observable<AverageDto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/promedio?CodigoAlumno=${userId}&PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => ({average:Number.parseFloat(data['dato']) ?? 0})),
      catchError(this.utils.handleHttpError<AverageDto>({average:0})),
    );
  }

  /**
   * Fetches all the subjecs that the user has taken.
   * @param userId The user id
   * @param planId the plan id of the user
   * @return An observable with a `Subject` list
   */
  private fetchAllSubjects(userId:String, planId:String): Observable<Subject[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaMaterias?CodigoAlumno=${userId}&PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        let subjects: Subject[] = [];
        data.forEach(subject => subjects.push(this.mapSubject(subject)));
        return subjects;
      }),
      catchError(this.utils.handleHttpError<Subject[]>([])),
    );
  }

  /**
   * Fetches the semesters information from a plan.
   * @param planId The plan id to fetch the semesters
   * @return An observable with a `Semester` list
   */
  private fetchSemesterInfo(planId: String): Observable<Semester[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaCiclos?PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        const semesters:Semester[] = [];
        data.forEach(semester => semesters.push({
          name: semester['titulo'],
          planId: semester['planId'],
          order: Number.parseInt(semester['ciclo']),
          average: 0.0, // Still don't have the average
          subjects: [],
        }));
        return semesters;
      }),
      catchError(this.utils.handleHttpError<Semester[]>([])),
    );
  }

  private mapSubject(json: any): Subject {
    return {
      name: json['nombreCurso'],
      score: Number.parseFloat(json['nota'] ?? json['notaExtra']),
      isExtra: json['notaExtra'] != 0,
      credits: Number.parseInt(json['creditos']),
      teacher: {
        name: json['maestro'],
      },
      extras: {
        semester: Number.parseInt(json['ciclo']),
        loadId: json['cursoCargaId'],
        type: json['tipo'],
      }
    }
  }
}

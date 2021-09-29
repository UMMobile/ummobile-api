import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { UtilsService } from 'src/utils/utils.service';
import { Archive } from './entities/archives.entity';
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
   * Fetches the archives of the user.
   * @param userId The user id to fetch with
   * @return An observable with the archives list
   */
  fetchArchives(userId: String): Observable<Archive[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => forkJoin([
        this.http.get<[]>(`/listaDocumentos?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<[]>(`/listaImagenes?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
      ])),
      map(([docs, imgs]) => {
        const archives: Archive[] = [];
        docs.data.forEach(archive => archives.push({
          id: archive['documentoId'],
          name: archive['documentoNombre'],
          images: [
            ...imgs.data
            .filter(img => img['documentoId'] === archive['documentoId'])
            .map(img => ({
              page: img['hoja'],
              image: img['imagen'],
            }))
          ]
        }));
        return archives;
      }),
      catchError(this.utils.handleHttpError<Archive[]>([])),
    )
  }

  /**
   * Fetches and merge the subjects by semester that the user has taken.
   * @param userId The user id to fetch with
   * @param options The options to manipulate the data
   * @param options.sort Option to know if semesters should be sort. Default `true`.
   * @return An observable with an object with the plan id and the semesters list
   */
  fetchSemestersWithSubjects(
    userId:String,
    options: {sort:boolean} = {sort: true},
  ): Observable<{planId:String,semesters:Semester[]}> {
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
      catchError(this.utils.handleHttpError<{planId:String,semesters:Semester[]}>({planId:'',semesters:[]})),
    );
  }

  /**
   * Fetches and merge the current subjecs of the user with the current semester.
   * @param userId The user id
   * @return An observable with the semester
   */
  fetchCurrentSemester(userId:String): Observable<Semester> {
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
   * @return An observable with an object with the plan field
   */
  fetchPlan(userId: String): Observable<{plan:String}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/plan?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(res => ({ plan: res.data['dato'] })),
      catchError(this.utils.handleHttpError<{ plan:String }>({plan: ''})),
    );
  }

  /**
   * Fetches the current global average.
   * @param userId The user id
   * @return An observable with an object with the average
   */
  fetchCurrentGlobalAverage(userId:String): Observable<{average:String}> {
    return this.fetchPlan(userId)
    .pipe(map(data => data.plan))
    .pipe(
      switchMap(planId => this.fetchGlobalAverage(userId, planId)),
      catchError(this.utils.handleHttpError<{average:String}>({average:''})),
    );
  }

  /**
   * Fetches the current subjecs of the user.
   * @param userId The user id
   * @return An observable with the subjects list
   */
  private fetchCurrentSubjects(userId:String): Observable<Subject[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaMateriasActuales?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        let subjects: Subject[] = [];
        data.forEach(subject => subjects.push({
          name: subject['nombreCurso'],
          score: subject['nota'] ?? subject['notaExtra'],
          isExtra: subject['notaExtra'] != 0,
          credits: subject['creditos'],
          teacher: {
            name: subject['maestro'],
          },
          extras: {
            semester: subject['ciclo'],
            loadId: subject['cursoCargaId'],
            type: subject['tipo'],
          }
        }));

        return subjects;
      }),
      catchError(this.utils.handleHttpError<Subject[]>([])),
    );
  }

  /**
   * Fetches the global average.
   * @param userId The user id
   * @param planId The plan id
   * @return An observable with an object with the average
   */
   private fetchGlobalAverage(userId:String, planId:String): Observable<{average:String}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`/promedio?CodigoAlumno=${userId}&PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => ({average:data['dato']})),
      catchError(this.utils.handleHttpError<{average:String}>({average:''})),
    );
  }

  /**
   * Fetches all the subjecs that the user has taken.
   * @param userId The user id
   * @param planId the plan id of the user
   * @return An observable with the subjects list
   */
  private fetchAllSubjects(userId:String, planId:String): Observable<Subject[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaMaterias?CodigoAlumno=${userId}&PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        let subjects: Subject[] = [];
        data.forEach(subject => subjects.push({
          name: subject['nombreCurso'],
          score: subject['nota'] ?? subject['notaExtra'],
          isExtra: subject['notaExtra'] != 0,
          credits: subject['creditos'],
          teacher: {
            name: subject['maestro'],
          },
          extras: {
            semester: subject['ciclo'],
            loadId: subject['cursoCargaId'],
            type: subject['tipo'],
          }
        }));
        return subjects;
      }),
      catchError(this.utils.handleHttpError<Subject[]>([])),
    );
  }

  /**
   * Fetches the semesters information from a plan.
   * @param planId The plan id to fetch the semesters
   * @return An observable with the semesters list
   */
  private fetchSemesterInfo(planId: String): Observable<Semester[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`/listaCiclos?PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        const semesters:Semester[] = [];
        data.forEach(semester => semesters.push({
          name: semester['titulo'],
          planId: semester['planId'],
          order: semester['ciclo'],
          average: 0, // Still don't have the average
          subjects: [],
        }));
        return semesters;
      }),
      catchError(this.utils.handleHttpError<Semester[]>([])),
    );
  }
}

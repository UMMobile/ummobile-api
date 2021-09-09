import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/acaAuth/acaAuth.service';
import academicConfig from 'src/config/academic.config';
import { Archive } from './entities/archives.entity';
import { Semester } from './entities/semester.entity';
import { Subject } from './entities/subject.entity';

@Injectable()
export class AcademicService {
  constructor(
    private http: HttpService,
    private acaAuth: AcaAuthService,
    @Inject(academicConfig.KEY) private readonly acaConfig: ConfigType<typeof academicConfig>,
  ) {}

  fetchArchives(userId: String): Observable<Archive[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => forkJoin([
        this.http.get<[]>(`${this.acaConfig.url}/listaDocumentos?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<[]>(`${this.acaConfig.url}/listaImagenes?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
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
      catchError(this.handleError<Archive[]>([])),
    )
  }

  fetchSemestersWithSubjects(
    userId:String,
    options: {sort:boolean} = {sort: true},
  ): Observable<{planId:String,semesters:Semester[]}> {
    return forkJoin([
      this.acaAuth.token(),
      this.fetchPlan(userId)
        .pipe(map(data => data.plan)),
    ]).pipe(
      switchMap(([token, planId]) => 
        forkJoin([
          of(planId),
          this.fetchSemesterInfo(planId),
          this.fetchAllSubjects(userId, planId),
        ])
      ),
      map(([planId, semesters, subjects]) => {
        semesters.forEach(semester => 
          semester.subjects.push(
            ...subjects
              .filter(subject =>semester.order === subject.extras.semester)
          )
        );
        if(options.sort) {
          semesters = semesters.sort((a, b) => a.order - b.order);
        }
        return {planId, semesters};
      }),
      catchError(this.handleError<{planId:String,semesters:Semester[]}>({planId:'',semesters:[]})),
    );
  }

  fetchPlan(userId: String): Observable<{plan:String}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<String>(`${this.acaConfig.url}/plan?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(res => ({ plan: res.data['dato'] })),
      catchError(this.handleError<{ plan:String }>({plan: ''})),
    );
  }

  private fetchAllSubjects(userId:String, planId:String): Observable<Subject[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`${this.acaConfig.url}/listaMaterias?CodigoAlumno=${userId}&PlanId=${planId}`, {headers:{Authorization:token}})),
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
      catchError(this.handleError<Subject[]>([])),
    );
  }

  private fetchSemesterInfo(planId: String): Observable<Semester[]> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<[]>(`${this.acaConfig.url}/listaCiclos?PlanId=${planId}`, {headers:{Authorization:token}})),
      map(({data}) => {
        const semesters:Semester[] = [];
        data.forEach(semester => semesters.push({
          name: semester['titulo'],
          planId: semester['planId'],
          order: semester['ciclo'],
          subjects: [],
        }));
        return semesters;
      }),
      catchError(this.handleError<Semester[]>([])),
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

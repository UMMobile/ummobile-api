import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AcaAuthService } from 'src/acaAuth/acaAuth.service';
import academicConfig from 'src/config/academic.config';
import { Archive } from './entities/archives.entity';

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

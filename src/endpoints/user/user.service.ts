import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { academicConfig, apiManagerConfig } from 'src/config/configuration';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { Roles } from 'src/statics/types';
import { UtilsService } from 'src/utils/utils.service';
import { Base64Dto } from './dto/base64.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private http: HttpService,
    private utils: UtilsService,
    private acaAuth: AcaAuthService,
    @Inject(academicConfig.KEY) private readonly academic: ConfigType<typeof academicConfig>,
    @Inject(apiManagerConfig.KEY) private readonly am: ConfigType<typeof apiManagerConfig>,
  ) {}

  /**
   * Fetches the user information (for students).
   * @param options The options to configure the call:
   * @param options.includePicture Conditionally add or remove the profile picture to reduce the size of the response. Default `true`.
   * @return An observable with the user information
   */
   fetchUserStudent(
    userId: String,
    options: { includePicture: Boolean } = { includePicture: false },
  ): Observable<User> {
    return this.acaAuth.token().pipe(
      switchMap(token => forkJoin([
        this.http.get<{}>(`${this.academic.url}/personal?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<{}>(`${this.academic.url}/datos?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<{}>(`${this.academic.url}/academico?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
        this.http.get<{}>(`${this.academic.url}/beca?CodigoAlumno=${userId}`, {headers:{Authorization:token}}),
      ])),
      map(([{data: personal}, {data: extras}, {data: academic}, {data: scholarship}]) => ({
        id: Number.parseInt(personal['matricula']),
        name: personal['nombre'],
        surnames: personal['apellidos'],
        image: options.includePicture ? personal['imagenPerfil'] : undefined,
        extras: {
          curp: extras['curp'],
          email: extras['email'] ?? undefined,
          phone: extras['telefono'] ?? undefined,
          birthday: new Date(extras['fecNacimiento']),
          maritalStatus: extras['estadoCivil'],
        },
        student: {
          baptized: extras['bautizado'] === 'S' ? true : false,
          religion: extras['religion'],
          type: extras['tipoAlumno'],
          academic: {
            dormitory: Number.parseInt(academic['dormitorio']),
            modality: academic['modalidad'],
            residence: this.utils.fromStringToResidence(academic['residencia']),
            signedUp: academic['inscrito'] === 'SI' ? true : false,
          },
          scholarship: Number.parseInt(scholarship['matricula']) ? {
            workplace: scholarship['lugar'],
            position: scholarship['puesto'],
            startDate: new Date(scholarship['fechaIni']),
            endDate: new Date(scholarship['fechaFin']),
            hours: Number.parseInt(scholarship['horas']),
            status: scholarship['estado'],
          } : undefined,
        },
        role: Roles.Student,
      })),
      catchError(this.utils.handleHttpError<User>(new User())),
    );
  }

  /**
   * Fetches the user information (for employees).
   * @param userId The user id to fetch with
   * @param options The options to configure the call:
   * @param options.includePicture Conditionally add or remove the profile picture to reduce the size of the response. Default `true`.
   * @return An observable with the user information 
   */
  fetchUserEmployee(
    userId: String,
    options: { includePicture: Boolean } = { includePicture: false },
  ): Observable<User> {
    return forkJoin([
      this.http.get<{}>(`${this.am.url}/umrh/1.0.0/empleadonnomina/${userId}`, {headers:{Authorization:`Bearer ${this.am.key}`}}),
      options.includePicture ? this.fetchEmployeePicture(userId).pipe(map(data => data.base64)) : of(undefined),
    ])
    .pipe(
      map(([{data}, base64Image]) => {
        return {
        id: Number.parseInt(data['nnomina']),
        name: data['nombre'],
        surnames: data['apellidos'],
        image: base64Image,
        extras: {
          curp: data['curp'],
          email: data['correo'] ?? undefined,
          phone: data['telefono'] ?? undefined,
          birthday: this.utils.parseDDMMYYYY(data['fechaNacimiento']),
          maritalStatus: data['estadoCivil'],
        },
        employee: {
          imss: data['imss'] ?? '',
          rfc: data['rfc'] ?? '',
          contract: this.utils.fromNumberToContract(data['idTipoContrato'] ?? 0),
          positions: [
            ...data['laborales'].map((job: any) => ({
              id: job['idCosto'],
              department: job['descripcion'],
              name: job['puesto'],
            }))
          ],
        },
        role: Roles.Employee,
      }}),
      catchError(this.utils.handleHttpError<User>(new User())),
    );
  }

  /**
   * Fetches the employee picture.
   * @param userId The user id to fetch with
   * @return An observable with the base64 employee picture
   */
  fetchEmployeePicture(userId: String): Observable<Base64Dto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`${this.academic.url}/empleado?Nomina=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ base64: data['imagenPerfil'] })),
      catchError(this.utils.handleHttpError<Base64Dto>({base64: ''})),
    );
  }

  /**
   * Fetches the student picture.
   * @param userId The user id to fetch with
   * @return An observable with the base64 student picture
   */
   fetchStudentPicture(userId: String): Observable<Base64Dto> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`${this.academic.url}/personal?CodigoAlumno=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ base64: data['imagenPerfil'] })),
      catchError(this.utils.handleHttpError<Base64Dto>({base64: ''})),
    );
  }
}

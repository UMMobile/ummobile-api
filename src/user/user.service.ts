import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { academicConfig, wso2Config } from 'src/config/configuration';
import { AcaAuthService } from 'src/services/acaAuth/acaAuth.service';
import { ContractTypes, Roles } from 'src/statics/types';
import { UtilsService } from 'src/utils/utils.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private http: HttpService,
    private utils: UtilsService,
    private acaAuth: AcaAuthService,
    @Inject(academicConfig.KEY) private readonly academic: ConfigType<typeof academicConfig>,
    @Inject(wso2Config.KEY) private readonly wso2: ConfigType<typeof wso2Config>,
  ) {}

  /**
   * Fetches the user information (for students).
   * @param options The options to configure the call:
   * @param options.includePicture Conditionally add or remove the profile picture of the response. Default `True`
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
      map(([{data: personal}, {data: extras}, {data: academic}, {data: scholarship}]) => {
        return {
        id: personal['matricula'],
        name: personal['nombre'],
        surnames: personal['apellidos'],
        image: options.includePicture ? personal['imagenPerfil'] : undefined,
        extras: {
          curp: extras['curp'],
          email: extras['email'] ?? undefined,
          phone: extras['telefono'] ?? undefined,
          birthday: this.utils.parseDDMMYYYY(extras['fechaNacimiento']),
          maritalStatus: extras['estadoCivil'],
        },
        student: {
          baptized: extras['bautizado'],
          religion: extras['religion'],
          studentType: extras['tipoAlumno'],
          academic: {
            dormitory: academic['dormitorio'],
            modality: academic['modalidad'],
            residence: academic['residencia'],
            signedUp: academic['inscrito'],
          },
          scholarship: Number.parseInt(scholarship['matricula']) ? {
            workplace: scholarship['lugar'],
            position: scholarship['puesto'],
            startDate: new Date(scholarship['fechaIni']),
            endDate: new Date(scholarship['fechaFin']),
            hours: scholarship['horas'],
            status: scholarship['estado'],
          } : undefined,
        },
        role: Roles.Student,
      }}),
      catchError(this.handleError<User>(new User())),
    );
  }

  /**
   * Fetches the user information (for employees).
   * @param userId The user id to fetch with
   * @param options The options to configure the call:
   * @param options.includePicture Conditionally add or remove the profile picture of the response. Default `True`
   * @return An observable with the user information 
   */
  fetchUserEmployee(
    userId: String,
    options: { includePicture: Boolean } = { includePicture: false },
  ): Observable<User> {
    return forkJoin([
      this.http.get<{}>(`${this.wso2.url}/umrh/1.0.0/empleadonnomina/${userId}`, {headers:{Authorization:`Bearer ${this.wso2.api_key}`}}),
      options.includePicture ? this.fetchEmployeePicture(userId).pipe(map(data => data.base64)) : of(undefined),
    ])
    .pipe(
      map(([{data}, base64Image]) => {
        return {
        id: data['nnomina'],
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
          contract: this.fromIdToContractType(data['idTipoContrato'] ?? 0),
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
      catchError(this.handleError<User>(new User())),
    );
  }

  /**
   * Fetches the employee picture.
   * @param userId The user id to fetch with
   * @return An observable with the base64 employee picture
   */
  fetchEmployeePicture(userId: String): Observable<{base64:String}> {
    return this.acaAuth.token().pipe(
      switchMap(token => this.http.get<{}>(`${this.academic.url}/empleado?Nomina=${userId}`, {headers:{Authorization:token}})),
      map(({data}) => ({ base64: data['imagenPerfil'] })),
      catchError(this.handleError<{ base64:String }>({base64: ''})),
    );
  }

  private fromIdToContractType(contractTypeId: number) {
    switch (contractTypeId) {
      case 1:
        return ContractTypes.Denominational;
      case 2:
        return ContractTypes.InterDivision;
      case 3:
        return ContractTypes.InterUnion;
      case 5:
        return ContractTypes.MissionaryService;
      case 6:
        return ContractTypes.RetiredWorkerService;
      case 7:
        return ContractTypes.Contract;
      case 8:
        return ContractTypes.VoluntaryAdventistService;
      case 9:
        return ContractTypes.HourlyTeacher;
      case 10:
        return ContractTypes.SocialService;
      case 11:
        return ContractTypes.HospitalLaCarlota;
      case 14:
        return ContractTypes.Others;
      case 15:
        return ContractTypes.DaycareMisAmiguitos;
      default:
        return ContractTypes.Unknown;
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

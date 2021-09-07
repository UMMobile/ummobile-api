import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { AcademicConfig } from 'src/config/academic.config';

@Injectable()
export class LoginService {
  constructor(private http: HttpService, private readonly config: ConfigService){}

  token(): Observable<AxiosResponse<String>> {
    const academic = this.config.get<AcademicConfig>('academic');
    return this.http.get(`${academic.url}/login?password=${academic.password}&user=${academic.user}`);
  }
}

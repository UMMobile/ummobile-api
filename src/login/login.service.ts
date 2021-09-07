import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { academicConfig } from 'src/config/configuration';

@Injectable()
export class LoginService {
  constructor(
    private http: HttpService,
    @Inject(academicConfig.KEY) private readonly academic: ConfigType<typeof academicConfig>,
  ){}

  token(): Observable<AxiosResponse<String>> {
    return this.http.get(`${this.academic.url}/login?password=${this.academic.password}&user=${this.academic.user}`);
  }
}

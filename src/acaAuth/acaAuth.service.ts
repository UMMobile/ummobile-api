import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { academicConfig } from 'src/config/configuration';

@Injectable()
export class AcaAuthService {
  constructor(
    private http: HttpService,
    @Inject(academicConfig.KEY) private readonly academic: ConfigType<typeof academicConfig>,
  ){}

  /**
   * Fetches a new token to authenticate with the academic service.
   * @return An observable with the token
   */
  token(): Observable<String> {
    return this.http.get<String>(`/login?password=${this.academic.password}&user=${this.academic.user}`).pipe(map(res => res.data));
  }
}

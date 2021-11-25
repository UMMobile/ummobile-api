import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { AuthDto } from './entities/authDto.entity';
import { URLSearchParams } from 'url';
import identityServerConfig from 'src/config/identityServer.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
    @Inject(identityServerConfig.KEY) private readonly isConfig: ConfigType<typeof identityServerConfig>,
  ) {}

  /**
   * Generate a new token that can be used to consum this API.
   * 
   * **Important:**
   * 
   * The returned token is the one that can be used to authorize the other API endpoints.
   * 
   * This endpoint should be the only one that works with an application API Key from the API Manager instead of the user token generated here. All the others should use the generated user token from here.
   * 
   * @param auth The username & password to authenticate
   * @param query The queries to send in the call:
   * @param query.scope The scope of the token. Default `openId`.
   * @param options The options to configure the call:
   * @param options.grantType The option to define how to authenticate. Default `password`.
   * @param options.sandbox The option to define if should use sandbox credentials. Default `false`.
   * @return An observable with the token schema
   */
  generateToken(
    auth: AuthDto,
    query: {scope: string} = {scope: 'openId'},
    options: {grantType: String, sandbox: boolean} = {grantType: 'password', sandbox: false},
  ): Observable<any> {
    const body: URLSearchParams = new URLSearchParams();
    body.append('grant_type', options.grantType.toString());
    body.append('username', `${auth.username}@um.movil`);
    body.append('password', auth.password.toString());
    return this.http.post<{}>(`/t/um.movil/oauth2/token?scope=${query.scope}`, body.toString(), {
      auth: {
        username: options.sandbox ? this.isConfig.sandbox.user : this.isConfig.user ?? this.isConfig.sandbox.user,
        password: options.sandbox ? this.isConfig.sandbox.password : this.isConfig.password ?? this.isConfig.sandbox.password,
      },
    }).pipe(
      map(({data}) => data),
      catchError(this.utils.handleHttpError())
    );
  }
}

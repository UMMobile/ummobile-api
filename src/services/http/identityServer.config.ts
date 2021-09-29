import { HttpModuleOptions, HttpModuleOptionsFactory, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import identityServerConfig from "src/config/identityServer.config";

@Injectable()
export class IdentityServerHttpService implements HttpModuleOptionsFactory {

  constructor(
    @Inject(identityServerConfig.KEY) private readonly isConfig: ConfigType<typeof identityServerConfig>,
  ){}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.isConfig.url,
      auth: {
        username: this.isConfig.user,
        password: this.isConfig.password,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };
  }
}
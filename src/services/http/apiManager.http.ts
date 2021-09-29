import { HttpModuleOptions, HttpModuleOptionsFactory, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import apiManagerConfig from "src/config/apiManager.config";

@Injectable()
export class ApiManagerHttpService implements HttpModuleOptionsFactory {

  constructor(
    @Inject(apiManagerConfig.KEY) private readonly amConfig: ConfigType<typeof apiManagerConfig>,
  ){}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.amConfig.url,
      headers: {
        Authorization: `Bearer ${this.amConfig.key}`,
      },
    };
  }
}
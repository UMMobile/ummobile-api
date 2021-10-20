import { HttpModuleOptions, HttpModuleOptionsFactory, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { generalConfig } from "src/config/configuration";

@Injectable()
export class ConectateHttpService implements HttpModuleOptionsFactory {

  constructor(
    @Inject(generalConfig.KEY) private readonly generalConf: ConfigType<typeof generalConfig>,
  ){}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.generalConf.conectate,
    };
  }
}
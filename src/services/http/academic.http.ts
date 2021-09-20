import { HttpModuleOptions, HttpModuleOptionsFactory, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import academicConfig from "src/config/academic.config";

@Injectable()
export class AcademicHttpService implements HttpModuleOptionsFactory {

  constructor(
    @Inject(academicConfig.KEY) private readonly acaConfig: ConfigType<typeof academicConfig>,
  ){}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.acaConfig.url,
    };
  }
}
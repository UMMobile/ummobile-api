import { HttpModuleOptions, HttpModuleOptionsFactory, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import wso2Config from "src/config/wso2.config";

@Injectable()
export class Wso2HttpService implements HttpModuleOptionsFactory {

  constructor(
    @Inject(wso2Config.KEY) private readonly wso2Conf: ConfigType<typeof wso2Config>,
  ){}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.wso2Conf.url,
      headers: {
        Authorization: `Bearer ${this.wso2Conf.api_key}`,
      },
    };
  }
}
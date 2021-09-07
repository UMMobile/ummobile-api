import { Controller, Get, Headers } from '@nestjs/common';
import { Roles } from 'src/statics/roles.enum';
import { UtilsService } from 'src/utils/utils.service';
import { CatalogueService } from './catalogue.service';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService, private readonly utils: UtilsService) {}

  @Get()
  catalogueEntryPoint() {
    return {
      'rules': '/rules',
      'countries': '/countries'
    };
  }

  @Get('rules')
  findRules(@Headers() headers) {
    const token: String | undefined = this.utils.getToken(headers);
    const role: Roles = this.utils.getRoleFromToken(token);
    return this.catalogueService.getRules(role);
  }

  @Get('countries')
  findCountries() {
    return this.catalogueService.getCountries();
  }
}

import { Controller, Get, Headers, Request } from '@nestjs/common';
import { Roles } from 'src/statics/roles.enum';
import { UtilsService } from 'src/utils/utils.service';
import { CatalogueService } from './catalogue.service';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService, private readonly utils: UtilsService) {}

  @Get()
  entryPoint(@Request() req: Request) {
    return {
      'rules': `${req.url}/rules`,
      'countries': `${req.url}/countries`
    };
  }

  @Get('rules')
  getRules(@Headers() headers) {
    const token: String | undefined = this.utils.getToken(headers);
    const role: Roles = this.utils.getRoleFromToken(token);
    return this.catalogueService.filterRulesFor(role);
  }

  @Get('countries')
  getCountries() {
    return this.catalogueService.fetchCountries();
  }
}

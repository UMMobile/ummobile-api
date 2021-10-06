import { Controller, Get, Headers } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Roles } from 'src/statics/roles.enum';
import { UtilsService } from 'src/utils/utils.service';
import { CatalogueService } from './catalogue.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';

@ApiTags('Catalogue')
@Controller('catalogue')
export class CatalogueController {
  constructor(
    private readonly catalogueService: CatalogueService,
    private readonly utils: UtilsService
  ) {}

  @ApiOperation({summary: "Fetches the rules for the user"})
  @ApiHeader({
    name: 'Authorization',
    description: 'The user token',
    required: false,
  })
  @Get('rules')
  getRules(@Headers() headers): Rule[] {
    const token: String | undefined = this.utils.getToken(headers);
    const role: Roles = this.utils.getRoleFromToken(token);
    return this.catalogueService.filterRulesFor(role);
  }
  
  @ApiOperation({summary: "Fetches the countries"})
  @Get('countries')
  getCountries(): Observable<Country[]> {
    return this.catalogueService.fetchCountries();
  }
}

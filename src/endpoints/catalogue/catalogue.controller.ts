import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { TokenGuard } from 'src/services/guards/token.guard';
import { Roles } from 'src/statics/roles.enum';
import { UtilsService } from 'src/utils/utils.service';
import { CatalogueService } from './catalogue.service';
import { Calendar } from './entities/calendar.entity';
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
  @UseGuards(TokenGuard)
  getRules(@Headers() headers): Rule[] {
    const token: string | undefined = this.utils.getToken(headers);
    const role: Roles = this.utils.getRoleFromToken(token);
    return this.catalogueService.filterRulesFor(role);
  }
  
  @ApiOperation({summary: "Fetches the countries"})
  @Get('countries')
  getCountries(): Observable<Country[]> {
    return this.catalogueService.fetchCountries();
  }

  @ApiOperation({summary: "Fetches the calendar for the user"})
  @ApiHeader({
    name: 'Authorization',
    description: 'The user token',
    required: false,
  })
  @Get('calendar')
  @UseGuards(TokenGuard)
  getCalendar(@Headers() headers): Observable<Calendar> {
    const token: string | undefined = this.utils.getToken(headers);
    const role: Roles = this.utils.getRoleFromToken(token);
    return this.catalogueService.fetchCurrentCalendar(role);
  }
}

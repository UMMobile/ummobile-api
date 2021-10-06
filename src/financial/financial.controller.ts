import { Controller, Get, Param, UseGuards, Headers, ForbiddenException, Query, ParseBoolPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiHeader, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Balance } from './entities/balance.entity';
import { MovementsDto } from './dto/movements.dto';

@ApiBearerAuth()
@ApiHeader({
  name: 'authorization',
  description: 'Override the endpoint auth. Is required if endpoint is not authenticated and will return 401.',
  required: false,
})
@ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({ status: 403, description: 'Forbidden if is neither a student or valid token.'})
@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly utils: UtilsService
  ) {}

  @ApiQuery({
    name: 'includeMovements',
    description: 'The format type for movements field. `0`: a link to movements, `1`: only current movements, `2`: current and last year movements. Any other value for this field will be treated as default.',
    required: false,
    schema: {
      default: 2,
      minimum: 0,
      maximum: 2,
      type: 'integer'
    }
  })
  @Get()
  @UseGuards(TokenGuard)
  getFullFinancialInformation(
    @Headers('authorization') token: String,
    @Query('includeMovements', new DefaultValuePipe(2), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ): Observable<Balance[]> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }

  @ApiQuery({
    name: 'includeMovements',
    description: 'The format type for movements field. `0`: a link to movements, `1`: only current movements, `2`: current and last year movements. Any other value for this field will be treated as default.',
    required: false,
    schema: {
      default: 0,
      minimum: 0,
      maximum: 2,
      type: 'integer',
    }
  })
  @Get('balances')
  @UseGuards(TokenGuard)
  getBalances(
    @Headers('authorization') token: String,
    @Query('includeMovements', new DefaultValuePipe(0), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ): Observable<Balance[]> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }
  
  @ApiParam({
    name: 'id',
    description: 'The balance id.',
  })
  @ApiQuery({
    name: 'includeLastYear',
    description: '`false` for only current movements & `true` for current and last year movements.',
    required: false,
    schema: {
      default: false,
      type: 'boolean',
    }
  })
  @Get('balances/:id/movements')
  @UseGuards(TokenGuard)
  getBalancesMovements(
    @Headers('authorization') token: String,
    @Param('id') balanceId: string,
    @Query('includeLastYear', new DefaultValuePipe(false), ParseBoolPipe) includeLastYear: boolean,
  ): Observable<MovementsDto> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.financialService.fetchBalancesMovements(userId, balanceId, {
        includeLastYear,
      });
    } else throw new ForbiddenException();
  }
}

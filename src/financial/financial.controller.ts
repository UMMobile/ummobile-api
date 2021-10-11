import { Controller, Get, Param, UseGuards, Headers, ForbiddenException, Query, ParseBoolPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Balance } from './entities/balance.entity';
import { MovementsDto } from './dto/movements.dto';

@ApiBearerAuth()
@ApiUnauthorizedResponse({description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({description: 'Forbidden if is neither a student or valid token.'})
@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly utils: UtilsService
  ) {}

  @ApiOperation({
    summary: "Fetches the student financial information",
    description: "Fetches the student financial information, which are the balances with their movements by default. Also, the format of the movements field can be changed by using the `includeMovements` query parameter.",
  })
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
    @Headers() headers: any,
    @Query('includeMovements', new DefaultValuePipe(2), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ): Observable<Balance[]> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Fetches the student balances",
    description: "This endpoint is similar to `/financial` but here their movements fields are by default a link to their movements. This behavior can be changed by using the `includeMovements` query parameter.",
  })
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
    @Headers() headers: any,
    @Query('includeMovements', new DefaultValuePipe(0), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ): Observable<Balance[]> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }
  
  @ApiOperation({
    summary: "Fetches the balance movements",
    description: "The path to this endpoint can be formed using the `/financial` or the `/financial/balances` endpoints with the `includeMovements` query parameter set to `0`. If not, you should know somehow (probably with the other endpoints) the balance ID to be able to consume this endpoint.",
  })
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
    @Headers() headers: any,
    @Param('id') balanceId: string,
    @Query('includeLastYear', new DefaultValuePipe(false), ParseBoolPipe) includeLastYear: boolean,
  ): Observable<MovementsDto> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.financialService.fetchBalancesMovements(userId, balanceId, {
        includeLastYear,
      });
    } else throw new ForbiddenException();
  }
}

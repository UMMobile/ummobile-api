import { Controller, Get, Param, UseGuards, Headers, ForbiddenException, Query, ParseBoolPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService, private readonly utils: UtilsService) {}

  @Get()
  @UseGuards(TokenGuard)
  getFullFinancialInformation(
    @Headers('authorization') token: String,
    @Query('includeMovements', new DefaultValuePipe(2), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }

  @Get('balances')
  @UseGuards(TokenGuard)
  getBalances(
    @Headers('authorization') token: String,
    @Query('includeMovements', new DefaultValuePipe(0), ParseIntPipe) includeMovements: 0 | 1 | 2,
  ) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.financialService.fetchBalances(userId, {
        includeMovements,
      });
    } else throw new ForbiddenException();
  }
  
  @Get('balances/:id/movements')
  @UseGuards(TokenGuard)
  getBalancesMovements(
    @Headers('authorization') token: String,
    @Param('id') balanceId: string,
    @Query('includeLastYear', new DefaultValuePipe(false), ParseBoolPipe) includeLastYear: boolean,
  ) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.financialService.fetchBalancesMovements(userId, balanceId, {
        includeLastYear: includeLastYear ?? false,
      });
    } else throw new ForbiddenException();
  
  }
}

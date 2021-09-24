import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers, ForbiddenException, Query, ParseBoolPipe, DefaultValuePipe } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService, private readonly utils: UtilsService) {}

  @Get('balances')
  @UseGuards(TokenGuard)
  getBalances(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.financialService.fetchBalances(userId);
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

  @Post()
  create(@Body() createFinancialDto: CreateFinancialDto) {
    return this.financialService.create(createFinancialDto);
  }

  @Get()
  findAll() {
    return this.financialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinancialDto: UpdateFinancialDto) {
    return this.financialService.update(+id, updateFinancialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financialService.remove(+id);
  }
}

import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { HttpModule } from '@nestjs/axios';
import { ApiManagerHttpService } from 'src/services/http/apiManager.http';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: ApiManagerHttpService,
    }),
  ],
  controllers: [FinancialController],
  providers: [FinancialService]
})
export class FinancialModule {}

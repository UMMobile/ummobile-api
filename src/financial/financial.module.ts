import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { HttpModule } from '@nestjs/axios';
import { Wso2HttpService } from 'src/services/http/wso2.http';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: Wso2HttpService,
    }),
  ],
  controllers: [FinancialController],
  providers: [FinancialService]
})
export class FinancialModule {}

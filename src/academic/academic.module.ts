import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { AcaAuthModule } from 'src/acaAuth/acaAuth.module';
import { HttpModule } from '@nestjs/axios';
import { AcademicHttpService } from 'src/services/academic.http';

@Module({
  imports: [
    AcaAuthModule,
    UtilsModule,
    HttpModule.registerAsync({
      useClass: AcademicHttpService,
    }),
  ],
  controllers: [AcademicController],
  providers: [AcademicService]
})
export class AcademicModule {}

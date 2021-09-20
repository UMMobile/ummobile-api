import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';
import { AcaAuthModule } from 'src/acaAuth/acaAuth.module';
import { UtilsModule } from 'src/utils/utils.module';
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
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService]
})
export class QuestionnaireModule {}

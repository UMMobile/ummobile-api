import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';
import { AcaAuthModule } from 'src/services/acaAuth/acaAuth.module';
import { UtilsModule } from 'src/utils/utils.module';
import { HttpModule } from '@nestjs/axios';
import { AcademicHttpService } from 'src/services/http/academic.http';
import { MongooseModule } from '@nestjs/mongoose';
import { CovidQuestionnaire, CovidQuestionnaireDocument, CovidQuestionnaireSchema } from './entities/covidQuestionnaire.entity';

@Module({
  imports: [
    AcaAuthModule,
    UtilsModule,
    HttpModule.registerAsync({
      useClass: AcademicHttpService,
    }),
    MongooseModule.forFeature([
      { name: CovidQuestionnaire.name, schema: CovidQuestionnaireSchema },
    ])
  ],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService]
})
export class QuestionnaireModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './endpoints/catalogue/catalogue.module';
import { AcademicModule } from './endpoints/academic/academic.module';
import { QuestionnaireModule } from './endpoints/questionnaire/questionnaire.module';
import ConfigModule from './config/configuration';

@Module({
  imports: [
    ConfigModule,
    CatalogueModule,
    AcademicModule,
    QuestionnaireModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

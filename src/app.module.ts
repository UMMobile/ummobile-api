import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './catalogue/catalogue.module';
import { AcademicModule } from './academic/academic.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { UserModule } from './user/user.module';
import ConfigModule from './config/configuration';

@Module({
  imports: [
    ConfigModule,
    CatalogueModule,
    AcademicModule,
    QuestionnaireModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

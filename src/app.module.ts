import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './catalogue/catalogue.module';
import { AcademicModule } from './academic/academic.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { UserModule } from './user/user.module';
import ConfigModule from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<String>('database.url'),
        useFindAndModify: false,
      }),
      inject: [ConfigService]
    }),
    CatalogueModule,
    AcademicModule,
    QuestionnaireModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

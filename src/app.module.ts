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
import { FinancialModule } from './financial/financial.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TokenModule } from './token/token.module';

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
    FinancialModule,
    NotificationsModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

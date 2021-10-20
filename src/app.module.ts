import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './endpoints/catalogue/catalogue.module';
import { AcademicModule } from './endpoints/academic/academic.module';
import { QuestionnaireModule } from './endpoints/questionnaire/questionnaire.module';
import { UserModule } from './endpoints/user/user.module';
import ConfigModule from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { FinancialModule } from './endpoints/financial/financial.module';
import { NotificationsModule } from './endpoints/notifications/notifications.module';
import { TokenModule } from './endpoints/token/token.module';
import { CommunicationModule } from './endpoints/communication/communication.module';

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
    CommunicationModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

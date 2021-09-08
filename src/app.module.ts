import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './catalogue/catalogue.module';
import { AcademicModule } from './academic/academic.module';
import ConfigModule from './config/configuration';

@Module({
  imports: [
    CatalogueModule,
    ConfigModule,
    AcademicModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

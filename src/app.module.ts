import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogueModule } from './catalogue/catalogue.module';
import ConfigModule from './config/configuration';

@Module({
  imports: [
    CatalogueModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}

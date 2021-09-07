import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { HttpModule } from '@nestjs/axios';
import { LoginModule } from 'src/login/login.module';
import { UtilsService } from 'src/utils/utils.service';
import { UtilsModule } from 'src/utils/utils.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UtilsModule, LoginModule, HttpModule],
  controllers: [CatalogueController],
  providers: [CatalogueService]
})
export class CatalogueModule {}

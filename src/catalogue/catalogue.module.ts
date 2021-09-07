import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { HttpModule } from '@nestjs/axios';
import { LoginModule } from 'src/login/login.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule, LoginModule, HttpModule],
  controllers: [CatalogueController],
  providers: [CatalogueService]
})
export class CatalogueModule {}

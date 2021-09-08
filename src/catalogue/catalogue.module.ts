import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { HttpModule } from '@nestjs/axios';
import { AcaAuthModule } from 'src/acaAuth/acaAuth.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule, AcaAuthModule, HttpModule],
  controllers: [CatalogueController],
  providers: [CatalogueService]
})
export class CatalogueModule {}

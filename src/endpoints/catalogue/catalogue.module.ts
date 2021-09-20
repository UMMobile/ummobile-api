import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { HttpModule } from '@nestjs/axios';
import { AcaAuthModule } from 'src/services/acaAuth/acaAuth.module';
import { UtilsModule } from 'src/utils/utils.module';
import { AcademicHttpService } from 'src/services/http/academic.http';

@Module({
  imports: [
    UtilsModule,
    AcaAuthModule,
    HttpModule.registerAsync({
      useClass: AcademicHttpService,
    }),
  ],
  controllers: [CatalogueController],
  providers: [CatalogueService]
})
export class CatalogueModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AcaAuthService } from './acaAuth.service';
import { AcademicHttpService } from 'src/services/http/academic.http';

@Module({
  imports: [HttpModule.registerAsync({
    useClass: AcademicHttpService,
  }),],
  providers: [AcaAuthService],
  exports: [AcaAuthService],
})
export class AcaAuthModule {}
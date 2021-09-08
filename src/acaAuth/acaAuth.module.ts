import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AcaAuthService } from './acaAuth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [AcaAuthService],
  exports: [AcaAuthService],
})
export class AcaAuthModule {}
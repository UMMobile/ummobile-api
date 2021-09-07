import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoginService } from './login.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LoginService],
  exports: [LoginService],
})
export class LoginModule {}
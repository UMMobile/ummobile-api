import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HttpModule } from '@nestjs/axios';
import { AcaAuthModule } from 'src/services/acaAuth/acaAuth.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    AcaAuthModule,
    UtilsModule,
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}

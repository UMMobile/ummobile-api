import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { HttpModule } from '@nestjs/axios';
import { IdentityServerHttpService } from 'src/services/http/identityServer.config';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: IdentityServerHttpService,
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService]
})
export class TokenModule {}

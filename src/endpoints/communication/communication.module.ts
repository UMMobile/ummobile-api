import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { HttpModule } from '@nestjs/axios';
import { ConectateHttpService } from 'src/services/http/conectate.http';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: ConectateHttpService,
    }),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService]
})
export class CommunicationModule {}

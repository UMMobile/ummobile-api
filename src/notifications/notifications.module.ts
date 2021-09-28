import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { HttpModule } from '@nestjs/axios';
import { Wso2HttpService } from 'src/services/http/wso2.http';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: Wso2HttpService,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule {}
